/**
 * Theme Color Utilities
 * Converts Tailwind color classes to actual hex color values
 */

// Tailwind color mappings (100-500 depths)
const TAILWIND_COLORS: Record<string, Record<number, string>> = {
	purple: {
		100: '#F3E8FF',
		200: '#E9D5FF',
		300: '#D8B4FE',
		400: '#C084FC',
		500: '#A855F7',
	},
	indigo: {
		100: '#E0E7FF',
		200: '#C7D2FE',
		300: '#A5B4FC',
		400: '#818CF8',
		500: '#6366F1',
	},
	sky: {
		100: '#E0F2FE',
		200: '#BAE6FD',
		300: '#7DD3FC',
		400: '#38BDF8',
		500: '#0EA5E9',
	},
	teal: {
		100: '#CCFBF1',
		200: '#99F6E4',
		300: '#5EEAD4',
		400: '#2DD4BF',
		500: '#14B8A6',
	},
	emerald: {
		100: '#D1FAE5',
		200: '#A7F3D0',
		300: '#6EE7B7',
		400: '#34D399',
		500: '#10B981',
	},
	lime: {
		100: '#ECFCCB',
		200: '#D9F99D',
		300: '#BEF264',
		400: '#A3E635',
		500: '#84CC16',
	},
	pink: {
		100: '#FCE7F3',
		200: '#FBCFE8',
		300: '#F9A8D4',
		400: '#F472B6',
		500: '#EC4899',
	},
	blue: {
		100: '#DBEAFE',
		200: '#BFDBFE',
		300: '#93C5FD',
		400: '#60A5FA',
		500: '#3B82F6',
	},
	stone: {
		100: '#F5F5F4',
		200: '#E7E5E4',
		300: '#D6D3D1',
		400: '#A8A29E',
		500: '#78716C',
	},
};

/**
 * Extract color name and depth from Tailwind class
 * e.g., 'bg-purple-200' -> { color: 'purple', depth: 200 }
 */
function parseTailwindClass(tailwindClass: string): { color: string; depth: number } | null {
	const match = tailwindClass.match(/(?:bg|text|border)-(\w+)-(\d+)/);
	if (!match) return null;

	const color = match[1];
	const depth = parseInt(match[2], 10);
	return { color, depth };
}

/**
 * Get hex color value from Tailwind class
 */
export function getColorFromTheme(tailwindClass: string): string {
	const parsed = parseTailwindClass(tailwindClass);
	if (!parsed) return '#FFFFFF'; // Default to white

	const { color, depth } = parsed;
	const colorMap = TAILWIND_COLORS[color];
	if (!colorMap) return '#FFFFFF';

	// Find closest depth if exact match doesn't exist
	if (colorMap[depth]) {
		return colorMap[depth];
	}

	// Find closest available depth
	const depths = Object.keys(colorMap).map(Number).sort((a, b) => a - b);
	const closestDepth = depths.reduce((prev, curr) =>
		Math.abs(curr - depth) < Math.abs(prev - depth) ? curr : prev
	);
	return colorMap[closestDepth] || '#FFFFFF';
}

/**
 * Get lightest theme color (200 depth from primary/secondary/tertiary)
 */
export function getLightestThemeColor(theme: any): string {
	return getColorFromTheme(theme.background.primary); // This is 200 depth
}

/**
 * Get darkest theme color (300 depth from accent1/accent2/accent3)
 */
export function getDarkestThemeColor(theme: any): string {
	return getColorFromTheme(theme.button.primary); // This is accent1, 300 depth
}

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
	// Remove # if present
	hex = hex.replace('#', '');
	
	// Parse RGB values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

