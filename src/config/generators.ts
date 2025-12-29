// Game configuration and constants
export interface GeneratorConfig {
    id: number;
    name: string;
    color: string;
    baseCost: number;
    growthRate: number;
    baseProduction: number;
    fillTime: number;
    unlockCost: number;
    unlocked: boolean;
}

export const GENERATORS: GeneratorConfig[] = [
    {
        id: 1,
        name: 'Yellow',
        color: '#FFD93D',
        baseCost: 10,
        growthRate: 1.07,
        baseProduction: 1.0,
        fillTime: 1000,
        unlockCost: 0,
        unlocked: true
    },
    {
        id: 2,
        name: 'Rose',
        color: '#FF9ECD',
        baseCost: 100,
        growthRate: 1.09,
        baseProduction: 10.0,
        fillTime: 2000,
        unlockCost: 1000,
        unlocked: false
    },
    {
        id: 3,
        name: 'Sky',
        color: '#6EC1E4',
        baseCost: 1000,
        growthRate: 1.10,
        baseProduction: 120.0,
        fillTime: 3000,
        unlockCost: 15000,
        unlocked: false
    },
    {
        id: 4,
        name: 'Mint',
        color: '#7FE7CC',
        baseCost: 10000,
        growthRate: 1.11,
        baseProduction: 1400.0,
        fillTime: 4000,
        unlockCost: 200000,
        unlocked: false
    },
    {
        id: 5,
        name: 'Lavender',
        color: '#B4A7D6',
        baseCost: 100000,
        growthRate: 1.12,
        baseProduction: 16000.0,
        fillTime: 5000,
        unlockCost: 3000000,
        unlocked: false
    },
    {
        id: 6,
        name: 'Peach',
        color: '#FFB499',
        baseCost: 1000000,
        growthRate: 1.13,
        baseProduction: 200000.0,
        fillTime: 6000,
        unlockCost: 50000000,
        unlocked: false
    },
    {
        id: 7,
        name: 'Cyan',
        color: '#5DDEF4',
        baseCost: 10000000,
        growthRate: 1.14,
        baseProduction: 2500000.0,
        fillTime: 7000,
        unlockCost: 800000000,
        unlocked: false
    },
    {
        id: 8,
        name: 'Coral',
        color: '#FF8A80',
        baseCost: 100000000,
        growthRate: 1.14,
        baseProduction: 30000000.0,
        fillTime: 8000,
        unlockCost: 15000000000,
        unlocked: false
    },
    {
        id: 9,
        name: 'Pearl',
        color: '#F0E6FF',
        baseCost: 1000000000,
        growthRate: 1.15,
        baseProduction: 400000000.0,
        fillTime: 9000,
        unlockCost: 300000000000,
        unlocked: false
    }
];

export const MILESTONES = [25, 50, 100, 200, 400];

export const GAME_VERSION = '1.0.0';

