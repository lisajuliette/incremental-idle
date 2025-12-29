import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useGame } from './GameContext';
import { getTheme, Theme } from '../theme/colors';
import { SkinId } from '../theme/skins';

interface ThemeContextValue {
    theme: Theme;
    skinId: SkinId;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { gameState } = useGame();
    const skinId: SkinId = gameState.settings.theme || 'nostalgia';
    
    // Memoize theme to prevent recreation on every render
    const theme = useMemo(() => getTheme(skinId), [skinId]);
    
    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({ theme, skinId }), [theme, skinId]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

