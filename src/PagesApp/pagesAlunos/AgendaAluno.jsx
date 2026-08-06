import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Loader2,
  AlertCircle,
  CalendarX
} from 'lucide-react';
import api from '../../Services/api';

export default function AgendaAluno() {
  const navigate = useNavigate();

  // Estados da API e UI
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados dos Modais / Dropdowns
  const [modalDisciplinasAberto, setModalDisciplinasAberto] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('Todas as disciplinas');
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  // Estados de Data
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  // Lista de Disciplinas disponíveis para filtro
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

  // Helper para formatar data local no padrão YYYY-MM-DD
  const formatarDataIso = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // Busca os agendamentos da API filtrados pela data selecionada
  const carregarAgendamentos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');
      const dataFormatada = formatarDataIso(dataSelecionada);

      // Chamada API (Ajuste o endpoint se necessário, ex: /agendamentos/aluno ou com params)
      const resposta = await api.get('/agendamentos', {
        params: { data: dataFormatada }
      });

      const dados = resposta.data || [];

      // Se a API retornar a lista crua de agendamentos, agrupamos por disciplina
      if (Array.isArray(dados)) {
        const agrupado = dados.reduce((acc, item) => {
          const nomeDisciplina = item.disciplina || item.disciplinaNome || 'Geral';
          let grupo = acc.find((g) => g.disciplina === nomeDisciplina);

          if (!grupo) {
            grupo = { disciplina: nomeDisciplina, pacientes: [] };
            acc.push(grupo);
          }

          grupo.pacientes.push({
            id: item.id || item._id,
            hora: item.hora || item.horario || '00:00',
            nome: item.pacienteNome || item.paciente?.nome || 'Paciente sem nome',
            procedimento: item.procedimento || item.tipoProcedimento || 'Consulta',
            dadosOriginais: item
          });

          return acc;
        }, []);

        setAgendamentos(agrupado);
      } else {
        setAgendamentos([]);
      }
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setErro('Falha ao carregar agendamentos do dia.');
    } finally {
      setCarregando(false);
    }
  }, [dataSelecionada]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  // --- LÓGICA DE NAVEGAÇÃO DA SEMANA ---
  const getInicioSemana = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const inicioSemanaAtual = getInicioSemana(dataSelecionada);

  const diasDaSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemanaAtual);
    d.setDate(d.getDate() + i);
    return d;
  });

  const semanaAnterior = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setDate(novaData.getDate() - 7);
    setDataSelecionada(novaData);
  };

  const proximaSemana = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setDate(novaData.getDate() + 7);
    setDataSelecionada(novaData);
  };

  const mesAnoFormatado = inicioSemanaAtual.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const isMesmoDia = (d1, d2) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const agendamentosFiltrados = agendamentos.filter((grupo) => {
    if (disciplinaSelecionada === 'Todas as disciplinas') return true;
    return grupo.disciplina.toLowerCase() === disciplinaSelecionada.toLowerCase();
  });

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
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          Agenda de Atendimentos
        </h1>

        <div className="w-9" />
      </div>

      {/* 2. CARD PRINCIPAL BRANCO */}
      <div className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-5 pb-6 flex-1 overflow-y-auto flex flex-col space-y-4 shadow-inner relative">
        
        {/* BOTÃO SELECT DE DISCIPLINAS */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalDisciplinasAberto(!modalDisciplinasAberto);
            }}
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

        {/* CALENDÁRIO SEMANAL DINÂMICO */}
        <div className="pt-1 pb-2">
          <div className="flex items-center justify-between text-[#3B42B2] font-bold text-sm mb-3 px-2 capitalize">
            <button 
              onClick={semanaAnterior}
              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer active:scale-95 text-[#3B42B2]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span>{mesAnoFormatado}</span>

            <button 
              onClick={proximaSemana}
              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer active:scale-95 text-[#3B42B2]"
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

            {diasDaSemana.map((dataItem, idx) => {
              const ativo = isMesmoDia(dataItem, dataSelecionada);
              return (
                <div key={idx} className="flex justify-center pt-1">
                  <button
                    onClick={() => setDataSelecionada(dataItem)}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                      ativo
                        ? 'bg-[#3B42B2] text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {dataItem.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* LISTA DE ATENDIMENTOS OU ESTADOS DE FEEDBACK */}
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#3B42B2]" />
            <p className="text-xs font-semibold">Carregando compromissos...</p>
          </div>
        ) : erro ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{erro}</span>
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
            <CalendarX className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-500">Sem agendamentos nesta data</p>
            <p className="text-[11px] text-slate-400">Tente selecionar outro dia no calendário.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {agendamentosFiltrados.map((grupo, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs">
                      🦷
                    </div>
                    <h3 className="font-extrabold text-[#3B42B2] text-xs">
                      {grupo.disciplina}
                    </h3>
                  </div>

                  <span className="bg-indigo-50 text-[#3B42B2] text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {grupo.pacientes.length > 0 
                      ? `${grupo.pacientes.length} agendamento${grupo.pacientes.length > 1 ? 's' : ''}`
                      : 'Sem agendamentos'
                    }
                  </span>
                </div>

                {grupo.pacientes.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {grupo.pacientes.map((paciente) => (
                      <div key={paciente.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold text-slate-500 w-10">
                            {paciente.hora}
                          </span>

                          <div>
                            <h4 className="font-extrabold text-slate-800 text-xs">
                              {paciente.nome}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {paciente.procedimento}
                            </p>
                          </div>
                        </div>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAbertoId(menuAbertoId === paciente.id ? null : paciente.id);
                            }}
                            className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
                          >
                            <MoreVertical className="w-5 h-5 text-[#3B42B2]" />
                          </button>

                          {menuAbertoId === paciente.id && (
                            <div 
                              className="absolute right-0 top-7 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  navigate('/app/aluno/agenda/detalhes', { state: { paciente } });
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Ver atendimento
                              </button>
                              <button
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  navigate('/app/aluno/pacientes/detalhes', { state: { paciente } });
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
            ))}
          </div>
        )}

        {/* 3. MODAL POPUP SELEÇÃO DE DISCIPLINAS */}
        {modalDisciplinasAberto && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
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