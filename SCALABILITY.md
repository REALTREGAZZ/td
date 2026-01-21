# TradeCoach AI - Architecture & Scalability Guide

## 🏗️ Architecture Overview

TradeCoach AI is designed to be **Free, Fast, and Scalable**. It uses a lightweight Node.js backend with intelligent caching to serve thousands of users without hitting external API limits.

### Data Flow
1.  **User Request**: Mobile App or Web Demo requests `/api/alert?symbol=bitcoin`.
2.  **Cache Check**: Backend checks in-memory `node-cache` (TTL 60s).
    -   *Hit*: Returns data instantly (< 10ms).
    -   *Miss*: Fetches fresh data from CoinGecko.
3.  **AI Analysis**:
    -   Calculates RSI (14), EMA (20).
    -   Calculates Volatility (StdDev).
    -   Identifies Support/Resistance levels from 14-day history.
4.  **Coach Logic**: Selects a viral, context-aware phrase based on all metrics.
5.  **Response**: JSON sent to user.

## 🚀 Scalability Strategy (How to handle 10k+ users)

### 1. The Caching Layer (Implemented)
We use `node-cache` to store the result of CoinGecko calls for 60 seconds.
-   **Impact**: Even if 10,000 users request BTC price in 1 minute, we only make **1 call** to CoinGecko.
-   **Limit Safety**: CoinGecko Free allows ~10-30 calls/minute. Our system makes max 3 calls/minute (BTC, ETH, SOL). We are 10x safe.

### 2. Cloudflare Workers (Optional - For massive scale)
If the Node.js server (Render) gets overwhelmed, you can put a Cloudflare Worker in front.
-   **Worker Logic**: Cache the `/api/alert` response at the Edge.
-   **Cost**: Free plan allows 100,000 requests/day.
-   **Latency**: Users get responses from the nearest server location globally.

### 3. Render Free Tier
-   **Constraint**: Spins down after 15 mins of inactivity.
-   **Solution**: Use a free uptime monitor (like UptimeRobot) to ping your API every 10 minutes. This keeps it "warm" and prevents the 30s wake-up delay.

## 🛠️ Deployment Instructions

### Backend (Render)
1.  Push code to GitHub.
2.  New Web Service on Render.
3.  Build: `npm install`
4.  Start: `node server.js`
5.  **Env Vars**: None needed for free tier.

### Web Demo (GitHub Pages)
1.  Push `web/` folder content to a `gh-pages` branch.
2.  Update `app.js` with your Render URL.
3.  Enable Pages in GitHub Repo Settings.

### Mobile (React Native)
1.  Build APK/AAB with Expo.
2.  Submit to Play Store.
3.  Update `api.ts` with your Render URL.

## 🤖 AI Logic Details
The "Coach" isn't just random text. It analyzes:
-   **Trend**: Price vs EMA(20).
-   **Momentum**: RSI(14).
-   **Volatility**: Standard Deviation of recent moves.
-   **Structure**: Proximity to 14-day Highs (Resistance) or Lows (Support).

This ensures the advice is **contextually relevant** while maintaining the "Viral/Gen Z" tone.
