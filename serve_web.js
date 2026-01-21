const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'web')));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web Demo servida en http://localhost:${PORT}`);
    console.log(`🔌 Backend expected at: http://localhost:3000`);
});
