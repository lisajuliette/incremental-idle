/**
 * Info Bar Component
 * Top bar showing currency and income per second
 * Uses Window component for retro aesthetic
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/formatters';
import Window from './Window';
import { pixelFontFamily } from '../utils/fonts';

export const INFO_BAR_HEIGHT = 70;

export default function InfoBar() {
	const { gameState } = useGame();

	return (
		<Window title="info.inf" compact={true} style={{ height: INFO_BAR_HEIGHT }}>
			<View className="flex-row items-center justify-between px-2 py-2">
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
				<View className="flex-row items-center">
					<Text
						className="text-xs text-stone-600 mr-2"
						style={{ fontFamily: pixelFontFamily }}
					>
						Income/sec:
					</Text>
					<Text
						className="text-sm text-stone-800"
						style={{ fontFamily: pixelFontFamily }}
					>
						${formatNumber(gameState.stats.incomePerSecond)}
					</Text>
				</View>
			</View>
		</Window>
	);
}
