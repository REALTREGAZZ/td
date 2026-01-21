/**
 * TRADECOACH AI - BACKEND DEFINITIVO
 * Lógica de Precios y Análisis de Gráficos con Gemini 1.5 Flash
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// 1. CONFIGURACIÓN DE IA
// Nota: Se recomienda usar process.env.GEMINI_KEY en producción
const genAI = new GoogleGenerativeAI("AIzaSyCmmRbkccMyXUWBesODjjdMZJPTZxi4lTA");

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentado para soportar imágenes en alta resolución

// 3. CACHÉ DE MERCADO
let marketData = {
    BTC: { price: "0", advice: "Sincronizando..." },
    ETH: { price: "0", advice: "Sincronizando..." },
    SOL: { price: "0", advice: "Sincronizando..." }
};

// Función para actualizar precios desde Coinbase
async function updatePrices() {
    const assets = ['BTC', 'ETH', 'SOL'];
    for (const a of assets) {
        try {
            const res = await axios.get(`https://api.coinbase.com/v2/prices/${a}-USD/spot`, {
                timeout: 5000
            });
            const price = res.data.data.amount;
            marketData[a] = {
                price: price,
                advice: `El precio actual de ${a} es $${parseFloat(price).toLocaleString()}. El Coach está listo para analizar tu gráfico.`
            };
        } catch (e) {
            console.error(`Error actualizando ${a}:`, e.message);
        }
    }
}

// Actualizar cada 60 segundos
setInterval(updatePrices, 60000);
updatePrices();

// 4. ENDPOINTS

// Ruta de prueba para verificar que el servidor vive
app.get('/', (req, res) => res.send('TradeCoach Server Active ✅'));

// Endpoint 1: Consulta de precios rápida
app.post('/api/consultar-coach', (req, res) => {
    const activo = req.body.activo || 'BTC';
    res.json({ success: true, data: marketData[activo] });
});

// Endpoint 2: Escáner de Gráficos con Gemini AI
app.post('/api/scan', async (req, res) => {
    try {
        const { imageBase64, activoActual } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "No se recibió ninguna imagen." });
        }

        // Extraer metadatos del Base64 de forma segura
        const mimeTypeMatch = imageBase64.match(/data:([^;]+);/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
        const base64Data = imageBase64.split(",")[1];

        // Configurar modelo
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Actúa como un Coach de Trading experto. 
            Analiza este gráfico de ${activoActual}.
            1. Identifica la tendencia (alcista, bajista o lateral).
            2. Menciona niveles visuales importantes si los hay.
            3. Da un consejo final breve (máximo 2 frases) sobre si es momento de esperar o actuar.
            Responde en español, de forma profesional pero directa.
        `;

        // Llamada a la API de Google
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            message: text
        });

    } catch (error) {
        console.error("Error en Scan IA:", error);
        
        // Error amigable para el frontend
        res.status(500).json({
            success: false,
            message: "El Coach tuvo un problema leyendo la imagen. Verifica que sea un gráfico claro y reintenta."
        });
    }
});

// 5. ARRANQUE DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 TradeCoach Backend Running on Port ${PORT}`);
    console.log(`-----------------------------------------`);
});
