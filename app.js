/**
 * TRADECOACH AI - FRONTEND DEFINITIVO
 * Sistema de análisis con Google Gemini AI
 */

// 1. CONFIGURACIÓN DE CONEXIÓN
// Detecta si estás en tu PC (localhost) o en internet (Render)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://tradecoach-backend.onrender.com';

// ESTADO GLOBAL DE LA APP
let currentSymbol = 'BTC'; 

// ELEMENTOS DEL DOM (MAPEADOS PARA EL HTML)
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

// 2. INICIALIZACIÓN
function init() {
    setupListeners();
    console.log("🚀 TradeCoach AI iniciado con servidor en:", API_URL);
}

// Configuración de eventos de botones
function setupListeners() {
    // Selección de Monedas (Bitcoin, Ethereum, Solana)
    els.cryptoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI: Cambiar botón activo
            els.cryptoBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Lógica: Mapear nombre a Símbolo
            const symbolMap = { 'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL' };
            currentSymbol = symbolMap[btn.dataset.symbol] || btn.dataset.symbol;
            
            resetCard();
        });
    });

    // Botones de Acción principales
    if (els.actionBtn) els.actionBtn.addEventListener('click', handleConsult);
    if (els.scanBtn) els.scanBtn.addEventListener('click', handleScan);
    if (els.copyBtn) els.copyBtn.addEventListener('click', handleCopy);
}

// Función para limpiar la tarjeta y volver al inicio
window.resetCard = function() {
    showState('initial');
    if (els.copyBtn) els.copyBtn.classList.add('hidden');
    if (els.actionBtn) els.actionBtn.textContent = 'CONSULTAR COACH';
    els.card.className = 'card'; 
};

// 3. LÓGICA DE CONSULTA DE PRECIOS (TEXTO)
async function handleConsult() {
    showState('loading');
    els.card.className = 'card';

    try {
        const response = await fetch(`${API_URL}/api/consultar-coach`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'bypass-tunnel-reminder': 'true' // Salta advertencias de túneles
            },
            body: JSON.stringify({ activo: currentSymbol })
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const resultado = await response.json();
        
        // Renderizar el resultado en la UI
        renderResult(resultado.data.price, resultado.data.advice);

        els.actionBtn.textContent = 'NUEVA CONSULTA';
        if (els.copyBtn) els.copyBtn.classList.remove('hidden');

    } catch (error) {
        console.error("Error en consulta:", error);
        showError("El Coach está fuera de línea. <br><br> Asegúrate de que el servidor en Render esté 'Active' y espera 30 segundos.");
    }
}

// 4. LÓGICA DE ESCÁNER DE GRÁFICOS (IMAGEN + IA)
async function handleScan() {
    // Creamos un input de archivo invisible para abrir la galería/cámara
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar que la imagen no sea excesivamente grande (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError("La imagen es muy grande para procesar. Prueba con una captura más pequeña.");
            return;
        }

        showState('loading');
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result;

            try {
                // Enviamos la imagen al backend corregido
                const response = await fetch(`${API_URL}/api/scan`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'bypass-tunnel-reminder': 'true'
                    },
                    body: JSON.stringify({ 
                        imageBase64: base64Image,
                        activoActual: currentSymbol 
                    })
                });

                const res = await response.json();
                
                if (res.success) {
                    // El primer parámetro es el título que sale arriba en grande
                    renderResult("ANÁLISIS IA", res.message, true);
                } else {
                    throw new Error(res.message);
                }
            } catch (error) {
                console.error("Error en Scan:", error);
                showError("Gemini no pudo procesar esta imagen. <br><br> Intenta con una foto más clara del gráfico.");
            }
        };
    };
    
    fileInput.click();
}

// 5. RENDERIZADO DE LA INTERFAZ (UI)
function renderResult(precio, consejo, isScan = false) {
    // Aplicamos efectos visuales
    els.card.className = `card glow-neutral`;
    els.statusBadge.textContent = isScan ? 'ANALIZADO' : 'LIVE';
    els.statusBadge.style.backgroundColor = `#FFBB3320`;
    els.statusBadge.style.color = '#FFBB33';

    // Formatear precio si es número
    const priceNum = parseFloat(precio);
    els.priceDisplay.textContent = isNaN(priceNum) ? precio : `$${priceNum.toLocaleString()}`;
    
    // Limpiar el texto que devuelve la IA (quitar comillas extra)
    const consejoLimpio = consejo.replace(/^["']|["']$/g, '').trim();
    els.coachNote.textContent = `"${consejoLimpio}"`;

    // Cambiar etiquetas informativas
    els.riskDisplay.textContent = isScan ? `TIPO: IA VISUAL` : `RIESGO: CALCULADO`;
    els.trendDisplay.textContent = isScan ? `ORIGEN: GRÁFICO` : `TENDENCIA: ACTUAL`;

    showState('result');
    if (isScan && els.actionBtn) els.actionBtn.textContent = 'NUEVO ESCANEO';
}

// Control de estados (Ocultar/Mostrar secciones)
function showState(state) {
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

// Mostrar mensajes de error estéticos
function showError(msg) {
    if (els.errorState) {
        els.errorState.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #ff4444; font-weight: bold; line-height: 1.4; margin-bottom: 20px;">${msg}</p>
                <button onclick="resetCard()" style="background:rgba(255,255,255,0.1); color:white; border:1px solid #444; padding:12px 24px; border-radius:8px; cursor:pointer; font-size:14px; text-transform:uppercase; letter-spacing:1px;">
                    Reintentar
                </button>
            </div>
        `;
    }
    showState('error');
    els.card.className = 'card glow-red';
}

// Copiar al portapapeles
function handleCopy() {
    const note = els.coachNote.textContent.replace(/"/g, '');
    const textToCopy = `"${note}"\n\nAnálisis realizado por TradeCoach AI 🚀`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = els.copyBtn.textContent;
        els.copyBtn.textContent = '¡COPIADO!';
        setTimeout(() => els.copyBtn.textContent = originalText, 2000);
    });
}

// Lanzar la App
init();
