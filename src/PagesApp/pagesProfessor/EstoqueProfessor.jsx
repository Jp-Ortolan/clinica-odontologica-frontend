import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Scan, QrCode, Printer, Plus, ChevronRight, AlertCircle 
} from 'lucide-react';

// Dados estáticos extraídos do escopo do componente
const MATERIAIS_MOCK = [
  {
    nome: "Kit Cirúrgico 01",
    embalagem: "(1 Un)",
    codigo: "125794216646",
    lote: "2026-04-15",
    val: "15/04/2030",
    qtd: 30,
    imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Kit",
    tipo: "Consumo",
    categoria: "Cirurgia",
    estoqueAtual: 30,
    estoqueMinimo: 10,
    estoqueIdeal: 40,
    emFalta: 10,
    fabricante: "Prevenção Cia",
    anvisa: "80123456789",
    dataEntrada: "10/01/2026",
    unidadeMedida: "Unidade"
  },
  {
    nome: "Luva Descartável",
    embalagem: "(2 Un)",
    codigo: "36589103001645354",
    lote: "2026-02-07",
    val: "08/09/3034",
    qtd: 81,
    imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Luva",
    tipo: "Descartável",
    categoria: "Luvas",
    estoqueAtual: 81,
    estoqueMinimo: 20,
    estoqueIdeal: 100,
    emFalta: 19,
    fabricante: "Luvax Luvas",
    anvisa: "103478465126",
    dataEntrada: "05/02/2026",
    unidadeMedida: "Caixa c/ 50 pares"
  },
  {
    nome: "Seringa Carpule",
    embalagem: "(1 Un)",
    codigo: "859648430000545",
    lote: "2025-12-28",
    val: "Indeterminado",
    qtd: 1, // Baixo estoque -> Badge Crítico
    imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Seringa",
    tipo: "Instrumental",
    categoria: "Dentística",
    estoqueAtual: 1,
    estoqueMinimo: 10,
    estoqueIdeal: 20,
    emFalta: 19,
    fabricante: "OdontoMed Brasil",
    anvisa: "40321569874",
    dataEntrada: "28/12/2025",
    unidadeMedida: "Unidade"
  },
  {
    nome: "Gaze",
    embalagem: "(3 Un)",
    codigo: "18279813055465",
    lote: "2026-01-31",
    val: "20/07/2029",
    qtd: 100,
    imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Gaze",
    tipo: "Consumo",
    categoria: "Periodontia",
    estoqueAtual: 100,
    estoqueMinimo: 30,
    estoqueIdeal: 150,
    emFalta: 50,
    fabricante: "MediTextil",
    anvisa: "70258963147",
    dataEntrada: "15/01/2026",
    unidadeMedida: "Pacote"
  }
];

