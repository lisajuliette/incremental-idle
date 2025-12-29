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
        baseCost: 500,
        growthRate: 1.07,
        baseProduction: 10.0,
        fillTime: 1500,
        unlockCost: 5000,
        unlocked: false
    },
    {
        id: 3,
        name: 'Amber',
        color: '#F59E0B',
        baseCost: 25000,
        growthRate: 1.08,
        baseProduction: 100.0,
        fillTime: 2000,
        unlockCost: 250000,
        unlocked: false
    },
    {
        id: 4,
        name: 'Yellow',
        color: '#EAB308',
        baseCost: 1250000,
        growthRate: 1.08,
        baseProduction: 1000.0,
        fillTime: 2500,
        unlockCost: 12500000,
        unlocked: false
    },
    {
        id: 5,
        name: 'Lime',
        color: '#84CC16',
        baseCost: 62500000,
        growthRate: 1.09,
        baseProduction: 10000.0,
        fillTime: 3000,
        unlockCost: 625000000,
        unlocked: false
    },
    {
        id: 6,
        name: 'Green',
        color: '#22C55E',
        baseCost: 3125000000,
        growthRate: 1.09,
        baseProduction: 100000.0,
        fillTime: 3500,
        unlockCost: 31250000000,
        unlocked: false
    },
    {
        id: 7,
        name: 'Emerald',
        color: '#10B981',
        baseCost: 156250000000,
        growthRate: 1.10,
        baseProduction: 1000000.0,
        fillTime: 4000,
        unlockCost: 1562500000000,
        unlocked: false
    },
    {
        id: 8,
        name: 'Teal',
        color: '#14B8A6',
        baseCost: 7812500000000,
        growthRate: 1.10,
        baseProduction: 10000000.0,
        fillTime: 4500,
        unlockCost: 78125000000000,
        unlocked: false
    },
    {
        id: 9,
        name: 'Cyan',
        color: '#06B6D4',
        baseCost: 390625000000000,
        growthRate: 1.11,
        baseProduction: 100000000.0,
        fillTime: 5000,
        unlockCost: 3906250000000000,
        unlocked: false
    },
    {
        id: 10,
        name: 'Sky',
        color: '#0EA5E9',
        baseCost: 19531250000000000,
        growthRate: 1.11,
        baseProduction: 1000000000.0,
        fillTime: 5500,
        unlockCost: 195312500000000000,
        unlocked: false
    },
    {
        id: 11,
        name: 'Blue',
        color: '#3B82F6',
        baseCost: 976562500000000000,
        growthRate: 1.12,
        baseProduction: 10000000000.0,
        fillTime: 6000,
        unlockCost: 9765625000000000000,
        unlocked: false
    },
    {
        id: 12,
        name: 'Indigo',
        color: '#6366F1',
        baseCost: 48828125000000000000,
        growthRate: 1.12,
        baseProduction: 100000000000.0,
        fillTime: 6500,
        unlockCost: 488281250000000000000,
        unlocked: false
    },
    {
        id: 13,
        name: 'Violet',
        color: '#8B5CF6',
        baseCost: 2441406250000000000000,
        growthRate: 1.13,
        baseProduction: 1000000000000.0,
        fillTime: 7000,
        unlockCost: 24414062500000000000000,
        unlocked: false
    },
    {
        id: 14,
        name: 'Purple',
        color: '#A855F7',
        baseCost: 122070312500000000000000,
        growthRate: 1.13,
        baseProduction: 10000000000000.0,
        fillTime: 7500,
        unlockCost: 1220703125000000000000000,
        unlocked: false
    },
    {
        id: 15,
        name: 'Fuchsia',
        color: '#D946EF',
        baseCost: 6103515625000000000000000,
        growthRate: 1.14,
        baseProduction: 100000000000000.0,
        fillTime: 8000,
        unlockCost: 61035156250000000000000000,
        unlocked: false
    },
    {
        id: 16,
        name: 'Pink',
        color: '#EC4899',
        baseCost: 305175781250000000000000000,
        growthRate: 1.14,
        baseProduction: 1000000000000000.0,
        fillTime: 8500,
        unlockCost: 3051757812500000000000000000,
        unlocked: false
    },
    {
        id: 17,
        name: 'Rose',
        color: '#F43F5E',
        baseCost: 15258789062500000000000000000,
        growthRate: 1.15,
        baseProduction: 10000000000000000.0,
        fillTime: 9000,
        unlockCost: 152587890625000000000000000000,
        unlocked: false
    }
];

export const MILESTONES = [25, 50, 100, 200, 400];

export const GAME_VERSION = '1.0.0';

