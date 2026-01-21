const axios = require('axios');

// CONFIG
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';
const TOTAL_USERS = 20; // Number of concurrent users to simulate
const SYMBOLS = ['bitcoin', 'ethereum', 'solana'];

// UTILS
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
const getRandomDelay = () => Math.floor(Math.random() * 2000); // 0-2s

// SIMULATION
async function simulateUser(userId) {
    const symbol = getRandomSymbol();
    const delay = getRandomDelay();

    // Simulate user thinking time
    await sleep(delay);

    try {
        const start = Date.now();
        const response = await axios.get(`${BASE_URL}/alert?symbol=${symbol}`);
        const duration = Date.now() - start;

        const data = response.data;

        // Format Output
        const status = data.risk === 'high' ? '🔴 RED' : (data.trend === 'bullish' ? '🟢 GREEN' : '🟡 YELLOW');
        const source = data.source || 'Unknown';

        console.log(
            `${symbol.toUpperCase().padEnd(8)} | ` +
            `User ${userId.toString().padEnd(2)} | ` +
            `Price: $${data.price.toLocaleString().padEnd(8)} | ` +
            `Status: ${status.padEnd(10)} | ` +
            `Source: ${source.padEnd(10)} | ` +
            `Time: ${duration}ms`
        );

        if (source === 'Coinbase') {
            console.log(`⚠️  Fallback to Coinbase activated for User ${userId}`);
        }

    } catch (error) {
        console.error(`❌ User ${userId} failed: ${error.message}`);
    }
}

async function runSimulation() {
    console.log(`🚀 Starting Traffic Simulation: ${TOTAL_USERS} users...`);
    console.log(`Target: ${BASE_URL}\n`);

    const promises = [];
    for (let i = 1; i <= TOTAL_USERS; i++) {
        promises.push(simulateUser(i));
    }

    await Promise.all(promises);
    console.log('\n✅ Simulation Complete.');
}

// Run
runSimulation();
