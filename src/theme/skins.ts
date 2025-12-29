/**
 * Theme Skins Configuration
 * 
 * Each skin defines a complete color palette using Tailwind classes.
 * Colors use 200 and 300 depths for backgrounds and UI elements.
 * 
 * To add a new skin:
 * 1. Add a new entry to SkinDefinition
 * 2. Create the skin object with all required colors
 * 3. Add it to the SKINS object
 */

export type SkinId = 'purple' | 'green' | 'pastel';

export interface SkinDefinition {
    id: SkinId;
    name: string;
    description: string;
    colors: {
        // Primary colors (200 depth for backgrounds)
        primary: string;      // Main background
        secondary: string;    // Secondary background
        tertiary: string;     // Tertiary background
        
        // Accent colors (300 depth for UI elements)
        accent1: string;      // Primary accent
        accent2: string;      // Secondary accent
        accent3: string;      // Tertiary accent
        
        // UI element colors
        window: string;       // Window background
        card: string;         // Card background
        border: string;       // Border color
        borderActive: string; // Active border
        titleBar: string;     // Title bar
        titleBarActive: string; // Active title bar
    };
}

/**
 * Purple Theme
 * Uses purple, indigo, and sky colors at 200 and 300 depths
 */
export const PURPLE_SKIN: SkinDefinition = {
    id: 'purple',
    name: 'Purple',
    description: 'Purple, indigo, and sky theme',
    colors: {
        primary: 'bg-purple-200',        // Main background
        secondary: 'bg-indigo-200',       // Secondary background
        tertiary: 'bg-sky-200',          // Tertiary background
        
        accent1: 'bg-purple-300',        // Primary accent
        accent2: 'bg-indigo-300',        // Secondary accent
        accent3: 'bg-sky-300',           // Tertiary accent
        
        window: 'bg-white/85',
        card: 'bg-white/50',
        border: 'border-purple-300',
        borderActive: 'border-indigo-300',
        titleBar: 'bg-purple-300',
        titleBarActive: 'bg-indigo-300',
    },
};

/**
 * Pastel Theme
 * Soft pastel colors inspired by retro vaporwave aesthetics
 * Uses very light pastels: lavender, pink, blue, peach
 */
export const PASTEL_SKIN: SkinDefinition = {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft retro pastel dreamscape',
    colors: {
        primary: 'bg-purple-100',        // Very light lavender background
        secondary: 'bg-pink-100',         // Soft pink
        tertiary: 'bg-blue-100',          // Light blue
        
        accent1: 'bg-purple-200',        // Light purple accent
        accent2: 'bg-pink-200',          // Light pink accent
        accent3: 'bg-blue-200',           // Light blue accent
        
        window: 'bg-white/90',            // Slightly more opaque for better contrast
        card: 'bg-white/70',
        border: 'border-purple-200',
        borderActive: 'border-pink-300',
        titleBar: 'bg-blue-200',          // Soft blue title bars
        titleBarActive: 'bg-purple-200',
    },
};

/**
 * Green Theme
 * Uses teal, emerald, and lime colors at 200 and 300 depths
 */
export const GREEN_SKIN: SkinDefinition = {
    id: 'green',
    name: 'Green',
    description: 'Teal, emerald, and lime theme',
    colors: {
        primary: 'bg-teal-200',          // Main background
        secondary: 'bg-emerald-200',     // Secondary background
        tertiary: 'bg-lime-200',         // Tertiary background
        
        accent1: 'bg-teal-300',          // Primary accent
        accent2: 'bg-emerald-300',       // Secondary accent
        accent3: 'bg-lime-300',          // Tertiary accent
        
        window: 'bg-white/85',
        card: 'bg-white/50',
        border: 'border-teal-300',
        borderActive: 'border-emerald-300',
        titleBar: 'bg-teal-300',
        titleBarActive: 'bg-emerald-300',
    },
};

/**
 * All available skins
 */
export const SKINS: Record<SkinId, SkinDefinition> = {
    purple: PURPLE_SKIN,
    green: GREEN_SKIN,
    pastel: PASTEL_SKIN,
};

/**
 * Get a skin by ID
 */
export function getSkin(skinId: SkinId): SkinDefinition {
    return SKINS[skinId] || SKINS.pastel; // Default to pastel for retro aesthetic
}

/**
 * Get all available skins
 */
export function getAllSkins(): SkinDefinition[] {
    return Object.values(SKINS);
}

