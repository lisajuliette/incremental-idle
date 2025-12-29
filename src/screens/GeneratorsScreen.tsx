import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { buyGenerator, unlockGenerator } from '../utils/generators';
import { formatNumber } from '../utils/formatters';
import { Generator } from '../types/game';
import Window from '../components/Window';
import RetroBackground from '../components/RetroBackground';
import GeneratorCard from '../components/GeneratorCard';

// Header component to display currency
function HeaderRight() {
	const { gameState } = useGame();

	return (
		<View className="flex-row items-center mr-4 px-3 py-1.5 rounded border-2 bg-white/30 border-white/50">
			<Text
				className="text-[11px] tracking-wide text-yellow-400"
				style={{ fontFamily: 'Jersey10' }}
			>
				${formatNumber(gameState.currency)}
			</Text>
		</View>
	);
}

export default function GeneratorsScreen() {
	const { gameState, setGameState } = useGame();
	const insets = useSafeAreaInsets();

	const handleBuy = (generator: Generator, amount: number) => {
		setGameState((prevState) => {
			const newState = { ...prevState };
			const gen = newState.generators.find((g) => g.id === generator.id);

			if (gen && buyGenerator(gen, amount, newState)) {
				return newState;
			}
			return prevState;
		});
	};

	const handleUnlock = (generator: Generator) => {
		setGameState((prevState) => {
			const newState = { ...prevState };
			const gen = newState.generators.find((g) => g.id === generator.id);

			if (gen && unlockGenerator(gen, newState)) {
				return newState;
			}
			return prevState;
		});
	};

	return (
		<RetroBackground>
			<View className="flex-1 p-4" style={{ paddingTop: insets.top }}>
				<Window title="generators.exe" className="flex-1">
					<ScrollView
						className="flex-1"
						contentContainerStyle={{ padding: 8 }}
						showsVerticalScrollIndicator={false}
					>
						{gameState.generators.map((generator) => (
							<GeneratorCard
								key={generator.id}
								generator={generator}
								gameState={gameState}
								onBuy={handleBuy}
								onUnlock={handleUnlock}
							/>
						))}
					</ScrollView>
				</Window>
			</View>
		</RetroBackground>
	);
}

// Export HeaderRight for use in App.tsx
GeneratorsScreen.HeaderRight = HeaderRight;
