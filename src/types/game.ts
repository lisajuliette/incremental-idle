import Decimal from 'break_infinity.js';
import { GeneratorConfig } from '../config/generators';

export interface Generator extends GeneratorConfig {
    level: number;
    fillProgress: number;
    earnBonus: Decimal;
    speedBonus: number;
    costReduction: number;
}

export interface PrestigeHistory {
    generator: string;
    bonus: string;
    amount: string;
    timestamp: number;
}

export interface PrestigeState {
    totalPrestiges: number;
    currentIdleMultiplier: number;
    selectablesRemaining: number;
    history: PrestigeHistory[];
}

export interface GameStats {
    lifetimeEarnings: Decimal;
    incomePerSecond: Decimal;
    timePlayedMs: number;
}

export interface GlobalState {
    pow: number;
    idlePower: number;
    worldsCompleted: number;
}

export interface Timestamps {
    lastSave: number;
    lastTick: number;
    sessionStart: number;
}

export interface GameSettings {
    soundEnabled: boolean;
    buyMode: number; // 1, 10, -1 for MAX, or -2 for NEXT
    buyModeSticky: boolean;
    theme: 'purple' | 'green' | 'pastel' | 'nostalgia'; // Theme skin ID
}

export interface GameState {
    currency: Decimal;
    generators: Generator[];
    prestige: PrestigeState;
    stats: GameStats;
    global: GlobalState;
    timestamps: Timestamps;
    settings: GameSettings;
}

export interface GameContextValue {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    saveGame: () => Promise<void>;
    restartGame: () => Promise<void>;
}

