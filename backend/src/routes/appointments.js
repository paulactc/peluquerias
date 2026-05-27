const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// ─── Utilidades ───────────────────────────────────────────────────────────────

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// ─── Slots disponibles (público) ──────────────────────────────────────────────
// GET /api/appointments/slots?slug=&service_id=&staff_id=&date=YYYY-MM-DD
router.get('/slots', async (req, res) => {
  const { slug, service_id, staff_id, date } = req.query;
  if (!slug || !service_id || !date)
    return res.status(400).json({ error: 'slug, service_id y date son requeridos' });

  try {
    const [salons] = await db.query('SELECT id FROM salons WHERE slug = ?', [slug]);
    if (!salons.length) return res.status(404).json({ error: 'Salón no encontrado' });
    const salonId = salons[0].id;

    const [services] = await db.query('SELECT duration_minutes FROM services WHERE id = ? AND salon_id = ?', [service_id, salonId]);
    if (!services.length) return res.status(404).json({ error: 'Servicio no encontrado' });
    const duration = services[0].duration_minutes;

    // Día de la semana (0=Lun … 6=Dom)  MySQL: DAYOFWEEK devuelve 1=Dom..7=Sab
    const jsDate = new Date(date + 'T00:00:00Z');
    const dow = (jsDate.getUTCDay() + 6) % 7; // convertir a 0=Lun

    // Empleados a considerar
    let staffFilter = staff_id ? 'AND st.id = ?' : '';
    let staffParams = staff_id ? [salonId, dow, staff_id] : [salonId, dow];

    const [scheduleRows] = await db.query(
      `SELECT sc.staff_id, sc.start_time, sc.end_time
       FROM schedules sc
       JOIN staff st ON st.id = sc.staff_id
       WHERE st.salon_id = ? AND sc.day_of_week = ? AND st.active = 1 ${staffFilter}`,
      staffParams
    );

    if (!scheduleRows.length) return res.json([]);

    // Citas ya reservadas ese día
    const staffIds = scheduleRows.map(r => r.staff_id);
    const [bookedRows] = await db.query(
      `SELECT a.staff_id, a.appt_time, s.duration_minutes
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       WHERE a.salon_id = ? AND a.appt_date = ? AND a.status != 'cancelada'
         AND a.staff_id IN (${staffIds.map(() => '?').join(',')})`,
      [salonId, date, ...staffIds]
    );

    // Bloqueos manuales
    const [blockedRows] = await db.query(
      `SELECT staff_id, start_time, end_time FROM blocked_slots
       WHERE blocked_date = ? AND staff_id IN (${staffIds.map(() => '?').join(',')})`,
      [date, ...staffIds]
    );

    const slots = [];

    for (const sched of scheduleRows) {
      let current = timeToMinutes(sched.start_time);
      const end   = timeToMinutes(sched.end_time);

      while (current + duration <= end) {
        const slotStart = `${String(Math.floor(current/60)).padStart(2,'0')}:${String(current%60).padStart(2,'0')}`;
        const slotEnd   = addMinutes(slotStart, duration);

        // ¿Choca con alguna cita?
        const busy = bookedRows.some(b => {
          if (b.staff_id !== sched.staff_id) return false;
          const bStart = timeToMinutes(b.appt_time);
          const bEnd   = bStart + b.duration_minutes;
          return current < bEnd && (current + duration) > bStart;
        });

        // ¿Choca con algún bloqueo?
        const blocked = blockedRows.some(bl => {
          if (bl.staff_id !== sched.staff_id) return false;
          if (!bl.start_time) return true; // día completo bloqueado
          const bStart = timeToMinutes(bl.start_time);
          const bEnd   = timeToMinutes(bl.end_time);
          return current < bEnd && (current + duration) > bStart;
        });

        if (!busy && !blocked) {
          slots.push({ staff_id: sched.staff_id, time: slotStart, end_time: slotEnd });
        }
        current += 30; // intervalos de 30 min
      }
    }

    res.json(slots);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Crear cita (público) ─────────────────────────────────────────────────────
// POST /api/appointments
router.post('/', async (req, res) => {
  const { slug, service_id, staff_id, client_name, client_phone, client_email, appt_date, appt_time, notes } = req.body;
  if (!slug || !service_id || !client_name || !client_email || !appt_date || !appt_time)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const [salons] = await db.query('SELECT id FROM salons WHERE slug = ?', [slug]);
    if (!salons.length) return res.status(404).json({ error: 'Salón no encontrado' });
    const salonId = salons[0].id;

    // Verificar que el slot sigue libre
    const [services] = await db.query('SELECT duration_minutes FROM services WHERE id = ?', [service_id]);
    if (!services.length) return res.status(404).json({ error: 'Servicio no encontrado' });
    const duration = services[0].duration_minutes;

    const slotStart = timeToMinutes(appt_time);
    const slotEnd   = slotStart + duration;

    const [conflicts] = await db.query(
      `SELECT a.id FROM appointments a
       JOIN services s ON s.id = a.service_id
       WHERE a.salon_id = ? AND a.appt_date = ? AND a.status != 'cancelada'
         AND a.staff_id = ?
         AND ? < (TIME_TO_SEC(a.appt_time)/60 + s.duration_minutes)
         AND (? + ?) > TIME_TO_SEC(a.appt_time)/60`,
      [salonId, appt_date, staff_id, slotStart, slotStart, duration]
    );

    if (conflicts.length)
      return res.status(409).json({ error: 'El horario ya está ocupado, elige otro' });

    const [r] = await db.query(
      `INSERT INTO appointments
        (salon_id, service_id, staff_id, client_name, client_phone, client_email, appt_date, appt_time, notes)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [salonId, service_id, staff_id || null, client_name, client_phone || null, client_email, appt_date, appt_time, notes || null]
    );

    res.status(201).json({ id: r.insertId, message: '¡Cita reservada con éxito!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Admin: listar citas ──────────────────────────────────────────────────────
// GET /api/appointments?date=&status=&staff_id=
router.get('/', auth, async (req, res) => {
  const { date, status, staff_id } = req.query;
  let query = `
    SELECT a.*, sv.name AS service_name, sv.duration_minutes,
           st.name AS staff_name
    FROM appointments a
    JOIN services sv ON sv.id = a.service_id
    LEFT JOIN staff st ON st.id = a.staff_id
    WHERE a.salon_id = ?`;
  const params = [req.salon.id];

  if (date)     { query += ' AND a.appt_date = ?';  params.push(date); }
  if (status)   { query += ' AND a.status = ?';     params.push(status); }
  if (staff_id) { query += ' AND a.staff_id = ?';   params.push(staff_id); }

  query += ' ORDER BY a.appt_date, a.appt_time';

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const valid = ['pendiente', 'confirmada', 'cancelada', 'completada'];
  if (!valid.includes(status))
    return res.status(400).json({ error: 'Estado no válido' });
  try {
    await db.query(
      'UPDATE appointments SET status=? WHERE id=? AND salon_id=?',
      [status, req.params.id, req.salon.id]
    );
    res.json({ message: 'Estado actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/appointments/:id  (cancelar)
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      "UPDATE appointments SET status='cancelada' WHERE id=? AND salon_id=?",
      [req.params.id, req.salon.id]
    );
    res.json({ message: 'Cita cancelada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
