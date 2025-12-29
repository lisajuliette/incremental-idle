// Decimal is loaded globally from CDN
const Decimal = window.Decimal;
import { GENERATORS, MILESTONES } from './config.js';
import { updateGenerators, getUpgradeCost, getProduction, getMilestoneMultiplier, bulkBuyCost, maxAffordable } from './generators.js';
import { calculatePrestigeValue, updateIdleMultiplier } from './prestige.js';
import { renderUI, renderGenerators, renderStats, renderPrestige } from './ui.js';
import { saveGame, loadGame } from './save.js';

// Global game state
export const gameState = {
    currency: new Decimal(0),
    
    generators: GENERATORS.map(gen => ({
        ...gen,
        level: 0,
        fillProgress: 0,
        earnBonus: new Decimal(1),
        speedBonus: 1,
        costReduction: 1
    })),
    
    prestige: {
        totalPrestiges: 0,
        currentIdleMultiplier: 1,
        selectablesRemaining: 0,
        history: []
    },
    
    stats: {
        lifetimeEarnings: new Decimal(0),
        incomePerSecond: new Decimal(0),
        timePlayedMs: 0
    },
    
    global: {
        pow: 1.0,
        idlePower: 0,
        worldsCompleted: 0
    },
    
    timestamps: {
        lastSave: Date.now(),
        lastTick: Date.now(),
        sessionStart: Date.now()
    },
    
    settings: {
        soundEnabled: true,
        buyMode: 1, // 1, 10, or -1 for MAX
        buyModeSticky: false
    }
};

let lastTime = performance.now();
const TICK_RATE = 1000 / 60; // 60 FPS target
let lastSaveTime = Date.now();

// Initialize game
export function initGame() {
    // Try to load saved game
    if (!loadGame()) {
        // New game - unlock first generator
        gameState.generators[0].unlocked = true;
    }
    
    // Set up window positions
    setupWindowPositions();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Auto-save interval
    setInterval(() => {
        saveGame();
    }, 30000); // Every 30 seconds
}

function setupWindowPositions() {
    const mainWindow = document.getElementById('main-window');
    const statsWindow = document.getElementById('stats-window');
    const prestigeWindow = document.getElementById('prestige-window');
    const settingsWindow = document.getElementById('settings-window');
    
    // Default positions
    mainWindow.style.left = '50px';
    mainWindow.style.top = '50px';
    mainWindow.style.width = '600px';
    mainWindow.style.height = '700px';
    
    statsWindow.style.left = '700px';
    statsWindow.style.top = '50px';
    statsWindow.style.width = '250px';
    statsWindow.style.height = '180px';
    
    prestigeWindow.style.left = '50px';
    prestigeWindow.style.top = '800px';
    prestigeWindow.style.width = '280px';
    prestigeWindow.style.height = '200px';
    
    settingsWindow.style.left = '50px';
    settingsWindow.style.top = '50px';
    settingsWindow.style.width = '200px';
    settingsWindow.style.height = '300px';
    settingsWindow.style.display = 'none'; // Hidden by default
}

function setupEventListeners() {
    // Window dragging
    setupWindowDragging();
    
    // Prestige button
    const prestigeButton = document.getElementById('prestige-button');
    prestigeButton.addEventListener('click', handlePrestige);
    
    // Buy mode selector
    const buyModeButtons = document.querySelectorAll('.buy-mode-selector button');
    buyModeButtons.forEach(btn => {
        // Set initial active state
        if (parseInt(btn.dataset.mode) === gameState.settings.buyMode) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (e) => {
            const mode = parseInt(e.target.dataset.mode);
            gameState.settings.buyMode = mode;
            buyModeButtons.forEach(b => {
                b.classList.remove('active');
            });
            e.target.classList.add('active');
        });
    });
    
    // Settings
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        gameState.settings.soundEnabled = e.target.checked;
    });
    
    document.getElementById('sticky-mode-toggle').addEventListener('change', (e) => {
        gameState.settings.buyModeSticky = e.target.checked;
    });
    
    document.getElementById('save-button').addEventListener('click', () => {
        saveGame();
        showNotification('Game saved!');
    });
    
    document.getElementById('load-button').addEventListener('click', () => {
        if (loadGame()) {
            showNotification('Game loaded!');
        } else {
            showNotification('No save file found.');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, select, textarea')) {
            e.preventDefault();
            handlePrestige();
        } else if (e.key === '1') {
            gameState.settings.buyMode = 1;
        } else if (e.key === '0') {
            gameState.settings.buyMode = 10;
        } else if (e.key.toLowerCase() === 'm') {
            gameState.settings.buyMode = -1;
        }
    });
    
    // Auto-save on page unload
    window.addEventListener('beforeunload', () => {
        saveGame();
    });
    
    // Auto-save on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            saveGame();
        }
    });
}

