/**
 * Info Bar Component
 * Top bar showing currency and next generator unlock
 * Uses Window component for retro aesthetic
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Decimal from 'break_infinity.js';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/formatters';
import { unlockGenerator } from '../utils/generators';
import { getGeneratorHexColor } from '../utils/generatorColors';
import Window from './Window';
import { pixelFontFamily } from '../utils/fonts';

export const INFO_BAR_HEIGHT = 80;

export default function InfoBar() {
	const { gameState, setGameState } = useGame();

	// Find the next locked generator
	const nextGenerator = gameState.generators.find((g) => !g.unlocked);

	const canUnlockNext =
		nextGenerator &&
		gameState.currency.gte(new Decimal(nextGenerator.unlockCost));
	const unlockProgress = nextGenerator
		? Math.min(
				100,
				(gameState.currency.toNumber() / nextGenerator.unlockCost) * 100
		  )
		: 100;

	const nextGeneratorColor = nextGenerator
		? getGeneratorHexColor(nextGenerator.name)
		: '#EF4444';

	const handleUnlockNext = () => {
		if (!nextGenerator || !canUnlockNext) return;

		setGameState((prevState) => {
			const newState = { ...prevState };
			const gen = newState.generators.find((g) => g.id === nextGenerator.id);
			if (gen && unlockGenerator(gen, newState)) {
				return newState;
			}
			return prevState;
		});
	};

	return (
		<Window title="info.inf" compact={true} style={{ height: INFO_BAR_HEIGHT }}>
			<View className="flex-row items-center justify-between px-2 py-2">
				{/* Currency on the left */}
				<View className="flex-row items-center">
					<Text
						className="text-xs text-stone-600 mr-2"
						style={{ fontFamily: pixelFontFamily }}
					>
						Currency:
					</Text>
					<Text
						className="text-sm text-stone-800"
						style={{ fontFamily: pixelFontFamily }}
					>
						${formatNumber(gameState.currency)}
					</Text>
				</View>

				{/* Next generator unlock on the right */}
				{nextGenerator ? (
					<View className="flex-1 items-end ml-4">
						<TouchableOpacity
							className={`px-3 py-1.5 rounded border ${
								canUnlockNext ? '' : 'opacity-50'
							}`}
							style={{
								backgroundColor: nextGeneratorColor,
								borderColor: nextGeneratorColor,
								borderWidth: 2,
							}}
							onPress={handleUnlockNext}
							disabled={!canUnlockNext}
						>
							<Text
								className="text-[9px] uppercase text-white"
								style={{ fontFamily: pixelFontFamily }}
							>
								ADD NEXT
							</Text>
						</TouchableOpacity>
						{/* Progress bar */}
					</View>
				) : (
					<View className="flex-row items-center"></View>
				)}
			</View>
			<View
				className="mt-1.5 w-full"
				style={{
					height: 2,
					backgroundColor: 'rgba(0, 0, 0, 0.1)',
					borderRadius: 1,
					overflow: 'hidden',
				}}
			>
				<View
					style={{
						width: `${unlockProgress}%`,
						height: '100%',
						backgroundColor: nextGeneratorColor,
					}}
				/>
			</View>
		</Window>
	);
}
