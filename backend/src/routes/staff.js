const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET /api/staff/salon/:slug  (público)
router.get('/salon/:slug', async (req, res) => {
  try {
    const [salons] = await db.query('SELECT id FROM salons WHERE slug = ?', [req.params.slug]);
    if (!salons.length) return res.status(404).json({ error: 'Salón no encontrado' });
    const [rows] = await db.query(
      'SELECT id, name, role, photo_url FROM staff WHERE salon_id = ? AND active = 1',
      [salons[0].id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/staff  (admin)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff WHERE salon_id = ?', [req.salon.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/staff
router.post('/', auth, async (req, res) => {
  const { name, role } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const [r] = await db.query(
      'INSERT INTO staff (salon_id, name, role) VALUES (?,?,?)',
      [req.salon.id, name, role || 'Estilista']
    );
    res.status(201).json({ id: r.insertId, message: 'Empleado creado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/staff/:id
router.put('/:id', auth, async (req, res) => {
  const { name, role, active } = req.body;
  try {
    await db.query(
      'UPDATE staff SET name=?, role=?, active=? WHERE id=? AND salon_id=?',
      [name, role, active ?? 1, req.params.id, req.salon.id]
    );
    res.json({ message: 'Empleado actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/staff/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM staff WHERE id=? AND salon_id=?', [req.params.id, req.salon.id]);
    res.json({ message: 'Empleado eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/staff/:id/schedules  (admin)
router.get('/:id/schedules', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.* FROM schedules s
       JOIN staff st ON st.id = s.staff_id
       WHERE s.staff_id = ? AND st.salon_id = ?`,
      [req.params.id, req.salon.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/staff/:id/schedules
router.post('/:id/schedules', auth, async (req, res) => {
  const { schedules } = req.body; // array de { day_of_week, start_time, end_time }
  try {
    await db.query('DELETE FROM schedules WHERE staff_id = ?', [req.params.id]);
    for (const s of schedules) {
      await db.query(
        'INSERT INTO schedules (staff_id, day_of_week, start_time, end_time) VALUES (?,?,?,?)',
        [req.params.id, s.day_of_week, s.start_time, s.end_time]
      );
    }
    res.json({ message: 'Horarios guardados' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
