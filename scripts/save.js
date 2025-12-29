// Decimal is loaded globally from CDN
const Decimal = window.Decimal;
import { gameState } from './game.js';
import { GENERATORS } from './config.js';
import { showNotification } from './game.js';

export function saveGame() {
    try {
        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            state: {
                currency: gameState.currency.toString(),
                generators: gameState.generators.map(g => ({
                    id: g.id,
                    level: g.level,
                    fillProgress: g.fillProgress,
                    unlocked: g.unlocked,
                    earnBonus: g.earnBonus.toString(),
                    speedBonus: g.speedBonus,
                    costReduction: g.costReduction
                })),
                prestige: {
                    ...gameState.prestige,
                    history: gameState.prestige.history.map(h => ({
                        ...h,
                        timestamp: h.timestamp
                    }))
                },
                stats: {
                    lifetimeEarnings: gameState.stats.lifetimeEarnings.toString(),
                    incomePerSecond: gameState.stats.incomePerSecond.toString(),
                    timePlayedMs: gameState.stats.timePlayedMs
                },
                global: { ...gameState.global },
                timestamps: {
                    ...gameState.timestamps,
                    lastSave: Date.now()
                },
                settings: { ...gameState.settings }
            }
        };
        
        const serialized = JSON.stringify(saveData);
        const compressed = window.LZString ? window.LZString.compressToBase64(serialized) : btoa(serialized);
        localStorage.setItem('idleGameSave', compressed);
        
        gameState.timestamps.lastSave = Date.now();
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

export function loadGame() {
    try {
        const compressed = localStorage.getItem('idleGameSave');
        if (!compressed) return false;
        
        const serialized = window.LZString ? window.LZString.decompressFromBase64(compressed) : atob(compressed);
        if (!serialized) return false;
        
        const saveData = JSON.parse(serialized);
        
        // Restore Decimal values
        gameState.currency = new Decimal(saveData.state.currency || 0);
        gameState.stats.lifetimeEarnings = new Decimal(saveData.state.stats.lifetimeEarnings || 0);
        gameState.stats.incomePerSecond = new Decimal(saveData.state.stats.incomePerSecond || 0);
        
        // Restore generators
        saveData.state.generators.forEach(savedGen => {
            const gen = gameState.generators.find(g => g.id === savedGen.id);
            if (gen) {
                gen.level = savedGen.level || 0;
                gen.fillProgress = savedGen.fillProgress || 0;
                gen.unlocked = savedGen.unlocked !== undefined ? savedGen.unlocked : false;
                gen.earnBonus = new Decimal(savedGen.earnBonus || 1);
                gen.speedBonus = savedGen.speedBonus || 1;
                gen.costReduction = savedGen.costReduction || 1;
            }
        });
        
        // Restore prestige
        if (saveData.state.prestige) {
            gameState.prestige.totalPrestiges = saveData.state.prestige.totalPrestiges || 0;
            gameState.prestige.currentIdleMultiplier = saveData.state.prestige.currentIdleMultiplier || 1;
            gameState.prestige.selectablesRemaining = saveData.state.prestige.selectablesRemaining || 0;
            gameState.prestige.history = saveData.state.prestige.history || [];
        }
        
        // Restore stats
        if (saveData.state.stats) {
            gameState.stats.timePlayedMs = saveData.state.stats.timePlayedMs || 0;
        }
        
        // Restore global
        if (saveData.state.global) {
            Object.assign(gameState.global, saveData.state.global);
        }
        
        // Restore timestamps
        if (saveData.state.timestamps) {
            gameState.timestamps.lastSave = saveData.state.timestamps.lastSave || Date.now();
            gameState.timestamps.lastTick = Date.now();
        }
        
        // Restore settings
        if (saveData.state.settings) {
            Object.assign(gameState.settings, saveData.state.settings);
            
            // Update UI checkboxes
            const soundToggle = document.getElementById('sound-toggle');
            const stickyToggle = document.getElementById('sticky-mode-toggle');
            if (soundToggle) soundToggle.checked = gameState.settings.soundEnabled;
            if (stickyToggle) stickyToggle.checked = gameState.settings.buyModeSticky;
        }
        
        // Calculate offline progress
        if (saveData.timestamp) {
            calculateOfflineProgress(saveData.timestamp);
        }
        
        return true;
    } catch (error) {
        console.error('Failed to load game:', error);
        return false;
    }
}

function calculateOfflineProgress(lastSaveTime) {
    const offlineMs = Date.now() - lastSaveTime;
    const hours = offlineMs / (1000 * 60 * 60);
    
    // Cap at 24 hours
    const cappedHours = Math.min(hours, 24);
    
    if (cappedHours > 0.01) { // Only show if more than 36 seconds
        // Increase idle multiplier instead of granting currency
        const idleGain = cappedHours * (0.5 + gameState.global.idlePower * 0.3);
        gameState.prestige.currentIdleMultiplier = 1 + idleGain;
        
        // Show offline progress notification
        showNotification(
            `Welcome back!\n` +
            `You were away for ${cappedHours.toFixed(1)} hours.\n` +
            `Idle multiplier: ×${gameState.prestige.currentIdleMultiplier.toFixed(2)}`
        );
    }
}

