const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// CACHÉ COLECTIVA: Una sola llamada para todos, sin límites 5/5
let marketData = {
    BTC: { price: "0", advice: "Sincronizando..." },
    ETH: { price: "0", advice: "Sincronizando..." },
    SOL: { price: "0", advice: "Sincronizando..." }
};

async function updatePrices() {
    const assets = ['BTC', 'ETH', 'SOL'];
    for (const a of assets) {
        try {
            const res = await axios.get(`https://api.coinbase.com/v2/prices/${a}-USD/spot`);
            marketData[a] = {
                price: res.data.data.amount,
                advice: `[Coach AI] ${a} está en $${res.data.data.amount}.`
            };
        } catch (e) { console.log("Error en API externa"); }
    }
}
setInterval(updatePrices, 60000);
updatePrices();

// ENDPOINT PARA WEB Y APP
app.post('/api/consultar-coach', (req, res) => {
    // Saltamos la pantalla de aviso de localtunnel
    res.setHeader('bypass-tunnel-reminder', 'true');
    res.json({ success: true, data: marketData[req.body.activo] });
});

// ESCÁNER (Simulado para que no de error de lectura)
app.post('/api/scan', (req, res) => {
    res.json({ success: true, message: "Gráfico analizado. Tendencia detectada." });
});

app.listen(3000, '0.0.0.0', () => console.log('Servidor en puerto 3000'));
