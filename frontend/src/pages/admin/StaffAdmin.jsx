import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';

const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const emptyForm = { name: '', role: 'Estilista' };

export default function StaffAdmin() {
  const [staff, setStaff]   = useState([]);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [scheduleFor, setScheduleFor] = useState(null);
  const [schedules, setSchedules]     = useState([]);
  const [msg, setMsg]       = useState('');

  const load = () => api.get('/staff').then(r => setStaff(r.data));
  useEffect(() => { load(); }, []);

  const notify = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (editing) {
      await api.put(`/staff/${editing}`, form);
      notify('Empleado actualizado');
    } else {
      await api.post('/staff', form);
      notify('Empleado añadido');
    }
    setForm(emptyForm); setEditing(null); load();
  };

  const openSchedule = async member => {
    setScheduleFor(member);
    const res = await api.get(`/staff/${member.id}/schedules`);
    const rows = DAYS.map((_, i) => {
      const existing = res.data.find(s => s.day_of_week === i);
      return existing || { day_of_week: i, start_time: '09:00', end_time: '18:00', enabled: false };
    });
    // mark enabled
    const withEnabled = rows.map((r,i) => ({
      ...r, enabled: !!res.data.find(s => s.day_of_week === i)
    }));
    setSchedules(withEnabled);
  };

  const saveSchedules = async () => {
    const toSave = schedules.filter(s => s.enabled).map(({ day_of_week, start_time, end_time }) => ({ day_of_week, start_time, end_time }));
    await api.post(`/staff/${scheduleFor.id}/schedules`, { schedules: toSave });
    notify('Horarios guardados'); setScheduleFor(null);
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 className="page-title">Equipo</h1>
        {msg && <div className="card mt-2" style={{background:'#d1fae5',color:'#065f46',padding:'.75rem 1rem'}}>{msg}</div>}

        <div className="card mt-2">
          <h2 style={{fontSize:'1rem',fontWeight:700,marginBottom:'1rem'}}>{editing ? 'Editar empleado' : 'Añadir empleado'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <input value={form.role} onChange={e => setForm({...form,role:e.target.value})} />
              </div>
            </div>
            <div className="flex gap-1">
              <button className="btn btn-primary" type="submit">{editing ? 'Guardar' : 'Añadir'}</button>
              {editing && <button className="btn btn-outline" type="button" onClick={() => {setForm(emptyForm);setEditing(null);}}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="card mt-2">
          {staff.map(s => (
            <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.7rem 0',borderBottom:'1px solid var(--color-border)'}}>
              <div>
                <strong>{s.name}</strong>
                <span className="text-muted" style={{marginLeft:'.5rem',fontSize:'.85rem'}}>{s.role}</span>
              </div>
              <div className="flex gap-1">
                <button className="btn btn-outline btn-sm" onClick={() => openSchedule(s)}>📅 Horarios</button>
                <button className="btn btn-outline btn-sm" onClick={() => {setForm(s);setEditing(s.id);}}>Editar</button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal horarios */}
        {scheduleFor && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
            <div className="card" style={{width:'100%',maxWidth:500,maxHeight:'85vh',overflowY:'auto'}}>
              <h2 style={{fontWeight:700,marginBottom:'1rem'}}>Horarios de {scheduleFor.name}</h2>
              {schedules.map((s, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'.6rem',flexWrap:'wrap'}}>
                  <label style={{width:90,fontWeight:500,fontSize:'.9rem'}}>
                    <input type="checkbox" checked={s.enabled} onChange={e => {
                      const upd = [...schedules]; upd[i] = {...upd[i], enabled: e.target.checked}; setSchedules(upd);
                    }} /> {DAYS[i]}
                  </label>
                  <input type="time" value={s.start_time} disabled={!s.enabled}
                    onChange={e => {const upd=[...schedules];upd[i]={...upd[i],start_time:e.target.value};setSchedules(upd);}}
                    style={{padding:'.3rem .5rem',border:'1.5px solid var(--color-border)',borderRadius:'.4rem'}}
                  />
                  <span>—</span>
                  <input type="time" value={s.end_time} disabled={!s.enabled}
                    onChange={e => {const upd=[...schedules];upd[i]={...upd[i],end_time:e.target.value};setSchedules(upd);}}
                    style={{padding:'.3rem .5rem',border:'1.5px solid var(--color-border)',borderRadius:'.4rem'}}
                  />
                </div>
              ))}
              <div className="flex gap-1 mt-2">
                <button className="btn btn-primary" onClick={saveSchedules}>Guardar horarios</button>
                <button className="btn btn-outline" onClick={() => setScheduleFor(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
