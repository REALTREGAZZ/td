const express = require('express');
const router = express.Router();
const Tesseract = require('tesseract.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure Multer
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, '../uploads/'))) {
    fs.mkdirSync(path.join(__dirname, '../uploads/'));
}

// Parsing Functions
function extractNumberNear(text, keyword) {
    // Regex to find a number after a keyword, allowing for some noise
    // e.g. "Entry Price 50,000.00" or "Entry Price: $50000"
    const regex = new RegExp(`${keyword}[^0-9]*([0-9,]+\\.?[0-9]*)`, 'i');
    const match = text.match(regex);
    if (match) {
        // Remove commas for parsing
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
}

function extractPNL(text) {
    // Look for ROE or PNL with %
    // e.g. "+150%", "-20.5%"
    const regex = /(?:ROE|PNL)[^0-9\-+]*([\+\-]?[0-9,]+\.?[0-9]*)/i;
    const match = text.match(regex);
    if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
}

function detectPosition(text) {
    if (/LONG/i.test(text)) return 'LONG';
    if (/SHORT/i.test(text)) return 'SHORT';
    return 'UNKNOWN';
}

// POST /api/analyze-trade
router.post('/analyze-trade', upload.single('tradeImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        console.log(`[OCR] Analyzing image: ${req.file.path}`);

        // OCR with Tesseract
        const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');

        // Cleanup: Delete temp file
        fs.unlinkSync(req.file.path);

        console.log(`[OCR] Raw text length: ${text.length}`);

        // Parse Data
        const position = detectPosition(text);
        const entry = extractNumberNear(text, 'Entry Price') || extractNumberNear(text, 'Entry') || extractNumberNear(text, 'Avg Price');
        const mark = extractNumberNear(text, 'Mark Price') || extractNumberNear(text, 'Mark') || extractNumberNear(text, 'Last Price');
        const pnl = extractPNL(text);

        // Generate Contextual Note
        let note = 'Trade analyzed. Remember to manage your risk.';
        if (pnl) {
            if (pnl > 50) note = "🔥 Great profit! Consider taking some off the table.";
            else if (pnl < -20) note = "⚠️ Watch your stop loss. Don't let it bleed.";
        }

        res.json({
            success: true,
            data: {
                position,
                entry,
                mark,
                pnl,
                note
            },
            // rawText: text.substring(0, 200) // Uncomment for debugging
        });

    } catch (error) {
        console.error('[OCR] Error:', error);
        // Cleanup if error occurred before unlink
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to analyze trade image' });
    }
});

module.exports = router;
