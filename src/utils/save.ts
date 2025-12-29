import Decimal from 'break_infinity.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LZString from 'lz-string';
import { GENERATORS } from '../config/generators';
import { GameState, Generator } from '../types/game';

const SAVE_KEY = 'idleGameSave';
const SAVE_VERSION = '1.0.0';

/**
 * Complete save data structure - ready for Supabase migration
 * All game state that needs to persist between sessions
 */
export interface SaveData {
    version: string;
    timestamp: number;
    state: {
        // Core progression
        currency: string;
        
        // Generator state (all 9 generators)
        generators: Array<{
            id: number;
            level: number;
            fillProgress: number;
            unlocked: boolean;
            earnBonus: string;      // Decimal as string
            speedBonus: number;
            costReduction: number;
        }>;
        
        // Prestige system
        prestige: {
            totalPrestiges: number;
            currentIdleMultiplier: number;
            selectablesRemaining: number;
            history: Array<{
                generator: string;
                bonus: string;
                amount: string;
                timestamp: number;
            }>;
        };
        
        // Statistics
        stats: {
            lifetimeEarnings: string;    // Decimal as string
            incomePerSecond: string;      // Decimal as string
            timePlayedMs: number;
        };
        
        // Global game state (for future features)
        global: {
            pow: number;
            idlePower: number;
            worldsCompleted: number;
        };
        
        // Timestamps (for offline progress calculation)
        timestamps: {
            lastSave: number;
            lastTick: number;
            sessionStart: number;
        };
        
        // User settings
        settings: {
            soundEnabled: boolean;
            buyMode: number;             // 1, 10, or -1 for MAX
            buyModeSticky: boolean;
            theme: string;
        };
    };
}

/**
 * Save game state to local storage
 * Returns the save data for potential Supabase sync
 */
export async function saveGame(gameState: GameState): Promise<{ success: boolean; data?: SaveData }> {
    try {
        const saveData: SaveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            state: {
                // Core currency
                currency: gameState.currency.toString(),
                
                // All generator data
                generators: gameState.generators.map(g => ({
                    id: g.id,
                    level: g.level,
                    fillProgress: g.fillProgress,
                    unlocked: g.unlocked,
                    earnBonus: g.earnBonus.toString(),
                    speedBonus: g.speedBonus,
                    costReduction: g.costReduction
                })),
                
                // Prestige state
                prestige: {
                    totalPrestiges: gameState.prestige.totalPrestiges,
                    currentIdleMultiplier: gameState.prestige.currentIdleMultiplier,
                    selectablesRemaining: gameState.prestige.selectablesRemaining,
                    history: gameState.prestige.history.map(h => ({
                        generator: h.generator,
                        bonus: h.bonus,
                        amount: h.amount,
                        timestamp: h.timestamp
                    }))
                },
                
                // Statistics
                stats: {
                    lifetimeEarnings: gameState.stats.lifetimeEarnings.toString(),
                    incomePerSecond: gameState.stats.incomePerSecond.toString(),
                    timePlayedMs: gameState.stats.timePlayedMs
                },
                
                // Global state
                global: {
                    pow: gameState.global.pow,
                    idlePower: gameState.global.idlePower,
                    worldsCompleted: gameState.global.worldsCompleted
                },
                
                // Timestamps
                timestamps: {
                    lastSave: Date.now(),
                    lastTick: gameState.timestamps.lastTick,
                    sessionStart: gameState.timestamps.sessionStart
                },
                
                // User settings
                settings: {
                    soundEnabled: gameState.settings.soundEnabled,
                    buyMode: gameState.settings.buyMode,
                    buyModeSticky: gameState.settings.buyModeSticky,
                    theme: gameState.settings.theme
                }
            }
        };
        
        // Serialize and compress
        const serialized = JSON.stringify(saveData);
        const compressed = LZString.compressToBase64(serialized);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(SAVE_KEY, compressed);
        
        // Update timestamp in game state
        gameState.timestamps.lastSave = Date.now();
        
        return { success: true, data: saveData };
    } catch (error) {
        console.error('Failed to save game:', error);
        return { success: false };
    }
}

/**
 * Load game state from local storage
 * Returns a new GameState object (doesn't mutate input)
 */
