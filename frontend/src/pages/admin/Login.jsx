import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.salon);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card card">
        <div className="auth-icon">✂️</div>
        <h1>Panel de administración</h1>
        <p className="text-muted">Accede a tu peluquería</p>
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@mipeluqueria.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary" style={{width:'100%'}} disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="mt-2 text-muted" style={{fontSize:'.85rem', textAlign:'center'}}>
          ¿No tienes cuenta? <Link to="/admin/registro" style={{color:'var(--color-primary)'}}>Registra tu peluquería</Link>
        </p>
      </div>
    </div>
  );
}
