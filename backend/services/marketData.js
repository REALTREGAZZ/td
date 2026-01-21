const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 60 seconds to respect CoinGecko free tier limits
const marketCache = new NodeCache({ stdTTL: 60 });

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Fetch market chart data (prices) for a given symbol
 * @param {string} symbol - The coin ID (e.g., 'bitcoin', 'ethereum')
 * @param {string} days - Number of days for data (default '1' for intraday)
 * @returns {Promise<Array>} - Array of [timestamp, price]
 */
async function getMarketChart(symbol = 'bitcoin', days = '1') {
    const cacheKey = `chart_${symbol}_${days}`;
    const cachedData = marketCache.get(cacheKey);

    if (cachedData) {
        console.log(`[CACHE] Hit for ${cacheKey}`);
        return cachedData;
    }

    try {
        console.log(`[API] Fetching chart for ${symbol}...`);
        const response = await axios.get(`${COINGECKO_API}/coins/${symbol}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: days
            }
        });

        const prices = response.data.prices;
        marketCache.set(cacheKey, prices);
        return prices;
    } catch (error) {
        console.error(`[ERROR] Failed to fetch chart for ${symbol}:`, error.message);
        throw new Error('Failed to fetch market data');
    }
}

/**
 * Fetch current price with Fallback (CoinGecko -> Coinbase)
 * @param {string} symbol - The coin ID
 * @returns {Promise<{price: number, source: string}>} - Price and Source
 */
async function getCurrentPrice(symbol = 'bitcoin') {
    const cacheKey = `price_${symbol}`;
    const cachedData = marketCache.get(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    try {
        // 1. Try CoinGecko
        console.log(`[API] Fetching price for ${symbol} from CoinGecko...`);
        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: symbol,
                vs_currencies: 'usd'
            },
            timeout: 5000 // 5s timeout
        });

        if (!response.data[symbol]) throw new Error('CoinGecko no data');

        const price = response.data[symbol].usd;
        const result = { price, source: 'CoinGecko' };
        marketCache.set(cacheKey, result);
        return result;

    } catch (error) {
        console.warn(`[WARNING] CoinGecko failed for ${symbol}: ${error.message}. Trying Coinbase...`);

        // 2. Fallback to Coinbase
        try {
            const cbSymbol = getCoinbaseSymbol(symbol);
            const cbResponse = await axios.get(`https://api.coinbase.com/v2/prices/${cbSymbol}-USD/spot`);

            const price = parseFloat(cbResponse.data.data.amount);
            const result = { price, source: 'Coinbase' };

            // Cache for shorter time on fallback (e.g., 30s)
            marketCache.set(cacheKey, result, 30);
            return result;
        } catch (cbError) {
            console.error(`[ERROR] Coinbase also failed for ${symbol}:`, cbError.message);
            throw new Error('Failed to fetch price from all sources');
        }
    }
}

function getCoinbaseSymbol(geckoSymbol) {
    const map = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'solana': 'SOL'
    };
    return map[geckoSymbol] || 'BTC';
}

module.exports = {
    getMarketChart,
    getCurrentPrice
};
