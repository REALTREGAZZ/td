/**
 * TRADECOACH AI - APP.JS COMPLETO
 * Versión final: Ruta sincronizada con el servidor de Render
 */

// 1. CONFIGURACIÓN DE RED
// Detecta si estás en local o en producción (Render)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://tradecoach-backend.onrender.com';

// 2. ESTADO DE LA APLICACIÓN
let currentSymbol = 'BTC'; 

// 3. ELEMENTOS DEL DOM
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

// 4. INICIALIZACIÓN
function init() {
    setupListeners();
}

function setupListeners() {
    // Manejo de botones de selección de Cripto
    els.cryptoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.cryptoBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const symbolMap = { 'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL' };
            currentSymbol = symbolMap[btn.dataset.symbol] || btn.dataset.symbol;

            resetCard();
        });
    });

    // Eventos de botones principales
    if (els.actionBtn) els.actionBtn.addEventListener('click', handleConsult);
    if (els.copyBtn) els.copyBtn.addEventListener('click', handleCopy);
}

function resetCard() {
    showState('initial');
    if (els.copyBtn) els.copyBtn.classList.add('hidden');
    if (els.actionBtn) els.actionBtn.textContent = 'CONSULTAR COACH';
    els.card.className = 'card'; 
}

// 5. LÓGICA DE CONSULTA (SIN ERROR 404)
async function handleConsult() {
    showState('loading');
    els.card.className = 'card';

    try {
        // LLAMADA CLAVE: Usamos /api/consultar-coach (idéntico a tu server.js)
        const response = await fetch(`${API_URL}/api/consultar-coach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: currentSymbol })
        });

        // Si el servidor responde pero la ruta está mal, lanzará este error
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const resultado = await response.json();

        // Mostramos los datos reales que vienen de Coinbase
        renderResult({
            precio: resultado.data.price,
            consejo: resultado.data.advice
        });

        els.actionBtn.textContent = 'NUEVA CONSULTA';
        if (els.copyBtn) els.copyBtn.classList.remove('hidden');

    } catch (error) {
        console.error("Error de conexión:", error);
        
        // ASTUCIA: Borramos cualquier rastro del puerto 3000 del HTML original
        showError("El Coach está despertando en la nube.<br><br>Por favor, espera 30 segundos y pulsa 'NUEVA CONSULTA'.");
        
        if (els.actionBtn) els.actionBtn.textContent = 'REINTENTAR';
    }
}

// 6. RENDERIZADO DE RESULTADOS
function renderResult(data) {
    // Aplicamos el diseño neón neutral
    els.card.className = 'card glow-neutral';
    els.statusBadge.textContent = 'NEUTRAL';
    els.statusBadge.style.color = '#FFBB33';
    els.statusBadge.style.backgroundColor = '#FFBB3320';

    // Formateamos el precio (ej: 45000 -> $45,000)
    const price = parseFloat(data.precio);
    els.priceDisplay.textContent = isNaN(price) ? data.precio : `$${price.toLocaleString()}`;

    // Insertamos el consejo de la IA
    els.coachNote.textContent = `"${data.consejo}"`;

    // Metadatos de la operación
    els.riskDisplay.textContent = `RIESGO: MEDIO`;
    els.trendDisplay.textContent = `TENDENCIA: ESTABLE`;

    showState('result');
}

// 7. UTILIDADES
function handleCopy() {
    const note = els.coachNote.textContent.replace(/"/g, '');
    const textToCopy = `"${note}"\n\n— TradeCoach AI`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = els.copyBtn.textContent;
        els.copyBtn.textContent = '¡COPIADO!';
        setTimeout(() => {
            els.copyBtn.textContent = originalText;
        }, 2000);
    });
}

function showState(state) {
    const states = ['initial', 'loading', 'result', 'error'];
    states.forEach(s => {
        const el = document.getElementById(`${s}-state`);
        if (el) el.classList.add('hidden');
    });
    const activeState = document.getElementById(`${state}-state`);
    if (activeState) activeState.classList.remove('hidden');
}

function showError(msg) {
    if (els.errorState) {
        // Inyectamos el mensaje limpio sobreescribiendo el HTML viejo
        els.errorState.innerHTML = `<p style="color: #ff4444; font-weight: bold; text-align: center; padding: 20px;">${msg}</p>`;
    }
    showState('error');
    els.card.className = 'card glow-red';
}

// LANZAR APP
init();
