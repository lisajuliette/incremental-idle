/**
 * Generator Card Component
 * Compact, color-themed card for displaying generator information
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { Generator } from '../types/game';
import Decimal from 'break_infinity.js';
import {
	getUpgradeCost,
	getProduction,
	getMilestoneProgress,
	maxAffordable,
	bulkBuyCost,
} from '../utils/generators';
import { formatNumber } from '../utils/formatters';
import {
	getGeneratorHexColor,
	getGeneratorColorClasses,
} from '../utils/generatorColors';

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
	// Get color theming for this generator
	const colorClasses = getGeneratorColorClasses(generator.name);
	const hexColor = getGeneratorHexColor(generator.name);

	// Animated values for progress bars
	const milestoneProgressAnim = useRef(new Animated.Value(0)).current;
	const fillProgressAnim = useRef(new Animated.Value(0)).current;
	const milestonePathAnim = useRef(new Animated.Value(0)).current;

	// Calculate values
	const level = generator.level;
	const isMaxed = level >= 400;
	const milestoneProgress = getMilestoneProgress(level);
	const fillPercent = Math.min(100, generator.fillProgress * 100);
	const milestonePercent = Math.min(100, milestoneProgress.progress * 100);

	// Helper function to convert polar to cartesian coordinates
	const polarToCartesian = (
		centerX: number,
		centerY: number,
		radius: number,
		angleInDegrees: number
	) => {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		};
	};

	// Helper function to describe an arc path
	const describeArc = (
		x: number,
		y: number,
		radius: number,
		startAngle: number,
		endAngle: number
	) => {
		const start = polarToCartesian(x, y, radius, endAngle);
		const end = polarToCartesian(x, y, radius, startAngle);
		const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
		const d = [
			'M',
			start.x,
			start.y,
			'A',
			radius,
			radius,
			0,
			largeArcFlag,
			0,
			end.x,
			end.y,
		].join(' ');
		return d;
	};

	// Animate progress bars
	useEffect(() => {
		if (generator.unlocked) {
			Animated.timing(milestoneProgressAnim, {
				toValue: milestonePercent,
				duration: 16,
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();

			// Also animate the path value for SVG
			Animated.timing(milestonePathAnim, {
				toValue: milestonePercent,
				duration: 16,
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();
		}
	}, [milestonePercent, generator.unlocked]);

	// Calculate the current arc path based on animated value
	const [currentPath, setCurrentPath] = React.useState(
		describeArc(10, 10, 8, 0, 0.01)
	);

	useEffect(() => {
		const listenerId = milestonePathAnim.addListener(({ value }) => {
			const endAngle = Math.max(0.01, (value / 100) * 360);
			setCurrentPath(describeArc(10, 10, 8, 0, endAngle));
		});

		return () => {
			milestonePathAnim.removeListener(listenerId);
		};
	}, [milestonePathAnim]);

	useEffect(() => {
		if (generator.unlocked) {
			Animated.timing(fillProgressAnim, {
				toValue: fillPercent,
				duration: 16,
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();
		}
	}, [fillPercent, generator.unlocked]);

	// Early return for locked generators
	if (!generator.unlocked) {
		const unlockCost = new Decimal(generator.unlockCost);
		const canAffordUnlock = gameState.currency.gte(unlockCost);

		return (
			<View
				className={`border-2 rounded mb-2 p-2 ${colorClasses.bg} ${
					canAffordUnlock ? 'opacity-100' : 'opacity-60'
				}`}
				style={{ borderColor: hexColor }}
			>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center flex-1">
						<View
							className="w-4 h-4 rounded-full mr-2"
							style={{ backgroundColor: hexColor }}
						/>
						<Text
							className={`text-xs ${colorClasses.text}`}
							style={{ fontFamily: 'Jersey10' }}
						>
							{generator.name}
						</Text>
						<MaterialIcons
							name="lock"
							size={12}
							color={hexColor}
							className="ml-1"
						/>
					</View>
					<Text
						className={`text-[9px] ${colorClasses.text}`}
						style={{ fontFamily: 'Jersey10' }}
					>
						{formatNumber(unlockCost)}
					</Text>
					{onUnlock && (
						<TouchableOpacity
							className={`ml-2 px-2 py-1 rounded ${colorClasses.accent} ${
								!canAffordUnlock ? 'opacity-50' : ''
							}`}
							onPress={() => onUnlock(generator)}
							disabled={!canAffordUnlock}
						>
							<Text
								className="text-[8px] uppercase text-white"
								style={{ fontFamily: 'Jersey10' }}
							>
								UNLOCK
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	}

	// Unlocked generator logic
	const production = getProduction(generator);
	const nextCost = getUpgradeCost(generator, 1);

	// Calculate cost to reach next milestone
	let costToNextMilestone = new Decimal(0);
	let levelsToNextMilestone = 0;
	if (!isMaxed && milestoneProgress.next) {
		levelsToNextMilestone = milestoneProgress.next - level;
		if (levelsToNextMilestone > 0) {
			costToNextMilestone = bulkBuyCost(
				generator.baseCost,
				generator.growthRate,
				generator.level,
				levelsToNextMilestone,
				generator.costReduction
			);
		}
	}

	// Calculate buy amount based on buy mode
	const buyMode = gameState.settings.buyMode;
	let buyAmount = 1;
	let buyCost = nextCost;
	let canAffordBuy = gameState.currency.gte(nextCost);

	if (buyMode === 10) {
		buyAmount = 10;
		buyCost = getUpgradeCost(generator, 10);
		canAffordBuy = gameState.currency.gte(buyCost);
	} else if (buyMode === -1) {
		// MAX mode
		const maxAffordableAmount = maxAffordable(
			gameState.currency,
			generator.baseCost,
			generator.growthRate,
			generator.level,
			generator.costReduction
		);
		buyAmount = maxAffordableAmount;
		buyCost =
			maxAffordableAmount > 0
				? getUpgradeCost(generator, maxAffordableAmount)
				: new Decimal(0);
		canAffordBuy = maxAffordableAmount > 0 && gameState.currency.gte(buyCost);
	} else if (buyMode === -2) {
		// NEXT mode - buy until next milestone
		if (!isMaxed && milestoneProgress.next && levelsToNextMilestone > 0) {
			buyAmount = levelsToNextMilestone;
			buyCost = costToNextMilestone;
			canAffordBuy = gameState.currency.gte(costToNextMilestone);
		} else {
			// No next milestone or already maxed
			buyAmount = 0;
			buyCost = new Decimal(0);
			canAffordBuy = false;
		}
	}

	const hasPrestigeBuffs =
		generator.earnBonus.gt(1) ||
		generator.speedBonus > 1 ||
		generator.costReduction > 1;

	return (
		<View className="mb-2">
			{/* Card Content */}
			<View
				className="border-2 rounded p-2"
				style={{
					borderColor: hexColor,
					backgroundColor: 'rgba(255, 255, 255, 0.9)',
					shadowColor: hexColor,
					shadowOffset: { width: 1, height: 1 },
					shadowOpacity: 0.15,
					shadowRadius: 0,
					elevation: 2,
				}}
			>
				{/* Compact Header Row */}
				<View className="flex-row items-center justify-between mb-1">
					<View className="flex-row items-center flex-1">
						{/* Generator Color Circle with Circular Progress Indicator */}
						<View
							className="mr-1.5"
							style={{
								position: 'relative',
								width: 20,
								height: 20,
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							{/* Solid white circle (16px = w-4 h-4) with level number */}
							<View
								className="w-4 h-4 rounded-full flex items-center justify-center"
								style={{
									backgroundColor: '#FFFFFF',
									borderWidth: 1,
									borderColor: hexColor,
								}}
							>
								<Text
									className="text-[7px] leading-none"
									style={{ fontFamily: 'Jersey10', color: hexColor }}
								>
									{level}
								</Text>
							</View>
							{/* Circular progress outline - 2px margin (16px + 2px + 2px = 20px total) */}
							{!isMaxed && (
								<View
									style={{
										position: 'absolute',
										width: 20,
										height: 20,
									}}
									pointerEvents="none"
								>
									<Svg width={20} height={20}>
										{/* Background circle (incomplete portion) */}
										<Circle
											cx={10}
											cy={10}
											r={8}
											stroke={hexColor}
											strokeWidth={2}
											fill="none"
											opacity={0.2}
										/>
										{/* Progress arc */}
										{milestonePercent > 0 && (
											<Path
												d={currentPath}
												stroke={hexColor}
												strokeWidth={2}
												strokeLinecap="round"
												fill="none"
											/>
										)}
									</Svg>
								</View>
							)}
						</View>
						<Text
							className={`text-xs ${colorClasses.text}`}
							style={{ fontFamily: 'Jersey10' }}
						>
							{generator.name}
						</Text>
						<Text
							className={`text-[9px] ml-1 ${colorClasses.text}`}
							style={{ fontFamily: 'Jersey10' }}
						>
							Lv.{level}
						</Text>
						{isMaxed && (
							<MaterialIcons
								name="star"
								size={12}
								color={hexColor}
								className="ml-1"
							/>
						)}
						{/* {hasPrestigeBuffs && (
							<MaterialIcons
								name="stars"
								size={10}
								color={hexColor}
								className="ml-1"
							/>
						)} */}
					</View>
					<Text
						className={`text-[9px] ${colorClasses.text}`}
						style={{ fontFamily: 'Jersey10' }}
					>
						${formatNumber(production)}
					</Text>
				</View>

				{/* Windows 95/98 Style Progress Bar */}
				<View className="mb-1">
					<View
						style={{
							height: 16,
							borderWidth: 2,
							borderTopColor: '#FFFFFF',
							borderLeftColor: '#FFFFFF',
							borderRightColor: '#808080',
							borderBottomColor: '#808080',
							backgroundColor: '#C0C0C0',
							position: 'relative',
							overflow: 'hidden',
						}}
					>
						{/* Progress fill with Windows-style gradient effect */}
						<Animated.View
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								bottom: 0,
								width: fillProgressAnim.interpolate({
									inputRange: [0, 100],
									outputRange: ['0%', '100%'],
								}),
								backgroundColor: hexColor, // Generator's themed color
							}}
						>
							{/* Inner highlight for 3D effect */}
							<View
								style={{
									position: 'absolute',
									left: 0,
									top: 0,
									right: 0,
									height: '50%',
									backgroundColor: 'rgba(255, 255, 255, 0.3)',
								}}
							/>
						</Animated.View>
					</View>
				</View>

				{/* Boost Info Row */}
				<View className="flex-row items-center justify-between w-full gap-2">
					<View className="flex-row items-center gap-2 mb-1">
						{hasPrestigeBuffs && (
							<>
								{generator.earnBonus.gt(1) && (
									<View className="flex-row items-center">
										<MaterialIcons
											name="attach-money"
											size={10}
											color={hexColor}
										/>
										<Text
											className={`text-[8px] ml-0.5 ${colorClasses.text}`}
											style={{ fontFamily: 'Jersey10' }}
										>
											×{generator.earnBonus.toFixed(1)}
										</Text>
									</View>
								)}
								{generator.speedBonus > 1 && (
									<View className="flex-row items-center">
										<MaterialIcons name="speed" size={10} color={hexColor} />
										<Text
											className={`text-[8px] ml-0.5 ${colorClasses.text}`}
											style={{ fontFamily: 'Jersey10' }}
										>
											×{generator.speedBonus.toFixed(1)}
										</Text>
									</View>
								)}
								{generator.costReduction > 1 && (
									<View className="flex-row items-center">
										<MaterialIcons
											name="local-offer"
											size={10}
											color={hexColor}
										/>
										<Text
											className={`text-[8px] ml-0.5 ${colorClasses.text}`}
											style={{ fontFamily: 'Jersey10' }}
										>
											×{generator.costReduction.toFixed(1)}
										</Text>
									</View>
								)}
							</>
						)}
					</View>

					{/* Single Buy Button - Smaller */}
					<TouchableOpacity
						className={`px-1.5 py-1 rounded border min-w-[60px] ${
							colorClasses.accent
						} ${!canAffordBuy ? 'opacity-50' : ''}`}
						style={{ borderColor: hexColor, alignSelf: 'flex-start' }}
						onPress={() => {
							if (buyMode === -1) {
								onBuy(generator, -1);
							} else if (buyMode === -2) {
								onBuy(generator, buyAmount);
							} else {
								onBuy(generator, buyAmount);
							}
						}}
						disabled={!canAffordBuy || buyAmount === 0}
					>
						<View className="flex-row items-center justify-center gap-0.5">
							<MaterialIcons name="shopping-cart" size={10} color="#FFFFFF" />
							<Text
								className="text-[8px] uppercase text-white"
								style={{ fontFamily: 'Jersey10' }}
							>
								{buyAmount > 0 ? buyAmount : '-'}
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
