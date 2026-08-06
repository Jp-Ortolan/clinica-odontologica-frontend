import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, UserCheck } from 'lucide-react';
import api from '../Services/api'; // Caminho corrigido para a pasta Services

export default function LayoutRecepcao() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera dados do usuário do localStorage com fallback seguro
  const getUsuarioSalvo = () => {
    try {
      return JSON.parse(localStorage.getItem('@clinica:usuario') || '{}');
    } catch {
      return {};
    }
  };

  const usuarioSalvo = getUsuarioSalvo();

  // Identificação dinâmica da aba ativa com base na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/app/recepcao/pacientes')) return 'pacientes';
    if (path.includes('/app/recepcao/agenda')) return 'agenda';
    if (path.includes('/app/recepcao/dashboard') || path === '/app/recepcao') return 'home';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Função de Logout Real integrada à API
  const handleLogout = async () => {
    try {
      // Opcional: Avisa a API sobre a invalidação de sessão
      await api.post('/auth/logout').catch(() => {});
    } finally {
      // Limpa dados de autenticação armazenados no cliente
      localStorage.removeItem('@clinica:token');
      localStorage.removeItem('@clinica:usuario');
      delete api.defaults.headers.common['Authorization'];

      // Redireciona para a tela de login
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      
      {/* SIDEBAR VERTICAL WEB */}
      <aside className="w-64 bg-[#3B44A8] flex flex-col justify-between text-white shrink-0 shadow-xl z-40 select-none">
        <div>
          {/* Logo / Título do Sistema */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-black tracking-wider uppercase text-[#F9A814]">Recepção</h2>
            <p className="text-white/60 text-xs font-light">Clínica Odontológica</p>
          </div>

          {/* Links de Navegação */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => navigate('/app/recepcao/dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === 'home'
                  ? 'bg-[#F9A814] text-white shadow-md scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home size={18} />
              <span>Início</span>
            </button>

            <button
              onClick={() => navigate('/app/recepcao/pacientes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === 'pacientes'
                  ? 'bg-[#F9A814] text-white shadow-md scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users size={18} />
              <span>Pacientes</span>
            </button>

            <button
              onClick={() => navigate('/app/recepcao/agenda')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === 'agenda'
                  ? 'bg-[#F9A814] text-white shadow-md scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar size={18} />
              <span>Agenda Geral</span>
            </button>
          </nav>
        </div>

        {/* Rodapé da Sidebar: Usuário Ativo + Botão de Sair */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {usuarioSalvo.nome && (
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="p-1.5 bg-[#F9A814]/20 text-[#F9A814] rounded-lg">
                <UserCheck size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{usuarioSalvo.nome}</p>
                <p className="text-[10px] text-white/50 truncate capitalize">{usuarioSalvo.cargo || 'Recepção'}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-200 hover:bg-red-500/20 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL EXPANSÍVEL */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 pb-8">
        <Outlet />
      </main>
    </div>
  );
}