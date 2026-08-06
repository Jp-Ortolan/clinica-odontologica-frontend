import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Home,
  Users,
  Box,
  CheckCircle,
  Scissors,
  User
} from 'lucide-react';
import api from '../../Services/api';

const STATUS_CONFIG = {
  realizada: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Concluída' },
  agendada: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Agendada' },
  cancelada: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelada' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.agendada;
  return (
    <span className={`${config.bg} ${config.text} text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap`}>
      {config.label}
    </span>
  );
}

export default function TelaMutiraoCirurgico() {
  const navigate = useNavigate();
  const [mutirao, setMutirao] = useState(null);
  const [cirurgiasDoMutirao, setCirurgiasDoMutirao] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/cirurgias/mutiroes'),
      api.get('/cirurgias'),
      api.get('/pacientes'),
    ]).then(([mutiroesRes, cirurgiasRes, pacientesRes]) => {
      const mutiroes = mutiroesRes.data;
      if (mutiroes.length === 0) {
        setMutirao(null);
        return;
      }

      // Prioriza o mutirão mais próximo de hoje (evento futuro mais próximo, ou o mais recente)
      const hoje = new Date();
      const ordenados = [...mutiroes].sort((a, b) => {
        const diffA = Math.abs(new Date(a.data_evento) - hoje);
        const diffB = Math.abs(new Date(b.data_evento) - hoje);
        return diffA - diffB;
      });
      const selecionado = ordenados[0];
      setMutirao(selecionado);

      const nomePorId = {};
      pacientesRes.data.forEach((p) => { nomePorId[p.id] = p.nome; });

      const cirurgiasFiltradas = cirurgiasRes.data
        .filter((c) => c.mutirao_id === selecionado.id)
        .map((c) => ({
          id: c.id,
          nome: nomePorId[c.paciente_id] || 'Paciente',
          horario: new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          procedimento: c.tipo_cirurgia || 'Cirurgia',
          status: c.status,
          dadosOriginais: c,
        }))
        .sort((a, b) => a.horario.localeCompare(b.horario));

      setCirurgiasDoMutirao(cirurgiasFiltradas);
    }).catch((err) => console.error('Erro ao carregar mutirão cirúrgico:', err))
      .finally(() => setCarregando(false));
  }, []);

  const totalPacientes = cirurgiasDoMutirao.length;
  const totalRealizadas = cirurgiasDoMutirao.filter((c) => c.status === 'realizada').length;
  const totalAgendadas = cirurgiasDoMutirao.filter((c) => c.status === 'agendada').length;
  const totalCanceladas = cirurgiasDoMutirao.filter((c) => c.status === 'cancelada').length;

  return (
    <div className="w-full h-full min-h-screen bg-[#3B42B2] text-white flex flex-col justify-between font-sans m-0 p-0 overflow-x-hidden">

      {/* Top Header */}
      <header className="pt-6 pb-4 px-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-medium tracking-wide text-center flex-1 pr-8">
          Mutirão Cirúrgico
        </h1>
      </header>

      {/* Main Container */}
      <main className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-5 pb-6 flex-1 flex flex-col space-y-4">

        {carregando ? (
          <div className="text-center text-slate-400 text-xs font-semibold py-10">Carregando mutirão...</div>
        ) : !mutirao ? (
          <div className="text-center text-slate-400 text-xs font-semibold py-10 border border-dashed border-slate-200 rounded-2xl">
            Nenhum mutirão cirúrgico cadastrado ainda.
          </div>
        ) : (
          <>
            {/* Main Event Card */}
            <section className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex justify-between items-start">
              <div className="space-y-1.5">
                <h2 className="font-bold text-[#3B42B2] text-base leading-tight">
                  {mutirao.nome}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{mutirao.data_evento ? new Date(mutirao.data_evento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Data não informada'}</span>
                </div>
                {mutirao.local && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{mutirao.local}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Summary Metrics */}
            <section className="grid grid-cols-4 gap-2 py-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-2 text-center shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Pacientes</p>
                <p className="text-xl font-black text-[#3B42B2] my-0.5">{totalPacientes}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">No mutirão</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-2 text-center shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Realizadas</p>
                <p className="text-xl font-black text-[#3B42B2] my-0.5">{totalRealizadas}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">Concluídas</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-2 text-center shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Agendadas</p>
                <p className="text-xl font-black text-[#3B42B2] my-0.5">{totalAgendadas}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">Na fila</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-2 text-center shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Canceladas</p>
                <p className="text-xl font-black text-rose-600 my-0.5">{totalCanceladas}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">Total</p>
              </div>
            </section>

            {/* Queue Header */}
            <div className="flex justify-between items-center pt-1">
              <h3 className="font-bold text-[#3B42B2] text-sm">
                Fila de atendimento
              </h3>
            </div>

            {/* Queue List */}
            <div className="border border-slate-200 rounded-2xl bg-white shadow-sm divide-y divide-slate-100 overflow-hidden flex-1">
              {cirurgiasDoMutirao.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                  Nenhuma cirurgia vinculada a este mutirão ainda.
                </div>
              ) : (
                cirurgiasDoMutirao.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/app/professor/cirurgias/detalhes', { state: { cirurgia: item.dadosOriginais } })}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer gap-3 active:bg-slate-100"
                  >
                    {/* Avatar Icon */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                        {item.nome}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 my-0.5">
                        {item.horario}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {item.procedimento}
                      </p>
                    </div>

                    {/* Status Tag */}
                    <StatusBadge status={item.status} />
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-[#3B42B2] px-2 py-3 flex items-center justify-around border-t border-white/10 sticky bottom-0 z-10">
        <button
          onClick={() => navigate('/app/professor')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => navigate('/app/professor/agenda')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer"
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        <button
          onClick={() => navigate('/app/professor/cirurgias')}
          className="flex flex-col items-center gap-1 text-amber-400 font-bold cursor-pointer"
        >
          <Scissors className="w-5 h-5 text-amber-400 rotate-90" />
          <span className="text-[10px]">Cirurgias</span>
        </button>

        <button
          onClick={() => navigate('/app/professor/pacientes')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Pacientes</span>
        </button>

        <button
          onClick={() => navigate('/app/professor/cme')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">CME</span>
        </button>

        <button
          onClick={() => navigate('/app/professor/estoque')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer"
        >
          <Box className="w-5 h-5" />
          <span className="text-[10px] font-medium">Estoque</span>
        </button>
      </nav>

    </div>
  );
}
