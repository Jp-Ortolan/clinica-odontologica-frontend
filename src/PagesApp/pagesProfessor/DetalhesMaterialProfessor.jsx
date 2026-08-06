import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../../Services/api';
import AcoesMaterial from '../../components/AcoesMaterial';

export default function DetalhesMaterialProfessor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();

  const [material, setMaterial] = useState(location.state?.material || null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  // A lista completa já vem do backend; o botão "Ver todas" só alterna
  // entre mostrar as 5 mais recentes e o histórico inteiro.
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const materialId = material?.id || paramId;

  // Sempre busca o material completo por id — a lista que manda o state
  // via navegação usa uma versão "enxuta" (sem a imagem_base64 inteira,
  // só um booleano tem_imagem), então só essa chamada garante a foto real.
  // Recarrega material e histórico. Fica numa função só porque as ações
  // (entrada, saída, edição) precisam atualizar a tela depois de salvar.
  const recarregar = useCallback(() => {
    if (!materialId) return;
    api.get(`/materiais/${materialId}`)
      .then((res) => setMaterial(res.data))
      .catch((err) => console.error(err));
    api.get('/movimentacoes', { params: { material_id: materialId } })
      .then((res) => setMovimentacoes(res.data))
      .catch((err) => console.error('Erro ao carregar movimentações:', err));
  }, [materialId]);

  useEffect(() => { recarregar(); }, [recarregar]);

  if (!material) {
    return <div className="p-8 text-center text-gray-400 text-sm">Carregando material...</div>;
  }

  // Verificação de nível crítico de estoque
  const estoqueAtualNum = Number(material.quantidade ?? 0);
  const estoqueMinimoNum = Number(material.estoque_minimo ?? 5);
  const isCritico = material.status_estoque === 'Crítico' || estoqueAtualNum < estoqueMinimoNum;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">

      {/* TOPO FIXO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide mr-8">Detalhes do material</h1>
        <div className="w-6"></div>
      </div>

      {/* CONTEÚDO ROLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">

        {/* BANNER DE ALERTA CRÍTICO */}
        {isCritico && (
          <div className="bg-[#FCE8E6] text-[#A83B3B] p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[#A83B3B]/10 select-none">
            <AlertTriangle size={20} className="shrink-0 text-[#D32F2F] mt-0.5" />
            <div className="text-[11px]">
              <p className="font-bold text-[#D32F2F]">Estoque em nível crítico</p>
              <p className="font-medium text-gray-600 mt-0.5">O estoque deste material está abaixo do nível mínimo recomendado.</p>
            </div>
          </div>
        )}

        {/* CARD PRINCIPAL DO PRODUTO */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex gap-4">
            {material.imagem_base64 && (
              <img
                src={material.imagem_base64}
                alt={material.nome}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
              />
            )}
            {/* Infos Principais */}
            <div className="flex-1 min-w-0 text-[10px] text-gray-500 font-semibold space-y-0.5">
              <h2 className="text-gray-900 font-bold text-sm leading-tight truncate">{material.nome}</h2>
              <p className="text-gray-400 font-medium">Código: {material.codigo_barras || material.id || "N/A"}</p>
              <p><span className="text-gray-400 font-medium">Categoria:</span> {material.categoria_nome || "Geral"}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* BALANÇO DE QUANTIDADES */}
          <div className="grid grid-cols-4 gap-1 text-center divide-x divide-gray-100 select-none">
            <div className="px-1">
              <span className="block text-[9px] font-bold text-gray-500 leading-none">Estoque atual</span>
              <span className={`block text-base font-black mt-1.5 ${isCritico ? 'text-[#D32F2F]' : 'text-gray-900'}`}>
                {estoqueAtualNum}
              </span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">unidade(s)</span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold text-gray-500 leading-none">Estoque mínimo</span>
              <span className="block text-base font-black text-[#3B44A8] mt-1.5">{material.estoque_minimo ?? 10}</span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">unidades</span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold text-gray-500 leading-none">Estoque ideal</span>
              <span className="block text-base font-black text-[#3B44A8] mt-1.5">{material.estoque_ideal ?? '-'}</span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">unidades</span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold text-gray-500 leading-none">Em falta</span>
              <span className="block text-base font-black text-[#3B44A8] mt-1.5">{material.em_falta ?? 0}</span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">unidades</span>
            </div>
          </div>
        </div>

        {/* SEÇÃO INFORMAÇÕES DO MATERIAL */}
        <div className="space-y-2">
          <h3 className="text-[#3B44A8] font-bold text-xs tracking-wide select-none px-1">Informações do material</h3>

          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] font-medium text-gray-600">
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Fabricante</span>
              {material.fabricante || "Não informado"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Lote</span>
              {material.lote || "Não informado"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Registro ANVISA</span>
              {material.registro_anvisa || "Isento / Não informado"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Data de entrada</span>
              {material.data_entrada ? new Date(material.data_entrada).toLocaleDateString('pt-BR') : "-"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Validade</span>
              {material.validade ? new Date(material.validade).toLocaleDateString('pt-BR') : "-"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Unidade de medida</span>
              {material.unidade_medida || "Unidade"}
            </div>
          </div>
        </div>

        {/* DESCRIÇÃO (a coluna passou a existir na migration 011) */}
        {material.descricao && (
          <div className="space-y-2">
            <h3 className="text-[#3B44A8] font-bold text-xs tracking-wide select-none px-1">Descrição</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-line">
              {material.descricao}
            </div>
          </div>
        )}

        {/* AÇÕES: entrada, saída, editar e (professor) excluir */}
        <AcoesMaterial material={material} aoAtualizar={recarregar} />

        {/* SEÇÃO ÚLTIMAS MOVIMENTAÇÕES */}
        <div className="space-y-2">
          <div className="flex justify-between items-center select-none px-1">
            <h3 className="text-[#3B44A8] font-bold text-xs tracking-wide">Últimas movimentações</h3>
            <button
              type="button"
              onClick={() => setMostrarTodas((atual) => !atual)}
              disabled={movimentacoes.length <= 5}
              className="text-[#3B44A8] text-[10px] font-bold hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:no-underline"
            >
              {mostrarTodas ? 'Ver menos' : `Ver todas${movimentacoes.length > 5 ? ` (${movimentacoes.length})` : ''}`}
            </button>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-150">
            {movimentacoes.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-[10px]">Nenhuma movimentação registrada.</div>
            ) : (
              (mostrarTodas ? movimentacoes : movimentacoes.slice(0, 5)).map((mov) => {
                const isEntrada = mov.tipo === 'entrada';
                return (
                  <div key={mov.id} className="p-3.5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-3 min-w-0">
                      {isEntrada ? (
                        <ArrowUpCircle className="text-emerald-500 shrink-0" size={20} />
                      ) : (
                        <ArrowDownCircle className="text-rose-500 shrink-0" size={20} />
                      )}
                      <div className="min-w-0 font-semibold">
                        <p className={`font-bold capitalize ${isEntrada ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mov.tipo}
                        </p>
                        <p className="text-gray-400 truncate text-[9px] font-medium mt-0.5">{mov.observacao || mov.usuario_nome}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-medium text-gray-400 text-[9px] pl-2">
                      <p>{new Date(mov.data_hora).toLocaleDateString('pt-BR')}</p>
                      <p className={`font-bold mt-0.5 ${isEntrada ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isEntrada ? '+' : '-'} {mov.quantidade}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
