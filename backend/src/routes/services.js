const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET /api/services/salon/:slug  (público – para clientes)
router.get('/salon/:slug', async (req, res) => {
  try {
    const [salons] = await db.query('SELECT id FROM salons WHERE slug = ?', [req.params.slug]);
    if (!salons.length) return res.status(404).json({ error: 'Salón no encontrado' });
    const [rows] = await db.query(
      'SELECT * FROM services WHERE salon_id = ? AND active = 1',
      [salons[0].id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/services  (admin – servicios propios)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM services WHERE salon_id = ?', [req.salon.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/services
router.post('/', auth, async (req, res) => {
  const { name, description, duration_minutes, price } = req.body;
  if (!name || !duration_minutes) return res.status(400).json({ error: 'Nombre y duración requeridos' });
  try {
    const [r] = await db.query(
      'INSERT INTO services (salon_id, name, description, duration_minutes, price) VALUES (?,?,?,?,?)',
      [req.salon.id, name, description || null, duration_minutes, price || 0]
    );
    res.status(201).json({ id: r.insertId, message: 'Servicio creado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/services/:id
router.put('/:id', auth, async (req, res) => {
  const { name, description, duration_minutes, price, active } = req.body;
  try {
    await db.query(
      `UPDATE services SET name=?, description=?, duration_minutes=?, price=?, active=?
       WHERE id = ? AND salon_id = ?`,
      [name, description, duration_minutes, price, active ?? 1, req.params.id, req.salon.id]
    );
    res.json({ message: 'Servicio actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/services/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ? AND salon_id = ?', [req.params.id, req.salon.id]);
    res.json({ message: 'Servicio eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
