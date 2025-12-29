import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Switch,
	Alert,
	ScrollView,
	Modal,
	TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Decimal from 'break_infinity.js';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { getAllSkins, SkinId } from '../theme/skins';
import { formatNumber } from '../utils/formatters';
import Window from '../components/Window';
import RetroBackground from '../components/RetroBackground';

export default function SettingsScreen() {
	const { gameState, setGameState, saveGame, restartGame } = useGame();
	const { theme } = useTheme();
	const insets = useSafeAreaInsets();
	const [addCurrencyModalVisible, setAddCurrencyModalVisible] = useState(false);
	const [currencyInput, setCurrencyInput] = useState('');

	const handleBuyModeChange = (mode: number): void => {
		setGameState((prevState) => ({
			...prevState,
			settings: {
				...prevState.settings,
				buyMode: mode,
			},
		}));
	};

	const handleSoundToggle = (value: boolean): void => {
		setGameState((prevState) => ({
			...prevState,
			settings: {
				...prevState.settings,
				soundEnabled: value,
			},
		}));
	};

	const handleStickyToggle = (value: boolean): void => {
		setGameState((prevState) => ({
			...prevState,
			settings: {
				...prevState.settings,
				buyModeSticky: value,
			},
		}));
	};

	const handleThemeChange = (skinId: SkinId): void => {
		setGameState((prevState) => ({
			...prevState,
			settings: {
				...prevState.settings,
				theme: skinId,
			},
		}));
	};

	const handleSave = async (): Promise<void> => {
		await saveGame();
		Alert.alert('Game saved!');
	};

	const handleLoad = (): void => {
		Alert.alert('Load', 'Game loads automatically on startup');
	};

	const handleRestart = (): void => {
		Alert.alert(
			'Restart Game',
			'This will delete all progress and start fresh. Are you sure?',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Restart',
					style: 'destructive',
					onPress: async () => {
						await restartGame();
						Alert.alert('Game restarted!');
					},
				},
			]
		);
	};

	const handleAddCurrency = (): void => {
		const amount = parseFloat(currencyInput);
		if (isNaN(amount) || amount <= 0) {
			Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
			return;
		}

		setGameState((prevState) => ({
			...prevState,
			currency: prevState.currency.plus(amount),
			stats: {
				...prevState.stats,
				lifetimeEarnings: prevState.stats.lifetimeEarnings.plus(amount),
			},
		}));

		setCurrencyInput('');
		setAddCurrencyModalVisible(false);
		Alert.alert(
			'Success',
			`Added ${formatNumber(new Decimal(amount))} currency!`
		);
	};

	const availableSkins = getAllSkins();

	return (
		<RetroBackground>
			<View className="flex-1 p-4">
				<Window title="config.ini" className="flex-1">
					<ScrollView
						className="flex-1"
						contentContainerStyle={{ padding: 12 }}
					>
						<View className="flex-row items-center justify-between mb-6">
							<View className="flex-row items-center min-w-[100px]">
								<MaterialIcons
									name="volume-up"
									size={18}
									color="#57534E"
									className="mr-2"
								/>
								<Text className={`text-xs font-mono ${theme.text.primary}`}>
									Sound:
								</Text>
							</View>
							<Switch
								value={gameState.settings.soundEnabled}
								onValueChange={handleSoundToggle}
								trackColor={{ false: '#8B8B8B', true: '#66CC66' }}
								thumbColor={
									gameState.settings.soundEnabled ? '#FFD93D' : '#D4D4D4'
								}
							/>
						</View>

						<View className="flex-row items-center justify-between mb-6">
							<View className="flex-row items-center min-w-[100px]">
								<MaterialIcons
									name="shopping-cart"
									size={18}
									color="#57534E"
									className="mr-2"
								/>
								<Text className={`text-xs font-mono ${theme.text.primary}`}>
									Buy Mode:
								</Text>
							</View>
							<View className="flex-row gap-2">
								<TouchableOpacity
									className={`p-2 min-w-[50px] ${
										gameState.settings.buyMode === 1
											? `${theme.button.success} border-green-600`
											: 'bg-stone-300 border-stone-400'
									} border-2 rounded items-center`}
									onPress={() => handleBuyModeChange(1)}
								>
									<Text
										className={`text-xs font-mono ${
											gameState.settings.buyMode === 1
												? 'text-white'
												: theme.text.primary
										}`}
									>
										1
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className={`p-2 min-w-[50px] ${
										gameState.settings.buyMode === 10
											? `${theme.button.success} border-green-600`
											: 'bg-stone-300 border-stone-400'
									} border-2 rounded items-center`}
									onPress={() => handleBuyModeChange(10)}
								>
									<Text
										className={`text-xs font-mono ${
											gameState.settings.buyMode === 10
												? 'text-white'
												: theme.text.primary
										}`}
									>
										10
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className={`p-2 min-w-[50px] ${
										gameState.settings.buyMode === -1
											? `${theme.button.success} border-green-600`
											: 'bg-stone-300 border-stone-400'
									} border-2 rounded items-center`}
									onPress={() => handleBuyModeChange(-1)}
								>
									<Text
										className={`text-xs font-mono ${
											gameState.settings.buyMode === -1
												? 'text-white'
												: theme.text.primary
										}`}
									>
										MAX
									</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View className="flex-row items-center justify-between mb-6">
							<View className="flex-row items-center min-w-[100px]">
								<MaterialIcons
									name="push-pin"
									size={18}
									color="#57534E"
									className="mr-2"
								/>
								<Text className={`text-xs font-mono ${theme.text.primary}`}>
									Sticky Mode:
								</Text>
							</View>
							<Switch
								value={gameState.settings.buyModeSticky}
								onValueChange={handleStickyToggle}
								trackColor={{ false: '#8B8B8B', true: '#66CC66' }}
								thumbColor={
									gameState.settings.buyModeSticky ? '#FFD93D' : '#D4D4D4'
								}
							/>
						</View>

						<View className="mb-6">
							<View className="flex-row items-center mb-3">
								<MaterialIcons
									name="palette"
									size={18}
									color="#57534E"
									className="mr-2"
								/>
								<Text className={`text-xs font-mono ${theme.text.primary}`}>
									Theme:
								</Text>
							</View>
							<View className="flex-row gap-2 flex-wrap">
								{availableSkins.map((skin) => {
									const isSelected = gameState.settings.theme === skin.id;
									return (
										<TouchableOpacity
											key={skin.id}
											className={`flex-1 min-w-[100px] p-3 rounded border-2 items-center ${
												isSelected
													? `${theme.button.primary} ${theme.border.default}`
													: 'bg-stone-300 border-stone-400'
											}`}
											onPress={() => handleThemeChange(skin.id)}
										>
											<Text
												className={`text-xs ${
													isSelected ? 'text-white' : theme.text.primary
												} `}
												style={{ fontFamily: 'Jersey10' }}
											>
												{skin.name}
											</Text>
											<Text
												className={`text-xs ${
													isSelected ? 'text-white/80' : theme.text.secondary
												} mt-1`}
												style={{ fontFamily: 'Jersey10' }}
											>
												{skin.description}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>

						<View className="flex-row gap-3 mt-6">
							<TouchableOpacity
								className={`flex-1 ${theme.button.primary} ${theme.button.primaryBorder} border-3 rounded p-3 items-center`}
								onPress={handleSave}
							>
								<View className="flex-row items-center">
									<MaterialIcons
										name="save"
										size={16}
										color="#44403C"
										className="mr-1.5"
									/>
									<Text
										className={`text-xs font-mono ${theme.text.primary} uppercase`}
									>
										SAVE GAME
									</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity
								className={`flex-1 ${theme.button.primary} ${theme.button.primaryBorder} border-3 rounded p-3 items-center`}
								onPress={handleLoad}
							>
								<View className="flex-row items-center">
									<MaterialIcons
										name="folder-open"
										size={16}
										color="#44403C"
										className="mr-1.5"
									/>
									<Text
										className={`text-xs font-mono ${theme.text.primary} uppercase`}
									>
										LOAD GAME
									</Text>
								</View>
							</TouchableOpacity>
						</View>

						<View className="mt-8 pt-6 border-t-2 border-stone-400">
							<View className="flex-row items-center mb-4">
								<MaterialIcons
									name="bug-report"
									size={18}
									color="#57534E"
									className="mr-2"
								/>
								<Text
									className={`text-xs font-mono ${theme.text.secondary} uppercase`}
								>
									DEBUG
								</Text>
							</View>
							<View className="gap-3">
								<TouchableOpacity
									className={`${theme.button.primary} ${theme.button.primaryBorder} border-3 rounded p-3 items-center`}
									onPress={() => setAddCurrencyModalVisible(true)}
								>
									<View className="flex-row items-center">
										<MaterialIcons
											name="attach-money"
											size={16}
											color="#44403C"
											className="mr-1.5"
										/>
										<Text
											className={`text-xs font-mono ${theme.text.primary} uppercase`}
										>
											ADD CURRENCY
										</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity
									className={`${theme.button.secondary} border-3 border-red-500 rounded p-3 items-center`}
									onPress={handleRestart}
								>
									<View className="flex-row items-center">
										<MaterialIcons
											name="refresh"
											size={16}
											color="#44403C"
											className="mr-1.5"
										/>
										<Text
											className={`text-xs font-mono ${theme.text.primary} uppercase`}
										>
											RESTART GAME
										</Text>
									</View>
								</TouchableOpacity>
							</View>
						</View>

						<Modal
							visible={addCurrencyModalVisible}
							transparent={true}
							animationType="fade"
							onRequestClose={() => setAddCurrencyModalVisible(false)}
						>
							<View className="flex-1 bg-black/50 items-center justify-center p-4">
								<View
									className={`${theme.background.card} border-4 ${theme.border.default} rounded p-6 w-full max-w-sm`}
								>
									<View className="flex-row items-center justify-between mb-4">
										<Text
											className={`text-sm font-mono ${theme.text.primary}  uppercase`}
										>
											Add Currency
										</Text>
										<TouchableOpacity
											onPress={() => {
												setAddCurrencyModalVisible(false);
												setCurrencyInput('');
											}}
										>
											<MaterialIcons name="close" size={24} color="#57534E" />
										</TouchableOpacity>
									</View>

									<Text
										className={`text-xs font-mono ${theme.text.secondary} mb-2`}
									>
										Enter amount to add:
									</Text>
									<TextInput
										className={`${theme.background.secondary} border-2 ${theme.border.default} rounded p-3 mb-4 font-mono text-sm ${theme.text.primary}`}
										value={currencyInput}
										onChangeText={setCurrencyInput}
										placeholder="0"
										placeholderTextColor="#999"
										keyboardType="numeric"
										autoFocus={true}
									/>

									<View className="flex-row gap-3">
										<TouchableOpacity
											className={`flex-1 ${theme.button.secondary} border-2 ${theme.border.default} rounded p-3 items-center`}
											onPress={() => {
												setAddCurrencyModalVisible(false);
												setCurrencyInput('');
											}}
										>
											<Text
												className={`text-xs font-mono ${theme.text.primary} uppercase`}
											>
												Cancel
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											className={`flex-1 ${theme.button.primary} ${theme.button.primaryBorder} border-3 rounded p-3 items-center`}
											onPress={handleAddCurrency}
										>
											<Text
												className={`text-xs font-mono ${theme.text.primary} uppercase`}
											>
												Add
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</Modal>
					</ScrollView>
				</Window>
			</View>
		</RetroBackground>
	);
}
