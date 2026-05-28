import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAuth } from '../../context/SuperAuthContext';
import axios from 'axios';
import './SuperAdmin.css';

export default function SuperLogin() {
  const { login } = useSuperAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/superadmin/login', form);
      login(data.token);
      navigate('/superadmin');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="super-login-wrap">
      <div className="super-login-card">
        <div className="super-login-icon">✂</div>
        <h1>Panel Administrador</h1>
        <p className="super-login-sub">Peluquería — Gestión de clientes</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@peluqueriasaas.com"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="super-error">{error}</p>}
          <button className="super-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
