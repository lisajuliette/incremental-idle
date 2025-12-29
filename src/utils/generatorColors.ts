/**
 * Generator Color Utilities
 * Maps generator names to Tailwind color names and provides color theming
 */

// Map generator names to Tailwind color names (red through rose)
export const GENERATOR_COLOR_MAP: Record<string, string> = {
	'Red': 'red',
	'Orange': 'orange',
	'Amber': 'amber',
	'Yellow': 'yellow',
	'Lime': 'lime',
	'Green': 'green',
	'Emerald': 'emerald',
	'Teal': 'teal',
	'Cyan': 'cyan',
	'Sky': 'sky',
	'Blue': 'blue',
	'Indigo': 'indigo',
	'Violet': 'violet',
	'Purple': 'purple',
	'Fuchsia': 'fuchsia',
	'Pink': 'pink',
	'Rose': 'rose',
};

/**
 * Get Tailwind color name for a generator
 */
export function getGeneratorColorName(generatorName: string): string {
	return GENERATOR_COLOR_MAP[generatorName] || 'red';
}

/**
 * Get hex color for a generator (using 500 shade as default)
 */
export function getGeneratorHexColor(generatorName: string): string {
	const colorName = getGeneratorColorName(generatorName);
	// Map to approximate hex colors (Tailwind 500 shades)
	const hexColors: Record<string, string> = {
		red: '#EF4444',
		orange: '#F97316',
		amber: '#F59E0B',
		yellow: '#EAB308',
		lime: '#84CC16',
		green: '#22C55E',
		emerald: '#10B981',
		teal: '#14B8A6',
		cyan: '#06B6D4',
		sky: '#0EA5E9',
		blue: '#3B82F6',
		indigo: '#6366F1',
		violet: '#8B5CF6',
		purple: '#A855F7',
		fuchsia: '#D946EF',
		pink: '#EC4899',
		rose: '#F43F5E',
	};
	return hexColors[colorName] || '#EF4444';
}

/**
 * Get color classes for generator card theming
 * Uses shades 50-900 for different UI elements
 */
export function getGeneratorColorClasses(
	generatorName: string
): {
	bg: string; // Background (50-100)
	border: string; // Border (300-400)
	text: string; // Text (700-800)
	accent: string; // Accent/buttons (500-600)
	progress: string; // Progress bars (400-500)
	light: string; // Light elements (100-200)
	dark: string; // Dark elements (800-900)
} {
	const colorName = getGeneratorColorName(generatorName);

	return {
		bg: `bg-${colorName}-50`,
		border: `border-${colorName}-400`,
		text: `text-${colorName}-800`,
		accent: `bg-${colorName}-500`,
		progress: `bg-${colorName}-400`,
		light: `bg-${colorName}-100`,
		dark: `bg-${colorName}-900`,
	};
}



