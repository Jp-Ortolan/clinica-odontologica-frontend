import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Calendar, ChevronRight, User } from 'lucide-react';
import api from '../../Services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardAluno() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [dataAtual, setDataAtual] = useState('');
  const [temNotificacoes, setTemNotificacoes] = useState(false);
  const [consultasHoje, setConsultasHoje] = useState([]);
  const [cirurgiasHoje, setCirurgiasHoje] = useState([]);
  const [pacientesPorId, setPacientesPorId] = useState({});

  const nomeUsuario = usuario?.nome?.split(' ')[0] || 'Aluno';

  useEffect(() => {
    const obterDataFormatada = () => {
      const data = new Date();
      const opcoes = { day: 'numeric', month: 'long', year: 'numeric' };
      const dataFormatada = data.toLocaleDateString('pt-BR', opcoes);
      const partes = dataFormatada.split(' de ');
      if (partes[1]) {
        partes[1] = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);
      }
      return `Hoje, ${partes.join(' de ')}`;
    };
    setDataAtual(obterDataFormatada());

    const carregarDados = async () => {
      try {
        const [consultasRes, cirurgiasRes, pacientesRes] = await Promise.all([
          api.get('/consultas'),
          api.get('/cirurgias'),
          api.get('/pacientes'),
        ]);

        const nomePorId = {};
        pacientesRes.data.forEach((p) => { nomePorId[p.id] = p.nome; });
        setPacientesPorId(nomePorId);

        const hojeStr = new Date().toDateString();
        setConsultasHoje(consultasRes.data.filter((c) => new Date(c.data_hora).toDateString() === hojeStr));
        setCirurgiasHoje(cirurgiasRes.data.filter((c) => new Date(c.data_hora).toDateString() === hojeStr));
      } catch (err) {
        console.error('Erro ao carregar dashboard do aluno:', err);
      }
    };

    carregarDados();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans">
      
      {/* TOPO FIXO - Dashboard */}
      <div className="bg-[#3B42B2] pt-10 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          onClick={() => navigate('/app/aluno/configuracoes')}
          className="p-1.5 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Configurações"
        >
          <Settings size={22} />
        </button>
        
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-wide">Dashboard</h1>
          <p className="text-[#F9A814] text-[10px] font-semibold uppercase tracking-wider">Aluno</p>
        </div>

        <button 
          onClick={() => navigate('/app/aluno/notificacoes')}
          className="p-1.5 hover:bg-white/10 rounded-lg transition active:scale-95 relative cursor-pointer"
          aria-label="Notificações"
        >
          <Bell size={22} />
          {temNotificacoes && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* CONTEÚDO ROLÁVEL - Dashboard */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        
        {/* Saudação */}
        <div className="select-none">
          <h2 className="text-slate-900 text-2xl font-extrabold leading-tight">
            Olá, {nomeUsuario}
          </h2>
          <p className="text-slate-500 text-xs font-medium">Bem-vindo de volta!</p>
        </div>

        {/* Seletor de Data */}
        <div className="w-full border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs bg-white select-none">
          <span className="text-[#3B42B2] font-bold text-xs">{dataAtual}</span>
          <Calendar className="text-[#3B42B2]" size={18} />
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 gap-3 select-none">
          {/* Consultas */}
          <button 
            onClick={() => navigate('/app/aluno/agenda')}
            className="bg-white border border-slate-200 hover:border-[#3B42B2]/40 rounded-2xl p-4 text-center shadow-xs transition cursor-pointer active:scale-95"
          >
            <span className="block text-slate-900 font-extrabold text-xs leading-tight">Consultas do dia</span>
            <span className="block text-3xl font-extrabold text-[#3B42B2] my-1.5">{consultasHoje.length}</span>
            <span className="block text-[10px] font-semibold text-slate-600">Agendadas</span>
          </button>

          {/* Card de Cirurgias */}
          <button 
            onClick={() => navigate('/app/aluno/cirurgias')}
            className="bg-white border border-slate-200 hover:border-[#3B42B2]/40 rounded-2xl p-4 text-center shadow-xs transition cursor-pointer active:scale-95"
          >
            <span className="block text-slate-900 font-extrabold text-xs leading-tight">Cirurgias do dia</span>
            <span className="block text-3xl font-extrabold text-[#3B42B2] my-1.5">{cirurgiasHoje.length}</span>
            <span className="block text-[10px] font-semibold text-slate-600">Agendadas</span>
          </button>
        </div>

        {/* Próximos Atendimentos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3B42B2] font-extrabold text-sm">Próximos atendimentos</h3>
            <button 
              onClick={() => navigate('/app/aluno/agenda')}
              className="text-[#3B42B2] text-xs font-bold hover:underline cursor-pointer"
            >
              Ver agenda
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
            {consultasHoje.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">Nenhuma consulta hoje.</div>
            ) : (
              consultasHoje.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/app/aluno/agenda')}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="text-slate-500 font-medium text-xs w-10 pr-1 text-center">
                    {new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="w-[1px] h-8 bg-slate-200 mr-3"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{pacientesPorId[c.paciente_id] || 'Paciente'}</h4>
                    <p className="text-slate-700 text-[11px] font-semibold">{c.queixa_principal || 'Consulta'}</p>
                    <p className="text-slate-400 text-[9px] font-medium capitalize">{c.status}</p>
                  </div>
                  <ChevronRight size={16} className="text-[#3B42B2]" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cirurgias de Hoje */}
        <div className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3B42B2] font-extrabold text-sm">Cirurgias de hoje</h3>
            <button 
              onClick={() => navigate('/app/aluno/cirurgias')}
              className="text-[#3B42B2] text-xs font-bold hover:underline cursor-pointer"
            >
              Ver agenda
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
            {cirurgiasHoje.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">Nenhuma cirurgia hoje.</div>
            ) : (
              cirurgiasHoje.map((cirurgia) => (
                <div
                  key={cirurgia.id}
                  onClick={() => navigate('/app/aluno/cirurgias')}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="text-slate-500 font-medium text-xs w-10 pr-1 text-center">
                    {new Date(cirurgia.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="w-[1px] h-10 bg-slate-200 mr-3"></div>
                  <div className="flex-1 flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center shrink-0">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{pacientesPorId[cirurgia.paciente_id] || 'Paciente'}</h4>
                      <p className="text-[#3B42B2] text-[11px] font-semibold">{cirurgia.tipo_cirurgia || 'Cirurgia'}</p>
                      <p className="text-slate-400 text-[9px] font-medium leading-none mt-0.5 capitalize">{cirurgia.status}</p>
                    </div>
                  </div>
                  <div className="pl-2 text-[#3B42B2]">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}