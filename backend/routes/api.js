const express = require('express');
const router = express.Router();
const marketData = require('../services/marketData');
const aiCoach = require('../services/aiCoach');

// GET /api/price?symbol=bitcoin
router.get('/price', async (req, res) => {
    const symbol = req.query.symbol || 'bitcoin';
    try {
        const data = await marketData.getCurrentPrice(symbol);
        res.json({
            symbol: symbol,
            price: data.price,
            source: data.source,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/alert?symbol=bitcoin&mockPrice=50000
router.get('/alert', async (req, res) => {
    const symbol = req.query.symbol || 'bitcoin';
    const mockPrice = req.query.mockPrice ? parseFloat(req.query.mockPrice) : null;

    try {
        // 1. Get Current Price (with Source)
        let priceData;
        if (mockPrice) {
            priceData = { price: mockPrice, source: 'Simulated' };
        } else {
            priceData = await marketData.getCurrentPrice(symbol);
        }

        // 2. Get History for Analysis
        let analysis = {
            trend: 'neutral',
            risk: 'medium',
            note: "Market data busy. Showing live price.",
            indicators: {}
        };

        try {
            // We still need history for RSI/EMA. 
            let prices = await marketData.getMarketChart(symbol, '14');

            // Inject mock price
            if (mockPrice) {
                const lastTimestamp = Date.now();
                prices[prices.length - 1] = [lastTimestamp, mockPrice];
            } else {
                const lastTimestamp = Date.now();
                prices[prices.length - 1] = [lastTimestamp, priceData.price];
            }

            analysis = aiCoach.analyzeMarket(prices);
        } catch (chartError) {
            console.warn(`[WARNING] History fetch failed for ${symbol}: ${chartError.message}. Returning basic data.`);
        }

        res.json({
            symbol: symbol,
            ...analysis,
            price: priceData.price, // Ensure price is always top-level
            source: priceData.source,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
