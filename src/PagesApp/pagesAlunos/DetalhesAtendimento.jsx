import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Minus, Check, X, AlertTriangle } from 'lucide-react';
import api from '../../Services/api';

// Mapa entre o status real do backend (enum de "consulta") e os 4 passos visuais
const PASSO_POR_STATUS = {
  agendada: 0, confirmada: 0, aguardando: 0,
  em_atendimento: 1,
  realizada: 2,
  cancelada: 3, faltou: 3,
};

export default function DetalhesAtendimento() {
  const navigate = useNavigate();
  const location = useLocation();

  // O item vindo da AgendaAluno tem { id, hora, nome, procedimento, dadosOriginais }
  const consultaResumo = location.state?.paciente || {};
  const consultaRaw = consultaResumo.dadosOriginais || {};

  const [pacienteCompleto, setPacienteCompleto] = useState(null);
  const [alergias, setAlergias] = useState([]);
  const [statusAtual, setStatusAtual] = useState(PASSO_POR_STATUS[consultaRaw.status] ?? 0);

  useEffect(() => {
    if (consultaRaw.paciente_id) {
      api.get(`/pacientes/${consultaRaw.paciente_id}`).then((res) => setPacienteCompleto(res.data)).catch((err) => console.error(err));
      api.get(`/pacientes/${consultaRaw.paciente_id}/alergias`).then((res) => setAlergias(res.data)).catch((err) => console.error(err));
    }
  }, [consultaRaw.paciente_id]);

  const paciente = {
    nome: pacienteCompleto?.nome || consultaResumo.nome || 'Paciente',
    cpf: pacienteCompleto?.cpf || '',
    telefone: pacienteCompleto?.telefone || '',
    procedimento: consultaRaw.queixa_principal || consultaResumo.procedimento || 'Consulta',
  };

  const dataHoraObj = consultaRaw.data_hora ? new Date(consultaRaw.data_hora) : null;

  const listaStatus = [
    { id: 0, label: 'Agendado' },
    { id: 1, label: 'Em andamento' },
    { id: 2, label: 'Finalizado' },
    { id: 3, label: 'Cancelado' },
  ];

  // Atualiza o status real da consulta no backend ao clicar num passo
  const handleMudarStatus = async (novoStatusId) => {
    const statusPorPasso = ['agendada', 'em_atendimento', 'realizada', 'cancelada'];
    const novoStatus = statusPorPasso[novoStatusId];
    setStatusAtual(novoStatusId);
    if (consultaRaw.id) {
      try {
        await api.put(`/consultas/${consultaRaw.id}`, { status: novoStatus });
      } catch (err) {
        console.error('Erro ao atualizar status da consulta:', err);
      }
    }
  };

  // Checklist real de materiais previstos, persistido em consulta_material
  // (migration 010). Antes era uma lista fixa escrita aqui no código, que
  // não vinha do banco, não persistia e era igual pra toda consulta.
  const [materiais, setMateriais] = useState([]);
  const [carregandoMateriais, setCarregandoMateriais] = useState(true);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [buscaCatalogo, setBuscaCatalogo] = useState('');
  const [adicionando, setAdicionando] = useState(false);

  const carregarMateriais = () => {
    if (!consultaRaw.id) {
      setCarregandoMateriais(false);
      return;
    }
    setCarregandoMateriais(true);
    api.get(`/consultas/${consultaRaw.id}/materiais`)
      .then((res) => setMateriais(res.data))
      .catch((err) => console.error('Erro ao carregar materiais da consulta:', err))
      .finally(() => setCarregandoMateriais(false));
  };

  useEffect(() => {
    carregarMateriais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultaRaw.id]);

  const alterarQuantidade = async (vinculoId, delta) => {
    const item = materiais.find((m) => m.id === vinculoId);
    if (!item) return;
    const novaQtd = Math.max(0, item.quantidade + delta);

    setMateriais((prev) => prev.map((m) => (m.id === vinculoId ? { ...m, quantidade: novaQtd } : m)));
    try {
      await api.put(`/consultas/${consultaRaw.id}/materiais/${vinculoId}`, { quantidade: novaQtd });
    } catch (err) {
      console.error('Erro ao atualizar quantidade do material:', err);
      carregarMateriais();
    }
  };

  const removerMaterial = async (vinculoId) => {
    const anterior = materiais;
    setMateriais((prev) => prev.filter((m) => m.id !== vinculoId));
    try {
      await api.delete(`/consultas/${consultaRaw.id}/materiais/${vinculoId}`);
    } catch (err) {
      console.error('Erro ao remover material da consulta:', err);
      setMateriais(anterior);
    }
  };

  const abrirPicker = () => {
    setMostrarPicker(true);
    if (catalogo.length === 0) {
      api.get('/materiais')
        .then((res) => setCatalogo(res.data))
        .catch((err) => console.error('Erro ao carregar catálogo de materiais:', err));
    }
  };

  const adicionarMaterial = async (materialId) => {
    setAdicionando(true);
    try {
      const { data: vinculo } = await api.post(`/consultas/${consultaRaw.id}/materiais`, {
        material_id: materialId,
        quantidade: 1,
      });
      setMateriais((prev) => [...prev, vinculo]);
    } catch (err) {
      console.error('Erro ao adicionar material à consulta:', err);
      alert(err.response?.data?.message || 'Não foi possível adicionar o material.');
    } finally {
      setAdicionando(false);
    }
  };

  const idsJaVinculados = new Set(materiais.map((m) => m.material_id));
  const catalogoFiltrado = catalogo.filter((m) =>
    !idsJaVinculados.has(m.id) &&
    (m.nome || '').toLowerCase().includes(buscaCatalogo.toLowerCase().trim())
  );

  // Calcula a porcentagem de preenchimento da barra de progresso
  const calcularLarguraProgresso = () => {
    if (statusAtual === 3) return '100%'; // Cancelado
    if (statusAtual === 0) return '0%';
    const totalEtapasNormais = 2; // Agendado (0) -> Em andamento (1) -> Finalizado (2)
    return `${(Math.min(statusAtual, totalEtapasNormais) / totalEtapasNormais) * 100}%`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans">
      
      {/* TOPO FIXO AZUL */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center relative z-10 shrink-0 rounded-b-[24px] shadow-md select-none">
        <button 
          onClick={() => navigate('/app/aluno/agenda')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 absolute left-5 cursor-pointer"
          aria-label="Voltar para agenda"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-bold tracking-wide mx-auto">Detalhes do atendimento</h1>
      </div>

      {/* CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">
        
        {/* CARD DO PACIENTE */}
        <div
          onClick={() => navigate('/app/aluno/pacientes/detalhes', {
            // O objeto `paciente` montado nesta tela não tem id — sem ele a
            // tela de destino não conseguia carregar nada. Usa o id que veio
            // na própria consulta.
            state: { paciente: pacienteCompleto || { id: consultaRaw.paciente_id, nome: paciente.nome } },
          })}
          className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-xs bg-white cursor-pointer hover:bg-gray-50/50 transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden text-gray-400 shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 8a7 7 0 0114 0H5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-950 text-sm">{paciente.nome}</h3>
                <span className="bg-[#D1E7DD] text-[#0f5132] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Ativo
                </span>
              </div>
              <p className="text-gray-400 text-[11px] font-medium mt-0.5">{paciente.cpf}</p>
              <p className="text-gray-400 text-[11px] font-medium">{paciente.telefone}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#3B44A8]" />
        </div>

        {/* DETALHES DO ATENDIMENTO */}
        <div className="space-y-2">
          <h2 className="text-[#3B44A8] font-black text-xs px-1">Detalhes do atendimento</h2>
          
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-3.5">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Data</span>
                <span className="block text-gray-500 font-bold text-[11px] mt-0.5">{dataHoraObj ? dataHoraObj.toLocaleDateString('pt-BR') : '-'}</span>
              </div>
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Horário</span>
                <span className="block text-gray-500 font-bold text-[11px] mt-0.5">{dataHoraObj ? dataHoraObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
              </div>
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Status</span>
                <span className="block text-gray-500 font-bold text-[11px] mt-0.5 capitalize">{consultaRaw.status || '-'}</span>
              </div>
            </div>

            <div>
              <span className="block text-gray-950 font-black text-[11px]">Procedimento</span>
              <span className="block text-gray-500 font-bold text-[11px] mt-0.5">{paciente.procedimento}</span>
            </div>

            {consultaRaw.observacoes && (
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Observações da consulta</span>
                <span className="block text-gray-500 font-bold text-[11px] mt-0.5">{consultaRaw.observacoes}</span>
              </div>
            )}

            {alergias.length > 0 && (
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Alergias do paciente</span>
                {alergias.map((a) => (
                  <p key={a.id} className="text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 text-[11px] font-semibold mt-1 leading-relaxed flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                    {a.substancia} {a.gravidade && `(${a.gravidade})`}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MATERIAIS PREVISTOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[#3B44A8] font-black text-xs">Materiais previstos</h2>
            <button
              type="button"
              onClick={abrirPicker}
              className="text-[#3B44A8] font-bold text-[10px] hover:underline cursor-pointer"
            >
              + Adicionar materiais
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {carregandoMateriais ? (
              <div className="p-4 text-center text-gray-400 text-[11px]">Carregando materiais...</div>
            ) : materiais.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-[11px]">
                Nenhum material vinculado a este atendimento ainda.
              </div>
            ) : (
              materiais.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg border border-gray-100 bg-gray-50 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-950 text-xs truncate">{item.material_nome}</h4>
                      <p className="text-gray-400 text-[9px] font-medium">{item.unidade_medida || ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* CONTADOR DE QUANTIDADE */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => alterarQuantidade(item.id, -1)}
                        className="p-1.5 px-2.5 text-gray-500 hover:bg-gray-50 transition active:bg-gray-100 cursor-pointer"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={11} className="stroke-[3px]" />
                      </button>
                      <span className="px-2 text-xs font-black text-gray-950 min-w-[20px] text-center select-none">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => alterarQuantidade(item.id, 1)}
                        className="p-1.5 px-2.5 text-gray-500 hover:bg-gray-50 transition active:bg-gray-100 cursor-pointer"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={11} className="stroke-[3px]" />
                      </button>
                    </div>
                    <button
                      onClick={() => removerMaterial(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition active:scale-90 cursor-pointer"
                      aria-label="Remover material"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PICKER DE MATERIAIS (adicionar ao checklist) */}
        {mostrarPicker && (
          <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setMostrarPicker(false)}>
            <div
              className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-3 max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[#3B44A8] font-black text-xs">Adicionar material</h3>
                <button type="button" onClick={() => setMostrarPicker(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Buscar material..."
                value={buscaCatalogo}
                onChange={(e) => setBuscaCatalogo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#3B44A8]"
              />
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {catalogoFiltrado.length === 0 ? (
                  <p className="text-center text-gray-400 text-[11px] py-4">Nenhum material disponível encontrado.</p>
                ) : (
                  catalogoFiltrado.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={adicionando}
                      onClick={() => adicionarMaterial(m.id)}
                      className="w-full text-left py-2.5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                    >
                      <span className="text-xs font-bold text-gray-800">{m.nome}</span>
                      <Plus size={16} className="text-[#3B44A8]" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* STATUS DO ATENDIMENTO (INTERATIVO E DINÂMICO) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-[#3B44A8] font-black text-xs px-1">Status do Atendimento</h2>
          
          <div className="relative flex items-start justify-between px-2 select-none">
            {/* Linha base cinza */}
            <div className="absolute left-6 right-6 top-[13px] h-[2px] bg-gray-200 -z-10"></div>
            
            {/* Linha de progresso verde/vermelha */}
            <div 
              className={`absolute left-6 top-[13px] h-[2px] transition-all duration-300 -z-10 ${
                statusAtual === 3 ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `calc(${calcularLarguraProgresso()} - 24px)` }}
            ></div>

            {/* Renderização dos Passos */}
            {listaStatus.map((step) => {
              const isAtual = step.id === statusAtual;
              const isAnterior = step.id < statusAtual && statusAtual !== 3;
              const isCancelado = statusAtual === 3 && step.id === 3;

              return (
                <div 
                  key={step.id} 
                  onClick={() => handleMudarStatus(step.id)}
                  className="flex flex-col items-center text-center cursor-pointer group w-16"
                >
                  {/* Círculo do Status */}
                  <div 
                    className={`w-7 h-7 rounded-full border-4 border-white shadow-xs flex items-center justify-center text-white transition-all duration-300 active:scale-90 ${
                      isCancelado
                        ? 'bg-red-500 scale-110'
                        : isAtual 
                        ? 'bg-amber-500 scale-110' 
                        : isAnterior 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-200 group-hover:bg-gray-300'
                    }`}
                  >
                    {isCancelado ? (
                      <X size={14} className="stroke-[3px]" />
                    ) : isAnterior ? (
                      <Check size={12} className="stroke-[3px]" />
                    ) : isAtual ? (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    ) : null}
                  </div>

                  {/* Nome do Status */}
                  <span className={`text-[9px] mt-1.5 leading-tight transition-colors ${
                    isCancelado
                      ? 'font-black text-red-600'
                      : isAtual 
                      ? 'font-black text-amber-600' 
                      : isAnterior 
                      ? 'font-black text-emerald-600' 
                      : 'font-bold text-gray-400'
                  }`}>
                    {step.label}
                  </span>

                  {/* Horário (se houver) */}
                  {step.hora && (
                    <span className="text-[7.5px] text-gray-400 font-bold mt-0.5 leading-none whitespace-pre-line">
                      {step.hora}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RODAPÉ FIXO DE AÇÕES */}
      <div className="p-4 border-t border-gray-100 bg-white flex gap-3 shrink-0 shadow-lg">
        <button 
          onClick={() => navigate('/app/aluno/agenda')}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition active:scale-[0.98] cursor-pointer"
        >
          Voltar
        </button>
        <button
          onClick={() => navigate('/app/aluno/agenda')}
          className="flex-1 py-3 bg-[#3B44A8] text-white rounded-xl font-bold text-xs hover:bg-[#30388d] transition active:scale-[0.98] shadow-sm cursor-pointer"
        >
          Concluir
        </button>
      </div>

    </div>
  );
}