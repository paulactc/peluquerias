import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', slug: '', email: '', password: '', address: '', phone: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const slugify = name => name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'name' ? { slug: slugify(value) } : {})
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/admin/login', { state: { msg: '¡Peluquería registrada! Inicia sesión.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card card" style={{maxWidth:520}}>
        <div className="auth-icon">✂️</div>
        <h1>Registra tu peluquería</h1>
        <p className="text-muted">Crea tu cuenta gratis</p>
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="grid-2">
            <div className="form-group">
              <label>Nombre del salón *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Mi Peluquería" required />
            </div>
            <div className="form-group">
              <label>URL pública *</label>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="mi-peluqueria" required />
              <small className="text-muted">/{form.slug || 'mi-peluqueria'}</small>
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@ejemplo.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mín. 8 caracteres" required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Dirección</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Calle, nº, ciudad" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="600 000 000" />
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary" style={{width:'100%'}} disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="mt-2 text-muted" style={{fontSize:'.85rem',textAlign:'center'}}>
          ¿Ya tienes cuenta? <Link to="/admin/login" style={{color:'var(--color-primary)'}}>Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
