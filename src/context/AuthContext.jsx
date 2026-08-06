import { createContext, useContext, useState } from 'react';
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
    <AuthContext.Provider value={{ usuario, login, logout, rotaInicial }}>
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
