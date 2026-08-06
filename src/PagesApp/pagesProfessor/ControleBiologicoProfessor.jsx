import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import api from '../../Services/api';

const AutoclaveIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="5" y="9" width="14" height="11" rx="2" />
    <path d="M7 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    <circle cx="10" cy="5" r="2" />
    <path d="M10 5l1 -1" />
    <path d="M5 13H3" />
    <path d="M21 13h-2" />
    <circle cx="9" cy="16" r="1.5" />
    <circle cx="15" cy="16" r="1.5" />
  </svg>
);

const TIPO_LABEL = { bowie_dick: 'Bowie-Dick', biologico: 'Biológico', quimico: 'Químico' };

// Interpretação de domínio: em um indicador biológico, "aprovado" significa que o
// esporo-teste não cresceu (ciclo eficaz) e "reprovado" significa contaminação.
// "pendente" é o teste ainda em incubação/aguardando leitura.
function statusVisual(resultado) {
  switch (resultado) {
    case 'aprovado':
      return { label: 'Negativo', badge: 'bg-[#B8D8B2] text-emerald-800' };
    case 'reprovado':
      return { label: 'Não Conforme', badge: 'bg-red-100 text-red-700' };
    default:
      return { label: 'Em incubação', badge: 'bg-[#C5CBE9] text-[#3B42B2]' };
  }
}

