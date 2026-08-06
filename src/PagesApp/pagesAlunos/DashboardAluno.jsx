import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Calendar, ChevronRight, User } from 'lucide-react';
import api from '../../Services/api';

export default function DashboardAluno() {
  const navigate = useNavigate();
  const [dataAtual, setDataAtual] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('Aluno');
  const [temNotificacoes, setTemNotificacoes] = useState(true);

  useEffect(() => {
    // 1. Formatação da Data Atual
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

    // 2. Busca do Nome do Usuário
    const carregarUsuario = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.nome) {
          const primeiroNome = response.data.nome.split(' ')[0];
          setNomeUsuario(primeiroNome);
        }
      } catch (err) {
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
          try {
            const parsed = JSON.parse(usuarioSalvo);
            if (parsed.nome) {
              setNomeUsuario(parsed.nome.split(' ')[0]);
            }
          } catch {
            // Mantém fallback 'Aluno' ou 'Rhaya'
            setNomeUsuario('Rhaya');
          }
        }
      }
    };

    carregarUsuario();
  }, []);

  const cirurgiasHoje = [
    {
      horario: "08:30",
      paciente: "Rhaya Borges",
      procedimento: "Exodontia - 36",
      professor: "Prof. Dr. Carlos Eduardo",
      local: "Centro Cirúrgico"
    },
    {
      horario: "15:30",
      paciente: "Maria Silva",
      procedimento: "Extração de siso",
      professor: "Prof. Dra. Ana Maria",
      local: "Centro Cirúrgico"
    }
  ];

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
            <span className="block text-3xl font-extrabold text-[#3B42B2] my-1.5">3</span>
            <span className="block text-[10px] font-semibold text-slate-600">Confirmadas</span>
          </button>

          {/* Card de Cirurgias */}
          <button 
            onClick={() => navigate('/app/aluno/cirurgias')}
            className="bg-white border border-slate-200 hover:border-[#3B42B2]/40 rounded-2xl p-4 text-center shadow-xs transition cursor-pointer active:scale-95"
          >
            <span className="block text-slate-900 font-extrabold text-xs leading-tight">Cirurgias do dia</span>
            <span className="block text-3xl font-extrabold text-[#3B42B2] my-1.5">2</span>
            <span className="block text-[10px] font-semibold text-slate-600">Confirmadas</span>
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
            <div 
              onClick={() => navigate('/app/aluno/agenda')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="text-slate-500 font-medium text-xs w-10 pr-1 text-center">09:30</div>
              <div className="w-[1px] h-8 bg-slate-200 mr-3"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-xs truncate">Maria Silva</h4>
                <p className="text-slate-700 text-[11px] font-semibold">Clareamento Dental</p>
                <p className="text-slate-400 text-[9px] font-medium">Dentística</p>
              </div>
              <div className="ml-2 flex items-center gap-1 text-[#3B42B2]">
                <span className="inline-block bg-[#DCE0F5] text-[#3B42B2] text-[8px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                  Clínica 2
                </span>
                <ChevronRight size={16} />
              </div>
            </div>
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
            {cirurgiasHoje.map((cirurgia, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate('/app/aluno/cirurgias')}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="text-slate-500 font-medium text-xs w-10 pr-1 text-center">{cirurgia.horario}</div>
                <div className="w-[1px] h-10 bg-slate-200 mr-3"></div>
                <div className="flex-1 flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center shrink-0">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{cirurgia.paciente}</h4>
                    <p className="text-[#3B42B2] text-[11px] font-semibold">{cirurgia.procedimento}</p>
                    <p className="text-slate-400 text-[9px] font-medium leading-none mt-0.5">{cirurgia.professor}</p>
                  </div>
                </div>
                <div className="pl-2 text-[#3B42B2]">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}