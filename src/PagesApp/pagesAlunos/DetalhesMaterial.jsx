import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function DetalhesMaterial() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera o material enviado pela navegação ou aplica o fallback
  const material = location.state?.material || {
    nome: "Máscara Descartável Tripla",
    codigo: "125794216646",
    embalagem: "(Cx c/ 50 Un)",
    tipo: "Descartável",
    categoria: "Luvas",
    estoqueAtual: 1,
    estoqueMinimo: 10,
    estoqueIdeal: 20,
    emFalta: 9,
    fabricante: "Luvax Luvas",
    lote: "2026-04-15",
    anvisa: "103478465126",
    dataEntrada: "15/04/2026",
    validade: "15/04/2030",
    unidadeMedida: "Caixa c/ 50 pares"
  };

  // Histórico de movimentações
  const movimentacoes = [
    {
      tipo: "Saída",
      descricao: "Uso em procedimento - Consultório 02",
      data: "18/05/2026",
      qtd: "- 6 Un",
      isEntrada: false
    },
    {
      tipo: "Saída",
      descricao: "Uso em sala de aula - Sala 02",
      data: "14/05/2026",
      qtd: "- 24 Un",
      isEntrada: false
    },
    {
      tipo: "Entrada",
      descricao: "Compra - NF 12456",
      data: "13/05/2026",
      qtd: "+ 4 Un",
      isEntrada: true
    }
  ];

  // Verificação de nível crítico de estoque
  const estoqueAtualNum = Number(material.estoqueAtual ?? material.qtd ?? 0);
  const estoqueMinimoNum = Number(material.estoqueMinimo ?? 5);
  const isCritico = estoqueAtualNum < estoqueMinimoNum;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans">
      
      {/* TOPO FIXO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para a página anterior"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold tracking-wide flex-1 text-center mr-6">Detalhes do material</h1>
      </div>

      {/* CONTEÚDO ROLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">
        
        {/* BANNER DE ALERTA CRÍTICO */}
        {isCritico && (
          <div className="bg-[#FCE8E6] text-[#A83B3B] p-4 rounded-2xl flex items-start gap-3 shadow-xs border border-[#A83B3B]/10 select-none">
            <AlertTriangle size={20} className="shrink-0 text-[#D32F2F] mt-0.5" />
            <div className="text-[11px]">
              <p className="font-bold text-[#D32F2F]">Estoque em nível crítico</p>
              <p className="font-medium text-gray-600 mt-0.5">O estoque deste material está abaixo do nível mínimo recomendado.</p>
            </div>
          </div>
        )}

        {/* CARD PRINCIPAL DO PRODUTO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex gap-4">
            {/* Imagem */}
            <img 
              src={material.imagem || "https://placehold.co/100x100/e2e8f0/475569?text=Mascara"} 
              alt={material.nome || "Imagem do material"}
              className="w-16 h-16 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0"
            />
            {/* Infos Principais */}
            <div className="flex-1 min-w-0 text-[10px] text-gray-500 font-semibold space-y-0.5">
              <h2 className="text-gray-900 font-bold text-sm leading-tight truncate">{material.nome}</h2>
              <p className="text-gray-400 font-medium">Código: {material.codigo || material.id || "N/A"}</p>
              <p><span className="text-gray-400 font-medium">Tipo:</span> {material.tipo || "Consumo"}</p>
              <p><span className="text-gray-400 font-medium">Categoria:</span> {material.categoria || "Geral"}</p>
            </div>
            {/* Embalagem */}
            <div className="text-[10px] text-gray-500 font-bold shrink-0 self-start mt-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              {material.embalagem || "(1 Un)"}
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
              <span className="block text-base font-black text-[#3B44A8] mt-1.5">{material.estoqueMinimo ?? 10}</span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">unidades</span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold text-gray-500 leading-none">Estoque ideal</span>
              <span className="block text-base font-black text-[#3B44A8] mt-1.5">{material.estoqueIdeal ?? 20}</span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">unidades</span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold text-gray-500 leading-none">Em falta</span>
              <span className="block text-base font-black text-[#3B44A8] mt-1.5">{material.emFalta ?? 0}</span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">unidades</span>
            </div>
          </div>
        </div>

        {/* SEÇÃO INFORMAÇÕES DO MATERIAL */}
        <div className="space-y-2">
          <h3 className="text-[#3B44A8] font-bold text-xs tracking-wide select-none px-1">Informações do material</h3>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] font-medium text-gray-600">
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
              {material.anvisa || "Isento / Não informado"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Data de entrada</span>
              {material.dataEntrada || "-"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Validade</span>
              {material.val || material.validade || "-"}
            </div>
            <div>
              <span className="block text-gray-900 font-bold mb-0.5">Unidade de medida</span>
              {material.unidadeMedida || "Unidade"}
            </div>
          </div>
        </div>

        {/* SEÇÃO ÚLTIMAS MOVIMENTAÇÕES */}
        <div className="space-y-2">
          <div className="flex justify-between items-center select-none px-1">
            <h3 className="text-[#3B44A8] font-bold text-xs tracking-wide">Últimas movimentações</h3>
            <button 
              type="button" 
              className="text-[#3B44A8] text-[10px] font-bold hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {movimentacoes.map((mov, index) => (
              <div key={index} className="p-3.5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-3 min-w-0">
                  {mov.isEntrada ? (
                    <ArrowUpCircle className="text-emerald-500 shrink-0" size={20} />
                  ) : (
                    <ArrowDownCircle className="text-rose-500 shrink-0" size={20} />
                  )}
                  <div className="min-w-0 font-semibold">
                    <p className={`font-bold ${mov.isEntrada ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {mov.tipo}
                    </p>
                    <p className="text-gray-400 truncate text-[9px] font-medium mt-0.5">{mov.descricao}</p>
                  </div>
                </div>
                
                <div className="text-right shrink-0 font-medium text-gray-400 text-[9px] pl-2">
                  <p>{mov.data}</p>
                  <p className={`font-bold mt-0.5 ${mov.isEntrada ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {mov.qtd}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}