function setupWindowDragging() {
    let draggedWindow = null;
    let dragOffset = { x: 0, y: 0 };
    
    document.querySelectorAll('.window-titlebar[data-draggable="true"]').forEach(titlebar => {
        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-button')) return;
            
            draggedWindow = titlebar.closest('.window');
            const rect = draggedWindow.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            titlebar.classList.add('dragging');
            draggedWindow.classList.add('active');
            
            // Bring to front
            document.querySelectorAll('.window').forEach(w => {
                if (w !== draggedWindow) w.classList.remove('active');
            });
        });
    });
    
    document.addEventListener('mousemove', (e) => {
        if (draggedWindow) {
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            draggedWindow.style.left = `${x}px`;
            draggedWindow.style.top = `${y}px`;
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (draggedWindow) {
            draggedWindow.querySelector('.window-titlebar').classList.remove('dragging');
            draggedWindow = null;
        }
    });
}

function gameLoop(currentTime) {
    const deltaTime = Math.min(currentTime - lastTime, 1000); // Cap at 1 second
    lastTime = currentTime;
    
    // Update generators (production, fill progress)
    updateGenerators(deltaTime);
    
    // Update idle multiplier
    updateIdleMultiplier(deltaTime);
    
    // Check generator unlocks
    checkGeneratorUnlocks();
    
    // Update UI
    renderUI();
    
    requestAnimationFrame(gameLoop);
}

function checkGeneratorUnlocks() {
    gameState.generators.forEach(gen => {
        if (!gen.unlocked && gameState.stats.lifetimeEarnings.gte(gen.unlockCost)) {
            gen.unlocked = true;
            showNotification(`${gen.name} Generator Unlocked!`);
        }
    });
}

function handlePrestige() {
    const prestigeValue = calculatePrestigeValue();
    
    if (prestigeValue.lte(0)) {
        showNotification('Keep playing to gain prestige!');
        return;
    }
    
    // Check if we have selectable prestiges
    if (gameState.prestige.selectablesRemaining > 0) {
        // Use selectable prestige UI
        const genSelect = document.getElementById('selectable-generator');
        const bonusSelect = document.getElementById('selectable-bonus');
        
        if (genSelect.value && bonusSelect.value) {
            applySelectablePrestige(genSelect.value, bonusSelect.value, prestigeValue);
            gameState.prestige.selectablesRemaining--;
            return;
        } else {
            showNotification('Please select a generator and bonus type!');
            return;
        }
    }
    
    // Random prestige
    applyRandomPrestige(prestigeValue);
}

function applyRandomPrestige(prestigeValue) {
    const unlockedGenerators = gameState.generators.filter(g => g.unlocked);
    if (unlockedGenerators.length === 0) return;
    
    const targetGenerator = unlockedGenerators[Math.floor(Math.random() * unlockedGenerators.length)];
    const bonusTypes = ['earn', 'speed', 'cost'];
    const weights = [0.4, 0.3, 0.3];
    
    let random = Math.random();
    let bonusType = 'earn';
    if (random < 0.4) {
        bonusType = 'earn';
    } else if (random < 0.7) {
        bonusType = 'speed';
    } else {
        bonusType = 'cost';
    }
    
    applyPrestigeBonus(targetGenerator, bonusType, prestigeValue);
}

function applySelectablePrestige(generatorId, bonusType, prestigeValue) {
    const targetGenerator = gameState.generators.find(g => g.id === parseInt(generatorId));
    if (!targetGenerator || !targetGenerator.unlocked) return;
    
    applyPrestigeBonus(targetGenerator, bonusType, prestigeValue);
}

function applyPrestigeBonus(generator, bonusType, prestigeValue) {
    const prestigeNum = prestigeValue instanceof Decimal ? prestigeValue.toNumber() : prestigeValue;
    const bonusAmount = 1 + (prestigeNum / 100);
    
    switch(bonusType) {
        case 'earn':
            generator.earnBonus = generator.earnBonus.times(bonusAmount);
            break;
        case 'speed':
            generator.speedBonus *= bonusAmount;
            break;
        case 'cost':
            generator.costReduction *= bonusAmount;
            break;
    }
    
    // Add to history
    const bonusNames = {
        'earn': 'Earn',
        'speed': 'Speed',
        'cost': 'Cost Reduction'
    };
    
    gameState.prestige.history.unshift({
        generator: generator.name,
        bonus: bonusNames[bonusType],
        amount: bonusAmount.toFixed(2) + '×',
        timestamp: Date.now()
    });
    
    if (gameState.prestige.history.length > 10) {
        gameState.prestige.history.pop();
    }
    
    // Reset game state
    gameState.currency = new Decimal(0);
    gameState.generators.forEach(gen => {
        gen.level = 0;
        gen.fillProgress = 0;
    });
    
    gameState.prestige.totalPrestiges++;
    gameState.prestige.currentIdleMultiplier = 1;
    
    showNotification(
        `Prestige Complete!\n` +
        `${generator.name}: +${(bonusAmount - 1) * 100}% ${bonusNames[bonusType]}`
    );
}

export function showNotification(message) {
    const overlay = document.getElementById('notification-overlay');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    overlay.innerHTML = '';
    overlay.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'notificationPop 0.3s ease-out reverse';
        setTimeout(() => {
            overlay.innerHTML = '';
        }, 300);
    }, 2000);
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

