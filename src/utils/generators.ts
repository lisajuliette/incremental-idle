import Decimal from 'break_infinity.js';
import { MILESTONES } from '../config/generators';
import { Generator, GameState } from '../types/game';

export function updateGenerators(generators: Generator[], deltaTime: number, gameState: GameState): void {
	let totalIncome = new Decimal(0);

	for (const gen of generators) {
		if (!gen.unlocked || gen.level === 0) continue;

		// Update fill progress
		const effectiveFillTime = gen.fillTime / gen.speedBonus;
		gen.fillProgress += deltaTime / effectiveFillTime;

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
	for (const gen of generators) {
		if (!gen.unlocked || gen.level === 0) continue;
		const effectiveFillTime = gen.fillTime / gen.speedBonus;
		const production = getProduction(gen);
		const incomePerSecond = production.times(1000 / effectiveFillTime);
		totalIncomePerSecond = totalIncomePerSecond.plus(incomePerSecond);
	}
	gameState.stats.incomePerSecond = totalIncomePerSecond;
}

export function getUpgradeCost(generator: Generator, amount: number = 1): Decimal {
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

export function getProduction(generator: Generator): Decimal {
	if (generator.level === 0) return new Decimal(0);

	const { baseProduction, level, earnBonus } = generator;
	const milestoneMultiplier = getMilestoneMultiplier(level);

	const production = new Decimal(baseProduction)
		.times(level)
		.times(milestoneMultiplier)
		.times(earnBonus);

	return production;
}

export function getMilestoneMultiplier(level: number): number {
	let multiplier = 1;

	for (const milestone of MILESTONES) {
		if (level >= milestone) multiplier *= 2;
	}

	return multiplier;
}

export function bulkBuyCost(
	baseCost: number,
	growthRate: number,
	owned: number,
	amount: number,
	costReduction: number = 1
): Decimal {
	if (amount <= 0) return new Decimal(0);
	if (amount === 1) {
		return getUpgradeCost(
			{ baseCost, growthRate, level: owned, costReduction } as Generator,
			1
		);
	}

	const b = baseCost;
	const r = growthRate;
	const k = owned;
	const n = amount;

	const rawCost = (b * (Math.pow(r, k) * (Math.pow(r, n) - 1))) / (r - 1);
	return new Decimal(rawCost / costReduction);
}

export function maxAffordable(
	currency: Decimal,
	baseCost: number,
	growthRate: number,
	owned: number,
	costReduction: number = 1
): number {
	const c = currency.toNumber();
	const b = baseCost;
	const r = growthRate;
	const k = owned;

	if (c < (b * Math.pow(r, k)) / costReduction) return 0;

	const max = Math.floor(
		Math.log((c * (r - 1) * costReduction) / (b * Math.pow(r, k)) + 1) /
			Math.log(r)
	);

	return Math.max(0, max);
}

/**
 * Unlock a generator by paying its unlock cost
 */
export function unlockGenerator(generator: Generator, gameState: GameState): boolean {
	if (generator.unlocked) return false; // Already unlocked
	
	const unlockCost = new Decimal(generator.unlockCost);
	if (gameState.currency.lt(unlockCost)) return false; // Can't afford
	
	gameState.currency = gameState.currency.minus(unlockCost);
	generator.unlocked = true;
	
	return true;
}

export function buyGenerator(generator: Generator, amount: number, gameState: GameState): boolean {
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

export function getNextMilestone(level: number): number | null {
	for (const milestone of MILESTONES) {
		if (level < milestone) return milestone;
	}
	return null; // All milestones reached
}

export function getMilestoneProgress(level: number): { progress: number; next: number | null } {
	const nextMilestone = getNextMilestone(level);
	if (!nextMilestone) return { progress: 1, next: null };

	const prevMilestone = MILESTONES.find((m) => m < nextMilestone) || 0;
	const range = nextMilestone - prevMilestone;
	const progress = (level - prevMilestone) / range;

	return { progress: Math.min(1, Math.max(0, progress)), next: nextMilestone };
}

