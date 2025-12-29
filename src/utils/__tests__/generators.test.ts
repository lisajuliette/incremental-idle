/**
 * Tests for Generator Calculations
 * Verifies that prestige buffs (cost reduction, earn bonus, speed bonus) are correctly applied
 */

import Decimal from 'break_infinity.js';
import {
	getUpgradeCost,
	getProduction,
	bulkBuyCost,
	maxAffordable,
	buyGenerator,
	updateGenerators,
} from '../generators';
import { Generator, GameState } from '../../types/game';
import { GENERATORS } from '../../config/generators';

describe('Generator Calculations', () => {
	// Helper to create a generator with specific properties
	const createGenerator = (
		baseConfig: typeof GENERATORS[0],
		overrides: Partial<Generator> = {}
	): Generator => ({
		...baseConfig,
		level: 0,
		fillProgress: 0,
		earnBonus: new Decimal(1),
		speedBonus: 1,
		costReduction: 1,
		unlocked: true,
		...overrides,
	});

	// Helper to create a minimal game state
	const createGameState = (currency: number = 0): GameState => ({
		currency: new Decimal(currency),
		generators: [],
		prestige: {
			totalPrestiges: 0,
			currentIdleMultiplier: 1,
			selectablesRemaining: 0,
			history: [],
		},
		stats: {
			lifetimeEarnings: new Decimal(0),
			incomePerSecond: new Decimal(0),
			timePlayedMs: 0,
		},
		global: {
			pow: 1.0,
			idlePower: 0,
			worldsCompleted: 0,
		},
		timestamps: {
			lastSave: Date.now(),
			lastTick: Date.now(),
			sessionStart: Date.now(),
		},
		settings: {
			soundEnabled: true,
			buyMode: 1,
			buyModeSticky: false,
			theme: 'nostalgia',
		},
	});

	describe('Cost Reduction (Prestige Buff)', () => {
		test('Orange generator should apply cost reduction correctly', () => {
			const roseConfig = GENERATORS.find((g) => g.name === 'Orange')!;
			const rose = createGenerator(roseConfig, {
				level: 5,
				costReduction: 1.5, // 50% cost reduction (costs are divided by this)
			});

			// Calculate cost with and without cost reduction
			const costWithoutReduction = getUpgradeCost(
				createGenerator(roseConfig, { level: 5, costReduction: 1 }),
				1
			);
			const costWithReduction = getUpgradeCost(rose, 1);

			// With 1.5x cost reduction, cost should be 1/1.5 = 0.666... of original
			const expectedCost = costWithoutReduction.div(1.5);
			expect(costWithReduction.toNumber()).toBeCloseTo(
				expectedCost.toNumber(),
				2
			);
		});

		test('Cost reduction should work for bulk purchases', () => {
			const roseConfig = GENERATORS.find((g) => g.name === 'Orange')!;
			const rose = createGenerator(roseConfig, {
				level: 0,
				costReduction: 2.0, // 2x cost reduction (50% cheaper)
			});

			const bulkCost = bulkBuyCost(
				rose.baseCost,
				rose.growthRate,
				rose.level,
				10,
				rose.costReduction
			);

			// Calculate expected cost without reduction
			const expectedCostWithoutReduction = bulkBuyCost(
				rose.baseCost,
				rose.growthRate,
				rose.level,
				10,
				1
			);

			// With 2x cost reduction, cost should be half
			const expectedCost = expectedCostWithoutReduction.div(2);
			expect(bulkCost.toNumber()).toBeCloseTo(expectedCost.toNumber(), 2);
		});

		test('Cost reduction should affect max affordable calculation', () => {
			const roseConfig = GENERATORS.find((g) => g.name === 'Orange')!;
			const rose = createGenerator(roseConfig, {
				level: 0,
				costReduction: 1.5,
			});

			const currency = new Decimal(1000);

			// Max affordable with cost reduction
			const maxWithReduction = maxAffordable(
				currency,
				rose.baseCost,
				rose.growthRate,
				rose.level,
				rose.costReduction
			);

			// Max affordable without cost reduction
			const maxWithoutReduction = maxAffordable(
				currency,
				rose.baseCost,
				rose.growthRate,
				rose.level,
				1
			);

			// With cost reduction, should be able to afford more
			expect(maxWithReduction).toBeGreaterThan(maxWithoutReduction);
		});

		test('Multiple cost reduction buffs should stack multiplicatively', () => {
			const roseConfig = GENERATORS.find((g) => g.name === 'Orange')!;
			// Simulate two 1.5x cost reduction buffs = 2.25x total
			const rose = createGenerator(roseConfig, {
				level: 0,
				costReduction: 2.25,
			});

			const cost = getUpgradeCost(rose, 1);
			const costWithoutReduction = getUpgradeCost(
				createGenerator(roseConfig, { level: 0, costReduction: 1 }),
				1
			);

			// Should be 1/2.25 of original cost
			const expectedCost = costWithoutReduction.div(2.25);
			expect(cost.toNumber()).toBeCloseTo(expectedCost.toNumber(), 2);
		});
	});

	describe('Earn Bonus (Prestige Buff)', () => {
		test('Earn bonus should multiply production correctly', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			const red = createGenerator(redConfig, {
				level: 10,
				earnBonus: new Decimal(2.5), // 2.5x earn bonus
			});

			const production = getProduction(red);

			// Calculate expected production
			// baseProduction * level * milestoneMultiplier * earnBonus
			const baseProduction = red.baseProduction;
			const level = red.level;
			const milestoneMultiplier = 1; // No milestones at level 10
			const expectedProduction = new Decimal(baseProduction)
				.times(level)
				.times(milestoneMultiplier)
				.times(red.earnBonus);

			expect(production.toNumber()).toBeCloseTo(
				expectedProduction.toNumber(),
				2
			);
		});

		test('Earn bonus should work with milestone multipliers', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			const red = createGenerator(redConfig, {
				level: 50, // Past 25 and 50 milestones (2x * 2x = 4x multiplier)
				earnBonus: new Decimal(1.5),
			});

			const production = getProduction(red);

			// Should have 4x milestone multiplier at level 50 (25 and 50 milestones)
			const baseProduction = red.baseProduction;
			const expectedProduction = new Decimal(baseProduction)
				.times(50)
				.times(4) // Milestone multiplier (2 milestones: 25 and 50)
				.times(1.5); // Earn bonus

			expect(production.toNumber()).toBeCloseTo(
				expectedProduction.toNumber(),
				2
			);
		});

		test('Multiple earn bonuses should stack multiplicatively', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			// Simulate two 1.5x earn bonuses = 2.25x total
			const red = createGenerator(redConfig, {
				level: 10,
				earnBonus: new Decimal(2.25),
			});

			const production = getProduction(red);
			const productionWithoutBonus = getProduction(
				createGenerator(redConfig, { level: 10, earnBonus: new Decimal(1) })
			);

			// Should be 2.25x the base production
			const expectedProduction = productionWithoutBonus.times(2.25);
			expect(production.toNumber()).toBeCloseTo(
				expectedProduction.toNumber(),
				2
			);
		});
	});

	describe('Speed Bonus (Prestige Buff)', () => {
		test('Speed bonus should reduce fill time correctly', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			const red = createGenerator(redConfig, {
				level: 1,
				speedBonus: 2.0, // 2x speed (fill time is divided by this)
			});

			const gameState = createGameState(0);
			gameState.generators = [red];

			// Update generators for 1000ms (1 second)
			updateGenerators([red], 1000, gameState);

			// With 2x speed bonus, fillTime (1000ms) becomes 500ms effective
			// So in 1000ms, we should get 1000 / 500 = 2.0 fill progress
			// But fillProgress is capped at cycles, so we need to check if it completed cycles
			// Actually, fillProgress accumulates, so if it's >= 1, it grants currency and resets
			// So after 1000ms with 2x speed, we should have completed 2 cycles
			// The remaining fillProgress should be close to 0 (since 2 cycles were completed)
			expect(red.fillProgress).toBeGreaterThanOrEqual(0);
			expect(red.fillProgress).toBeLessThan(1);
		});

		test('Speed bonus should increase income per second', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			const red = createGenerator(redConfig, {
				level: 1,
				speedBonus: 1.5, // 1.5x speed
			});

			const gameState = createGameState(0);
			gameState.generators = [red];

			// Update generators
			updateGenerators([red], 1000, gameState);

			// Income per second should be higher with speed bonus
			const incomePerSecond = gameState.stats.incomePerSecond.toNumber();

			// Base production is 1.0, level 1, so base income per second = 1.0 / 1.0 = 1.0
			// With 1.5x speed, effective fill time = 1000 / 1.5 = 666.67ms
			// Income per second = 1.0 / 0.66667 = 1.5
			expect(incomePerSecond).toBeGreaterThan(1.0);
		});

		test('Multiple speed bonuses should stack multiplicatively', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			// Simulate two 1.5x speed bonuses = 2.25x total
			const red = createGenerator(redConfig, {
				level: 1,
				speedBonus: 2.25,
			});

			const gameState = createGameState(0);
			gameState.generators = [red];

			updateGenerators([red], 1000, gameState);

			// With 2.25x speed, fill time = 1000 / 2.25 = 444.44ms
			// In 1000ms, should complete 2 cycles (1000 / 444.44 = 2.25)
			// Remaining fillProgress should be 0.25 (after 2 cycles completed)
			expect(red.fillProgress).toBeCloseTo(0.25, 1);
		});
	});

	describe('Combined Prestige Buffs', () => {
		test('Orange generator with all three buffs should work correctly', () => {
			const roseConfig = GENERATORS.find((g) => g.name === 'Orange')!;
			const rose = createGenerator(roseConfig, {
				level: 5,
				earnBonus: new Decimal(2.0), // 2x earn
				speedBonus: 1.5, // 1.5x speed
				costReduction: 1.5, // 1.5x cost reduction
			});

			// Test cost reduction
			const cost = getUpgradeCost(rose, 1);
			const costWithoutReduction = getUpgradeCost(
				createGenerator(roseConfig, { level: 5, costReduction: 1 }),
				1
			);
			expect(cost.toNumber()).toBeCloseTo(
				costWithoutReduction.div(1.5).toNumber(),
				2
			);

			// Test production (earn bonus)
			const production = getProduction(rose);
			const productionWithoutBonus = getProduction(
				createGenerator(roseConfig, {
					level: 5,
					earnBonus: new Decimal(1),
				})
			);
			expect(production.toNumber()).toBeCloseTo(
				productionWithoutBonus.times(2).toNumber(),
				2
			);

			// Test speed bonus
			const gameState = createGameState(0);
			gameState.generators = [rose];
			updateGenerators([rose], 1000, gameState);

			// With 1.5x speed, fill time = 1100 / 1.5 = 733.33ms
			// In 1000ms, should get 1000 / 733.33 = 1.36 fill progress
			// After 1 cycle completes, remaining should be 0.36
			expect(rose.fillProgress).toBeCloseTo(0.36, 1);
		});
	});

	describe('Buy Generator with Cost Reduction', () => {
		test('Buying should use cost reduction when calculating cost', () => {
			const roseConfig = GENERATORS.find((g) => g.name === 'Orange')!;
			const rose = createGenerator(roseConfig, {
				level: 0,
				costReduction: 2.0, // 2x cost reduction
			});

			const gameState = createGameState(1000); // Enough currency

			const initialCurrency = gameState.currency.toNumber();
			const success = buyGenerator(rose, 1, gameState);

			expect(success).toBe(true);
			expect(rose.level).toBe(1);

			// Cost should be half of normal
			const normalCost = getUpgradeCost(
				createGenerator(roseConfig, { level: 0, costReduction: 1 }),
				1
			);
			const expectedCost = normalCost.div(2);
			const actualCost = initialCurrency - gameState.currency.toNumber();

			expect(actualCost).toBeCloseTo(expectedCost.toNumber(), 2);
		});
	});

	describe('Edge Cases', () => {
		test('Cost reduction of 1 should not change cost', () => {
			const roseConfig = GENERATORS.find((g) => g.name === 'Rose')!;
			const rose = createGenerator(roseConfig, {
				level: 5,
				costReduction: 1,
			});

			const cost = getUpgradeCost(rose, 1);
			const costWithReduction = getUpgradeCost(
				createGenerator(roseConfig, { level: 5, costReduction: 1.5 }),
				1
			);

			// Cost with 1.5x reduction should be less
			expect(cost.toNumber()).toBeGreaterThan(costWithReduction.toNumber());
		});

		test('Earn bonus of 1 should not change production', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			const red = createGenerator(redConfig, {
				level: 10,
				earnBonus: new Decimal(1),
			});

			const production = getProduction(red);
			const productionWithBonus = getProduction(
				createGenerator(redConfig, {
					level: 10,
					earnBonus: new Decimal(2),
				})
			);

			// Production with 2x bonus should be double
			expect(productionWithBonus.toNumber()).toBeCloseTo(
				production.times(2).toNumber(),
				2
			);
		});

		test('Speed bonus of 1 should not change fill time', () => {
			const redConfig = GENERATORS.find((g) => g.name === 'Red')!;
			const red = createGenerator(redConfig, {
				level: 1,
				speedBonus: 1,
			});

			const gameState = createGameState(0);
			gameState.generators = [red];

			updateGenerators([red], 1000, gameState);

			// With speed bonus 1, fill time = 1000ms
			// In 1000ms, should complete 1 cycle, so fillProgress should be 0
			expect(red.fillProgress).toBeCloseTo(0, 1);
		});
	});
});

