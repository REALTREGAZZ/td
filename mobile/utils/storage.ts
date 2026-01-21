import AsyncStorage from '@react-native-async-storage/async-storage';

const LIMIT_KEY = 'DAILY_QUERY_COUNT';
const DATE_KEY = 'LAST_QUERY_DATE';
const MAX_DAILY_QUERIES = 5;

export const StorageUtils = {
    /**
     * Check if user can make a query.
     * Resets count if it's a new day.
     */
    canQuery: async (): Promise<boolean> => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastDate = await AsyncStorage.getItem(DATE_KEY);

            if (lastDate !== today) {
                // New day, reset
                await AsyncStorage.setItem(DATE_KEY, today);
                await AsyncStorage.setItem(LIMIT_KEY, '0');
                return true;
            }

            const countStr = await AsyncStorage.getItem(LIMIT_KEY);
            const count = countStr ? parseInt(countStr, 10) : 0;

            return count < MAX_DAILY_QUERIES;
        } catch (error) {
            console.error('Storage Error:', error);
            return true; // Fail safe: allow query
        }
    },

    /**
     * Increment the query count.
     */
    incrementCount: async (): Promise<number> => {
        try {
            const countStr = await AsyncStorage.getItem(LIMIT_KEY);
            let count = countStr ? parseInt(countStr, 10) : 0;
            count++;
            await AsyncStorage.setItem(LIMIT_KEY, count.toString());
            return count;
        } catch (error) {
            return 0;
        }
    },

    /**
     * Get current count for display
     */
    getCount: async (): Promise<number> => {
        const countStr = await AsyncStorage.getItem(LIMIT_KEY);
        return countStr ? parseInt(countStr, 10) : 0;
    }
};
