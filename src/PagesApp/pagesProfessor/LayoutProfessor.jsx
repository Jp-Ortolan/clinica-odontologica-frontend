import { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Stethoscope, Users, Box, PackageCheck } from 'lucide-react';

// Configuração centralizada da Bottom Navigation
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/app/professor/dashboard' },
  { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/app/professor/agenda' },
  { id: 'cirurgias', label: 'Cirurgias', icon: Stethoscope, path: '/app/professor/cirurgias' },
  { id: 'pacientes', label: 'Pacientes', icon: Users, path: '/app/professor/pacientes' },
  { id: 'cme', label: 'CME', icon: Box, path: '/app/professor/cme' },
  { id: 'estoque', label: 'Estoque', icon: PackageCheck, path: '/app/professor/estoque' },
];

export default function LayoutProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determina reativamente a aba ativa com base no pathname atual
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path === '/app/professor' || path === '/app/professor/' || path.startsWith('/app/professor/dashboard')) {
      return 'home';
    }
    const match = NAV_ITEMS.find((item) => item.id !== 'home' && path.startsWith(item.path));
    return match ? match.id : '';
  }, [location.pathname]);

  return (
    /* Moldura externa / Background */
    <div className="w-screen h-screen bg-[#1E1E24] flex items-center justify-center p-2 sm:p-4 font-sans overflow-hidden select-none">
      
      {/* Container de Simulação do Dispositivo Móvel */}
      <div className="w-full max-w-[390px] h-full max-h-[820px] bg-[#3B44A8] rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border border-white/20">
        
        {/* Viewport Renderizador das Páginas (`<Outlet />`) */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet />
        </main>

        {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA */}
        <nav 
          aria-label="Navegação principal"
          className="h-[68px] bg-[#3B44A8] px-2 py-2 flex items-center justify-between shrink-0 z-20 border-t border-white/10 rounded-b-[36px]"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-colors cursor-pointer ${
                  isActive ? 'text-[#F9A814] font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}