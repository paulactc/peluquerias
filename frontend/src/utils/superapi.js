import axios from 'axios';

const superapi = axios.create({ baseURL: '/api/superadmin' });

superapi.interceptors.request.use(cfg => {
  const token = localStorage.getItem('supertoken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default superapi;