export default function ControleBiologicoProfessor() {
  const navigate = useNavigate();
  const [listaControle, setListaControle] = useState([]);
  const [ciclos, setCiclos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Campos do formulário de novo teste
  const [esterilizacaoId, setEsterilizacaoId] = useState('');
  const [tipo, setTipo] = useState('biologico');
  const [loteIndicador, setLoteIndicador] = useState('');
  const [observacao, setObservacao] = useState('');
  // Lançamento do resultado do teste. O backend tinha PUT nesse recurso
  // desde sempre, mas a tela só mostrava o selo de status — o teste nascia
  // "pendente" e não havia como marcar aprovado/reprovado, então o alerta
  // de falha do CME nunca chegava a disparar.
  const [lancandoResultado, setLancandoResultado] = useState(null);

  const carregarControles = () => {
    setCarregando(true);
    api.get('/esterilizacoes')
      .then(async (res) => {
        const listaCiclos = res.data;
        setCiclos(listaCiclos);

        const resultados = await Promise.all(
          listaCiclos.map((c) =>
            api.get(`/esterilizacoes/${c.id}/controles`)
              .then((r) => r.data.map((ctrl) => ({ ...ctrl, ciclo: c })))
              .catch(() => [])
          )
        );

        setListaControle(resultados.flat().sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)));
      })
      .catch((err) => console.error('Erro ao carregar controle biológico:', err))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarControles();
  }, []);

  // Cálculos dinâmicos para as métricas da interface
  const lancarResultado = async (item, resultado) => {
    setLancandoResultado(item.id);
    try {
      await api.put(`/esterilizacoes/${item.esterilizacao_id}/controles/${item.id}`, { resultado });
      setListaControle((atuais) =>
        atuais.map((c) => (c.id === item.id ? { ...c, resultado } : c))
      );
    } catch (err) {
      console.error('Erro ao lançar resultado do controle biológico:', err);
      setErro(err.response?.data?.message || 'Não foi possível lançar o resultado.');
    } finally {
      setLancandoResultado(null);
    }
  };

  const totalIncubacao = listaControle.filter((item) => !item.resultado || item.resultado === 'pendente').length;
  const totalNegativos = listaControle.filter((item) => item.resultado === 'aprovado').length;
  const totalNaoConformes = listaControle.filter((item) => item.resultado === 'reprovado').length;

  const handleAbrirModal = () => {
    setErro('');
    setEsterilizacaoId(ciclos[0]?.id || '');
    setTipo('biologico');
    setLoteIndicador('');
    setObservacao('');
    setModalAberto(true);
  };

  const handleSalvarTeste = async (e) => {
    e.preventDefault();
    if (!esterilizacaoId) {
      setErro('Selecione um ciclo de esterilização.');
      return;
    }

    setSalvando(true);
    setErro('');
    try {
      await api.post(`/esterilizacoes/${esterilizacaoId}/controles`, {
        tipo,
        lote_indicador: loteIndicador || undefined,
        observacao: observacao || undefined,
      });
      setModalAberto(false);
      carregarControles();
    } catch (err) {
      console.error('Erro ao registrar teste de controle biológico:', err);
      setErro(err.response?.data?.message || 'Falha ao registrar o teste. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#3B42B2] text-white flex flex-col font-sans m-0 p-0 overflow-hidden relative">

      {/* HEADER / TOPO */}
      <div className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          Controle Biológico
        </h1>

        <button
          onClick={handleAbrirModal}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer active:scale-95 text-white flex items-center justify-center"
          title="Novo Teste"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* CARD PRINCIPAL BRANCO COM SCROLL */}
      <div className="bg-white text-slate-800 rounded-t-[32px] px-5 pt-6 pb-20 flex-1 overflow-y-auto flex flex-col space-y-6 shadow-inner relative">

        {/* CARDS DE RESUMO (KPIs) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-slate-900 mb-0.5">Em incubação</span>
            <span className="text-3xl font-black text-[#3B42B2] leading-none mb-1">
              {totalIncubacao}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Testes</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-slate-900 mb-0.5">Negativos</span>
            <span className="text-3xl font-black text-[#3B42B2] leading-none mb-1">
              {totalNegativos}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Testes</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-slate-900 mb-0.5">Não conformes</span>
            <span className="text-3xl font-black text-red-600 leading-none mb-1">
              {totalNaoConformes}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Teste</span>
          </div>
        </div>

        {/* LISTA DE TESTES BIOLÓGICOS */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs overflow-hidden divide-y divide-slate-100">
          {carregando ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold">Carregando testes...</div>
          ) : listaControle.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold">
              Nenhum registro de controle biológico encontrado.
            </div>
          ) : (
            listaControle.map((item) => {
              const visual = statusVisual(item.resultado);
              return (
                <div key={item.id} className="p-4 flex gap-3 hover:bg-slate-50/50 transition">

                  {/* Ícone */}
                  <div className="shrink-0 mt-1">
                    <AutoclaveIcon className="w-8 h-8 text-[#3B42B2]" />
                  </div>

                  {/* Informações */}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-[#3B42B2] text-sm">
                      {item.ciclo?.equipamento || `Ciclo ${item.esterilizacao_id}`} • {TIPO_LABEL[item.tipo] || item.tipo}
                    </h4>

                    <p className="text-[10px] text-slate-500 font-medium">
                      {item.data_teste ? new Date(item.data_teste).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : (item.criado_em ? new Date(item.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '')}
                    </p>

                    {item.lote_indicador && (
                      <p className="text-[10px] text-slate-700 font-bold mt-1">
                        Lote: <span className="font-medium text-slate-500">{item.lote_indicador}</span>
                      </p>
                    )}

                    {item.testado_por_nome && (
                      <p className="text-[10px] text-slate-700 font-bold">
                        Testado por: <span className="font-medium text-slate-500">{item.testado_por_nome}</span>
                      </p>
                    )}
                  </div>

                  {/* Badge de Status + lançamento do resultado */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${visual.badge}`}>
                      {visual.label}
                    </span>

                    {(!item.resultado || item.resultado === 'pendente') && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={lancandoResultado === item.id}
                          onClick={() => lancarResultado(item, 'aprovado')}
                          className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition active:scale-95 disabled:opacity-40"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          disabled={lancandoResultado === item.id}
                          onClick={() => lancarResultado(item, 'reprovado')}
                          className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition active:scale-95 disabled:opacity-40"
                        >
                          Reprovar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* MODAL: NOVO TESTE */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-[#3B42B2] text-sm">Novo teste de controle biológico</h3>
              <button type="button" onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarTeste} className="space-y-3">
              {erro && (
                <p className="text-red-500 text-[11px] font-bold">{erro}</p>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ciclo de esterilização</label>
                <select
                  value={esterilizacaoId}
                  onChange={(e) => setEsterilizacaoId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3B42B2]"
                  required
                >
                  <option value="" disabled>Selecione</option>
                  {ciclos.map((c) => (
                    <option key={c.id} value={c.id}>
                      Ciclo #{c.id} — {c.equipamento || 'Equipamento não informado'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de teste</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3B42B2]"
                  required
                >
                  <option value="biologico">Biológico</option>
                  <option value="bowie_dick">Bowie-Dick</option>
                  <option value="quimico">Químico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lote do indicador</label>
                <input
                  type="text"
                  value={loteIndicador}
                  onChange={(e) => setLoteIndicador(e.target.value)}
                  placeholder="Ex: LT-2026-045"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3B42B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Observação</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3B42B2] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#3B42B2] rounded-xl hover:bg-[#31388d] flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {salvando && <Loader2 size={14} className="animate-spin" />}
                  {salvando ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
