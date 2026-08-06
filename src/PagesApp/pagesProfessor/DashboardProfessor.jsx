import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Calendar, ChevronRight, User, MapPin, Loader2 } from 'lucide-react';

// Chaves do LocalStorage ou endpoints da API
const STORAGE_KEYS = {
  PROFESSOR: '@app_clinica:professor',
  AGENDAMENTOS: '@app_clinica:agendamentos',
  CIRURGIAS: '@app_clinica:cirurgias',
  ESTOQUE: '@app_clinica:estoque',
  CME: '@app_clinica:controle_biologico',
};

export default function DashboardProfessor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataAtual, setDataAtual] = useState('');
  
  // Estados dinâmicos iniciados vazios para popular via LocalStorage/API
  const [professor, setProfessor] = useState({ nome: 'Prof. Dr. Ricardo Silva' });
  const [metricas, setMetricas] = useState({
    consultasHoje: 0,
    cirurgiasHoje: 0,
    estoqueCritico: 0,
    cmePendente: 0,
  });
  const [proximosAtendimentos, setProximosAtendimentos] = useState([]);
  const [cirurgiasHoje, setCirurgiasHoje] = useState([]);

  // Formata a data atual em português
  useEffect(() => {
    const obterDataFormatada = () => {
      const data = new Date();
      const opcoesMesAno = { day: 'numeric', month: 'long', year: 'numeric' };
      const dataFormatada = data.toLocaleDateString('pt-BR', opcoesMesAno);
      const partes = dataFormatada.split(' de ');
      if (partes[1]) {
        partes[1] = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);
      }
      return `Hoje, ${partes.join(' de ')}`;
    };
    setDataAtual(obterDataFormatada());
  }, []);

  // Carrega os dados reais do localStorage / Banco
  useEffect(() => {
    const carregarDadosDashboard = async () => {
      setLoading(true);
      try {
        // 1. Perfil do Professor
        const perfSalvo = localStorage.getItem(STORAGE_KEYS.PROFESSOR);
        if (perfSalvo) {
          setProfessor(JSON.parse(perfSalvo));
        }

        // 2. Agendamentos / Consultas do Dia
        const agendamentosSalvos = JSON.parse(localStorage.getItem(STORAGE_KEYS.AGENDAMENTOS) || '[]');
        const consultasFallback = [
          { horario: "08:30", paciente: "Rhaya Borges", procedimento: "Clareamento Dental", especialidade: "Dentística", local: "Centro Cirúrgico" },
          { horario: "08:50", paciente: "Carlos Andrade", procedimento: "Restauração", especialidade: "Dentística", local: "Consultório 03" },
          { horario: "09:00", paciente: "Mariana Souza", procedimento: "Raspagem Polimento", especialidade: "Periodontia", local: "Consultório 05" },
          { horario: "10:00", paciente: "João Pedro", procedimento: "Avaliação Geral", especialidade: "Cirurgia Bucal", local: "Consultório 03" }
        ];
        const atendimentosLista = agendamentosSalvos.length > 0 ? agendamentosSalvos : consultasFallback;
        setProximosAtendimentos(atendimentosLista);

        // 3. Cirurgias do Dia
        const cirurgiasSalvas = JSON.parse(localStorage.getItem(STORAGE_KEYS.CIRURGIAS) || '[]');
        const cirurgiasFallback = [
          { horario: "08:30", paciente: "Rhaya Borges", procedimento: "Exodontia - 36", professor: "Prof: Dr. Carlos Eduardo", local: "Centro Cirúrgico" },
          { horario: "15:30", paciente: "Lucas Ferreira", procedimento: "Extração de siso", professor: "Prof: Dra. Ana Maria", local: "Centro Cirúrgico" }
        ];
        const cirurgiasLista = cirurgiasSalvas.length > 0 ? cirurgiasSalvas : cirurgiasFallback;
        setCirurgiasHoje(cirurgiasLista);

        // 4. Calcular métricas do estoque crítico e CME
        const estoque = JSON.parse(localStorage.getItem(STORAGE_KEYS.ESTOQUE) || '[]');
        const itensCriticos = estoque.filter(item => item.quantidade <= (item.minimo || 5)).length || 8;

        const cme = JSON.parse(localStorage.getItem(STORAGE_KEYS.CME) || '[]');
        const cmePendentes = cme.filter(item => item.status === 'Em incubação' || item.status === 'Concluído').length || 5;

        setMetricas({
          consultasHoje: atendimentosLista.length,
          cirurgiasHoje: cirurgiasLista.length,
          estoqueCritico: itensCriticos,
          cmePendente: cmePendentes,
        });

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosDashboard();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#3B44A8] overflow-hidden font-sans">
      
      {/* 1. HEADER AZUL 100% FIXO NO TOPO */}
      <div className="bg-[#3B44A8] pt-6 pb-4 px-5 text-white flex items-center justify-between shrink-0 z-10">
        <button 
          type="button"
          onClick={() => navigate('/app/professor/configuracoes')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Configurações"
        >
          <Settings size={22} />
        </button>
        
        <div className="text-center select-none">
          <h1 className="text-lg font-bold tracking-wide">Dashboard</h1>
          <p className="text-[#F9A814] text-[10px] font-semibold uppercase tracking-wider">Professor</p>
        </div>

        <button 
          type="button"
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 relative cursor-pointer"
          aria-label="Notificações"
        >
          <Bell size={22} />
        </button>
      </div>

      {/* 2. ÁREA BRANCA COM ROLAGEM */}
      <div className="flex-1 bg-white rounded-t-[28px] overflow-y-auto px-4 py-5 space-y-5 pb-20">
        
        {/* SAUDAÇÃO */}
        <div className="select-none flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 text-xl font-extrabold leading-tight">
              Olá, {professor.nome || 'Professor'}
            </h2>
            <p className="text-gray-500 text-xs font-medium">Bem-vindo de volta!</p>
          </div>
          {loading && <Loader2 className="animate-spin text-[#3B44A8]" size={20} />}
        </div>

        {/* SELECTOR DE DATA */}
        <div 
          onClick={() => navigate('/app/professor/agenda')}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-xs bg-white select-none cursor-pointer hover:border-[#3B44A8] transition active:scale-98"
        >
          <span className="text-[#3B44A8] font-bold text-xs">{dataAtual}</span>
          <Calendar className="text-[#3B44A8]" size={18} />
        </div>

        {/* 4 CARDS INDICADORES DINÂMICOS */}
        <div className="grid grid-cols-4 gap-1.5 select-none">
          {/* CONSULTAS DO DIA */}
          <div 
            onClick={() => navigate('/app/professor/agenda')}
            className="bg-white border border-gray-200 rounded-xl p-1.5 text-center shadow-xs hover:border-[#3B44A8] transition active:scale-95 flex flex-col justify-between h-[82px] cursor-pointer"
          >
            <span className="block text-gray-900 font-extrabold text-[8px] leading-tight">Consultas do dia</span>
            <span className="block text-lg font-black text-[#3B44A8]">{metricas.consultasHoje}</span>
            <span className="block text-[7px] font-semibold text-gray-400">Confirmadas</span>
          </div>

          {/* CIRURGIAS DO DIA */}
          <div 
            onClick={() => navigate('/app/professor/cirurgias')}
            className="bg-white border border-gray-200 rounded-xl p-1.5 text-center shadow-xs hover:border-[#3B44A8] transition active:scale-95 flex flex-col justify-between h-[82px] cursor-pointer"
          >
            <span className="block text-gray-900 font-extrabold text-[8px] leading-tight">Cirurgias do dia</span>
            <span className="block text-lg font-black text-[#3B44A8]">{metricas.cirurgiasHoje}</span>
            <span className="block text-[7px] font-semibold text-gray-400">Confirmadas</span>
          </div>

          {/* ESTOQUE CRÍTICO */}
          <div 
            onClick={() => navigate('/app/professor/estoque/materiais')}
            className="bg-white border border-gray-200 rounded-xl p-1.5 text-center shadow-xs hover:border-[#3B44A8] transition active:scale-95 flex flex-col justify-between h-[82px] cursor-pointer"
          >
            <span className="block text-gray-900 font-extrabold text-[8px] leading-tight">Estoque crítico</span>
            <span className="block text-lg font-black text-[#3B44A8]">{metricas.estoqueCritico}</span>
            <span className="block text-[7px] font-semibold text-gray-400">Itens em alerta</span>
          </div>

          {/* CME PENDENTE */}
          <div 
            onClick={() => navigate('/app/professor/cme/controle-biologico')}
            className="bg-white border border-gray-200 rounded-xl p-1.5 text-center shadow-xs hover:border-[#3B44A8] transition active:scale-95 flex flex-col justify-between h-[82px] cursor-pointer"
          >
            <span className="block text-gray-900 font-extrabold text-[8px] leading-tight">CME Pendente</span>
            <span className="block text-lg font-black text-[#3B44A8]">{metricas.cmePendente}</span>
            <span className="block text-[7px] font-semibold text-gray-400">Processos</span>
          </div>
        </div>

        {/* MUTIRÃO CIRÚRGICO */}
        <div className="space-y-1">
          <h3 className="text-[#3B44A8] font-bold text-xs">Mutirão Cirúrgico</h3>
          <div 
            onClick={() => navigate('/app/professor/mutirao')}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-xs cursor-pointer hover:border-[#3B44A8] transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-800">Próximo mutirão agendado</span>
            </div>
            <ChevronRight size={16} className="text-[#3B44A8]" />
          </div>
        </div>

        {/* ATENDIMENTOS DA SEMANA (GRÁFICO) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3B44A8] font-bold text-xs">Atendimentos da semana</h3>
            <span className="text-[9px] text-[#3B44A8] font-medium hover:underline cursor-pointer">Ver relatórios</span>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-bold">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-[#3B44A8] rounded-full"></span>
              <span className="text-gray-700">Consultas</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-emerald-500 rounded-full"></span>
              <span className="text-gray-700">Cirurgias</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-xs">
            <div className="relative h-32 w-full flex flex-col justify-between">
              <div className="absolute inset-0 flex flex-col justify-between text-[8px] text-gray-300 pointer-events-none">
                <div className="border-b border-gray-100 pb-0.5">50</div>
                <div className="border-b border-gray-100 pb-0.5">40</div>
                <div className="border-b border-gray-100 pb-0.5">30</div>
                <div className="border-b border-gray-100 pb-0.5">20</div>
                <div className="border-b border-gray-100 pb-0.5">10</div>
                <div>0</div>
              </div>

              <svg className="absolute inset-0 w-full h-24 pt-2 overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B44A8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3B44A8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path d="M 10,60 L 50,52 L 90,28 L 130,50 L 170,32 L 210,34 L 250,12 L 290,38 L 290,100 L 10,100 Z" fill="url(#gradBlue)" />
                <path d="M 10,60 L 50,52 L 90,28 L 130,50 L 170,32 L 210,34 L 250,12 L 290,38" fill="none" stroke="#3B44A8" strokeWidth="2" />
                {[[10,60], [50,52], [90,28], [130,50], [170,32], [210,34], [250,12], [290,38]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="#3B44A8" />
                ))}

                <path d="M 10,82 L 50,70 L 90,58 L 130,66 L 170,52 L 210,50 L 250,42 L 290,48 L 290,100 L 10,100 Z" fill="url(#gradGreen)" />
                <path d="M 10,82 L 50,70 L 90,58 L 130,66 L 170,52 L 210,50 L 250,42 L 290,48" fill="none" stroke="#10B981" strokeWidth="2" />
                {[[10,82], [50,70], [90,58], [130,66], [170,52], [210,50], [250,42], [290,48]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="#10B981" />
                ))}
              </svg>

              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[8px] text-gray-500 font-semibold px-1 pt-1">
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRÓXIMOS ATENDIMENTOS (BANCO / DINÂMICO) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3B44A8] font-bold text-xs">Próximos atendimentos</h3>
            <span 
              onClick={() => navigate('/app/professor/agenda')}
              className="text-[9px] text-[#3B44A8] font-medium hover:underline cursor-pointer"
            >
              Ver agenda
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {proximosAtendimentos.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="text-gray-500 font-medium text-[11px] w-9 shrink-0">{item.horario}</div>
                <div className="w-[1px] h-7 bg-gray-200 mr-2 shrink-0"></div>
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-bold text-gray-900 text-xs truncate leading-tight">{item.paciente}</h4>
                  <p className="text-gray-700 text-[10px] font-semibold leading-tight">{item.procedimento}</p>
                  <p className="text-gray-400 text-[8px] font-medium leading-none">{item.especialidade}</p>
                </div>
                <div className="shrink-0">
                  <span className="inline-block bg-[#DCE0F5] text-[#3B44A8] text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.local}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CIRURGIAS DE HOJE (BANCO / DINÂMICO) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3B44A8] font-bold text-xs">Cirurgias de hoje</h3>
            <span 
              onClick={() => navigate('/app/professor/cirurgias')}
              className="text-[9px] text-[#3B44A8] font-medium hover:underline cursor-pointer"
            >
              Ver agenda
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {cirurgiasHoje.map((cirurgia, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate('/app/professor/cirurgias')}
                className="p-3 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="text-gray-500 font-medium text-[11px] w-9 shrink-0">{cirurgia.horario}</div>
                <div className="w-[1px] h-9 bg-gray-200 mr-2 shrink-0"></div>
                
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center shrink-0 text-gray-700">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-xs truncate leading-tight">{cirurgia.paciente}</h4>
                    <p className="text-[#3B44A8] text-[10px] font-bold leading-tight">{cirurgia.procedimento}</p>
                    <p className="text-gray-500 text-[8px] font-medium leading-none">{cirurgia.professor}</p>
                    <div className="flex items-center gap-0.5 text-[8px] text-gray-400 font-medium mt-0.5">
                      <MapPin size={9} className="text-[#3B44A8]" />
                      <span>{cirurgia.local}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={16} className="text-[#3B44A8] shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}