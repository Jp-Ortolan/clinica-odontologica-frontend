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
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    const segmento = SEGMENTO_ROTA_POR_PERFIL[usuario.perfil] || 'login';
    return <Navigate to={`/app/${segmento}`} replace />;
  }

  return children;
}
