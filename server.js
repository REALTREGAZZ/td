const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Librería de IA

const app = express();

// Configuración de IA con tu clave
const genAI = new GoogleGenerativeAI("AIzaSyCmmRbkccMyXUWBesODjjdMZJPTZxi4lTA");

// Aumentamos el límite de tamaño para poder recibir imágenes base64
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

// CACHÉ DE PRECIOS
let marketData = {
    BTC: { price: "0", advice: "Sincronizando..." },
    ETH: { price: "0", advice: "Sincronizando..." },
    SOL: { price: "0", advice: "Sincronizando..." }
};

// Función para actualizar precios desde Coinbase cada 60 segundos
async function updatePrices() {
    const assets = ['BTC', 'ETH', 'SOL'];
    for (const a of assets) {
        try {
            const res = await axios.get(`https://api.coinbase.com/v2/prices/${a}-USD/spot`);
            marketData[a] = {
                price: res.data.data.amount,
                advice: `[Coach AI] ${a} está en $${res.data.data.amount}.`
            };
        } catch (e) { 
            console.log(`Error actualizando ${a}:`, e.message); 
        }
    }
}
setInterval(updatePrices, 60000);
updatePrices();

// 1. ENDPOINT DE CONSULTA RÁPIDA (Solo texto)
app.post('/api/consultar-coach', (req, res) => {
    res.setHeader('bypass-tunnel-reminder', 'true');
    const activo = req.body.activo || 'BTC';
    res.json({ success: true, data: marketData[activo] });
});

// 2. ESCÁNER REAL CON IA (Analiza imágenes de gráficos)
app.post('/api/scan', async (req, res) => {
    try {
        const { imageBase64, activoActual } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "No se recibió ninguna imagen." });
        }

        // Inicializamos el modelo de IA "Flash" (rápido y gratis)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Actúa como un Coach de Trading experto y motivador. 
            Analiza esta imagen de un gráfico de criptomonedas.
            1. Identifica qué activo es (ej. BTC, ETH, SOL) leyendo el texto de la imagen.
            2. Describe la tendencia actual (¿Es una caída fuerte, lateral o subida?).
            3. Da un consejo de máximo 2 frases sobre qué hacer (esperar, comprar, vender).
            4. Si el activo en la imagen es distinto a "${activoActual}", menciónalo.
            Responde de forma clara y directa en español.
        `;

        // Procesar la imagen
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64.split(",")[1], // Quitamos el encabezado data:image/png;base64,
                    mimeType: "image/png"
                }
            }
        ]);

        const responseText = result.response.text();

        res.json({ 
            success: true, 
            message: responseText 
        });

    } catch (error) {
        console.error("Error en Scan IA:", error);
        res.status(500).json({ 
            success: false, 
            message: "El Coach no pudo leer la imagen. Intenta con una más clara o espera 30 segundos." 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor de TradeCoach activo en puerto ${PORT}`));
