import { createContext, useContext, useState, useEffect } from 'react';
import api from '../Services/api';

const AuthContext = createContext(null);

// Perfis do backend -> rota inicial de cada área do app.
const ROTA_POR_PERFIL = {
  professor: '/app/professor',
  aluno: '/app/aluno',
  recepcionista: '/app/recepcao',
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario');
    try {
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  // Enquanto valida o token salvo com o backend (GET /auth/me). Começa
  // "true" só quando existe algo pra validar — sem token, não há nada
  // a esperar e o app pode renderizar (redirecionando pro login) direto.
  const [carregando, setCarregando] = useState(() => !!localStorage.getItem('token'));

  // O login antigo confiava cegamente no que estava salvo no
  // localStorage, sem checar se o token ainda é válido no servidor.
  // Aqui revalidamos contra /auth/me assim que o app abre: se o usuário
  // não existe mais ou o token expirou, a sessão local é encerrada.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCarregando(false);
      return;
    }

    let cancelado = false;
    api.get('/auth/me')
      .then((resposta) => {
        if (cancelado) return;
        setUsuario(resposta.data);
        localStorage.setItem('usuario', JSON.stringify(resposta.data));
      })
      .catch(() => {
        if (cancelado) return;
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, senha) {
    const resposta = await api.post('/auth/login', { email, senha });
    const { token, usuario: usuarioLogado } = resposta.data;

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
    setUsuario(usuarioLogado);

    return usuarioLogado;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  function rotaInicial(perfil) {
    return ROTA_POR_PERFIL[perfil] || '/login';
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, rotaInicial }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>');
  }
  return contexto;
}
