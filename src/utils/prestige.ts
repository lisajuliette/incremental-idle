import Decimal from 'break_infinity.js';
import { GameState } from '../types/game';

export function calculatePrestigeValue(gameState: GameState): Decimal {
    const totalEarned = gameState.stats.lifetimeEarnings;
    const baseValue = totalEarned.div(10000).floor();
    
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

export function updateIdleMultiplier(deltaTime: number, gameState: GameState): void {
    const hours = deltaTime / (1000 * 60 * 60);
    const growthRate = 0.5 + (gameState.global.idlePower * 0.3); // Base 50% per hour + idle power
    const maxHours = 24; // Cap at 24 hours
    
    const cappedHours = Math.min(hours, maxHours);
    const multiplierIncrease = cappedHours * growthRate;
    
    gameState.prestige.currentIdleMultiplier = 1 + multiplierIncrease;
}

