import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { calculatePrestigeValue } from '../utils/prestige';
import { formatNumber } from '../utils/formatters';
import Window from '../components/Window';
import RetroBackground from '../components/RetroBackground';

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return 'just now';
}

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        if (remainingHours > 0) {
            return `${days}d ${remainingHours}h`;
        }
        return `${days}d`;
    }
    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        if (remainingMinutes > 0) {
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${hours}h`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}s`;
}

export default function StatsScreen() {
    const { gameState } = useGame();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const prestigeValue = calculatePrestigeValue(gameState);

    return (
        <RetroBackground>
            <View className="flex-1 p-4">
                <Window title="stats.sys" className="flex-1">
                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
            <View className="mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-1 uppercase`}>CURRENT BALANCE</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="attach-money" size={20} color="#FFD93D" className="mr-2" />
                    <Text className={`text-sm font-mono ${theme.text.primary} mb-2`}>
                        {formatNumber(gameState.currency)}
                    </Text>
                </View>
            </View>

            <View className="mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-1 uppercase`}>INCOME</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="flash-on" size={20} color="#66CC66" className="mr-2" />
                    <Text className={`text-sm font-mono ${theme.text.primary} mb-2`}>
                        {formatNumber(gameState.stats.incomePerSecond)} / sec
                    </Text>
                </View>
            </View>

            <View className="mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-1 uppercase`}>PRESTIGE READY</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="stars" size={20} color="#FFD93D" className="mr-2" />
                    <Text className={`text-sm font-mono ${theme.text.primary} mb-2`}>
                        {formatNumber(prestigeValue)}
                    </Text>
                </View>
                <Text className={`text-xs font-mono ${theme.text.tertiary}`}>
                    (×{gameState.prestige.currentIdleMultiplier.toFixed(2)} idle bonus)
                </Text>
            </View>

            <View className="mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-1 uppercase`}>LIFETIME EARNED</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="bar-chart" size={20} color="#6EC1E4" className="mr-2" />
                    <Text className={`text-sm font-mono ${theme.text.primary} mb-2`}>
                        {formatNumber(gameState.stats.lifetimeEarnings)}
                    </Text>
                </View>
            </View>

            <View className="mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-1 uppercase`}>TOTAL PRESTIGES</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="workspace-premium" size={20} color="#B4A7D6" className="mr-2" />
                    <Text className={`text-sm font-mono ${theme.text.primary} mb-2`}>
                        {gameState.prestige.totalPrestiges}
                    </Text>
                </View>
            </View>

            <View className="mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-1 uppercase`}>PRESTIGE LIFETIME</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={20} color="#57534E" className="mr-2" />
                    <Text className={`text-sm font-mono ${theme.text.primary} mb-2`}>
                        {formatDuration(Date.now() - (gameState.timestamps.lastPrestige || gameState.timestamps.sessionStart))}
                    </Text>
                </View>
            </View>

            <View className="mb-6">
                <Text className={`text-xs font-mono ${theme.text.secondary} mb-1 uppercase`}>LAST SAVE</Text>
                <View className="flex-row items-center">
                    <MaterialIcons name="access-time" size={20} color="#57534E" className="mr-2" />
                    <Text className={`text-sm font-mono ${theme.text.primary} mb-2`}>
                        {formatTimeAgo(gameState.timestamps.lastSave)}
                    </Text>
                </View>
            </View>
                    </ScrollView>
                </Window>
            </View>
        </RetroBackground>
        );
    }
