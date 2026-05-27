const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

const PUBLIC_FIELDS  = 'id, name, slug, address, phone, logo_url, cover_url, brand_color, description, instagram, facebook, whatsapp';
const PRIVATE_FIELDS = 'id, name, slug, address, phone, email, logo_url, cover_url, brand_color, description, instagram, facebook, whatsapp';

// GET /api/salons  (lista pública para landing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT ${PUBLIC_FIELDS} FROM salons WHERE active = 1`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/salons/me/profile  (admin – datos propios) — DEBE IR ANTES DE /:slug
router.get('/me/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ${PRIVATE_FIELDS} FROM salons WHERE id = ?`, [req.salon.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/salons/me/stats  (admin – resumen del día)
router.get('/me/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[{ total }]]       = await db.query('SELECT COUNT(*) AS total FROM appointments WHERE salon_id=?', [req.salon.id]);
    const [[{ today_count }]] = await db.query('SELECT COUNT(*) AS today_count FROM appointments WHERE salon_id=? AND appt_date=?', [req.salon.id, today]);
    const [[{ pending }]]     = await db.query("SELECT COUNT(*) AS pending FROM appointments WHERE salon_id=? AND status='pendiente'", [req.salon.id]);
    res.json({ total, today: today_count, pending });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/salons/me/profile  (admin)
router.put('/me/profile', auth, async (req, res) => {
  const { name, address, phone, logo_url, cover_url, brand_color, description, instagram, facebook, whatsapp } = req.body;
  try {
    await db.query(
      `UPDATE salons SET name=?, address=?, phone=?, logo_url=?, cover_url=?,
       brand_color=?, description=?, instagram=?, facebook=?, whatsapp=? WHERE id=?`,
      [name, address, phone, logo_url, cover_url, brand_color, description, instagram, facebook, whatsapp, req.salon.id]
    );
    res.json({ message: 'Perfil actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/salons/:slug  (info pública de un salón)
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ${PUBLIC_FIELDS} FROM salons WHERE slug = ? AND active = 1`, [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Salón no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
