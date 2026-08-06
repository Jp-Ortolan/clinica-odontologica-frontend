import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2, Package, Plus, X } from 'lucide-react';
import api from '../../Services/api';

// Abertura de ciclo de esterilização (CME) e montagem dos pacotes.
//
// O backend tinha POST /esterilizacoes e POST /esterilizacoes/:id/pacotes,
// mas o app só sabia listar ciclos já existentes — não havia como registrar
// um ciclo novo nem colocar material dentro dele.
// Valores exatamente como o backend valida em esterilizacaoService.js —
// chutar rótulos "bonitos" aqui faria o POST voltar 400.
const TIPOS_CICLO = [
  { valor: 'vapor', rotulo: 'Vapor (autoclave)' },
  { valor: 'calor_seco', rotulo: 'Calor seco (estufa)' },
  { valor: 'plasma', rotulo: 'Plasma' },
];
const STATUS_CICLO = [
  { valor: 'pendente', rotulo: 'Pendente' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'concluido', rotulo: 'Concluído' },
  { valor: 'falhou', rotulo: 'Falhou' },
];

export default function NovoCicloCme() {
  const navigate = useNavigate();
  const location = useLocation();
  const cicloEdicao = location.state?.ciclo || null;
  const editando = Boolean(cicloEdicao?.id);

  const [equipamento, setEquipamento] = useState('');
  const [tipoCiclo, setTipoCiclo] = useState('vapor');
  const [temperatura, setTemperatura] = useState('');
  const [pressao, setPressao] = useState('');
  const [duracao, setDuracao] = useState('');
  const [status, setStatus] = useState('em_andamento');
  const [controleBiologico, setControleBiologico] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  // Pacotes do ciclo
  const [materiais, setMateriais] = useState([]);
  const [pacotes, setPacotes] = useState([]);
  const [materialSelecionado, setMaterialSelecionado] = useState('');
  const [validadePacote, setValidadePacote] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/materiais').then((r) => setMateriais(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cicloEdicao) return;
    setEquipamento(cicloEdicao.equipamento || '');
    setTipoCiclo(cicloEdicao.tipo_ciclo || 'vapor');
    setTemperatura(cicloEdicao.temperatura ?? '');
    setPressao(cicloEdicao.pressao ?? '');
    setDuracao(cicloEdicao.duracao_minutos ?? '');
    setStatus(cicloEdicao.status || 'em_andamento');
    setControleBiologico(Boolean(cicloEdicao.controle_biologico));
    setObservacoes(cicloEdicao.observacoes || '');
    api.get(`/esterilizacoes/${cicloEdicao.id}/pacotes`)
      .then((r) => setPacotes(r.data))
      .catch(() => {});
  }, [cicloEdicao]);

  const adicionarPacote = async (cicloId) => {
    if (!materialSelecionado) return;
    try {
      const { data } = await api.post(`/esterilizacoes/${cicloId}/pacotes`, {
        material_id: Number(materialSelecionado),
        validade: validadePacote || undefined,
      });
      setPacotes((atuais) => [...atuais, data]);
      setMaterialSelecionado('');
      setValidadePacote('');
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível adicionar o pacote.');
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const payload = {
        equipamento: equipamento || undefined,
        tipo_ciclo: tipoCiclo,
        temperatura: temperatura === '' ? undefined : Number(temperatura),
        pressao: pressao === '' ? undefined : Number(pressao),
        duracao_minutos: duracao === '' ? undefined : Number(duracao),
        status,
        controle_biologico: controleBiologico,
        observacoes: observacoes || undefined,
      };

      if (editando) {
        await api.put(`/esterilizacoes/${cicloEdicao.id}`, payload);
      } else {
        const { data } = await api.post('/esterilizacoes', payload);
        if (materialSelecionado) await adicionarPacote(data.id);
      }
      navigate('/app/professor/cme');
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível salvar o ciclo.');
    } finally {
      setSalvando(false);
    }
  };

  const cls = 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-sm transition';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button type="button" onClick={() => navigate('/app/professor/cme')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95" aria-label="Voltar">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold tracking-wide flex-1 text-center px-2 leading-tight">
          {editando ? 'Editar ciclo' : 'Novo ciclo CME'}
        </h1>
        <div className="w-6" />
      </div>

      <form onSubmit={salvar} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-24">
        {erro && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle size={18} className="shrink-0" /> <span>{erro}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Equipamento</label>
            <input type="text" placeholder="Ex.: Autoclave 01" value={equipamento}
              onChange={(e) => setEquipamento(e.target.value)} className={cls} />
          </div>
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Tipo de ciclo</label>
            <select value={tipoCiclo} onChange={(e) => setTipoCiclo(e.target.value)} className={cls}>
              {TIPOS_CICLO.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Temperatura (°C)</label>
            <input type="number" step="0.1" placeholder="134" value={temperatura}
              onChange={(e) => setTemperatura(e.target.value)} className={cls} />
          </div>
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Pressão</label>
            <input type="number" step="0.1" placeholder="2.2" value={pressao}
              onChange={(e) => setPressao(e.target.value)} className={cls} />
          </div>
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Duração (min)</label>
            <input type="number" placeholder="30" value={duracao}
              onChange={(e) => setDuracao(e.target.value)} className={cls} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Status do ciclo</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={cls}>
            {STATUS_CICLO.map((st) => (
              <option key={st.valor} value={st.valor}>{st.rotulo}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
          <input type="checkbox" checked={controleBiologico}
            onChange={(e) => setControleBiologico(e.target.checked)}
            className="w-4 h-4 accent-[#3B44A8]" />
          <span className="text-gray-700 text-xs font-bold">Ciclo com controle biológico</span>
        </label>

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Observações</label>
          <textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
            className={`${cls} resize-none`} />
        </div>

        {/* PACOTES DO CICLO */}
        <div className="space-y-2 pt-2">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide flex items-center gap-1.5">
            <Package size={15} /> Pacotes do ciclo
          </h2>

          <div className="flex gap-2">
            <select value={materialSelecionado} onChange={(e) => setMaterialSelecionado(e.target.value)}
              className={`${cls} flex-1`}>
              <option value="">Selecione o material</option>
              {materiais.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <input type="date" value={validadePacote} onChange={(e) => setValidadePacote(e.target.value)}
              className={`${cls} w-40`} title="Validade da esterilização" />
            {editando && (
              <button type="button" onClick={() => adicionarPacote(cicloEdicao.id)}
                disabled={!materialSelecionado}
                className="px-4 bg-[#3B44A8] text-white rounded-xl text-xs font-bold disabled:opacity-40 shrink-0">
                <Plus size={16} />
              </button>
            )}
          </div>

          {!editando && (
            <p className="text-gray-400 text-[10px] font-medium">
              O pacote selecionado entra no ciclo assim que ele for criado.
              Depois é possível adicionar mais pela edição.
            </p>
          )}

          {pacotes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {pacotes.map((p) => (
                <div key={p.id} className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">
                      {p.material_nome || `Material #${p.material_id}`}
                    </p>
                    <p className="text-gray-400 text-[10px] font-semibold">
                      {p.status || 'esterilizado'}
                      {p.validade ? ` • validade ${new Date(p.validade).toLocaleDateString('pt-BR')}` : ''}
                    </p>
                  </div>
                  <Package size={15} className="text-gray-300 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={salvando}
          className="w-full py-4 bg-[#F9A814] hover:bg-[#e0940f] active:scale-[0.98] rounded-xl font-bold text-white text-xs transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
          {salvando ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : (editando ? 'Salvar alterações' : 'Abrir ciclo')}
        </button>
      </form>
    </div>
  );
}
