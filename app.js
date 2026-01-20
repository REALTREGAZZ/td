/**
 * TRADECOACH AI - FRONTEND DEFINITIVO
 * Sistema de análisis con Google Gemini AI
 */

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://tradecoach-backend.onrender.com';

// ESTADO GLOBAL
let currentSymbol = 'BTC'; 

// ELEMENTOS DEL DOM
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
    actionBtn: document.getElementById('action-btn'),
    scanBtn: document.getElementById('scan-btn'), 
    copyBtn: document.getElementById('copy-btn')
};

// 1. INICIALIZACIÓN
function init() {
    setupListeners();
    console.log("TradeCoach AI Initialized en:", API_URL);
}

function setupListeners() {
    // Selección de Monedas
    els.cryptoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.cryptoBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const symbolMap = { 'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL' };
            currentSymbol = symbolMap[btn.dataset.symbol] || btn.dataset.symbol;
            resetCard();
        });
    });

    // Botones de Acción
    if (els.actionBtn) els.actionBtn.addEventListener('click', handleConsult);
    if (els.scanBtn) els.scanBtn.addEventListener('click', handleScan);
    if (els.copyBtn) els.copyBtn.addEventListener('click', handleCopy);
}

function resetCard() {
    showState('initial');
    if (els.copyBtn) els.copyBtn.classList.add('hidden');
    if (els.actionBtn) els.actionBtn.textContent = 'CONSULTAR COACH';
    els.card.className = 'card'; 
}

// 2. CONSULTA DE PRECIOS (Coinbase)
async function handleConsult() {
    showState('loading');
    els.card.className = 'card';

    try {
        const response = await fetch(`${API_URL}/api/consultar-coach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: currentSymbol })
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const resultado = await response.json();
        renderResult(resultado.data.price, resultado.data.advice);

        els.actionBtn.textContent = 'NUEVA CONSULTA';
        if (els.copyBtn) els.copyBtn.classList.remove('hidden');

    } catch (error) {
        console.error("Error de conexión:", error);
        showError("El Coach está despertando. <br><br> Por favor, espera 30 segundos y pulsa 'REINTENTAR'.");
    }
}

// 3. ESCANEO DE GRÁFICOS (Google Gemini AI)
async function handleScan() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showState('loading');
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result;

            try {
                const response = await fetch(`${API_URL}/api/scan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        imageBase64: base64Image,
                        activoActual: currentSymbol 
                    })
                });

                const res = await response.json();
                
                if (res.success) {
                    renderResult("ANÁLISIS IA", res.message, true);
                } else {
                    throw new Error(res.message);
                }
            } catch (error) {
                console.error("Error en Scan:", error);
                showError("No se pudo analizar el gráfico. Asegúrate de que la imagen sea clara y el servidor esté activo.");
            }
        };
    };
    
    fileInput.click();
}

// 4. UI Y RENDERIZADO
function renderResult(precio, consejo, isScan = false) {
    els.card.className = `card glow-neutral`;
    els.statusBadge.textContent = isScan ? 'ANALIZADO' : 'LIVE';
    els.statusBadge.style.backgroundColor = `#FFBB3320`;
    els.statusBadge.style.color = '#FFBB33';

    const priceNum = parseFloat(precio);
    els.priceDisplay.textContent = isNaN(priceNum) ? precio : `$${priceNum.toLocaleString()}`;
    
    // Limpiamos comillas duplicadas
    const consejoLimpio = consejo.replace(/^"|"$/g, '');
    els.coachNote.textContent = `"${consejoLimpio}"`;

    els.riskDisplay.textContent = isScan ? `TIPO: ESCÁNER` : `RIESGO: MEDIO`;
    els.trendDisplay.textContent = isScan ? `ORIGEN: VISUAL` : `TENDENCIA: ESTABLE`;

    showState('result');
    if (isScan && els.actionBtn) els.actionBtn.textContent = 'NUEVO ESCANEO';
}

function showState(state) {
    // Ocultar todos y limpiar el contenedor de error de basura estática del HTML
    const states = ['initial', 'loading', 'result', 'error'];
    states.forEach(s => {
        const el = document.getElementById(`${s}-state`);
        if (el) {
            el.classList.add('hidden');
            if (s === 'error') el.innerHTML = ''; 
        }
    });

    const active = document.getElementById(`${state}-state`);
    if (active) active.classList.remove('hidden');
}

function showError(msg) {
    if (els.errorState) {
        // Inyectamos el mensaje dinámicamente para borrar el texto rojo viejo
        els.errorState.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #ff4444; font-weight: bold; line-height: 1.4;">${msg}</p>
                <button onclick="resetCard()" style="margin-top:15px; background:rgba(255,255,255,0.1); color:white; border:1px solid #444; padding:8px 15px; border-radius:8px; cursor:pointer;">
                    Intentar de nuevo
                </button>
            </div>
        `;
    }
    showState('error');
    els.card.className = 'card glow-red';
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

// Iniciar aplicación
init();
