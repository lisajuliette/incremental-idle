/**
 * Theme System
 * 
 * This file provides the theme interface and builds complete themes from skins.
 * The theme includes all UI elements: backgrounds, buttons, text, etc.
 */

import { SkinDefinition, getSkin, SkinId } from './skins';

export interface Theme {
    // Background colors (from skin)
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
        window: string;
        card: string;
    };
    
    // Window chrome colors (from skin)
    chrome: {
        border: string;
        borderActive: string;
        titleBar: string;
        titleBarActive: string;
        text: string;
    };
    
    // Generator colors (fixed - these are game mechanics)
    generators: {
        yellow: string;
        rose: string;
        sky: string;
        mint: string;
        lavender: string;
        peach: string;
        cyan: string;
        coral: string;
        pearl: string;
    };
    
    // Button colors (using skin accents)
    button: {
        primary: string;
        primaryBorder: string;
        primaryPressed: string;
        secondary: string;
        success: string;
        disabled: string;
        disabledBorder: string;
    };
    
    // Text colors
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        accent: string;
        white: string;
        success: string;
    };
    
    // Progress bar colors
    progress: {
        background: string;
        fill: string;
        border: string;
    };
    
    // Currency/stat colors
    currency: {
        symbol: string;
        value: string;
        background: string;
    };
    
    // Border colors
    border: {
        default: string;
        light: string;
        dark: string;
    };
}

/**
 * Build a complete theme from a skin
 */
export function buildTheme(skin: SkinDefinition): Theme {
    return {
        // Background colors from skin
        background: {
            primary: skin.colors.primary,
            secondary: skin.colors.secondary,
            tertiary: skin.colors.tertiary,
            window: skin.colors.window,
            card: skin.colors.card,
        },
        
        // Window chrome from skin
        chrome: {
            border: skin.colors.border,
            borderActive: skin.colors.borderActive,
            titleBar: skin.colors.titleBar,
            titleBarActive: skin.colors.titleBarActive,
            text: 'text-white',
        },
        
        // Generator colors (fixed - these represent game mechanics)
        generators: {
            yellow: 'bg-yellow-400',
            rose: 'bg-pink-400',
            sky: 'bg-sky-400',
            mint: 'bg-emerald-400',
            lavender: 'bg-purple-300',
            peach: 'bg-orange-300',
            cyan: 'bg-cyan-400',
            coral: 'bg-red-400',
            pearl: 'bg-purple-100',
        },
        
        // Button colors using skin accents
        button: {
            primary: skin.colors.accent1,
            primaryBorder: skin.colors.border,
            primaryPressed: skin.colors.accent2,
            secondary: skin.colors.accent2,
            success: 'bg-green-500',
            disabled: 'bg-stone-400',
            disabledBorder: 'border-stone-500',
        },
        
        // Text colors
        text: {
            primary: 'text-stone-800',
            secondary: 'text-stone-600',
            tertiary: 'text-stone-500',
            accent: `text-${skin.colors.accent1.replace('bg-', '')}`,
            white: 'text-white',
            success: 'text-green-500',
        },
        
        // Progress bar colors
        progress: {
            background: 'bg-stone-300',
            fill: 'bg-green-500',
            border: 'border-stone-400',
        },
        
        // Currency/stat colors
        currency: {
            symbol: `text-${skin.colors.accent1.replace('bg-', '')}`,
            value: 'text-white',
            background: 'bg-white/20',
        },
        
        // Border colors
        border: {
            default: skin.colors.border,
            light: 'border-stone-200',
            dark: 'border-stone-500',
        },
    };
}

/**
 * Get theme for a skin ID
 */
export function getTheme(skinId: SkinId): Theme {
    const skin = getSkin(skinId);
    return buildTheme(skin);
}

/**
 * Helper function to get generator color by name
 * (Generator colors are fixed regardless of skin)
 */
export function getGeneratorColor(name: string, theme: Theme): string {
    const colorMap: Record<string, string> = {
        'Yellow': theme.generators.yellow,
        'Rose': theme.generators.rose,
        'Sky': theme.generators.sky,
        'Mint': theme.generators.mint,
        'Lavender': theme.generators.lavender,
        'Peach': theme.generators.peach,
        'Cyan': theme.generators.cyan,
        'Coral': theme.generators.coral,
        'Pearl': theme.generators.pearl,
    };
    return colorMap[name] || theme.generators.yellow;
}
