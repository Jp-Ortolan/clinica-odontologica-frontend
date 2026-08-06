import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// O backend chama o perfil de recepção "recepcionista"; as rotas do
// front usam "recepcao" — este mapa só serve pra redirecionar certo.
const SEGMENTO_ROTA_POR_PERFIL = {
  professor: 'professor',
  aluno: 'aluno',
  recepcionista: 'recepcao',
};

export default function ProtectedRoute({ perfisPermitidos, children }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  // Ainda validando o token salvo com o backend (GET /auth/me) — espera
  // antes de decidir redirecionar, pra não chutar o usuário pro login
  // só porque a resposta do servidor ainda não chegou.
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#3B44A8]/20 border-t-[#3B44A8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    const segmento = SEGMENTO_ROTA_POR_PERFIL[usuario.perfil] || 'login';
    return <Navigate to={`/app/${segmento}`} replace />;
  }

  return children;
}
