import { SaveData } from './save';
import { GameState } from '../types/game';

/**
 * Helper functions for Supabase migration
 * These functions prepare data for database storage
 */

/**
 * Convert SaveData to a format suitable for Supabase
 * Returns a flat object that can be inserted into a database row
 */
export function prepareForSupabase(saveData: SaveData, userId?: string): Record<string, any> {
    return {
        user_id: userId || null,
        version: saveData.version,
        saved_at: new Date(saveData.timestamp).toISOString(),
        
        // Core state
        currency: saveData.state.currency,
        
        // Generators as JSON
        generators: JSON.stringify(saveData.state.generators),
        
        // Prestige as JSON
        prestige: JSON.stringify(saveData.state.prestige),
        
        // Stats
        lifetime_earnings: saveData.state.stats.lifetimeEarnings,
        income_per_second: saveData.state.stats.incomePerSecond,
        time_played_ms: saveData.state.stats.timePlayedMs,
        
        // Global state as JSON
        global_state: JSON.stringify(saveData.state.global),
        
        // Timestamps
        last_save: new Date(saveData.state.timestamps.lastSave).toISOString(),
        last_tick: new Date(saveData.state.timestamps.lastTick).toISOString(),
        session_start: new Date(saveData.state.timestamps.sessionStart).toISOString(),
        
        // Settings as JSON
        settings: JSON.stringify(saveData.state.settings),
        
        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

/**
 * Convert Supabase row back to SaveData format
 */
export function fromSupabase(row: Record<string, any>): SaveData {
    return {
        version: row.version || '1.0.0',
        timestamp: new Date(row.saved_at).getTime(),
        state: {
            currency: row.currency || '0',
            generators: JSON.parse(row.generators || '[]'),
            prestige: JSON.parse(row.prestige || '{}'),
            stats: {
                lifetimeEarnings: row.lifetime_earnings || '0',
                incomePerSecond: row.income_per_second || '0',
                timePlayedMs: row.time_played_ms || 0
            },
            global: JSON.parse(row.global_state || '{}'),
            timestamps: {
                lastSave: new Date(row.last_save).getTime(),
                lastTick: new Date(row.last_tick).getTime(),
                sessionStart: new Date(row.session_start).getTime()
            },
            settings: JSON.parse(row.settings || '{}')
        }
    };
}

/**
 * Validate save data structure
 */
export function validateSaveData(data: any): data is SaveData {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || !data.timestamp) return false;
    if (!data.state || typeof data.state !== 'object') return false;
    
    // Check required fields
    const required = ['currency', 'generators', 'prestige', 'stats', 'global', 'timestamps', 'settings'];
    for (const field of required) {
        if (!(field in data.state)) return false;
    }
    
    return true;
}

/**
 * Get save data size (for monitoring)
 */
export function getSaveDataSize(saveData: SaveData): number {
    return JSON.stringify(saveData).length;
}



