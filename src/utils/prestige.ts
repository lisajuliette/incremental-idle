import Decimal from 'break_infinity.js';
import { GameState } from '../types/game';

export function calculatePrestigeValue(gameState: GameState): Decimal {
    const totalEarned = gameState.stats.lifetimeEarnings;
    // 1 prestige point per 10 million currency earned (may increase in future)
    const baseValue = totalEarned.div(10000000).floor();
    
    // Idle multiplier grows while player is away
    const idleMultiplier = gameState.prestige.currentIdleMultiplier;
    
    // POW applies in late game (after divine prestige)
    const pow = gameState.global.pow;
    
    if (pow > 1.0) {
        return applyPow(baseValue.times(idleMultiplier), pow);
    }
    
    return baseValue.times(idleMultiplier).floor();
}

function applyPow(baseValue: Decimal, pow: number): Decimal {
    // Idle Game 1's actual POW formula
    const value = baseValue.toNumber();
    if (value <= 0) return new Decimal(0);
    
    const powered = Math.pow(value, pow);
    const bonus = (pow - 1) * 20;
    
    return new Decimal(powered + bonus).floor();
}

export function updateIdleMultiplier(gameState: GameState): void {
    // Calculate time since last prestige (or game start)
    const now = Date.now();
    const lastPrestigeTime = gameState.timestamps.lastPrestige || gameState.timestamps.sessionStart;
    const hoursSinceLastPrestige = (now - lastPrestigeTime) / (1000 * 60 * 60);
    
    // Cap at 24 hours - at 24 hours, multiplier = 2x (double prestige points)
    const cappedHours = Math.min(hoursSinceLastPrestige, 24);
    
    // Linear growth: 1x at 0 hours, 2x at 24 hours
    // Formula: 1 + (hours / 24)
    gameState.prestige.currentIdleMultiplier = 1 + (cappedHours / 24);
}


