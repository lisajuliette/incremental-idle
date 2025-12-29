# Game Storage System

## Overview
The game uses local storage (AsyncStorage) to persist all game state between sessions. The system is designed to be easily migratable to Supabase when ready.

## What Gets Stored

### 1. Core Progression
- **Currency**: Current currency balance (as Decimal string)
- **Generators**: Complete state for all 9 generators:
  - `id`: Generator identifier
  - `level`: Current level (0-400)
  - `fillProgress`: Production cycle progress (0-1)
  - `unlocked`: Whether generator is unlocked
  - `earnBonus`: Prestige bonus multiplier (Decimal string)
  - `speedBonus`: Prestige speed multiplier
  - `costReduction`: Prestige cost reduction multiplier

### 2. Prestige System
- **totalPrestiges**: Total number of prestiges completed
- **currentIdleMultiplier**: Current idle bonus multiplier
- **selectablesRemaining**: Number of selectable prestiges available
- **history**: Array of recent prestige actions:
  - `generator`: Generator name
  - `bonus`: Type of bonus (Earn/Speed/Cost Reduction)
  - `amount`: Bonus multiplier
  - `timestamp`: When prestige occurred

### 3. Statistics
- **lifetimeEarnings**: Total currency earned across all sessions (Decimal string)
- **incomePerSecond**: Current income rate (Decimal string)
- **timePlayedMs**: Total time played in milliseconds

### 4. Global State
- **pow**: Power multiplier for late-game (default: 1.0)
- **idlePower**: Idle power level (affects offline gains)
- **worldsCompleted**: Number of worlds completed (for future features)

### 5. Timestamps
- **lastSave**: When game was last saved
- **lastTick**: Last game loop tick
- **sessionStart**: Current session start time

### 6. User Settings
- **soundEnabled**: Sound effects on/off
- **buyMode**: Default buy mode (1, 10, or -1 for MAX)
- **buyModeSticky**: Whether buy mode persists across generators

## Storage Implementation

### Local Storage (Current)
- **Location**: `AsyncStorage` (React Native)
- **Key**: `'idleGameSave'`
- **Format**: Base64 compressed JSON using `lz-string`
- **Size**: Compressed to minimize storage usage

### Save Frequency
- **Auto-save**: Every 30 seconds during gameplay
- **Manual save**: On demand via Settings screen
- **On unmount**: Final save when app closes

### Load Behavior
- **On app start**: Automatically loads saved game
- **Offline progress**: Calculates idle multiplier based on time away
- **Fallback**: Creates new game if no save exists

## Supabase Migration Ready

The save system includes helper functions in `src/utils/saveHelpers.ts`:

### `prepareForSupabase(saveData, userId?)`
Converts save data to Supabase-compatible format:
- Flattens nested objects
- Converts to ISO timestamps
- Adds user_id field
- Prepares for database insertion

### `fromSupabase(row)`
Converts Supabase row back to SaveData format:
- Parses JSON fields
- Converts timestamps
- Reconstructs nested structure

### Database Schema (Recommended)
```sql
CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  version TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL,
  
  -- Core state
  currency TEXT NOT NULL,
  generators JSONB NOT NULL,
  prestige JSONB NOT NULL,
  
  -- Stats
  lifetime_earnings TEXT NOT NULL,
  income_per_second TEXT NOT NULL,
  time_played_ms BIGINT NOT NULL,
  
  -- Global state
  global_state JSONB NOT NULL,
  
  -- Timestamps
  last_save TIMESTAMPTZ NOT NULL,
  last_tick TIMESTAMPTZ NOT NULL,
  session_start TIMESTAMPTZ NOT NULL,
  
  -- Settings
  settings JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_game_saves_saved_at ON game_saves(saved_at DESC);
```

## Data Validation

The system includes validation:
- **Version checking**: Ensures save version compatibility
- **Type safety**: Full TypeScript types for all data
- **Error handling**: Graceful fallback on load errors
- **Data integrity**: Validates required fields on load

## Testing Save/Load

To verify the system works:

1. **Play the game** - Make some progress
2. **Check Settings** - Use "Save Game" button
3. **Close app** - Force close the app
4. **Reopen app** - Should load your progress
5. **Verify** - Check currency, generator levels, prestige history

## Future Enhancements

- **Cloud sync**: Migrate to Supabase for cross-device sync
- **Backup/restore**: Export/import save files
- **Version migration**: Automatic migration for save format changes
- **Conflict resolution**: Handle sync conflicts when using multiple devices



