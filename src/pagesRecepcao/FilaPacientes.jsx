import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import api from '../Services/api'; // Ajustado para subir um nível e acessar a pasta Services

export default function FilaPacientes() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('aguardando'); // 'aguardando' ou 'atendimento'

  const [pacientesAguardando, setPacientesAguardando] = useState([]);
  const [pacientesEmAtendimento, setPacientesEmAtendimento] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Busca os atendimentos e fila do dia no banco de dados
  const carregarFila = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      // Busca os agendamentos/atendimentos de hoje
      const resposta = await api.get('/agendamentos/hoje');
      const dados = resposta.data || [];

      // Filtra de acordo com o status vindo da API
      const aguardando = dados.filter(item => 
        ['AGUARDANDO', 'EM_ESPERA', 'CHECK_IN'].includes(item.status?.toUpperCase())
      );
      
      const emAtendimento = dados.filter(item => 
        ['EM_ATENDIMENTO', 'EM_CONSULTA', 'INICIADO'].includes(item.status?.toUpperCase())
      );

      setPacientesAguardando(aguardando);
      setPacientesEmAtendimento(emAtendimento);
    } catch (err) {
      console.error('Erro ao carregar fila de pacientes:', err);
      setErro('Não foi possível carregar a fila de pacientes.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarFila();
  }, [carregarFila]);

  // Cálculo do tempo médio de espera dinâmico (em minutos)
  const calcularTempoMedioEspera = () => {
    if (pacientesAguardando.length === 0) return 0;

    const somaMinutos = pacientesAguardando.reduce((acc, p) => {
      if (p.tempoEsperaMinutos) return acc + p.tempoEsperaMinutos;
      
      // Cálculo baseado no horário de chegada/agendamento
      if (p.horaChegada || p.horario) {
        const horaAtual = new Date();
        const [horas, minutos] = (p.horaChegada || p.horario).split(':');
        const horaAgendada = new Date();
        horaAgendada.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0);

        const diffMs = horaAtual - horaAgendada;
        const diffMin = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        return acc + diffMin;
      }

      return acc;
    }, 0);

    return Math.round(somaMinutos / pacientesAguardando.length);
  };

  return (
    <div className="flex flex-col w-full min-h-full font-sans">
      
      {/* HEADER WEB COM BOTÃO VOLTAR */}
      <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/recepcao/dashboard')}
            className="p-2 bg-gray-50 text-[#3B44A8] hover:bg-gray-100 rounded-xl transition active:scale-95 border border-gray-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black text-gray-950">
            {abaAtiva === 'aguardando' ? 'Pacientes aguardando' : 'Pacientes em atendimento'}
          </h1>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL EXPANDIDO */}
      <div className="p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
        
        {/* BOTÕES DE ALTERNÂNCIA (TABS) */}
        <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex items-center gap-1.5 select-none border border-gray-200">
          <button
            onClick={() => setAbaAtiva('aguardando')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
              abaAtiva === 'aguardando'
                ? 'bg-[#3B44A8] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Aguardando ({pacientesAguardando.length})
          </button>
          <button
            onClick={() => setAbaAtiva('atendimento')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
              abaAtiva === 'atendimento'
                ? 'bg-[#3B44A8] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Em atendimento ({pacientesEmAtendimento.length})
          </button>
        </div>

        {/* FEEDBACK DE CARREGAMENTO */}
        {carregando ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-500 min-h-[300px]">
            <Loader2 size={32} className="animate-spin text-[#3B44A8]" />
            <p className="text-sm font-medium">Carregando informações da fila...</p>
          </div>
        ) : erro ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-500 min-h-[300px]">
            <AlertCircle size={36} className="text-red-500" />
            <p className="text-sm font-bold text-gray-800">{erro}</p>
            <button 
              onClick={carregarFila}
              className="text-xs text-[#3B44A8] font-bold underline mt-1"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* CONTEÚDOS DINÂMICOS BASEADOS NA ABA SELECIONADA */}
            {abaAtiva === 'aguardando' ? (
              /* ================= TELA: PACIENTES AGUARDANDO ================= */
              <div className="space-y-6">
                
                {/* Cards de Métricas Superiores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="block text-3xl font-black text-[#3B44A8]">
                        {pacientesAguardando.length}
                      </span>
                      <span className="block text-xs font-bold text-gray-500 mt-1">Total de pacientes na fila</span>
                    </div>
                    <div className="p-3 bg-blue-50 text-[#3B44A8] rounded-xl">
                      <Users size={22} />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#3B44A8]">
                          {calcularTempoMedioEspera()}
                        </span>
                        <span className="text-sm font-bold text-[#3B44A8]">min</span>
                      </div>
                      <span className="block text-xs font-bold text-gray-500 mt-1">Tempo médio de espera</span>
                    </div>
                    <div className="p-3 bg-amber-50 text-[#F9A814] rounded-xl">
                      <Clock size={22} />
                    </div>
                  </div>
                </div>

                {/* Lista da Fila de Espera */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
                  {pacientesAguardando.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 font-medium">
                      Nenhum paciente aguardando no momento.
                    </div>
                  ) : (
                    pacientesAguardando.map((p, idx) => (
                      <div key={p.id || p._id || idx} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="text-gray-500 font-black text-xs w-12 text-center bg-gray-50 py-1.5 rounded-lg border border-gray-200">
                            {p.horario || p.horaChegada || '--:--'}
                          </div>
                          <div className="w-[1px] h-8 bg-gray-200 mx-4"></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-950 text-sm truncate">
                              {p.pacienteNome || p.paciente?.nome || 'Paciente não identificado'}
                            </h4>
                            <p className="text-gray-600 text-xs font-medium mt-0.5">
                              {p.procedimento || p.servico || 'Consulta'} • <span className="text-gray-400 text-[11px]">{p.especialidade || p.categoria || 'Geral'}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-4 select-none">
                          <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-full border ${
                            p.tempoEspera 
                              ? 'bg-purple-50 text-purple-700 border-purple-100' 
                              : 'bg-blue-50 text-[#3B44A8] border-blue-100'
                          }`}>
                            {p.tempoEspera || 'Aguardando'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            ) : (
              /* ================= TELA: PACIENTES EM ATENDIMENTO ================= */
              <div className="space-y-4">
                
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
                  {pacientesEmAtendimento.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 font-medium">
                      Nenhum paciente em atendimento no momento.
                    </div>
                  ) : (
                    pacientesEmAtendimento.map((p, idx) => (
                      <div key={p.id || p._id || idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                        
                        {/* Dados do Paciente */}
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="text-gray-500 font-black text-xs w-12 text-center bg-gray-50 py-1.5 rounded-lg border border-gray-200">
                            {p.horario || p.horaInicio || '--:--'}
                          </div>
                          <div className="w-[1px] h-8 bg-gray-200 mx-4"></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-950 text-sm truncate">
                              {p.pacienteNome || p.paciente?.nome || 'Paciente não identificado'}
                            </h4>
                            <p className="text-gray-600 text-xs font-medium mt-0.5">
                              {p.procedimento || p.servico || 'Procedimento'} • <span className="text-gray-400 text-[11px]">{p.especialidade || p.categoria || 'Geral'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Localização / Alocação Profissional */}
                        <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-200 p-3 rounded-xl min-w-[200px] sm:text-right sm:justify-end">
                          <div className="shrink-0 sm:order-2 p-2 bg-[#3B44A8]/10 text-[#3B44A8] rounded-lg">
                            <UserCheck size={16} />
                          </div>
                          <div>
                            <span className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Local</span>
                            <span className="block text-xs font-bold text-gray-900">
                              {p.sala || p.consultorio || 'Consultório'}
                            </span>
                            <span className="block text-[10px] font-medium text-gray-500 mt-0.5">
                              {p.profissional || p.dentista || 'Profissional N/I'}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}