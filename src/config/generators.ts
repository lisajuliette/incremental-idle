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
        name: 'Red',
        color: '#EF4444',
        baseCost: 10,
        growthRate: 1.07,
        baseProduction: 1.0,
        fillTime: 1000,
        unlockCost: 0,
        unlocked: true
    },
    {
        id: 2,
        name: 'Orange',
        color: '#F97316',
        baseCost: 100,
        growthRate: 1.075,
        baseProduction: 10.0,
        fillTime: 1100,
        unlockCost: 1000,
        unlocked: false
    },
    {
        id: 3,
        name: 'Amber',
        color: '#F59E0B',
        baseCost: 1000,
        growthRate: 1.08,
        baseProduction: 120.0,
        fillTime: 1200,
        unlockCost: 15000,
        unlocked: false
    },
    {
        id: 4,
        name: 'Yellow',
        color: '#EAB308',
        baseCost: 10000,
        growthRate: 1.085,
        baseProduction: 1400.0,
        fillTime: 1300,
        unlockCost: 200000,
        unlocked: false
    },
    {
        id: 5,
        name: 'Lime',
        color: '#84CC16',
        baseCost: 100000,
        growthRate: 1.09,
        baseProduction: 16000.0,
        fillTime: 1400,
        unlockCost: 3000000,
        unlocked: false
    },
    {
        id: 6,
        name: 'Green',
        color: '#22C55E',
        baseCost: 1000000,
        growthRate: 1.095,
        baseProduction: 200000.0,
        fillTime: 1500,
        unlockCost: 50000000,
        unlocked: false
    },
    {
        id: 7,
        name: 'Emerald',
        color: '#10B981',
        baseCost: 10000000,
        growthRate: 1.10,
        baseProduction: 2500000.0,
        fillTime: 1600,
        unlockCost: 800000000,
        unlocked: false
    },
    {
        id: 8,
        name: 'Teal',
        color: '#14B8A6',
        baseCost: 100000000,
        growthRate: 1.105,
        baseProduction: 30000000.0,
        fillTime: 1700,
        unlockCost: 15000000000,
        unlocked: false
    },
    {
        id: 9,
        name: 'Cyan',
        color: '#06B6D4',
        baseCost: 1000000000,
        growthRate: 1.11,
        baseProduction: 400000000.0,
        fillTime: 1800,
        unlockCost: 300000000000,
        unlocked: false
    },
    {
        id: 10,
        name: 'Sky',
        color: '#0EA5E9',
        baseCost: 10000000000,
        growthRate: 1.115,
        baseProduction: 5000000000.0,
        fillTime: 1900,
        unlockCost: 6000000000000,
        unlocked: false
    },
    {
        id: 11,
        name: 'Blue',
        color: '#3B82F6',
        baseCost: 100000000000,
        growthRate: 1.12,
        baseProduction: 60000000000.0,
        fillTime: 2000,
        unlockCost: 120000000000000,
        unlocked: false
    },
    {
        id: 12,
        name: 'Indigo',
        color: '#6366F1',
        baseCost: 1000000000000,
        growthRate: 1.125,
        baseProduction: 700000000000.0,
        fillTime: 2100,
        unlockCost: 2400000000000000,
        unlocked: false
    },
    {
        id: 13,
        name: 'Violet',
        color: '#8B5CF6',
        baseCost: 10000000000000,
        growthRate: 1.13,
        baseProduction: 8000000000000.0,
        fillTime: 2200,
        unlockCost: 48000000000000000,
        unlocked: false
    },
    {
        id: 14,
        name: 'Purple',
        color: '#A855F7',
        baseCost: 100000000000000,
        growthRate: 1.135,
        baseProduction: 90000000000000.0,
        fillTime: 2300,
        unlockCost: 960000000000000000,
        unlocked: false
    },
    {
        id: 15,
        name: 'Fuchsia',
        color: '#D946EF',
        baseCost: 1000000000000000,
        growthRate: 1.14,
        baseProduction: 1000000000000000.0,
        fillTime: 2400,
        unlockCost: 19200000000000000000,
        unlocked: false
    },
    {
        id: 16,
        name: 'Pink',
        color: '#EC4899',
        baseCost: 10000000000000000,
        growthRate: 1.145,
        baseProduction: 11000000000000000.0,
        fillTime: 2500,
        unlockCost: 384000000000000000000,
        unlocked: false
    },
    {
        id: 17,
        name: 'Rose',
        color: '#F43F5E',
        baseCost: 100000000000000000,
        growthRate: 1.15,
        baseProduction: 120000000000000000.0,
        fillTime: 2600,
        unlockCost: 7680000000000000000000,
        unlocked: false
    }
];

export const MILESTONES = [25, 50, 100, 200, 400];

export const GAME_VERSION = '1.0.0';

