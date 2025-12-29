/**
 * Retro Window Component
 * Creates a Windows 95/98 style window with title bar and controls
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface WindowProps {
	title: string;
	children: React.ReactNode;
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	className?: string;
	style?: any;
	compact?: boolean; // For compact windows like InfoBar
}

export default function Window({
	title,
	children,
	onClose,
	onMinimize,
	onMaximize,
	className = '',
	style,
	compact = false,
}: WindowProps) {
	const { theme } = useTheme();

	return (
		<View
			className={`border-4 ${theme.chrome.border} rounded-sm shadow-lg bg-white/90 ${className}`}
			style={[styles.window, compact ? { minHeight: 0 } : undefined, style]}
		>
			{/* Title Bar */}
			<View
				className={`${theme.chrome.titleBar} flex-row items-center justify-between px-1 py-1 border-b-2 min-h-[28px] ${theme.chrome.border}`}
			>
				<Text
					className={`text-[10px] tracking-wide ${theme.chrome.text}`}
					style={{ fontFamily: 'Jersey10' }}
					numberOfLines={1}
				>
					{title}
				</Text>
				<View className="flex-row items-center gap-1">
					{/* Minimize button - always visible for aesthetics */}
					<TouchableOpacity
						onPress={onMinimize || (() => {})}
						className="w-5 h-5 min-w-[20px] min-h-[20px] bg-transparent border-2 border-white items-center justify-center rounded-none"
						disabled={!onMinimize}
					>
						<View className="w-3 h-0.5 bg-white" />
					</TouchableOpacity>
					{/* Maximize button - always visible for aesthetics */}
					<TouchableOpacity
						onPress={onMaximize || (() => {})}
						className="w-5 h-5 min-w-[20px] min-h-[20px] bg-transparent border-2 border-white items-center justify-center rounded-none"
						disabled={!onMaximize}
					>
						<View className="w-2.5 h-2.5 border border-white" />
					</TouchableOpacity>
					{/* Close button - always visible for aesthetics */}
					<TouchableOpacity
						onPress={onClose || (() => {})}
						className="w-5 h-5 min-w-[20px] min-h-[20px] bg-transparent border-2 border-white items-center justify-center rounded-none"
						disabled={!onClose}
					>
						<Text
							className="text-xs text-white"
							style={{ fontFamily: 'Jersey10' }}
						>
							×
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Window Content */}
			<View className={`flex-1 bg-transparent ${compact ? 'p-0' : 'px-1'}`}>
				{children}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	window: {
		minHeight: 200,
		shadowColor: '#1C1917', // stone-900
		shadowOffset: { width: 4, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 0,
		elevation: 8, // Android shadow - can't be done with Tailwind
	},
});