export async function loadGame(): Promise<{ success: boolean; state?: Partial<GameState> }> {
    try {
        const compressed = await AsyncStorage.getItem(SAVE_KEY);
        if (!compressed) {
            return { success: false };
        }
        
        const serialized = LZString.decompressFromBase64(compressed);
        if (!serialized) {
            console.error('Failed to decompress save data');
            return { success: false };
        }
        
        const saveData: SaveData = JSON.parse(serialized);
        
        // Validate version (for future migrations)
        if (saveData.version !== SAVE_VERSION) {
            console.warn(`Save version mismatch: ${saveData.version} vs ${SAVE_VERSION}`);
            // Could add migration logic here
        }
        
        // Build new state object
        const loadedState: Partial<GameState> = {
            // Core currency
            currency: new Decimal(saveData.state.currency || '0'),
            
            // Generators - restore all generator data
            generators: GENERATORS.map(genConfig => {
                const savedGen = saveData.state.generators.find(g => g.id === genConfig.id);
                if (savedGen) {
                    return {
                        ...genConfig,
                        level: savedGen.level || 0,
                        fillProgress: savedGen.fillProgress || 0,
                        unlocked: savedGen.unlocked !== undefined ? savedGen.unlocked : genConfig.unlocked,
                        earnBonus: new Decimal(savedGen.earnBonus || '1'),
                        speedBonus: savedGen.speedBonus || 1,
                        costReduction: savedGen.costReduction || 1
                    } as Generator;
                }
                // Default state for new generators
                return {
                    ...genConfig,
                    level: 0,
                    fillProgress: 0,
                    earnBonus: new Decimal(1),
                    speedBonus: 1,
                    costReduction: 1
                } as Generator;
            }),
            
            // Prestige state
            prestige: {
                totalPrestiges: saveData.state.prestige?.totalPrestiges || 0,
                currentIdleMultiplier: saveData.state.prestige?.currentIdleMultiplier || 1,
                selectablesRemaining: saveData.state.prestige?.selectablesRemaining || 0,
                history: saveData.state.prestige?.history || []
            },
            
            // Statistics
            stats: {
                lifetimeEarnings: new Decimal(saveData.state.stats?.lifetimeEarnings || '0'),
                incomePerSecond: new Decimal(saveData.state.stats?.incomePerSecond || '0'),
                timePlayedMs: saveData.state.stats?.timePlayedMs || 0
            },
            
            // Global state
            global: {
                pow: saveData.state.global?.pow || 1.0,
                idlePower: saveData.state.global?.idlePower || 0,
                worldsCompleted: saveData.state.global?.worldsCompleted || 0
            },
            
            // Timestamps
            timestamps: {
                lastSave: saveData.state.timestamps?.lastSave || Date.now(),
                lastTick: Date.now(), // Reset to now for new session
                sessionStart: Date.now() // New session
            },
            
            // Settings
            settings: {
                soundEnabled: saveData.state.settings?.soundEnabled !== undefined 
                    ? saveData.state.settings.soundEnabled 
                    : true,
                buyMode: saveData.state.settings?.buyMode || 1,
                buyModeSticky: saveData.state.settings?.buyModeSticky || false,
                theme: (saveData.state.settings?.theme === 'green' ? 'green' : 'purple') as 'purple' | 'green'
            }
        };
        
        // Calculate offline progress if applicable
        if (saveData.timestamp) {
            calculateOfflineProgress(saveData.timestamp, loadedState);
        }
        
        return { success: true, state: loadedState };
    } catch (error) {
        console.error('Failed to load game:', error);
        return { success: false };
    }
}

/**
 * Calculate offline progress based on time since last save
 * Updates idle multiplier based on offline time
 */
function calculateOfflineProgress(lastSaveTime: number, gameState: Partial<GameState>): void {
    if (!gameState.prestige || !gameState.global) return;
    
    const offlineMs = Date.now() - lastSaveTime;
    const hours = offlineMs / (1000 * 60 * 60);
    
    // Cap at 24 hours
    const cappedHours = Math.min(hours, 24);
    
    if (cappedHours > 0.01) { // Only apply if more than 36 seconds
        // Increase idle multiplier based on offline time
        const growthRate = 0.5 + (gameState.global.idlePower * 0.3);
        const idleGain = cappedHours * growthRate;
        gameState.prestige.currentIdleMultiplier = 1 + idleGain;
    }
}

/**
 * Clear all saved game data
 */
export async function clearSave(): Promise<boolean> {
    try {
        await AsyncStorage.removeItem(SAVE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear save:', error);
        return false;
    }
}

/**
 * Export save data as JSON (for backup or Supabase migration)
 */
export async function exportSaveData(): Promise<SaveData | null> {
    try {
        const compressed = await AsyncStorage.getItem(SAVE_KEY);
        if (!compressed) return null;
        
        const serialized = LZString.decompressFromBase64(compressed);
        if (!serialized) return null;
        
        return JSON.parse(serialized) as SaveData;
    } catch (error) {
        console.error('Failed to export save data:', error);
        return null;
    }
}
