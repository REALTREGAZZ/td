// ==========================================
// 1. CONFIGURACIÓN DE RED (SISTEMA PROFESIONAL)
// ==========================================
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://tradecoach-backend.onrender.com';

// STATE
let currentSymbol = 'BTC'; 

// ==========================================
// 2. ELEMENTOS DEL DOM
// ==========================================
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
    errorMessage: document.getElementById('error-message'), // Aquí es donde inyectaremos el texto limpio
    actionBtn: document.getElementById('action-btn'),
    copyBtn: document.getElementById('copy-btn')
};

// ==========================================
// 3. INICIALIZACIÓN
// ==========================================
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
    if (els.copyBtn) els.copyBtn.addEventListener('click', handleCopy);
}

function resetCard() {
    showState('initial');
    if (els.copyBtn) els.copyBtn.classList.add('hidden');
    if (els.actionBtn) els.actionBtn.textContent = 'CONSULTAR COACH';
    els.card.className = 'card'; 
}

// ==========================================
// 4. LÓGICA DE CONSULTA (SIN RASTROS DE PUERTO 3000)
// ==========================================
async function handleConsult() {
    showState('loading');
    els.card.className = 'card';

    try {
        const response = await fetch(`${API_URL}/api/coach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: currentSymbol })
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const resultado = await response.json();

        renderResult({
            precio: resultado.data.price,
            consejo: resultado.data.advice
        });

        els.actionBtn.textContent = 'NUEVA CONSULTA';
        els.copyBtn.classList.remove('hidden');

    } catch (error) {
        console.error("Conexión fallida:", error);
        // SER ASTUTO: Reemplazamos todo el contenido del error para borrar lo del puerto 3000
        showError("El Coach está despertando en la nube. <br><br> Por favor, espera 30 segundos y pulsa 'NUEVA CONSULTA'.");
    }
}

// ==========================================
// 5. RENDERIZADO Y UI
// ==========================================
function renderResult(data) {
    els.card.className = `card glow-neutral`;
    els.statusBadge.textContent = 'NEUTRAL';
    els.statusBadge.style.backgroundColor = `#FFBB3320`;
    els.statusBadge.style.color = '#FFBB33';

    const price = parseFloat(data.precio);
    els.priceDisplay.textContent = isNaN(price) ? data.precio : `$${price.toLocaleString()}`;
    els.coachNote.textContent = `"${data.consejo}"`;

    els.riskDisplay.textContent = `RIESGO: MEDIO`;
    els.trendDisplay.textContent = `TENDENCIA: ESTABLE`;

    showState('result');
}

function handleCopy() {
    const note = els.coachNote.textContent.replace(/"/g, '');
    const textToCopy = `"${note}"\n\n— TradeCoach AI`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = els.copyBtn.textContent;
        els.copyBtn.textContent = '¡COPIADO!';
        setTimeout(() => els.copyBtn.textContent = originalText, 2000);
    });
}

function showState(state) {
    const states = ['initialState', 'loadingState', 'resultState', 'errorState'];
    states.forEach(s => { if (els[s]) els[s].classList.add('hidden'); });
    if (els[`${state}State`]) els[`${state}State`].classList.remove('hidden');
}

function showError(msg) {
    if (els.errorState) {
        // ASTUCIA MÁXIMA: Forzamos que el contenedor de error SOLO tenga nuestro mensaje
        // Esto elimina cualquier texto antiguo que estuviera escrito en el HTML (como lo del puerto 3000)
        els.errorState.innerHTML = `<p id="error-message" style="color: #ff4444; font-weight: bold;">${msg}</p>`;
    }
    showState('error');
    els.card.className = 'card glow-red';
}

init();
