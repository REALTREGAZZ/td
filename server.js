/**
 * TRADECOACH AI - APP.JS (VERSION FINAL SIN ERRORES 404)
 */

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://tradecoach-backend.onrender.com';

let currentSymbol = 'BTC';

const els = {
    cryptoBtns: document.querySelectorAll('.crypto-btn'),
    card: document.getElementById('card'),
    initialState: document.getElementById('initial-state'),
    loadingState: document.getElementById('loading-state'),
    resultState: document.getElementById('result-state'),
    errorState: document.getElementById('error-state'),
    statusBadge: document.getElementById('status-badge'),
    priceDisplay: document.getElementById('price-display'),
    coachNote: document.getElementById('coach-note'),
    riskDisplay: document.getElementById('risk-display'),
    trendDisplay: document.getElementById('trend-display'),
    errorMessage: document.getElementById('error-message'),
    actionBtn: document.getElementById('action-btn'),
    copyBtn: document.getElementById('copy-btn')
};

function init() {
    setupListeners();
}

function setupListeners() {
    els.cryptoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.cryptoBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const symbolMap = { 'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL' };
            currentSymbol = symbolMap[btn.dataset.symbol] || btn.dataset.symbol;
            resetCard();
        });
    });

    if (els.actionBtn) els.actionBtn.addEventListener('click', handleConsult);
}

function resetCard() {
    showState('initial');
    if (els.copyBtn) els.copyBtn.classList.add('hidden');
    els.actionBtn.textContent = 'CONSULTAR COACH';
}

async function handleConsult() {
    showState('loading');
    
    try {
        // CORRECCIÓN AQUÍ: Usamos la ruta exacta de tu server.js
        const response = await fetch(`${API_URL}/api/consultar-coach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: currentSymbol })
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const res = await response.json();
        
        // Renderizar los datos
        renderResult(res.data);
        
        els.actionBtn.textContent = 'NUEVA CONSULTA';
        if (els.copyBtn) els.copyBtn.classList.remove('hidden');

    } catch (error) {
        console.error("Error:", error);
        // Borramos el mensaje del puerto 3000 por si acaso
        showError("El Coach está despertando en la nube. <br><br> Por favor, espera 30 segundos y pulsa 'NUEVA CONSULTA'.");
    }
}

function renderResult(data) {
    els.card.className = 'card glow-neutral';
    els.priceDisplay.textContent = `$${parseFloat(data.price).toLocaleString()}`;
    els.coachNote.textContent = `"${data.advice}"`;
    showState('result');
}

function showState(state) {
    const states = ['initial', 'loading', 'result', 'error'];
    states.forEach(s => {
        const el = document.getElementById(`${s}-state`);
        if (el) el.classList.add('hidden');
    });
    const active = document.getElementById(`${state}-state`);
    if (active) active.classList.remove('hidden');
}

function showError(msg) {
    if (els.errorState) {
        els.errorState.innerHTML = `<p style="color: #ff4444; font-weight: bold; text-align: center; padding: 20px;">${msg}</p>`;
    }
    showState('error');
    els.card.className = 'card glow-red';
}

init();
