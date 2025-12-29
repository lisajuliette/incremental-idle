import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { GameProvider } from './src/context/GameContext';
import { ThemeProvider } from './src/context/ThemeContext';
import GeneratorsScreen from './src/screens/GeneratorsScreen';
import StatsScreen from './src/screens/StatsScreen';
import PrestigeScreen from './src/screens/PrestigeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RetroBackground from './src/components/RetroBackground';
import { useJerseyFont } from './src/utils/fonts';

const Tab = createBottomTabNavigator();

function AppContent() {
	return (
		<SafeAreaProvider>
			<GameProvider>
				<ThemeProvider>
					<RetroBackground>
						<NavigationContainer>
							<Tab.Navigator
								screenOptions={{
									headerShown: false, // Hide default header, we'll use Window components
									tabBarStyle: {
										backgroundColor: 'rgba(200, 180, 255, 0.9)', // Pastel purple
										borderTopColor: 'rgba(150, 130, 200, 1)',
										borderTopWidth: 3,
										height: 60,
									},
									tabBarActiveTintColor: '#FFD93D',
									tabBarInactiveTintColor: 'rgba(100, 80, 150, 0.7)',
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
												className={`text-[9px] tracking-wide ${
													focused ? 'text-yellow-400' : 'text-purple-400/70'
												}`}
												style={{ fontFamily: 'Jersey10' }}
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
												className={`text-[9px] tracking-wide ${
													focused ? 'text-yellow-400' : 'text-purple-400/70'
												}`}
												style={{ fontFamily: 'Jersey10' }}
											>
												STATS
											</Text>
										),
										tabBarIcon: ({ color, size }) => (
											<MaterialIcons
												name="bar-chart"
												size={size}
												color={color}
											/>
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
												className={`text-[9px] tracking-wide ${
													focused ? 'text-yellow-400' : 'text-purple-400/70'
												}`}
												style={{ fontFamily: 'Jersey10' }}
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
												className={`text-[9px] tracking-wide ${
													focused ? 'text-yellow-400' : 'text-purple-400/70'
												}`}
												style={{ fontFamily: 'Jersey10' }}
											>
												CONFIG
											</Text>
										),
										tabBarIcon: ({ color, size }) => (
											<MaterialIcons
												name="settings"
												size={size}
												color={color}
											/>
										),
										headerTitle: 'config.ini',
									}}
								/>
							</Tab.Navigator>
						</NavigationContainer>
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
					className="mt-2.5 text-gray-600"
					style={{ fontFamily: 'monospace' }}
				>
					Loading fonts...
				</Text>
			</View>
		);
	}

	return <AppContent />;
}
