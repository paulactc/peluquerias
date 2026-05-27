const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, slug, email, password, address, phone } = req.body;
  if (!name || !slug || !email || !password)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const [existing] = await db.query(
      'SELECT id FROM salons WHERE email = ? OR slug = ?', [email, slug]
    );
    if (existing.length)
      return res.status(409).json({ error: 'Email o slug ya registrados' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO salons (name, slug, email, password_hash, address, phone) VALUES (?,?,?,?,?,?)',
      [name, slug, email, hash, address || null, phone || null]
    );
    res.status(201).json({ message: 'Salón registrado', salonId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  try {
    const [rows] = await db.query('SELECT * FROM salons WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const salon = rows[0];
    const valid = await bcrypt.compare(password, salon.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: salon.id, email: salon.email, name: salon.name, slug: salon.slug },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ token, salon: { id: salon.id, name: salon.name, slug: salon.slug, email: salon.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
