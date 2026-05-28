require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Rutas
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/superadmin',   require('./routes/superadmin'));
app.use('/api/salons',       require('./routes/salons'));
app.use('/api/services',     require('./routes/services'));
app.use('/api/staff',        require('./routes/staff'));
app.use('/api/appointments', require('./routes/appointments'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅  API corriendo en http://localhost:${PORT}`));
