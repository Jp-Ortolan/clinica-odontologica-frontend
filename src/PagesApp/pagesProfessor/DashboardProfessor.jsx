import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Calendar, ChevronRight, User, Loader2, Download } from 'lucide-react';
import api from '../../Services/api';
import { useAuth } from '../../context/AuthContext';
import { useContagemNaoLidas } from '../../hooks/useNotificacoes';

export default function DashboardProfessor() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { total: totalNaoLidas } = useContagemNaoLidas();
  const [loading, setLoading] = useState(true);
  const [dataAtual, setDataAtual] = useState('');
  const [baixandoRelatorio, setBaixandoRelatorio] = useState(false);

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

  // Carrega os dados reais do backend
  useEffect(() => {
    const carregarDadosDashboard = async () => {
      setLoading(true);
      try {
        const [resumoRes, consultasRes, cirurgiasRes, pacientesRes] = await Promise.all([
          api.get('/dashboard/resumo'),
          api.get('/consultas'),
          api.get('/cirurgias'),
          api.get('/pacientes'),
        ]);

        const nomePorId = {};
        pacientesRes.data.forEach((p) => { nomePorId[p.id] = p.nome; });

        const hojeStr = new Date().toDateString();
        const consultasHoje = consultasRes.data.filter((c) => new Date(c.data_hora).toDateString() === hojeStr);
        const cirurgiasHojeLista = cirurgiasRes.data.filter((c) => new Date(c.data_hora).toDateString() === hojeStr);

        setProximosAtendimentos(consultasHoje.map((c) => ({
          horario: new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          paciente: nomePorId[c.paciente_id] || 'Paciente',
          procedimento: c.queixa_principal || 'Consulta',
          status: c.status,
        })));

        setCirurgiasHoje(cirurgiasHojeLista.map((c) => ({
          horario: new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          paciente: nomePorId[c.paciente_id] || 'Paciente',
          procedimento: c.tipo_cirurgia || 'Cirurgia',
          status: c.status,
        })));

        setMetricas({
          consultasHoje: resumoRes.data.consultas_hoje ?? consultasHoje.length,
          cirurgiasHoje: resumoRes.data.cirurgias_hoje ?? cirurgiasHojeLista.length,
          estoqueCritico: resumoRes.data.materiais_estoque_critico ?? 0,
          cmePendente: resumoRes.data.esterilizacoes_pendentes ?? 0,
        });

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosDashboard();
  }, []);

  // GET /dashboard/relatorio-pdf devolve o PDF em binário; sem
  // responseType 'blob' o axios trata como texto e o arquivo sai corrompido.
  const baixarRelatorio = async () => {
    setBaixandoRelatorio(true);
    try {
      const resposta = await api.get('/dashboard/relatorio-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resposta.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'relatorio-dashboard.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar relatório:', err);
      alert('Não foi possível gerar o relatório.');
    } finally {
      setBaixandoRelatorio(false);
    }
  };

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
          onClick={() => navigate('/app/professor/notificacoes')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 relative cursor-pointer"
          aria-label="Notificações"
        >
          <Bell size={22} />
          {totalNaoLidas > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* 2. ÁREA BRANCA COM ROLAGEM */}
      <div className="flex-1 bg-white rounded-t-[28px] overflow-y-auto px-4 py-5 space-y-5 pb-20">
        
        {/* SAUDAÇÃO */}
        <div className="select-none flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 text-xl font-extrabold leading-tight">
              Olá, {usuario?.nome?.split(' ')[0] || 'Professor'}
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

        {/* Relatório em PDF — GET /dashboard/relatorio-pdf não tinha botão */}
        <button
          type="button"
          onClick={baixarRelatorio}
          disabled={baixandoRelatorio}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#3B44A8]/25 text-[#3B44A8] hover:bg-[#3B44A8]/5 rounded-xl font-bold text-[11px] transition active:scale-[0.98] disabled:opacity-50"
        >
          <Download size={14} />
          {baixandoRelatorio ? 'Gerando relatório...' : 'Baixar relatório em PDF'}
        </button>

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
                </div>
                <div className="shrink-0">
                  <span className="inline-block bg-[#DCE0F5] text-[#3B44A8] text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap capitalize">
                    {item.status}
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
                    <p className="text-gray-500 text-[8px] font-medium leading-none capitalize">{cirurgia.status}</p>
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