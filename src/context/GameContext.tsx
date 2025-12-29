import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import Decimal from 'break_infinity.js';
import { GENERATORS } from '../config/generators';
import { updateGenerators } from '../utils/generators';
import { updateIdleMultiplier } from '../utils/prestige';
import { loadGame, saveGame, clearSave } from '../utils/save';
import { GameState, GameContextValue, Generator } from '../types/game';

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function useGame(): GameContextValue {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
}

interface GameProviderProps {
    children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
    const [gameState, setGameState] = useState<GameState>(() => {
        // Initialize game state with defaults
        // Start with enough currency to buy the first generator (Yellow costs 10)
        const initialState: GameState = {
            currency: new Decimal(10),
            
            generators: GENERATORS.map(gen => ({
                ...gen,
                level: 0,
                fillProgress: 0,
                earnBonus: new Decimal(1),
                speedBonus: 1,
                costReduction: 1
            })) as Generator[],
            
            prestige: {
                totalPrestiges: 0,
                currentIdleMultiplier: 1,
                selectablesRemaining: 0,
                history: []
            },
            
            stats: {
                lifetimeEarnings: new Decimal(0),
                incomePerSecond: new Decimal(0),
                timePlayedMs: 0
            },
            
            global: {
                pow: 1.0,
                idlePower: 0,
                worldsCompleted: 0
            },
            
            timestamps: {
                lastSave: Date.now(),
                lastTick: Date.now(),
                sessionStart: Date.now(),
                lastPrestige: Date.now() // Start of current prestige run
            },
            
            settings: {
                soundEnabled: true,
                buyMode: 1,
                buyModeSticky: false,
                theme: 'nostalgia' as const
            }
        };
        
        // Unlock first generator
        initialState.generators[0].unlocked = true;
        
        return initialState;
    });

    const lastTimeRef = useRef<number>(performance.now());
    const lastSaveTimeRef = useRef<number>(Date.now());
    const sessionStartTimeRef = useRef<number>(Date.now());
    const animationFrameRef = useRef<number | null>(null);
    const isLoadedRef = useRef<boolean>(false);
    const gameStateRef = useRef<GameState | null>(null);

    // Load game on mount (only once)
    useEffect(() => {
        if (isLoadedRef.current) return;
        
        loadGame().then(({ success, state }) => {
            if (success && state) {
                setGameState(prevState => {
                    const loadedState = {
                        ...prevState,
                        ...state,
                        // Ensure generators array is properly merged
                        generators: state.generators || prevState.generators,
                        // Update session start to now
                        timestamps: {
                            ...prevState.timestamps,
                            ...state.timestamps,
                            sessionStart: Date.now(),
                            lastPrestige: state.timestamps?.lastPrestige || prevState.timestamps.lastPrestige || Date.now()
                        }
                    };
                    // Store in ref immediately
                    gameStateRef.current = loadedState;
                    return loadedState;
                });
                sessionStartTimeRef.current = Date.now();
            } else {
                // Store initial state in ref if no save loaded
                const initialState: GameState = {
                    currency: new Decimal(10),
                    generators: GENERATORS.map(gen => ({
                        ...gen,
                        level: 0,
                        fillProgress: 0,
                        earnBonus: new Decimal(1),
                        speedBonus: 1,
                        costReduction: 1
                    })) as Generator[],
                    prestige: {
                        totalPrestiges: 0,
                        currentIdleMultiplier: 1,
                        selectablesRemaining: 0,
                        history: []
                    },
                    stats: {
                        lifetimeEarnings: new Decimal(0),
                        incomePerSecond: new Decimal(0),
                        timePlayedMs: 0
                    },
                    global: {
                        pow: 1.0,
                        idlePower: 0,
                        worldsCompleted: 0
                    },
                    timestamps: {
                        lastSave: Date.now(),
                        lastTick: Date.now(),
                        sessionStart: Date.now(),
                        lastPrestige: Date.now() // Start of current prestige run
                    },
                    settings: {
                        soundEnabled: true,
                        buyMode: 1,
                        buyModeSticky: false,
                        theme: 'nostalgia' as const
                    }
                };
                initialState.generators[0].unlocked = true;
                gameStateRef.current = initialState;
            }
            isLoadedRef.current = true;
        });
    }, []);

    // Game loop - updates game state and tracks time played
    useEffect(() => {
        function gameLoop(currentTime: number) {
            const deltaTime = Math.min(currentTime - lastTimeRef.current, 1000); // Cap at 1 second
            lastTimeRef.current = currentTime;
            
            setGameState(prevState => {
                const newState = { ...prevState };
                
                // Update generators (production, fill progress)
                updateGenerators(newState.generators, deltaTime, newState);
                
                // Update idle multiplier based on time since last prestige
                updateIdleMultiplier(newState);
                
                // Update time played (accumulate session time)
                const sessionTime = Date.now() - sessionStartTimeRef.current;
                newState.stats.timePlayedMs = (prevState.stats.timePlayedMs || 0) + deltaTime;
                
                // Generators are now unlocked manually by paying the unlock cost
                
                // Update last tick timestamp
                newState.timestamps.lastTick = currentTime;
                
                // Store latest state in ref for auto-save
                gameStateRef.current = newState;
                
                return newState;
            });
            
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            // Final save on unmount
            if (gameStateRef.current) {
                saveGame(gameStateRef.current).catch(err => {
                    console.error('Final save failed:', err);
                });
            }
        };
    }, []);

    // Auto-save every 10 seconds using a separate interval
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (gameStateRef.current && isLoadedRef.current) {
                saveGame(gameStateRef.current)
                    .then(result => {
                        if (result.success) {
                            // Update lastSave timestamp in state
                            setGameState(prevState => ({
                                ...prevState,
                                timestamps: {
                                    ...prevState.timestamps,
                                    lastSave: Date.now()
                                }
                            }));
                        } else {
                            console.error('Auto-save failed');
                        }
                    })
                    .catch(err => {
                        console.error('Auto-save error:', err);
                    });
            }
        }, 10000); // 10 seconds

        return () => {
            clearInterval(autoSaveInterval);
        };
    }, []);

    const value: GameContextValue = {
        gameState,
        setGameState,
        saveGame: async () => {
            const result = await saveGame(gameState);
            if (!result.success) {
                console.error('Failed to save game');
            }
        },
        restartGame: async () => {
            await clearSave();
            // Reset to initial state
            setGameState(prevState => {
                const newState: GameState = {
                    currency: new Decimal(10),
                    generators: GENERATORS.map(gen => ({
                        ...gen,
                        level: 0,
                        fillProgress: 0,
                        earnBonus: new Decimal(1),
                        speedBonus: 1,
                        costReduction: 1
                    })) as Generator[],
                    prestige: {
                        totalPrestiges: 0,
                        currentIdleMultiplier: 1,
                        selectablesRemaining: 0,
                        history: []
                    },
                    stats: {
                        lifetimeEarnings: new Decimal(0),
                        incomePerSecond: new Decimal(0),
                        timePlayedMs: 0
                    },
                    global: {
                        pow: 1.0,
                        idlePower: 0,
                        worldsCompleted: 0
                    },
                    timestamps: {
                        lastSave: Date.now(),
                        lastTick: Date.now(),
                        sessionStart: Date.now(),
                        lastPrestige: Date.now() // Start of current prestige run
                    },
                    settings: prevState.settings // Keep settings
                };
                newState.generators[0].unlocked = true;
                return newState;
            });
        },
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
