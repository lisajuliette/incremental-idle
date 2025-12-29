/**
 * Retro Scrollbar Component
 * Windows 95/98 style scrollbar with 3D borders
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
	getLightestThemeColor,
	getDarkestThemeColor,
} from '../utils/themeColors';

interface RetroScrollbarProps extends ScrollViewProps {
	children: React.ReactNode;
}

export default function RetroScrollbar({
	children,
	...scrollViewProps
}: RetroScrollbarProps) {
	const { theme, skinId } = useTheme();
	const [scrollY, setScrollY] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);
	const [containerHeight, setContainerHeight] = useState(0);

	// Use skinId for stable dependency instead of theme object properties
	const lightestColor = useMemo(
		() => getLightestThemeColor(theme),
		[skinId, theme] // Use skinId for stable dependency, theme as fallback
	);
	const darkestColor = useMemo(
		() => getDarkestThemeColor(theme),
		[skinId, theme] // Use skinId for stable dependency, theme as fallback
	);

	const handleScroll = (event: any) => {
		const offsetY = event.nativeEvent.contentOffset.y;
		setScrollY(offsetY);
		if (scrollViewProps.onScroll) {
			scrollViewProps.onScroll(event);
		}
	};

	const handleContentSizeChange = (width: number, height: number) => {
		setContentHeight(height);
		if (scrollViewProps.onContentSizeChange) {
			scrollViewProps.onContentSizeChange(width, height);
		}
	};

	const handleLayout = (event: any) => {
		const { height } = event.nativeEvent.layout;
		setContainerHeight(height);
		if (scrollViewProps.onLayout) {
			scrollViewProps.onLayout(event);
		}
	};

	// Calculate scrollbar dimensions
	const scrollbarHeight = containerHeight;
	const arrowButtonHeight = 14; // Each arrow button is 16px
	const scrollbarTrackHeight = scrollbarHeight - arrowButtonHeight * 2; // Account for both up and down arrows
	const thumbHeight = Math.max(
		20,
		contentHeight > 0 && containerHeight > 0
			? (containerHeight / contentHeight) * scrollbarTrackHeight
			: scrollbarTrackHeight
	);
	const maxThumbPosition = Math.max(0, scrollbarTrackHeight - thumbHeight);
	const thumbPosition =
		contentHeight > containerHeight
			? Math.min(
					maxThumbPosition,
					Math.max(
						0,
						(scrollY / (contentHeight - containerHeight)) * maxThumbPosition
					)
			  )
			: 0;

	const showScrollbar = contentHeight > containerHeight && containerHeight > 0;

	return (
		<View style={styles.container} onLayout={handleLayout}>
			<ScrollView
				{...scrollViewProps}
				onScroll={handleScroll}
				onContentSizeChange={handleContentSizeChange}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
			>
				{children}
			</ScrollView>
			{showScrollbar && (
				<View
					className="my-2"
					style={[styles.scrollbarContainer, { borderColor: lightestColor }]}
				>
					{/* Up Arrow Button */}
					<View style={[styles.arrowButton, { borderColor: lightestColor }]}>
						<View
							style={[styles.arrowUp, { borderBottomColor: lightestColor }]}
						/>
					</View>
					{/* Scrollbar Track */}
					<View style={styles.track}>
						{/* Scrollbar Thumb */}
						<View
							style={[
								styles.thumb,
								{
									height: thumbHeight,
									transform: [{ translateY: thumbPosition }],
								},
							]}
						>
							<View
								style={[
									styles.thumbInner,
									{
										backgroundColor: darkestColor,
										borderColor: lightestColor,
									},
								]}
							/>
						</View>
					</View>
					{/* Down Arrow Button */}
					<View style={[styles.arrowButton, { borderColor: lightestColor }]}>
						<View
							style={[styles.arrowDown, { borderTopColor: lightestColor }]}
						/>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		position: 'relative',
	},
	scrollbarContainer: {
		width: 16,
		backgroundColor: 'transparent', // Transparent background
		borderWidth: 2,
		marginLeft: 2,
	},
	arrowButton: {
		height: 14,
		width: 12,
		backgroundColor: 'transparent', // Transparent background
		borderTopWidth: 2,
		borderBottomWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	arrowUp: {
		width: 0,
		height: 0,
		borderLeftWidth: 3,
		borderRightWidth: 3,
		borderBottomWidth: 4,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
	},
	arrowDown: {
		width: 0,
		height: 0,
		borderLeftWidth: 3,
		borderRightWidth: 3,
		borderTopWidth: 4,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
	},
	track: {
		flex: 1,
		backgroundColor: 'transparent', // Transparent background
		position: 'relative',
	},
	thumb: {
		position: 'absolute',
		width: 12,
		left: 0,
		top: 0,
	},
	thumbInner: {
		flex: 1,
		borderWidth: 2,
	},
});
