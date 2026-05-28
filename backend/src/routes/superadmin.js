const router  = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');
const superAuth = require('../middleware/superauth');
const { sendWelcomeEmail } = require('../utils/mailer');

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < length; i++)
    pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// POST /api/superadmin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  if (
    email    !== process.env.SUPER_ADMIN_EMAIL ||
    password !== process.env.SUPER_ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { role: 'superadmin', email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token });
});

// ── Rutas protegidas (superadmin) ────────────────────────────────────────────

// GET /api/superadmin/salons
router.get('/salons', superAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, slug, email, phone, address, nif, persona_contacto,
              numero_cuenta, active, created_at
       FROM salons ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/superadmin/salons  (dar de alta una peluquería)
router.post('/salons', superAuth, async (req, res) => {
  const { name, address, phone, email, nif, persona_contacto, numero_cuenta } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });

  try {
    const [existing] = await db.query('SELECT id FROM salons WHERE email = ?', [email]);
    if (existing.length)
      return res.status(409).json({ error: 'Ya existe una peluquería con ese email' });

    const password = generatePassword();
    const hash     = await bcrypt.hash(password, 10);
    let   slug     = slugify(name);

    // Asegurar slug único
    const [slugCheck] = await db.query('SELECT id FROM salons WHERE slug = ?', [slug]);
    if (slugCheck.length) slug = `${slug}-${Date.now()}`;

    const [result] = await db.query(
      `INSERT INTO salons
        (name, slug, email, password_hash, address, phone, nif, persona_contacto, numero_cuenta)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [name, slug, email, hash, address || null, phone || null,
       nif || null, persona_contacto || null, numero_cuenta || null]
    );

    // Enviar email con credenciales (no bloquear si falla)
    try {
      await sendWelcomeEmail({ to: email, salonName: name, password });
    } catch (mailErr) {
      console.error('Email no enviado:', mailErr.message);
    }

    res.status(201).json({ id: result.insertId, message: 'Peluquería registrada y email enviado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/superadmin/salons/:id
router.put('/salons/:id', superAuth, async (req, res) => {
  const { name, address, phone, email, nif, persona_contacto, numero_cuenta, active } = req.body;
  try {
    await db.query(
      `UPDATE salons SET name=?, address=?, phone=?, email=?, nif=?,
        persona_contacto=?, numero_cuenta=?, active=? WHERE id=?`,
      [name, address || null, phone || null, email, nif || null,
       persona_contacto || null, numero_cuenta || null,
       active !== undefined ? active : 1, req.params.id]
    );
    res.json({ message: 'Peluquería actualizada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/superadmin/salons/:id
router.delete('/salons/:id', superAuth, async (req, res) => {
  try {
    await db.query('UPDATE salons SET active=0 WHERE id=?', [req.params.id]);
    res.json({ message: 'Peluquería desactivada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
