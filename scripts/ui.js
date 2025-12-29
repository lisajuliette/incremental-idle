// Decimal is loaded globally from CDN
const Decimal = window.Decimal;
import { gameState } from './game.js';
import { getUpgradeCost, getProduction, getMilestoneProgress, buyGenerator, maxAffordable } from './generators.js';
import { calculatePrestigeValue } from './prestige.js';

export function renderUI() {
    renderGenerators();
    renderStats();
    renderPrestige();
}

export function renderGenerators() {
    const container = document.getElementById('generators-content');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.generators.forEach(gen => {
        const row = createGeneratorRow(gen);
        container.appendChild(row);
    });
}

function createGeneratorRow(generator) {
    const row = document.createElement('div');
    row.className = `generator-row ${generator.unlocked ? 'unlocked' : 'locked'}`;
    row.style.borderColor = generator.color;
    
    if (!generator.unlocked) {
        row.innerHTML = `
            <div class="generator-locked">
                <div>🔒 LOCKED</div>
                <div class="generator-unlock-cost">Unlock at: ${formatNumber(generator.unlockCost)}</div>
            </div>
        `;
        return row;
    }
    
    const level = generator.level;
    const isMaxed = level >= 400; // All milestones reached
    const milestoneProgress = getMilestoneProgress(level);
    const production = getProduction(generator);
    const nextCost = getUpgradeCost(generator, 1);
    const canAfford1 = gameState.currency.gte(nextCost);
    
    // Determine buy mode
    let buyAmount = gameState.settings.buyMode;
    if (buyAmount === -1) {
        buyAmount = maxAffordable(
            gameState.currency,
            generator.baseCost,
            generator.growthRate,
            generator.level,
            generator.costReduction
        );
    }
    
    const canAfford = buyAmount > 0 && gameState.currency.gte(getUpgradeCost(generator, buyAmount));
    
    // Determine button state
    let buttonClass = 'cannot-afford';
    if (canAfford) {
        if (buyAmount >= 13) {
            buttonClass = 'can-afford-13';
        } else if (buyAmount >= 3) {
            buttonClass = 'can-afford-3';
        } else {
            buttonClass = 'can-afford-1';
        }
    }
    
    // Fill progress
    const fillPercent = Math.min(100, generator.fillProgress * 100);
    
    row.innerHTML = `
        <div class="generator-header">
            <span class="generator-color-indicator" style="background: ${generator.color}"></span>
            <span class="generator-name">${generator.name}</span>
            <span class="generator-level">Lv. ${level}</span>
            ${isMaxed ? '<span class="generator-maxed">🌈 MAXED</span>' : ''}
        </div>
        
        ${!isMaxed ? `
        <div class="progress-container">
            <div class="progress-label">Milestone Progress (${milestoneProgress.next || 'MAX'})</div>
            <div class="milestone-progress">
                <div class="milestone-circle" style="--progress: ${milestoneProgress.progress * 100}%"></div>
                <div class="milestone-text">${Math.floor(milestoneProgress.progress * 100)}%</div>
            </div>
        </div>
        ` : ''}
        
        <div class="progress-container">
            <div class="progress-label">Production Cycle</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${fillPercent}%"></div>
                <div class="progress-text">${fillPercent.toFixed(0)}%</div>
            </div>
        </div>
        
        <div class="generator-stats">
            <div class="generator-stat-row">
                <span class="generator-stat-label">Production:</span>
                <span class="generator-stat-value">${formatNumber(production)}/fill</span>
            </div>
            <div class="generator-stat-row">
                <span class="generator-stat-label">Next:</span>
                <span class="generator-stat-value">${formatNumber(nextCost)}</span>
            </div>
        </div>
        
        <div class="generator-buttons">
            <button class="pixel-button buy-button ${buttonClass}" 
                    data-gen-id="${generator.id}" 
                    data-amount="1"
                    ${!canAfford1 ? 'disabled' : ''}>
                BUY 1
            </button>
            <button class="pixel-button buy-button ${buttonClass}" 
                    data-gen-id="${generator.id}" 
                    data-amount="10"
                    ${!gameState.currency.gte(getUpgradeCost(generator, 10)) ? 'disabled' : ''}>
                BUY 10
            </button>
            <button class="pixel-button buy-button ${buttonClass}" 
                    data-gen-id="${generator.id}" 
                    data-amount="-1"
                    ${!canAfford ? 'disabled' : ''}>
                BUY MAX
            </button>
        </div>
    `;
    
    // Add click handlers
    row.querySelectorAll('.buy-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const amount = parseInt(e.target.dataset.amount);
            if (buyGenerator(generator, amount)) {
                renderGenerators(); // Re-render to update UI
            }
        });
    });
    
    return row;
}

