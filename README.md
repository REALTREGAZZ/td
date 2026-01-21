# TradeCoach AI 🚀

The most attractive, viral, and useful AI trading coach backend.

## 🌟 Features
- **Real-time Analysis**: Fetches live data from CoinGecko.
- **AI Coach Logic**: Uses RSI, EMA, and Volatility to generate "Coach Notes".
- **Smart Caching**: In-memory caching (60s) to respect free API limits.
- **Ready for Scale**: Modular architecture, easy to swap CoinGecko for paid APIs.

## 🛠️ Tech Stack
- **Backend**: Node.js + Express
- **Data**: CoinGecko API (Free)
- **Indicators**: `technicalindicators` library
- **Caching**: `node-cache`

## 🚀 Quick Start (Local)

1.  **Install Dependencies**
    ```bash
    cd backend
    npm install
    ```

2.  **Start Server**
    ```bash
    npm start
    ```

3.  **Test Endpoints**
    - Price: `http://localhost:3000/api/price?symbol=bitcoin`
    - Alert: `http://localhost:3000/api/alert?symbol=ethereum`

## 🌍 Deployment (Render Free Tier)

1.  Push this code to GitHub.
2.  Create a new **Web Service** on [Render](https://render.com/).
3.  Connect your repo.
4.  Settings:
    - **Root Directory**: `backend`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
5.  Click **Deploy**.

## 📱 Mobile App Integration
Copy `mobile/services/api.ts` to your React Native project. Update `BASE_URL` with your Render URL.

## ⚠️ Disclaimer
*TradeCoach AI provides educational information only. It is not financial advice. Trading crypto involves risk.*