export default function EstoqueProfessor() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');

  // Resumo estatístico calculado dinamicamente ou estático conforme regra de negócio
  const resumo = useMemo(() => ({
    totalItens: 128,
    materiaisCriticos: 8,
    proximosVencimento: 0,
    semEstoque: 3
  }), []);

  // Normalização de texto para busca tolerante a acentos
  const normalizeText = (text) => 
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Filtragem reativa baseada no input de busca
  const materiaisFiltrados = useMemo(() => {
    if (!busca.trim()) return MATERIAIS_MOCK;
    
    const termo = normalizeText(busca);
    return MATERIAIS_MOCK.filter((item) => 
      normalizeText(item.nome).includes(termo) ||
      normalizeText(item.codigo).includes(termo) ||
      normalizeText(item.categoria).includes(termo)
    );
  }, [busca]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      
      {/* HEADER FIXO */}
      <header className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          onClick={() => navigate('/app/professor/dashboard')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95"
          aria-label="Voltar para o Dashboard"
        >
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="text-xl font-bold tracking-wide mr-8">Estoque</h1>
        
        <div className="w-6" aria-hidden="true" />
      </header>

      {/* CONTEÚDO ROLÁVEL */}
      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">
        
        {/* BARRA DE BUSCA */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar material, código ou descrição"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#3B44A8] shadow-sm text-gray-700 placeholder-gray-400"
            aria-label="Campo de busca de materiais"
          />
          <Search className="absolute left-4 top-4 text-gray-400" size={18} />
        </div>

        {/* BOTÕES DE ESCANEAR */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => navigate('/app/professor/estoque/scanner', { state: { modo: 'qrcode' } })}
            className="bg-[#DCE0F5] hover:bg-[#ccd1ee] active:scale-95 text-[#3B44A8] py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm border border-[#3B44A8]/10 transition-all text-center cursor-pointer"
          >
            <QrCode size={24} className="stroke-[2px]" />
            <span className="text-[11px] font-bold leading-tight">Escanear<br/>QR-Code</span>
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/app/professor/estoque/scanner', { state: { modo: 'barras' } })}
            className="bg-[#DCE0F5] hover:bg-[#ccd1ee] active:scale-95 text-[#3B44A8] py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm border border-[#3B44A8]/10 transition-all text-center cursor-pointer"
          >
            <Scan size={24} className="stroke-[2px]" />
            <span className="text-[11px] font-bold leading-tight">Escanear<br/>Código de Barras</span>
          </button>
        </div>

        {/* IMPRESSÃO DE ETIQUETAS */}
        <button 
          type="button" 
          onClick={() => navigate('/app/professor/estoque/materiais', { state: { modo: 'impressao' } })}
          className="w-full bg-[#DCE0F5] hover:bg-[#ccd1ee] active:scale-[0.99] text-[#3B44A8] py-4 px-5 rounded-2xl flex items-center justify-center gap-3 shadow-sm border border-[#3B44A8]/10 transition-all font-bold text-xs cursor-pointer"
        >
          <Printer size={20} />
          Impressão de etiquetas
        </button>

        {/* CADASTRAR NOVO MATERIAL */}
        <button 
          type="button"
          onClick={() => navigate('/app/professor/estoque/cadastrar')}
          className="w-full bg-[#DCE0F5] hover:bg-[#ccd1ee] active:scale-[0.99] text-[#3B44A8] py-4 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-sm border border-[#3B44A8]/10 transition-all font-bold text-xs cursor-pointer"
        >
          <Plus size={22} className="text-[#3B44A8]" />
          Cadastrar novo material
        </button>

        {/* RESUMO DO ESTOQUE */}
        <section className="space-y-2">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Resumo do estoque</h2>
          
          <div className="grid grid-cols-4 gap-1.5 bg-white border border-gray-150 rounded-2xl p-3 shadow-sm divide-x divide-gray-100 text-center select-none">
            <div>
              <span className="block text-[8px] font-bold text-gray-900 leading-tight">Total de itens</span>
              <span className="block text-lg font-black text-[#3B44A8] mt-1">{resumo.totalItens}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-gray-900 leading-tight">Materiais críticos</span>
              <span className="block text-lg font-black text-[#3B44A8] mt-1">{resumo.materiaisCriticos}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-gray-900 leading-tight">Próximos ao vencimento</span>
              <span className="block text-lg font-black text-[#3B44A8] mt-1">{resumo.proximosVencimento}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-gray-900 leading-tight">Itens sem estoque</span>
              <span className="block text-lg font-black text-[#3B44A8] mt-1">{resumo.semEstoque}</span>
            </div>
          </div>
        </section>

        {/* MATERIAIS CADASTRADOS */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Materiais cadastrados</h2>
            <button 
              type="button" 
              onClick={() => navigate('/app/professor/estoque/materiais')}
              className="text-[#3B44A8] text-[10px] font-bold hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-150">
            {materiaisFiltrados.length > 0 ? (
              materiaisFiltrados.map((item, index) => {
                const isCritico = item.qtd <= item.estoqueMinimo;

                return (
                  <div 
                    key={item.codigo || index}
                    onClick={() => navigate('/app/professor/estoque/detalhes', { state: { material: item } })}
                    className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={item.imagem} 
                        alt={item.nome}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                      />
                      
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs leading-tight truncate">{item.nome}</h3>
                        <p className="text-gray-500 text-[9px] font-semibold leading-tight">{item.embalagem}</p>
                        <p className="text-gray-400 text-[8px] mt-0.5 leading-none">Código: {item.codigo}</p>
                        
                        <div className="flex gap-2.5 mt-1 text-[8px] text-gray-400 font-semibold leading-none">
                          <span>Lote: {item.lote}</span>
                          <span>Val: {item.val}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
                        isCritico 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-[#DCE0F5] text-[#3B44A8]'
                      }`}>
                        {isCritico && <AlertCircle size={10} className="text-rose-600" />}
                        Qtd: {item.qtd}
                      </span>
                      <ChevronRight size={16} className="text-[#3B44A8]" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-400 text-xs font-medium">
                Nenhum material encontrado para "{busca}".
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}