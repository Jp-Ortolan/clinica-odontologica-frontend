import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Calendar as CalendarIcon
} from 'lucide-react';

// Chave utilizada para persistência no localStorage
const STORAGE_KEY_AGENDA = '@app_clinica:agenda_recepcao';

// Dados iniciais de fallback caso o localStorage esteja vazio
const AGENDAMENTOS_INICIAIS_MOCK = [
  {
    id: 1,
    data: '2026-05-25',
    hora: '09:30',
    paciente: 'Ana Maria Silva',
    procedimento: 'Clareamento Dental',
    disciplina: 'Dentística'
  },
  {
    id: 2,
    data: '2026-05-25',
    hora: '11:40',
    paciente: 'Carlos Eduardo',
    procedimento: 'Restauração',
    disciplina: 'Dentística'
  },
  {
    id: 3,
    data: '2026-05-25',
    hora: '13:00',
    paciente: 'Mariana Costa',
    procedimento: 'Tratamento de Canal',
    disciplina: 'Endodontia'
  }
];

export default function AgendaProfessor() {
  const navigate = useNavigate();

  // Estados dos Modais / Menus Dropdown
  const [modalDisciplinasAberto, setModalDisciplinasAberto] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('Todas as disciplinas');
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  // Estados de Data
  const [dataAtual, setDataAtual] = useState(new Date(2026, 4, 25)); // Maio/2026
  const [diaSelecionado, setDiaSelecionado] = useState(25);

  // Estado Principal da Agenda (Cadastrada pela Recepção)
  const [agendamentosRecepcao, setAgendamentosRecepcao] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Lista de Disciplinas disponíveis
  const listaDisciplinas = [
    'Todas as disciplinas',
    'Dentística',
    'Endodontia',
    'Periodontia',
    'Ortodontia',
    'Odontopediatria',
    'Cirurgia Bucal',
    'Prótese',
    'Reabilitação Bucal'
  ];

  // 1. CARREGAR AGENDAMENOS CADASTRADOS PELA RECEPÇÃO
  useEffect(() => {
    const carregarAgenda = () => {
      try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY_AGENDA);
        if (dadosSalvos) {
          setAgendamentosRecepcao(JSON.parse(dadosSalvos));
        } else {
          // Inicializa mock padrão se estiver vazio
          localStorage.setItem(STORAGE_KEY_AGENDA, JSON.stringify(AGENDAMENTOS_INICIAIS_MOCK));
          setAgendamentosRecepcao(AGENDAMENTOS_INICIAIS_MOCK);
        }
      } catch (error) {
        console.error("Erro ao carregar agenda cadastrada pela recepção:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarAgenda();

    // Ouve alterações no localStorage feitas pela aba/janela da recepção em tempo real
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_AGENDA && e.newValue) {
        setAgendamentosRecepcao(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Formatação de string de data selecionada YYYY-MM-DD
  const stringDataSelecionada = useMemo(() => {
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(diaSelecionado).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }, [dataAtual, diaSelecionado]);

  // 2. AGRUPAR E FILTRAR OS AGENDAMENTOS CADASTRADOS
  const agendamentosAgrupados = useMemo(() => {
    // A) Filtra por Data
    const doDia = agendamentosRecepcao.filter((item) => item.data === stringDataSelecionada);

    // B) Lista de Disciplinas a exibir
    const disciplinasParaExibir = disciplinaSelecionada === 'Todas as disciplinas'
      ? listaDisciplinas.filter((d) => d !== 'Todas as disciplinas')
      : [disciplinaSelecionada];

    // C) Agrupa por disciplina
    return disciplinasParaExibir.map((disciplina) => {
      const pacientes = doDia
        .filter((item) => item.disciplina === disciplina)
        .map((item) => ({
          id: item.id,
          hora: item.hora,
          nome: item.paciente,
          procedimento: item.procedimento
        }));

      return {
        disciplina,
        pacientes
      };
    });
  }, [agendamentosRecepcao, stringDataSelecionada, disciplinaSelecionada, listaDisciplinas]);

  // Utilitários de Data
  const formatarMesAno = (date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const mudarMes = (delta) => {
    const novaData = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + delta, 1);
    setDataAtual(novaData);
  };

  return (
    <div 
      className="w-full h-full bg-[#3B42B2] text-white flex flex-col font-sans m-0 p-0 overflow-hidden relative"
      onClick={() => {
        setMenuAbertoId(null);
        if (modalDisciplinasAberto) setModalDisciplinasAberto(false);
      }}
    >
      {/* 1. HEADER / TOPO */}
      <div className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          Agenda do Professor
        </h1>

        <div className="w-9" />
      </div>

      {/* 2. CARD PRINCIPAL BRANCO */}
      <div className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-5 pb-6 flex-1 overflow-y-auto flex flex-col space-y-4 shadow-inner relative">
        
        {/* BOTÃO SELECT DE DISCIPLINAS */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalDisciplinasAberto(!modalDisciplinasAberto);
            }}
            aria-expanded={modalDisciplinasAberto}
            className="w-full border border-slate-200 rounded-2xl py-3 px-4 flex items-center justify-between text-[#3B42B2] font-semibold text-xs bg-white shadow-xs cursor-pointer hover:bg-slate-50 transition"
          >
            <span>{disciplinaSelecionada}</span>
            {modalDisciplinasAberto ? (
              <ChevronUp className="w-5 h-5 text-amber-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-amber-500" />
            )}
          </button>
        </div>

        {/* CALENDÁRIO SEMANAL */}
        <div className="pt-1 pb-2">
          <div className="flex items-center justify-between text-[#3B42B2] font-bold text-sm mb-3 px-2">
            <button 
              type="button"
              onClick={() => mudarMes(-1)} 
              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="capitalize">{formatarMesAno(dataAtual)}</span>
            <button 
              type="button"
              onClick={() => mudarMes(1)} 
              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center gap-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, idx) => (
              <span key={idx} className="text-[10px] font-bold text-slate-400">
                {dia}
              </span>
            ))}

            {[
              { dia: 24 },
              { dia: 25 },
              { dia: 26 },
              { dia: 27 },
              { dia: 28 },
              { dia: 29 },
              { dia: 30 }
            ].map((item, idx) => {
              const eSelecionado = item.dia === diaSelecionado;
              return (
                <div key={idx} className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setDiaSelecionado(item.dia)}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                      eSelecionado
                        ? 'bg-[#3B42B2] text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.dia}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* LISTA DE ATENDIMENTOS DA RECEPÇÃO */}
        <div className="space-y-4 pb-6">
          {carregando ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              Carregando agendamentos da recepção...
            </div>
          ) : (
            agendamentosAgrupados.map((grupo, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                
                {/* Cabeçalho da Disciplina */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs">
                      🦷
                    </div>
                    <h2 className="font-extrabold text-[#3B42B2] text-xs">
                      {grupo.disciplina}
                    </h2>
                  </div>

                  <span className="bg-indigo-50 text-[#3B42B2] text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {grupo.pacientes.length > 0 
                      ? `${grupo.pacientes.length} agendamento${grupo.pacientes.length > 1 ? 's' : ''}`
                      : 'Sem agendamentos'
                    }
                  </span>
                </div>

                {/* Pacientes Agendados pela Recepção */}
                {grupo.pacientes.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {grupo.pacientes.map((paciente) => (
                      <div key={paciente.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-slate-500 w-10">
                            {paciente.hora}
                          </span>

                          <div>
                            <h3 className="font-extrabold text-slate-800 text-xs">
                              {paciente.nome}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {paciente.procedimento}
                            </p>
                          </div>
                        </div>

                        {/* Menu de Ações */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAbertoId(menuAbertoId === paciente.id ? null : paciente.id);
                            }}
                            className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
                            aria-label={`Opções do atendimento de ${paciente.nome}`}
                          >
                            <MoreVertical className="w-5 h-5 text-[#3B42B2]" />
                          </button>

                          {menuAbertoId === paciente.id && (
                            <div 
                              className="absolute right-0 top-7 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  navigate(`/app/professor/atendimento/${paciente.id}`);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Ver atendimento
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  navigate(`/app/professor/pacientes/detalhes/${paciente.id}`);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Ver paciente
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium py-2 text-center">
                    Não há pacientes agendados para essa data.
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* 3. MODAL POPUP SELEÇÃO DE DISCIPLINAS */}
        {modalDisciplinasAberto && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => setModalDisciplinasAberto(false)}
          >
            <div 
              className="bg-white rounded-3xl w-full max-w-xs p-5 space-y-3 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-[#3B42B2] text-sm">
                  Selecione a disciplina
                </span>
                <ChevronUp className="w-5 h-5 text-amber-500" />
              </div>

              <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                {listaDisciplinas.map((item, idx) => {
                  const selecionado = disciplinaSelecionada === item;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDisciplinaSelecionada(item);
                        setModalDisciplinasAberto(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 font-bold text-xs">
                          🦷
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {item}
                        </span>
                      </div>

                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selecionado ? 'border-[#3B42B2] bg-[#3B42B2]' : 'border-slate-300'
                      }`}>
                        {selecionado && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}