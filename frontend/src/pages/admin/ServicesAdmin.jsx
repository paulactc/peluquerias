import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';

const empty = { name: '', description: '', duration_minutes: 30, price: 0 };

export default function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => api.get('/services').then(r => setServices(r.data));
  useEffect(() => { load(); }, []);

  const notify = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (editing) {
      await api.put(`/services/${editing}`, form);
      notify('Servicio actualizado');
    } else {
      await api.post('/services', form);
      notify('Servicio creado');
    }
    setForm(empty); setEditing(null); load();
  };

  const handleEdit = sv => { setForm(sv); setEditing(sv.id); };
  const handleDelete = async id => {
    if (!confirm('¿Eliminar este servicio?')) return;
    await api.delete(`/services/${id}`);
    notify('Eliminado'); load();
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 className="page-title">Servicios</h1>
        {msg && <div className="card mt-2" style={{background:'#d1fae5',color:'#065f46',padding:'.75rem 1rem'}}>{msg}</div>}

        <div className="card mt-2">
          <h2 style={{fontSize:'1rem',fontWeight:700,marginBottom:'1rem'}}>{editing ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Duración (minutos) *</label>
                <input type="number" min="5" step="5" value={form.duration_minutes} onChange={e => setForm({...form,duration_minutes:Number(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label>Precio (€)</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form,price:Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input value={form.description || ''} onChange={e => setForm({...form,description:e.target.value})} />
              </div>
            </div>
            <div className="flex gap-1">
              <button className="btn btn-primary" type="submit">{editing ? 'Guardar' : 'Crear servicio'}</button>
              {editing && <button className="btn btn-outline" type="button" onClick={() => {setForm(empty);setEditing(null);}}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="card mt-2">
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.9rem'}}>
            <thead>
              <tr style={{textAlign:'left'}}>
                <th style={{padding:'.5rem .7rem',background:'var(--color-bg)',color:'var(--color-muted)',fontWeight:600}}>Nombre</th>
                <th style={{padding:'.5rem .7rem',background:'var(--color-bg)',color:'var(--color-muted)',fontWeight:600}}>Duración</th>
                <th style={{padding:'.5rem .7rem',background:'var(--color-bg)',color:'var(--color-muted)',fontWeight:600}}>Precio</th>
                <th style={{padding:'.5rem .7rem',background:'var(--color-bg)',color:'var(--color-muted)',fontWeight:600}}>Activo</th>
                <th style={{padding:'.5rem .7rem',background:'var(--color-bg)'}}></th>
              </tr>
            </thead>
            <tbody>
              {services.map(sv => (
                <tr key={sv.id} style={{borderTop:'1px solid var(--color-border)'}}>
                  <td style={{padding:'.55rem .7rem'}}>{sv.name}</td>
                  <td style={{padding:'.55rem .7rem'}}>{sv.duration_minutes} min</td>
                  <td style={{padding:'.55rem .7rem'}}>{Number(sv.price).toFixed(2)} €</td>
                  <td style={{padding:'.55rem .7rem'}}>{sv.active ? '✅' : '❌'}</td>
                  <td style={{padding:'.55rem .7rem'}}>
                    <div className="flex gap-1">
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(sv)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sv.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
