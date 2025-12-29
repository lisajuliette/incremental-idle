import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import Decimal from 'break_infinity.js';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { calculatePrestigeValue } from '../utils/prestige';
import { formatNumber } from '../utils/formatters';
import { Generator } from '../types/game';
import Window from '../components/Window';
import RetroBackground from '../components/RetroBackground';

export default function PrestigeScreen() {
    const { gameState, setGameState } = useGame();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedGenerator, setSelectedGenerator] = useState<string>('');
    const [selectedBonus, setSelectedBonus] = useState<'earn' | 'speed' | 'cost'>('earn');

    const prestigeValue = calculatePrestigeValue(gameState);

    const handlePrestige = () => {
        if (prestigeValue.lte(0)) {
            Alert.alert('Keep playing to gain prestige!');
            return;
        }

        // Check if we have selectable prestiges
        if (gameState.prestige.selectablesRemaining > 0) {
            if (!selectedGenerator) {
                Alert.alert('Please select a generator!');
                return;
            }
            applySelectablePrestige(selectedGenerator, selectedBonus, prestigeValue);
            setGameState(prevState => ({
                ...prevState,
                prestige: {
                    ...prevState.prestige,
                    selectablesRemaining: prevState.prestige.selectablesRemaining - 1,
                },
            }));
            return;
        }

        // Random prestige
        applyRandomPrestige(prestigeValue);
    };

    const applyRandomPrestige = (prestigeValue: Decimal) => {
        const unlockedGenerators = gameState.generators.filter(g => g.unlocked);
        if (unlockedGenerators.length === 0) return;

        const targetGenerator = unlockedGenerators[Math.floor(Math.random() * unlockedGenerators.length)];
        const bonusTypes: Array<'earn' | 'speed' | 'cost'> = ['earn', 'speed', 'cost'];
        const random = Math.random();
        let bonusType: 'earn' | 'speed' | 'cost' = 'earn';
        if (random < 0.4) {
            bonusType = 'earn';
        } else if (random < 0.7) {
            bonusType = 'speed';
        } else {
            bonusType = 'cost';
        }

        applyPrestigeBonus(targetGenerator, bonusType, prestigeValue);
    };

    const applySelectablePrestige = (generatorId: string, bonusType: 'earn' | 'speed' | 'cost', prestigeValue: Decimal) => {
        const targetGenerator = gameState.generators.find(g => g.id === parseInt(generatorId));
        if (!targetGenerator || !targetGenerator.unlocked) return;
        applyPrestigeBonus(targetGenerator, bonusType, prestigeValue);
    };

    const applyPrestigeBonus = (generator: Generator, bonusType: 'earn' | 'speed' | 'cost', prestigeValue: Decimal) => {
        const prestigeNum = prestigeValue instanceof Decimal ? prestigeValue.toNumber() : prestigeValue;
        const bonusAmount = 1 + (prestigeNum / 100);

        setGameState(prevState => {
            const newState = { ...prevState };
            const gen = newState.generators.find(g => g.id === generator.id);
            if (!gen) return prevState;

            switch (bonusType) {
                case 'earn':
                    gen.earnBonus = gen.earnBonus.times(bonusAmount);
                    break;
                case 'speed':
                    gen.speedBonus *= bonusAmount;
                    break;
                case 'cost':
                    gen.costReduction *= bonusAmount;
                    break;
            }

            // Add to history
            const bonusNames: Record<'earn' | 'speed' | 'cost', string> = {
                'earn': 'Earn',
                'speed': 'Speed',
                'cost': 'Cost Reduction',
            };

            newState.prestige.history.unshift({
                generator: generator.name,
                bonus: bonusNames[bonusType],
                amount: bonusAmount.toFixed(2) + '×',
                timestamp: Date.now(),
            });

            if (newState.prestige.history.length > 10) {
                newState.prestige.history.pop();
            }

            // Reset game state
            newState.currency = new Decimal(0);
            newState.generators.forEach(g => {
                g.level = 0;
                g.fillProgress = 0;
            });

            newState.prestige.totalPrestiges++;
            newState.prestige.currentIdleMultiplier = 1;

            Alert.alert(
                'Prestige Complete!',
                `${generator.name}: +${((bonusAmount - 1) * 100).toFixed(1)}% ${bonusNames[bonusType]}`
            );

            return newState;
        });
    };

    const unlockedGenerators = gameState.generators.filter(g => g.unlocked);

    return (
        <RetroBackground>
            <View className="flex-1 p-4" style={{ paddingTop: insets.top }}>
                <Window title="prestige.bat" className="flex-1">
                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
            <View className="items-center mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-2 uppercase`}>PRESTIGE AVAILABLE</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="stars" size={28} color="#FFD93D" className="mr-2" />
                    <Text className={`text-xl font-mono ${theme.text.accent} mb-1`}>
                        {formatNumber(prestigeValue)}
                    </Text>
                </View>
                <Text className={`text-xs font-mono ${theme.text.tertiary}`}>
                    (×{gameState.prestige.currentIdleMultiplier.toFixed(2)} idle)
                </Text>
            </View>

            {gameState.prestige.selectablesRemaining > 0 && (
                <View className="mb-6 p-3 bg-white/30 rounded">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons name="tune" size={16} color="#666" className="mr-1.5" />
                        <Text className={`text-xs font-mono ${theme.text.secondary} uppercase`}>SELECTABLE PRESTIGE</Text>
                    </View>
                    <Text className={`text-xs font-mono ${theme.text.accent} mb-3`}>
                        {gameState.prestige.selectablesRemaining} left
                    </Text>
                    <View className="mb-3">
                        <Text className={`text-xs font-mono ${theme.text.secondary} mb-1`}>Target:</Text>
                        <Picker
                            selectedValue={selectedGenerator}
                            onValueChange={(value: string) => setSelectedGenerator(value)}
                            className="bg-white border-2 border-gray-400 rounded"
                        >
                            <Picker.Item label="Choose Generator" value="" />
                            {unlockedGenerators.map(gen => (
                                <Picker.Item key={gen.id} label={gen.name} value={gen.id.toString()} />
                            ))}
                        </Picker>
                    </View>
                    <View className="mb-3">
                        <Text className={`text-xs font-mono ${theme.text.secondary} mb-1`}>Bonus:</Text>
                        <Picker
                            selectedValue={selectedBonus}
                            onValueChange={(value: 'earn' | 'speed' | 'cost') => setSelectedBonus(value)}
                            className="bg-white border-2 border-gray-400 rounded"
                        >
                            <Picker.Item label="Earn Boost" value="earn" />
                            <Picker.Item label="Speed Boost" value="speed" />
                            <Picker.Item label="Cost Reduction" value="cost" />
                        </Picker>
                    </View>
                </View>
            )}

            <TouchableOpacity
                className={`${prestigeValue.lte(0) ? `${theme.button.disabled} ${theme.button.disabledBorder} opacity-50` : `${theme.button.primary} ${theme.button.primaryBorder}`} border-3 rounded p-4 items-center mb-6`}
                onPress={handlePrestige}
                disabled={prestigeValue.lte(0)}
            >
                <View className="flex-row items-center">
                    <MaterialIcons 
                        name={prestigeValue.lte(0) ? "lock" : "refresh"} 
                        size={18} 
                        color={prestigeValue.lte(0) ? "#666" : "#333"} 
                        className="mr-2" 
                    />
                    <Text className={`text-sm font-mono ${theme.text.primary} uppercase`}>
                        {gameState.prestige.selectablesRemaining > 0
                            ? 'APPLY SELECTABLE PRESTIGE'
                            : 'RESET & GAIN BONUS'}
                    </Text>
                </View>
            </TouchableOpacity>

            <View className="mt-4 pt-4 border-t-2 border-blue-300">
                <View className="flex-row items-center mb-2">
                    <MaterialIcons name="history" size={16} color="#666" className="mr-1.5" />
                    <Text className={`text-xs font-mono ${theme.text.secondary} uppercase`}>RECENT PRESTIGE:</Text>
                </View>
                {gameState.prestige.history.length === 0 ? (
                    <Text className={`text-xs font-mono ${theme.text.primary} pl-2`}>No prestiges yet</Text>
                ) : (
                    gameState.prestige.history.slice(0, 5).map((item, index) => (
                        <View key={index} className="flex-row items-center mb-1 pl-2">
                            <MaterialIcons name="check-circle" size={14} color="#66CC66" className="mr-1.5" />
                            <Text className={`text-xs font-mono ${theme.text.primary}`}>
                                {item.generator}: +{item.amount} {item.bonus}
                            </Text>
                        </View>
                    ))
                )}
            </View>
                    </ScrollView>
                </Window>
            </View>
        </RetroBackground>
    );
}
