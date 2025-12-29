import './global.css';
import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import {
	SafeAreaProvider,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { GameProvider } from './src/context/GameContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import {
	getLightestThemeColor,
	getDarkestThemeColor,
	hexToRgba,
} from './src/utils/themeColors';
import GeneratorsScreen from './src/screens/GeneratorsScreen';
import StatsScreen from './src/screens/StatsScreen';
import PrestigeScreen from './src/screens/PrestigeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RetroBackground from './src/components/RetroBackground';
import InfoBar, { INFO_BAR_HEIGHT } from './src/components/InfoBar';
import { useJerseyFont } from './src/utils/fonts';

const Tab = createBottomTabNavigator();

function AppContentInner() {
	const insets = useSafeAreaInsets();
	const { theme, skinId } = useTheme();

	// Use skinId for stable dependency instead of theme object properties
	const lightestColor = useMemo(
		() => getLightestThemeColor(theme),
		[skinId] // Use skinId instead of theme properties for stable dependency
	);
	const darkestColor = useMemo(
		() => getDarkestThemeColor(theme),
		[skinId] // Use skinId instead of theme properties for stable dependency
	);

	return (
		<>
			<View
				className="absolute top-0 left-0 right-0 z-50 px-4"
				style={{ paddingTop: insets.top }}
			>
				<InfoBar />
			</View>
			<View
				className="flex-1"
				style={{ paddingTop: insets.top + INFO_BAR_HEIGHT }}
			>
				<NavigationContainer>
					<Tab.Navigator
						screenOptions={{
							headerShown: false, // Hide default header, we'll use Window components
							tabBarStyle: {
								backgroundColor: hexToRgba(lightestColor, 0.9), // Lightest theme color with 90% opacity
								borderTopColor: darkestColor,
								borderTopWidth: 3,
								height: 60,
							},
							tabBarActiveTintColor: '#FFFFFF', // White for active tabs
							tabBarInactiveTintColor: hexToRgba(darkestColor, 0.7), // Darkest theme color with 70% opacity
							tabBarLabelStyle: {
								fontFamily: 'Jersey10',
							},
						}}
					>
						<Tab.Screen
							name="Generators"
							component={GeneratorsScreen}
							options={{
								tabBarLabel: ({ focused }) => (
									<Text
										className="text-[9px] tracking-wide"
										style={{
											fontFamily: 'Jersey10',
											color: focused ? '#FFFFFF' : hexToRgba(darkestColor, 0.7),
										}}
									>
										GENERATORS
									</Text>
								),
								tabBarIcon: ({ color, size }) => (
									<MaterialIcons name="build" size={size} color={color} />
								),
								headerTitle: 'generators.exe',
								headerRight: () => <GeneratorsScreen.HeaderRight />,
							}}
						/>
						<Tab.Screen
							name="Stats"
							component={StatsScreen}
							options={{
								tabBarLabel: ({ focused }) => (
									<Text
										className="text-[9px] tracking-wide"
										style={{
											fontFamily: 'Jersey10',
											color: focused ? '#FFFFFF' : hexToRgba(darkestColor, 0.7),
										}}
									>
										STATS
									</Text>
								),
								tabBarIcon: ({ color, size }) => (
									<MaterialIcons name="bar-chart" size={size} color={color} />
								),
								headerTitle: 'stats.sys',
							}}
						/>
						<Tab.Screen
							name="Prestige"
							component={PrestigeScreen}
							options={{
								tabBarLabel: ({ focused }) => (
									<Text
										className="text-[9px] tracking-wide"
										style={{
											fontFamily: 'Jersey10',
											color: focused ? '#FFFFFF' : hexToRgba(darkestColor, 0.7),
										}}
									>
										PRESTIGE
									</Text>
								),
								tabBarIcon: ({ color, size }) => (
									<MaterialIcons name="stars" size={size} color={color} />
								),
								headerTitle: 'prestige.bat',
							}}
						/>
						<Tab.Screen
							name="Settings"
							component={SettingsScreen}
							options={{
								tabBarLabel: ({ focused }) => (
									<Text
										className="text-[9px] tracking-wide"
										style={{
											fontFamily: 'Jersey10',
											color: focused ? '#FFFFFF' : hexToRgba(darkestColor, 0.7),
										}}
									>
										CONFIG
									</Text>
								),
								tabBarIcon: ({ color, size }) => (
									<MaterialIcons name="settings" size={size} color={color} />
								),
								headerTitle: 'config.ini',
							}}
						/>
					</Tab.Navigator>
				</NavigationContainer>
			</View>
		</>
	);
}

function AppContent() {
	return (
		<SafeAreaProvider>
			<GameProvider>
				<ThemeProvider>
					<RetroBackground>
						<AppContentInner />
					</RetroBackground>
				</ThemeProvider>
			</GameProvider>
		</SafeAreaProvider>
	);
}

export default function App() {
	const fontsLoaded = useJerseyFont();

	if (!fontsLoaded) {
		return (
			<View className="flex-1 justify-center items-center bg-purple-200">
				<ActivityIndicator size="large" color="#8B9DC3" />
				<Text
					className="mt-2.5 text-stone-600"
					style={{ fontFamily: 'monospace' }}
				>
					Loading fonts...
				</Text>
			</View>
		);
	}

	return <AppContent />;
}
