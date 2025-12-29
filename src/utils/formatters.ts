import Decimal from 'break_infinity.js';

export function formatNumber(num: Decimal | number): string {
    if (num instanceof Decimal) {
        if (num.eq(0) || num.equals(0)) return '0';
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



