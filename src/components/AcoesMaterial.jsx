import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, SquarePen, Trash2, X, Loader2 } from 'lucide-react';
import api from '../Services/api';
import { useAuth } from '../context/AuthContext';

// Ações que faltavam na tela de detalhes do material. O backend já tinha
// todos estes endpoints, mas não havia botão nenhum para eles — por isso
// um material cadastrado com quantidade errada ficava travado assim para
// sempre, sem jeito de corrigir nem de dar entrada no estoque.
//
//   Entrada/Saída → POST /movimentacoes   (professor e aluno)
//   Editar        → PUT  /materiais/:id   (professor e aluno)
//   Excluir       → DELETE /materiais/:id (só professor)
export default function AcoesMaterial({ material, aoAtualizar }) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const ehProfessor = usuario?.perfil === 'professor';

  const [modal, setModal] = useState(null); // 'entrada' | 'saida' | 'editar' | 'excluir'
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Movimentação
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');

  // Edição
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (modal === 'editar') {
      setForm({
        nome: material.nome || '',
        codigo_barras: material.codigo_barras || '',
        categoria_id: material.categoria_id || '',
        unidade_medida: material.unidade_medida || 'un',
        estoque_minimo: material.estoque_minimo ?? 0,
        estoque_ideal: material.estoque_ideal ?? '',
        fabricante: material.fabricante || '',
        lote: material.lote || '',
        registro_anvisa: material.registro_anvisa || '',
        validade: material.validade ? String(material.validade).slice(0, 10) : '',
        descricao: material.descricao || '',
      });
      if (categorias.length === 0) {
        api.get('/categorias').then((r) => setCategorias(r.data)).catch(() => {});
      }
    }
    setErro('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  const fechar = () => { setModal(null); setQuantidade(''); setObservacao(''); setErro(''); };

  const registrarMovimentacao = async (tipo) => {
    const qtd = Number(quantidade);
    if (!qtd || qtd <= 0) { setErro('Informe uma quantidade maior que zero.'); return; }
    if (tipo === 'saida' && qtd > material.quantidade) {
      setErro(`Estoque insuficiente: disponível ${material.quantidade}.`);
      return;
    }
    setSalvando(true); setErro('');
    try {
      await api.post('/movimentacoes', {
        material_id: material.id, tipo, quantidade: qtd,
        observacao: observacao || undefined,
      });
      fechar();
      aoAtualizar?.();
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível registrar a movimentação.');
    } finally { setSalvando(false); }
  };

  const salvarEdicao = async () => {
    if (!form.nome?.trim()) { setErro('O nome é obrigatório.'); return; }
    setSalvando(true); setErro('');
    try {
      await api.put(`/materiais/${material.id}`, {
        ...form,
        categoria_id: Number(form.categoria_id),
        estoque_minimo: Number(form.estoque_minimo),
        estoque_ideal: form.estoque_ideal === '' ? null : Number(form.estoque_ideal),
        validade: form.validade || null,
      });
      fechar();
      aoAtualizar?.();
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível salvar as alterações.');
    } finally { setSalvando(false); }
  };

  const excluir = async () => {
    setSalvando(true); setErro('');
    try {
      await api.delete(`/materiais/${material.id}`);
      navigate(-1);
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível excluir o material.');
      setSalvando(false);
    }
  };

  const campo = (chave, rotulo, tipo = 'text') => (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-gray-600">{rotulo}</label>
      <input
        type={tipo}
        value={form[chave] ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [chave]: e.target.value }))}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8]"
      />
    </div>
  );

  return (
    <>
      {/* BARRA DE AÇÕES */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setModal('entrada')}
          className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition active:scale-[0.98] shadow-sm"
        >
          <ArrowUpCircle size={16} /> Registrar entrada
        </button>
        <button
          type="button"
          onClick={() => setModal('saida')}
          className="flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition active:scale-[0.98] shadow-sm"
        >
          <ArrowDownCircle size={16} /> Registrar saída
        </button>
        <button
          type="button"
          onClick={() => setModal('editar')}
          className={`flex items-center justify-center gap-2 py-3 bg-[#3B44A8] hover:bg-[#30388d] text-white rounded-xl font-bold text-xs transition active:scale-[0.98] shadow-sm ${ehProfessor ? '' : 'col-span-2'}`}
        >
          <SquarePen size={16} /> Editar material
        </button>
        {ehProfessor && (
          <button
            type="button"
            onClick={() => setModal('excluir')}
            className="flex items-center justify-center gap-2 py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition active:scale-[0.98]"
          >
            <Trash2 size={16} /> Excluir
          </button>
        )}
      </div>

      {/* MODAIS */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => !salvando && fechar()}>
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[#3B44A8] font-black text-sm">
                {modal === 'entrada' && 'Registrar entrada'}
                {modal === 'saida' && 'Registrar saída'}
                {modal === 'editar' && 'Editar material'}
                {modal === 'excluir' && 'Excluir material'}
              </h3>
              <button type="button" onClick={fechar} disabled={salvando} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {erro && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-xl font-semibold">
                {erro}
              </div>
            )}

            {(modal === 'entrada' || modal === 'saida') && (
              <>
                <p className="text-[11px] text-gray-500 font-medium">
                  Estoque atual: <strong className="text-gray-800">{material.quantidade}</strong> {material.unidade_medida || 'un'}
                </p>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Quantidade</label>
                  <input
                    type="number" min="1" autoFocus
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Observação (opcional)</label>
                  <input
                    type="text"
                    placeholder={modal === 'entrada' ? 'Ex.: compra, doação' : 'Ex.: uso em atendimento'}
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8]"
                  />
                </div>
                <button
                  type="button" disabled={salvando}
                  onClick={() => registrarMovimentacao(modal)}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-white transition active:scale-[0.98] disabled:opacity-50 ${modal === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                >
                  {salvando ? 'Registrando...' : `Confirmar ${modal}`}
                </button>
              </>
            )}

            {modal === 'editar' && (
              <>
                {campo('nome', 'Nome do produto')}
                {campo('codigo_barras', 'Código de barras')}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Categoria</label>
                  <select
                    value={form.categoria_id ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8]"
                  >
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {campo('estoque_minimo', 'Estoque mínimo', 'number')}
                  {campo('estoque_ideal', 'Estoque ideal', 'number')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {campo('lote', 'Lote')}
                  {campo('registro_anvisa', 'Registro ANVISA')}
                </div>
                {campo('fabricante', 'Fabricante')}
                {campo('validade', 'Validade', 'date')}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Descrição</label>
                  <textarea
                    rows={2}
                    value={form.descricao ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8] resize-none"
                  />
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  A quantidade em estoque não se edita aqui: use "Registrar entrada"
                  ou "Registrar saída" para que o histórico fique correto.
                </p>
                <button
                  type="button" disabled={salvando} onClick={salvarEdicao}
                  className="w-full py-3 bg-[#3B44A8] text-white rounded-xl font-bold text-xs transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {salvando && <Loader2 size={14} className="animate-spin" />}
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </>
            )}

            {modal === 'excluir' && (
              <>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Excluir <strong>{material.nome}</strong> em definitivo? O histórico de
                  movimentações desse material também deixa de ficar acessível.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={fechar} disabled={salvando}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs">
                    Cancelar
                  </button>
                  <button type="button" onClick={excluir} disabled={salvando}
                    className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold text-xs disabled:opacity-50">
                    {salvando ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
