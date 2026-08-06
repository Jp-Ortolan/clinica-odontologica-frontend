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

// Se o token guardado expirou/ficou inválido, o backend responde 401 em
// qualquer rota protegida. Nesse caso limpamos a sessão local e mandamos
// o usuário de volta pro login — evita ficar preso numa tela quebrada
// mostrando dados de uma sessão que o servidor já não reconhece mais.
// (Login com senha errada também dá 401, mas nesse caso não há token
// salvo ainda, então a condição abaixo não dispara o redirect.)
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const tinhaToken = !!localStorage.getItem('token');
    if (erro.response?.status === 401 && tinhaToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(erro);
  }
);

export default api;