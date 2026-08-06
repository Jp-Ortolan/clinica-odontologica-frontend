import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Package,
  Plus,
  Minus,
  X
} from 'lucide-react';
import api from '../../Services/api';

export default function DetalhesCirurgia() {
  const navigate = useNavigate();
  const location = useLocation();

  // Linha crua vinda do backend (id, paciente_id, usuario_id, data_hora,
  // tipo_cirurgia, status, observacoes, mutirao_id)
  const cirurgiaRaw = location.state?.cirurgia || {};
  const [paciente, setPaciente] = useState(null);
  const [equipe, setEquipe] = useState([]);

  useEffect(() => {
    if (cirurgiaRaw.paciente_id) {
      api.get(`/pacientes/${cirurgiaRaw.paciente_id}`).then((res) => setPaciente(res.data)).catch((err) => console.error(err));
    }
    if (cirurgiaRaw.id) {
      api.get(`/cirurgias/${cirurgiaRaw.id}/alunos`).then((res) => setEquipe(res.data)).catch((err) => console.error(err));
    }
  }, [cirurgiaRaw.id, cirurgiaRaw.paciente_id]);

  const dataHoraObj = cirurgiaRaw.data_hora ? new Date(cirurgiaRaw.data_hora) : null;
  const cirurgia = {
    paciente: paciente?.nome || 'Carregando...',
    cpf: paciente?.cpf || '',
    procedimento: cirurgiaRaw.tipo_cirurgia || 'Cirurgia',
    data: dataHoraObj ? dataHoraObj.toLocaleDateString('pt-BR') : '-',
    horario: dataHoraObj ? dataHoraObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
    status: cirurgiaRaw.status || 'agendada',
  };

  // Checklist real de materiais previstos, persistido em cirurgia_material
  // (antes era só uma lista fictícia local, sem vínculo com o backend).
  const [materiais, setMateriais] = useState([]);
  const [carregandoMateriais, setCarregandoMateriais] = useState(true);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [buscaCatalogo, setBuscaCatalogo] = useState('');
  const [adicionando, setAdicionando] = useState(false);

  const carregarMateriais = () => {
    if (!cirurgiaRaw.id) return;
    setCarregandoMateriais(true);
    api.get(`/cirurgias/${cirurgiaRaw.id}/materiais`)
      .then((res) => setMateriais(res.data))
      .catch((err) => console.error('Erro ao carregar materiais da cirurgia:', err))
      .finally(() => setCarregandoMateriais(false));
  };

  useEffect(() => {
    carregarMateriais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cirurgiaRaw.id]);

  const alterarQuantidade = async (vinculoId, delta) => {
    const item = materiais.find((m) => m.id === vinculoId);
    if (!item) return;
    const novaQtd = Math.max(0, item.quantidade + delta);

    setMateriais((prev) => prev.map((m) => (m.id === vinculoId ? { ...m, quantidade: novaQtd } : m)));
    try {
      await api.put(`/cirurgias/${cirurgiaRaw.id}/materiais/${vinculoId}`, { quantidade: novaQtd });
    } catch (err) {
      console.error('Erro ao atualizar quantidade do material:', err);
      carregarMateriais();
    }
  };

  const removerMaterial = async (vinculoId) => {
    const anterior = materiais;
    setMateriais((prev) => prev.filter((m) => m.id !== vinculoId));
    try {
      await api.delete(`/cirurgias/${cirurgiaRaw.id}/materiais/${vinculoId}`);
    } catch (err) {
      console.error('Erro ao remover material da cirurgia:', err);
      setMateriais(anterior);
    }
  };

  const abrirPicker = () => {
    setMostrarPicker(true);
    if (catalogo.length === 0) {
      api.get('/materiais').then((res) => setCatalogo(res.data)).catch((err) => console.error(err));
    }
  };

  const adicionarMaterial = async (materialId) => {
    setAdicionando(true);
    try {
      const { data: vinculo } = await api.post(`/cirurgias/${cirurgiaRaw.id}/materiais`, {
        material_id: materialId,
        quantidade: 1,
      });
      setMateriais((prev) => [...prev, vinculo]);
    } catch (err) {
      console.error('Erro ao adicionar material à cirurgia:', err);
      alert(err.response?.data?.message || 'Não foi possível adicionar o material.');
    } finally {
      setAdicionando(false);
    }
  };

  const idsJaVinculados = new Set(materiais.map((m) => m.material_id));
  const catalogoFiltrado = catalogo.filter((m) =>
    !idsJaVinculados.has(m.id) &&
    m.nome.toLowerCase().includes(buscaCatalogo.toLowerCase().trim())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#3B44A8] font-sans">
      
      {/* TOPO FIXO - Detalhes da Cirurgia */}
      <div className="pt-12 pb-6 px-6 text-white flex items-center justify-between shrink-0 select-none">
        <button 
          onClick={() => navigate('/app/aluno/cirurgias')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para a lista de cirurgias"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-bold tracking-wide flex-1 text-center mr-6">Detalhes da Cirurgia</h1>
      </div>

      {/* PAINEL INFERIOR ARREDONDADO */}
      <div className="flex-1 bg-white rounded-t-[32px] overflow-y-auto px-5 py-6 space-y-6 shadow-inner pb-24">
        
        {/* 1. CARD INFORMATIVO PRINCIPAL */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                <User className="text-gray-400" size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-950 text-sm leading-snug truncate">{cirurgia.paciente}</h2>
                <p className="text-gray-400 text-[10px] font-semibold">{cirurgia.cpf}</p>
              </div>
            </div>
            <span className="bg-[#DEF5E9] text-[#0f5132] text-[9px] font-black px-3 py-1 rounded-full whitespace-nowrap uppercase">
              {cirurgia.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-xs">
            <div>
              <span className="block text-gray-950 font-black text-[10px] uppercase tracking-wider">Procedimento</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight block mt-0.5">{cirurgia.procedimento}</span>
            </div>
            <div>
              <span className="block text-gray-950 font-black text-[10px] uppercase tracking-wider">Data</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight block mt-0.5">{cirurgia.data}</span>
            </div>
            <div>
              <span className="block text-gray-950 font-black text-[10px] uppercase tracking-wider">Horário</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight block mt-0.5">{cirurgia.horario}</span>
            </div>
          </div>

          {cirurgiaRaw.observacoes && (
            <div className="pt-1">
              <span className="block text-gray-950 font-black text-[10px] uppercase tracking-wider">Observações</span>
              <span className="text-gray-500 font-medium text-[11px] block mt-0.5">{cirurgiaRaw.observacoes}</span>
            </div>
          )}
        </div>

        {/* 2. EQUIPE RESPONSÁVEL */}
        <div className="space-y-2.5">
          <h3 className="text-[#3B44A8] font-black text-xs px-1">Equipe responsável</h3>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {equipe.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-[11px]">Nenhum vínculo de equipe cadastrado.</div>
            ) : (
              equipe.map((membro) => (
                <div key={membro.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 text-xs">{membro.usuario_nome || `Aluno #${membro.usuario_id}`}</h4>
                      <p className="text-gray-400 text-[10px] font-medium leading-none mt-0.5">{membro.curso || 'Aluno'}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    membro.papel === 'executante' ? 'bg-[#DCE0F5] text-[#3B44A8]' : 'bg-[#FFEED2] text-[#B45309]'
                  }`}>
                    {membro.papel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. MATERIAIS PREVISTOS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[#3B44A8] font-black text-xs">Materiais previstos</h3>
            <button onClick={abrirPicker} className="text-[#3B44A8] text-[10px] font-bold hover:underline cursor-pointer">
              + Adicionar materiais
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {carregandoMateriais ? (
              <div className="p-4 text-center text-gray-400 text-[11px]">Carregando materiais...</div>
            ) : materiais.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-[11px]">Nenhum material vinculado a esta cirurgia ainda.</div>
            ) : (
              materiais.map((mat) => (
                <div key={mat.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#3B44A8] shrink-0">
                      <Package size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-950 text-xs truncate leading-tight">{mat.material_nome}</h4>
                      <p className="text-gray-400 text-[9px] font-semibold mt-0.5">{mat.unidade_medida || ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Contador de Quantidade */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-2xs">
                      <button
                        onClick={() => alterarQuantidade(mat.id, -1)}
                        className="p-1.5 px-2 text-gray-500 hover:text-[#3B44A8] hover:bg-gray-100 transition active:scale-95 cursor-pointer"
                        aria-label={`Diminuir quantidade de ${mat.material_nome}`}
                      >
                        <Minus size={11} className="stroke-[3]" />
                      </button>
                      <span className="text-gray-950 font-bold text-xs min-w-[20px] text-center select-none px-1">
                        {mat.quantidade}
                      </span>
                      <button
                        onClick={() => alterarQuantidade(mat.id, 1)}
                        className="p-1.5 px-2 text-gray-500 hover:text-[#3B44A8] hover:bg-gray-100 transition active:scale-95 cursor-pointer"
                        aria-label={`Aumentar quantidade de ${mat.material_nome}`}
                      >
                        <Plus size={11} className="stroke-[3]" />
                      </button>
                    </div>
                    <button
                      onClick={() => removerMaterial(mat.id)}
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

      </div>

      {/* RODAPÉ FIXO DE AÇÕES */}
      <div className="p-4 border-t border-gray-100 bg-white flex gap-3 shrink-0 shadow-lg relative z-10">
        <button
          onClick={() => navigate('/app/aluno/cirurgias')}
          className="flex-1 py-3 bg-[#3B44A8] text-white rounded-xl font-bold text-xs hover:bg-[#30388d] transition active:scale-[0.98] shadow-sm cursor-pointer"
        >
          Voltar
        </button>
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

    </div>
  );
}