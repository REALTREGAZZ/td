/**
 * TradeCoach AI - Viral Phrases Library
 * Tono: Directo, Mentor Frío, Anti-FOMO, Gen Z.
 */

const PHRASES = {
    bullish: {
        high_risk: [ // RSI > 70
            "Estás persiguiendo una vela verde. El mercado te está esperando para atraparte.",
            "La euforia es cara. Si entras ahora, eres la liquidez de otro.",
            "¿Ves ese gráfico vertical? Es un tobogán esperando pasajeros.",
            "El FOMO es el impuesto de los impacientes. No pagues.",
            "Fiesta llena. Si no tienes invitación (entrada temprana), no entres."
        ],
        momentum: [ // RSI 50-70
            "El tren ya salió. Si subes ahora, agárrate fuerte.",
            "Tendencia clara, pero no te duermas. El mercado no tiene amigos.",
            "Verde que te quiero verde. Pero pon stop loss o llorarás.",
            "El viento sopla a favor. No escupas contra él.",
            "Esto sube. Tu ego no debería subir con ello."
        ],
        recovery: [ // RSI < 50
            "Despertando. Aún no es fiesta, pero ya hay música.",
            "Pequeño respiro. Si confiabas hace una hora, ¿por qué dudas ahora?",
            "El mercado está tomando aire. Tú deberías estar observando.",
            "Rebote técnico posible. No apuestes la casa.",
            "Parece que quiere arrancar. Confirmación > Esperanza."
        ]
    },
    bearish: {
        oversold: [ // RSI < 30
            "Cuchillo cayendo. Solo cógelo si tienes guantes de acero.",
            "Sangre en las calles. ¿Tienes valor o solo miedo?",
            "Rebajas de enero, o estafa piramidal. Tú decides.",
            "El RSI grita 'compra', pero la tendencia grita 'huye'.",
            "Aquí es donde el 90% vende en pérdidas. ¿Eres el 10%?"
        ],
        downtrend: [ // RSI 30-50
            "El suelo de hoy es el techo de mañana. Paciencia.",
            "No atrapes cuchillos. Deja que toquen el suelo primero.",
            "Gravedad activada. No luches contra Newton.",
            "Rojo, rojo, rojo. Si no estás corto, estás fuera.",
            "El mercado está limpiando a los débiles. No seas uno."
        ]
    },
    neutral: [
        "El mercado está indeciso. Tú deberías estar quieto.",
        "Ruido. Mucho ruido y pocas nueces. Guarda el dinero.",
        "Ni toros ni osos. Solo cerdos siendo sacrificados. Espera.",
        "Aburrido es bueno. Aburrido protege tu capital.",
        "Si no ves la oportunidad clara, es que no la hay."
    ],
    special: {
        high_volatility: [
            "El mercado está borracho. Mucha volatilidad. Aléjate o te vomita encima.",
            "Montaña rusa detectada. Solo para profesionales o ludópatas.",
            "Los stops están saltando como palomitas. No seas una de ellas."
        ],
        near_support: [
            "Tocando fondo histórico. O rebota o se rompe el suelo. Atento.",
            "En zona de soporte. Los compradores están mirando. ¿Tú también?",
            "Defensa numantina en este precio. Si aguanta, buen punto de entrada."
        ],
        near_resistance: [
            "Golpeando el techo. Si no rompe con fuerza, caerá con dolor.",
            "Zona de venta histórica. No compres aquí a menos que veas un cohete.",
            "Resistencia dura. Los osos están defendiendo este castillo."
        ]
    }
};

/**
 * Select a phrase based on rich context
 * @param {Object} ctx - { trend, risk, rsi, volatility, distToSupport, distToResistance }
 */
function getPhrase(ctx) {
    let category = [];

    // 1. Check Special Conditions First

    // High Volatility (> 2% std dev is quite high for hourly/daily depending on timeframe, assuming daily here)
    if (ctx.volatility > 3.0) {
        return getRandom(PHRASES.special.high_volatility);
    }

    // Near Support (< 2% distance)
    if (ctx.distToSupport < 2.0) {
        // If also oversold, it's a strong signal
        if (ctx.rsi < 35) return "Soporte clave + Sobreventa. Configuración de libro para rebote (o colapso final).";
        return getRandom(PHRASES.special.near_support);
    }

    // Near Resistance (< 2% distance)
    if (ctx.distToResistance < 2.0) {
        if (ctx.rsi > 65) return "Resistencia + Sobrecompra. Cóctel molotov para los toros. Cuidado.";
        return getRandom(PHRASES.special.near_resistance);
    }

    // 2. Standard Logic
    if (ctx.trend === 'bullish') {
        if (ctx.rsi > 70) category = PHRASES.bullish.high_risk;
        else if (ctx.rsi > 50) category = PHRASES.bullish.momentum;
        else category = PHRASES.bullish.recovery;
    } else if (ctx.trend === 'bearish') {
        if (ctx.rsi < 30) category = PHRASES.bearish.oversold;
        else category = PHRASES.bearish.downtrend;
    } else {
        category = PHRASES.neutral;
    }

    return getRandom(category);
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = { getPhrase };
