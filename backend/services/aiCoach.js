const { RSI, EMA } = require('technicalindicators');
const phrases = require('./phrases');

/**
 * Analyze market data and generate a "Coach" alert
 * @param {Array} prices - Array of [timestamp, price]
 * @returns {Object} - { trend, risk, note, indicators }
 */
function analyzeMarket(prices) {
    // Extract just the price values
    const priceValues = prices.map(p => p[1]);

    // Calculate Indicators
    // RSI (Relative Strength Index) - 14 periods
    const rsiInput = {
        values: priceValues,
        period: 14
    };
    const rsiValues = RSI.calculate(rsiInput);
    const currentRSI = rsiValues[rsiValues.length - 1];

    // EMA (Exponential Moving Average) - 20 periods (short term trend)
    const emaInput = {
        period: 20,
        values: priceValues
    };
    const emaValues = EMA.calculate(emaInput);
    const currentEMA = emaValues[emaValues.length - 1];
    const currentPrice = priceValues[priceValues.length - 1];

    // --- AI / Coach Logic ---

    // 1. Determine Trend
    let trend = 'neutral';
    if (currentPrice > currentEMA) {
        trend = 'bullish';
    } else if (currentPrice < currentEMA) {
        trend = 'bearish';
    }

    // 2. Determine Risk
    let risk = 'medium';
    if (currentRSI > 70 || currentRSI < 30) {
        risk = 'high'; // Overbought or Oversold
    } else if (currentRSI > 45 && currentRSI < 55) {
        risk = 'low'; // Stable
    }

    // 3. Generate Coach Note
    // Pass new context to phrases generator
    const context = {
        trend,
        risk,
        rsi: currentRSI,
        volatility,
        distToSupport,
        distToResistance
    };
    const note = phrases.getPhrase(context);

    return {
        price: currentPrice,
        trend: trend,
        risk: risk,
        note: note,
        indicators: {
            rsi: currentRSI.toFixed(2),
            ema: currentEMA.toFixed(2),
            volatility: volatility.toFixed(2) + '%',
            support: support.toFixed(2),
            resistance: resistance.toFixed(2)
        }
    };
}

/**
 * Calculate Volatility (Standard Deviation of % changes)
 */
function calculateVolatility(prices, period = 14) {
    if (prices.length < period + 1) return 0;

    // Calculate % changes
    const changes = [];
    for (let i = prices.length - period; i < prices.length; i++) {
        const prev = prices[i - 1];
        const curr = prices[i];
        if (prev && curr) {
            changes.push(((curr - prev) / prev) * 100);
        }
    }

    // Calculate Mean
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;

    // Calculate Variance
    const variance = changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;

    // Return Std Dev
    return Math.sqrt(variance);
}

module.exports = {
    analyzeMarket
};
