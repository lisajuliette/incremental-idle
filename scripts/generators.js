// Decimal is loaded globally from CDN
const Decimal = window.Decimal;
import { MILESTONES } from './config.js';
import { gameState } from './game.js';

export function updateGenerators(deltaTime) {
    let totalIncome = new Decimal(0);
    
    for (const gen of gameState.generators) {
        if (!gen.unlocked || gen.level === 0) continue;
        
        // Update fill progress
        const effectiveFillTime = gen.fillTime / gen.speedBonus;
        gen.fillProgress += (deltaTime / effectiveFillTime);
        
        // When fill completes, grant production
        if (gen.fillProgress >= 1) {
            const cycles = Math.floor(gen.fillProgress);
            gen.fillProgress -= cycles;
            
            const production = getProduction(gen).times(cycles);
            gameState.currency = gameState.currency.plus(production);
            gameState.stats.lifetimeEarnings = 
                gameState.stats.lifetimeEarnings.plus(production);
            
            // Calculate income per second
            const incomePerSecond = production.times(1000 / effectiveFillTime);
            totalIncome = totalIncome.plus(incomePerSecond.times(cycles));
        }
    }
    
    // Update income per second (sum of all generator production rates)
    let totalIncomePerSecond = new Decimal(0);
    for (const gen of gameState.generators) {
        if (!gen.unlocked || gen.level === 0) continue;
        const effectiveFillTime = gen.fillTime / gen.speedBonus;
        const production = getProduction(gen);
        const incomePerSecond = production.times(1000 / effectiveFillTime);
        totalIncomePerSecond = totalIncomePerSecond.plus(incomePerSecond);
    }
    gameState.stats.incomePerSecond = totalIncomePerSecond;
}

export function getUpgradeCost(generator, amount = 1) {
    if (amount === 1) {
        const { baseCost, growthRate, level, costReduction } = generator;
        const rawCost = baseCost * Math.pow(growthRate, level);
        return new Decimal(rawCost / costReduction);
    } else {
        // Bulk purchase cost
        return bulkBuyCost(
            generator.baseCost,
            generator.growthRate,
            generator.level,
            amount,
            generator.costReduction
        );
    }
}

export function getProduction(generator) {
    if (generator.level === 0) return new Decimal(0);
    
    const { baseProduction, level, earnBonus } = generator;
    const milestoneMultiplier = getMilestoneMultiplier(level);
    
    const production = new Decimal(baseProduction)
        .times(level)
        .times(milestoneMultiplier)
        .times(earnBonus);
    
    return production;
}

export function getMilestoneMultiplier(level) {
    let multiplier = 1;
    
    for (const milestone of MILESTONES) {
        if (level >= milestone) multiplier *= 2;
    }
    
    return multiplier;
}

export function bulkBuyCost(baseCost, growthRate, owned, amount, costReduction = 1) {
    if (amount <= 0) return new Decimal(0);
    if (amount === 1) {
        return getUpgradeCost({ baseCost, growthRate, level: owned, costReduction }, 1);
    }
    
    const b = baseCost;
    const r = growthRate;
    const k = owned;
    const n = amount;
    
    const rawCost = b * (Math.pow(r, k) * (Math.pow(r, n) - 1)) / (r - 1);
    return new Decimal(rawCost / costReduction);
}

export function maxAffordable(currency, baseCost, growthRate, owned, costReduction = 1) {
    const c = currency.toNumber();
    const b = baseCost;
    const r = growthRate;
    const k = owned;
    
    if (c < b * Math.pow(r, k) / costReduction) return 0;
    
    const max = Math.floor(
        Math.log((c * (r - 1) * costReduction) / (b * Math.pow(r, k)) + 1) / Math.log(r)
    );
    
    return Math.max(0, max);
}

export function buyGenerator(generator, amount) {
    if (!generator.unlocked) return false;
    
    let actualAmount = amount;
    
    // Determine amount to buy
    if (amount === -1) {
        // MAX mode
        actualAmount = maxAffordable(
            gameState.currency,
            generator.baseCost,
            generator.growthRate,
            generator.level,
            generator.costReduction
        );
        if (actualAmount === 0) return false;
    }
    
    const cost = getUpgradeCost(generator, actualAmount);
    
    if (gameState.currency.lt(cost)) return false;
    
    gameState.currency = gameState.currency.minus(cost);
    generator.level += actualAmount;
    
    return true;
}

export function getNextMilestone(level) {
    for (const milestone of MILESTONES) {
        if (level < milestone) return milestone;
    }
    return null; // All milestones reached
}

export function getMilestoneProgress(level) {
    const nextMilestone = getNextMilestone(level);
    if (!nextMilestone) return { progress: 1, next: null };
    
    const prevMilestone = MILESTONES.find(m => m < nextMilestone) || 0;
    const range = nextMilestone - prevMilestone;
    const progress = (level - prevMilestone) / range;
    
    return { progress: Math.min(1, Math.max(0, progress)), next: nextMilestone };
}