export function renderStats() {
    const balanceEl = document.getElementById('current-balance');
    const incomeEl = document.getElementById('income-per-sec');
    const prestigeEl = document.getElementById('prestige-value');
    const idleEl = document.getElementById('idle-multiplier');
    const lifetimeEl = document.getElementById('lifetime-earned');
    
    if (balanceEl) {
        balanceEl.textContent = `¤ ${formatNumber(gameState.currency)}`;
    }
    
    if (incomeEl) {
        incomeEl.textContent = `⚡ ${formatNumber(gameState.stats.incomePerSecond)} / sec`;
    }
    
    const prestigeValue = calculatePrestigeValue();
    if (prestigeEl) {
        prestigeEl.textContent = `✦ ${formatNumber(prestigeValue)}`;
    }
    
    if (idleEl) {
        idleEl.textContent = `(×${gameState.prestige.currentIdleMultiplier.toFixed(2)} idle bonus)`;
    }
    
    if (lifetimeEl) {
        lifetimeEl.textContent = `📊 ${formatNumber(gameState.stats.lifetimeEarnings)}`;
    }
}

export function renderPrestige() {
    const prestigeValue = calculatePrestigeValue();
    const displayEl = document.getElementById('prestige-display');
    const idleTextEl = document.getElementById('prestige-idle-text');
    const buttonEl = document.getElementById('prestige-button');
    const historyEl = document.getElementById('prestige-history-list');
    const selectableSection = document.getElementById('selectable-prestige-section');
    const selectableCount = document.getElementById('selectable-count');
    const genSelect = document.getElementById('selectable-generator');
    
    if (displayEl) {
        displayEl.textContent = `✦ ${formatNumber(prestigeValue)}`;
    }
    
    if (idleTextEl) {
        idleTextEl.textContent = `(×${gameState.prestige.currentIdleMultiplier.toFixed(2)} idle)`;
    }
    
    if (buttonEl) {
        buttonEl.disabled = prestigeValue.lte(0);
        if (prestigeValue.gt(0)) {
            buttonEl.style.animation = 'pulse 2s infinite';
        } else {
            buttonEl.style.animation = 'none';
        }
        
        // Update button text based on selectable prestiges
        if (gameState.prestige.selectablesRemaining > 0) {
            buttonEl.textContent = 'APPLY SELECTABLE PRESTIGE';
        } else {
            buttonEl.textContent = 'RESET & GAIN BONUS';
        }
    }
    
    // Render history
    if (historyEl) {
        historyEl.innerHTML = '';
        gameState.prestige.history.slice(0, 5).forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'prestige-history-item';
            historyItem.textContent = `• ${item.generator}: +${item.amount} ${item.bonus}`;
            historyEl.appendChild(historyItem);
        });
        
        if (gameState.prestige.history.length === 0) {
            historyEl.innerHTML = '<div class="prestige-history-item">No prestiges yet</div>';
        }
    }
    
    // Handle selectable prestiges
    if (gameState.prestige.selectablesRemaining > 0) {
        if (selectableSection) {
            selectableSection.style.display = 'block';
        }
        if (selectableCount) {
            selectableCount.textContent = `${gameState.prestige.selectablesRemaining} left`;
        }
        
        // Populate generator select
        if (genSelect) {
            genSelect.innerHTML = '<option value="">Choose Generator</option>';
            gameState.generators
                .filter(g => g.unlocked)
                .forEach(gen => {
                    const option = document.createElement('option');
                    option.value = gen.id;
                    option.textContent = gen.name;
                    genSelect.appendChild(option);
                });
        }
    } else {
        if (selectableSection) {
            selectableSection.style.display = 'none';
        }
    }
}

export function formatNumber(num) {
    if (num instanceof Decimal) {
        if (num.isZero()) return '0';
        if (num.lt(1000)) return num.toFixed(0);
        
        const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
        const tier = Math.floor(Math.log10(num.toNumber()) / 3);
        
        if (tier <= 0) return num.toFixed(0);
        if (tier >= units.length) return num.toExponential(2);
        
        const unit = units[tier];
        const scaled = num.div(Math.pow(10, tier * 3));
        
        return scaled.toFixed(2) + unit;
    }
    
    // Fallback for regular numbers
    if (num < 1000) return num.toFixed(0);
    
    const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    
    if (tier <= 0) return num.toFixed(0);
    if (tier >= units.length) return num.toExponential(2);
    
    const unit = units[tier];
    const scaled = num / Math.pow(10, tier * 3);
    
    return scaled.toFixed(2) + unit;
}

// Add pulse animation for prestige button
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 217, 61, 0.7);
        }
        50% {
            box-shadow: 0 0 0 10px rgba(255, 217, 61, 0);
        }
    }
`;
document.head.appendChild(style);

