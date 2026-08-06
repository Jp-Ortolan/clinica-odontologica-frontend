import axios from 'axios';

const api = axios.create({
  // Utiliza a variável da Vercel ou o link direto com /api como fallback
  baseURL: import.meta.env.VITE_API_URL || 'https://clinica-odontologica-backend-production.up.railway.app/api',
});

// Envia o token de autenticação automaticamente caso o usuário esteja logado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;