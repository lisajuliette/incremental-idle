/**
 * Generator Card Component
 * Retro-styled card for displaying generator information
 * Inspired by Windows 95/98 and retro pixel art aesthetics
 */

import React, { useRef, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Animated,
	StyleSheet,
	Easing,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getGeneratorColor } from '../theme/colors';
import { Generator } from '../types/game';
import Decimal from 'break_infinity.js';
import {
	getUpgradeCost,
	getProduction,
	getMilestoneProgress,
	maxAffordable,
	bulkBuyCost,
	unlockGenerator,
} from '../utils/generators';
import { formatNumber } from '../utils/formatters';

interface GeneratorCardProps {
	generator: Generator;
	gameState: {
		currency: Decimal;
		settings: {
			buyMode: number;
		};
	};
	onBuy: (generator: Generator, amount: number) => void;
	onUnlock?: (generator: Generator) => void;
}

export default function GeneratorCard({
	generator,
	gameState,
	onBuy,
	onUnlock,
}: GeneratorCardProps) {
	const { theme } = useTheme();

	// Animated values for progress bars
	const milestoneProgressAnim = useRef(new Animated.Value(0)).current;
	const fillProgressAnim = useRef(new Animated.Value(0)).current;

	// Calculate values needed for hooks (even if generator is locked)
	const level = generator.level;
	const isMaxed = level >= 400;
	const milestoneProgress = getMilestoneProgress(level);
	const fillPercent = Math.min(100, generator.fillProgress * 100);
	const milestonePercent = Math.min(100, milestoneProgress.progress * 100);

	// Animate progress bars smoothly with very frequent updates (16ms = one frame at 60fps)
	// Remove refs from dependencies as they are stable and don't change
	useEffect(() => {
		if (generator.unlocked) {
			Animated.timing(milestoneProgressAnim, {
				toValue: milestonePercent,
				duration: 16, // One frame at 60fps for very smooth updates
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();
		}
	}, [milestonePercent, generator.unlocked]); // Removed milestoneProgressAnim from deps (stable ref)

	useEffect(() => {
		if (generator.unlocked) {
			Animated.timing(fillProgressAnim, {
				toValue: fillPercent,
				duration: 16, // One frame at 60fps for very smooth updates
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();
		}
	}, [fillPercent, generator.unlocked]); // Removed fillProgressAnim from deps (stable ref)

	// Early return for locked generators
	if (!generator.unlocked) {
		const unlockCost = new Decimal(generator.unlockCost);
		const canAffordUnlock = gameState.currency.gte(unlockCost);

		return (
			<View
				className={`border-4 rounded mb-3 p-4 bg-white/40 ${
					canAffordUnlock ? 'opacity-100' : 'opacity-60'
				}`}
				style={{ borderColor: generator.color }}
			>
				<View className="flex-row items-center justify-center mb-3">
					<View
						className="w-5 h-5 rounded-full border-2 border-stone-800 mr-2"
						style={{ backgroundColor: generator.color }}
					/>
					<Text
						className="text-sm text-stone-600"
						style={{ fontFamily: 'Jersey10' }}
					>
						{generator.name}
					</Text>
					<MaterialIcons
						name="lock"
						size={16}
						color="#57534E"
						className="ml-2"
					/>
				</View>
				<Text
					className="text-xs text-center mb-3 text-stone-500"
					style={{ fontFamily: 'Jersey10' }}
				>
					Unlock Cost: {formatNumber(unlockCost)}
				</Text>
				{onUnlock && (
					<TouchableOpacity
						className={`p-3 rounded border-2 items-center justify-center ${
							!canAffordUnlock ? 'opacity-50' : ''
						}`}
						style={
							canAffordUnlock
								? {
										backgroundColor: generator.color,
										borderColor: generator.color,
								  }
								: { backgroundColor: '#D6D3D1', borderColor: '#78716C' }
						}
						onPress={() => onUnlock(generator)}
						disabled={!canAffordUnlock}
					>
						<Text
							className="text-[10px] uppercase text-stone-800"
							style={{ fontFamily: 'Jersey10' }}
						>
							UNLOCK GENERATOR
						</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	}

	// Continue with unlocked generator logic
	const production = getProduction(generator);
	const nextCost = getUpgradeCost(generator, 1);
	const cost10 = getUpgradeCost(generator, 10);
	const canAfford1 = gameState.currency.gte(nextCost);
	const canAfford10 = gameState.currency.gte(cost10);

	// Calculate max affordable for BUY MAX button
	const maxAffordableAmount = maxAffordable(
		gameState.currency,
		generator.baseCost,
		generator.growthRate,
		generator.level,
		generator.costReduction
	);

	const costMax =
		maxAffordableAmount > 0
			? getUpgradeCost(generator, maxAffordableAmount)
			: new Decimal(0);
	const canAfford = maxAffordableAmount > 0 && gameState.currency.gte(costMax);

	// Determine buy mode for button styling
	let buyAmount = gameState.settings.buyMode;
	if (buyAmount === -1) {
		buyAmount = maxAffordableAmount;
	}

	// Calculate cost to reach next milestone
	let costToNextMilestone = new Decimal(0);
	if (!isMaxed && milestoneProgress.next) {
		const levelsNeeded = milestoneProgress.next - level;
		if (levelsNeeded > 0) {
			costToNextMilestone = bulkBuyCost(
				generator.baseCost,
				generator.growthRate,
				generator.level,
				levelsNeeded,
				generator.costReduction
			);
		}
	}

	// Determine button style - use generator's color
	const buttonStyleEnabled = {
		backgroundColor: generator.color,
		borderColor: generator.color,
	};
	const buttonStyleDisabled = {
		backgroundColor: '#D6D3D1',
		borderColor: '#78716C',
	}; // stone-300 and stone-500

	return (
		<View
			className="border-4 rounded mb-3 p-3 bg-white/70"
			style={{
				borderColor: generator.color,
				shadowColor: generator.color,
				shadowOffset: { width: 2, height: 2 },
				shadowOpacity: 0.2,
				shadowRadius: 0,
				elevation: 4,
			}}
		>
			{/* Header */}
			<View className="flex-row items-center mb-3">
				<View
					className="w-5 h-5 rounded-full border-2 border-stone-800 mr-2"
					style={{ backgroundColor: generator.color }}
				/>
				<Text
					className="flex-1 text-sm text-stone-800"
					style={{ fontFamily: 'Jersey10' }}
				>
					{generator.name}
				</Text>
				<Text
					className="text-xs ml-2 text-stone-600"
					style={{ fontFamily: 'Jersey10' }}
				>
					Lv. {level}
				</Text>
				{isMaxed && (
					<View className="flex-row items-center ml-2">
						<MaterialIcons
							name="star"
							size={14}
							color="#FFD93D"
							className="mr-1"
						/>
						<Text
							className="text-xs text-yellow-400"
							style={{ fontFamily: 'Jersey10' }}
						>
							MAX
						</Text>
					</View>
				)}
			</View>

			{/* Milestone Progress */}
			{!isMaxed && (
				<View className="mb-3">
					<View className="flex-row items-center justify-between mb-1">
						<View className="flex-row items-center">
							<MaterialIcons
								name="trending-up"
								size={12}
								color="#57534E"
								className="mr-1.5"
							/>
							<Text
								className="text-[10px] text-stone-600"
								style={{ fontFamily: 'Jersey10' }}
							>
								Milestone ({milestoneProgress.next || 'MAX'})
							</Text>
						</View>
						{costToNextMilestone.gt(0) && (
							<Text
								className="text-[9px] text-stone-600"
								style={{ fontFamily: 'Jersey10' }}
							>
								{formatNumber(costToNextMilestone)}
							</Text>
						)}
					</View>
					<View className="h-4 border-2 border-stone-400 rounded relative overflow-hidden bg-stone-300/50">
						<Animated.View
							className="h-full absolute left-0 top-0"
							style={{
								width: milestoneProgressAnim.interpolate({
									inputRange: [0, 100],
									outputRange: ['0%', '100%'],
								}),
								backgroundColor: generator.color,
							}}
						/>
						<Text
							className="absolute top-0 left-0 right-0 bottom-0 text-center text-[9px] text-stone-800"
							style={{ fontFamily: 'Jersey10', lineHeight: 16 }}
						>
							{Math.floor(milestoneProgress.progress * 100)}%
						</Text>
					</View>
				</View>
			)}

			{/* Production Cycle */}
			<View className="mb-3">
				<View className="flex-row items-center mb-1">
					<MaterialIcons
						name="autorenew"
						size={12}
						color="#57534E"
						className="mr-1.5"
					/>
					<Text
						className="text-[10px] text-stone-600"
						style={{ fontFamily: 'Jersey10' }}
					>
						Production Cycle
					</Text>
				</View>
				<View className="h-3 border-2 border-stone-400 rounded relative overflow-hidden bg-stone-300/50">
					<Animated.View
						className="h-full absolute left-0 top-0"
						style={{
							width: fillProgressAnim.interpolate({
								inputRange: [0, 100],
								outputRange: ['0%', '100%'],
							}),
							backgroundColor: generator.color,
						}}
					/>
					<Text
						className="absolute top-0 left-0 right-0 bottom-0 text-center text-[8px] text-stone-800"
						style={{ fontFamily: 'Jersey10', lineHeight: 12 }}
					>
						{fillPercent.toFixed(0)}%
					</Text>
				</View>
			</View>

			{/* Stats */}
			<View className="mb-3">
				<View className="flex-row justify-between items-center mb-1">
					<View className="flex-row items-center">
						<MaterialIcons
							name="show-chart"
							size={12}
							color="#57534E"
							className="mr-1.5"
						/>
						<Text
							className="text-[10px] text-stone-600"
							style={{ fontFamily: 'Jersey10' }}
						>
							Production:
						</Text>
					</View>
					<Text
						className="text-[10px] text-stone-800"
						style={{ fontFamily: 'Jersey10' }}
					>
						{formatNumber(production)}/fill
					</Text>
				</View>
				<View className="flex-row justify-between items-center">
					<View className="flex-row items-center">
						<MaterialIcons
							name="arrow-upward"
							size={12}
							color="#57534E"
							className="mr-1.5"
						/>
						<Text
							className="text-[10px] text-stone-600"
							style={{ fontFamily: 'Jersey10' }}
						>
							Next:
						</Text>
					</View>
					<Text
						className="text-[10px] text-stone-800"
						style={{ fontFamily: 'Jersey10' }}
					>
						{formatNumber(nextCost)}
					</Text>
				</View>
			</View>

			{/* Prestige Buffs */}
			{(generator.earnBonus.gt(1) ||
				generator.speedBonus > 1 ||
				generator.costReduction > 1) && (
				<View className="mb-3 p-2 bg-yellow-100/50 border-2 border-yellow-400/50 rounded">
					<View className="flex-row items-center mb-1.5">
						<MaterialIcons
							name="stars"
							size={12}
							color="#F59E0B"
							className="mr-1.5"
						/>
						<Text
							className="text-[9px] text-yellow-700 uppercase"
							style={{ fontFamily: 'Jersey10' }}
						>
							Prestige Buffs:
						</Text>
					</View>
					{generator.earnBonus.gt(1) && (
						<View className="flex-row justify-between items-center mb-0.5">
							<View className="flex-row items-center">
								<MaterialIcons
									name="attach-money"
									size={10}
									color="#F59E0B"
									className="mr-1"
								/>
								<Text
									className="text-[9px] text-yellow-700"
									style={{ fontFamily: 'Jersey10' }}
								>
									Earn:
								</Text>
							</View>
							<Text
								className="text-[9px] text-yellow-800"
								style={{ fontFamily: 'Jersey10' }}
							>
								×{generator.earnBonus.toFixed(2)}
							</Text>
						</View>
					)}
					{generator.speedBonus > 1 && (
						<View className="flex-row justify-between items-center mb-0.5">
							<View className="flex-row items-center">
								<MaterialIcons
									name="speed"
									size={10}
									color="#F59E0B"
									className="mr-1"
								/>
								<Text
									className="text-[9px] text-yellow-700"
									style={{ fontFamily: 'Jersey10' }}
								>
									Speed:
								</Text>
							</View>
							<Text
								className="text-[9px] text-yellow-800"
								style={{ fontFamily: 'Jersey10' }}
							>
								×{generator.speedBonus.toFixed(2)}
							</Text>
						</View>
					)}
					{generator.costReduction > 1 && (
						<View className="flex-row justify-between items-center">
							<View className="flex-row items-center">
								<MaterialIcons
									name="trending-down"
									size={10}
									color="#F59E0B"
									className="mr-1"
								/>
								<Text
									className="text-[9px] text-yellow-700"
									style={{ fontFamily: 'Jersey10' }}
								>
									Cost:
								</Text>
							</View>
							<Text
								className="text-[9px] text-yellow-800"
								style={{ fontFamily: 'Jersey10' }}
							>
								×{generator.costReduction.toFixed(2)}
							</Text>
						</View>
					)}
				</View>
			)}

			{/* Buy Buttons */}
			<View className="flex-row gap-2 flex-wrap">
				<View className="flex-1 min-w-[70px]">
					<TouchableOpacity
						className={`p-2 rounded border-2 items-center justify-center ${
							!canAfford1 ? 'opacity-50' : ''
						}`}
						style={canAfford1 ? buttonStyleEnabled : buttonStyleDisabled}
						onPress={() => onBuy(generator, 1)}
						disabled={!canAfford1}
					>
						<Text
							className="text-[9px] uppercase text-stone-800"
							style={{ fontFamily: 'Jersey10' }}
						>
							BUY 1
						</Text>
					</TouchableOpacity>
					<Text
						className="text-center mt-1 text-[8px] text-stone-600"
						style={{ fontFamily: 'Jersey10' }}
					>
						{formatNumber(nextCost)}
					</Text>
				</View>
				<View className="flex-1 min-w-[70px]">
					<TouchableOpacity
						className={`p-2 rounded border-2 items-center justify-center ${
							!canAfford10 ? 'opacity-50' : ''
						}`}
						style={canAfford10 ? buttonStyleEnabled : buttonStyleDisabled}
						onPress={() => onBuy(generator, 10)}
						disabled={!canAfford10}
					>
						<Text
							className="text-[9px] uppercase text-stone-800"
							style={{ fontFamily: 'Jersey10' }}
						>
							BUY 10
						</Text>
					</TouchableOpacity>
					<Text
						className="text-center mt-1 text-[8px] text-stone-600"
						style={{ fontFamily: 'Jersey10' }}
					>
						{formatNumber(cost10)}
					</Text>
				</View>
				<View className="flex-1 min-w-[70px]">
					<TouchableOpacity
						className={`p-2 rounded border-2 items-center justify-center ${
							!canAfford ? 'opacity-50' : ''
						}`}
						style={canAfford ? buttonStyleEnabled : buttonStyleDisabled}
						onPress={() => onBuy(generator, -1)}
						disabled={!canAfford}
					>
						<Text
							className="text-[9px] uppercase text-stone-800"
							style={{ fontFamily: 'Jersey10' }}
						>
							BUY MAX
						</Text>
					</TouchableOpacity>
					<Text
						className="text-center mt-1 text-[8px] text-stone-600"
						style={{ fontFamily: 'Jersey10' }}
					>
						{formatNumber(costMax)}
					</Text>
					{maxAffordableAmount > 0 && (
						<Text
							className="text-center mt-0.5 text-[7px] text-stone-500"
							style={{ fontFamily: 'Jersey10' }}
						>
							({maxAffordableAmount})
						</Text>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	// Only keep styles that can't be done with Tailwind (shadows, elevation)
});
