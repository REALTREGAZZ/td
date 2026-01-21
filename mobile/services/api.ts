import axios from 'axios';

// Replace with your Render backend URL after deployment
// For local testing on Android emulator use 'http://10.0.2.2:3000/api'
// For iOS simulator use 'http://localhost:3000/api'
const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export interface CoachAlert {
    symbol: string;
    price: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    risk: 'low' | 'medium' | 'high';
    note: string;
    indicators: {
        rsi: string;
        ema: string;
    };
    timestamp: string;
}

export const TradeCoachAPI = {
    /**
     * Get current price for a symbol
     */
    getPrice: async (symbol: string = 'bitcoin') => {
        try {
            const response = await api.get(`/price?symbol=${symbol}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching price:', error);
            throw error;
        }
    },

    /**
     * Get AI Coach Alert
     */
    getAlert: async (symbol: string = 'bitcoin'): Promise<CoachAlert> => {
        try {
            const response = await api.get(`/alert?symbol=${symbol}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching alert:', error);
            throw error;
        }
    }
};
