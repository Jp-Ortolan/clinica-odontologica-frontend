import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Minus, Plus, ChevronDown, Eye, Package } from 'lucide-react';

export default function ConfigurarEtiqueta() {
  const navigate = useNavigate();
  const location = useLocation();
  const material = location.state?.material;

  // Redireciona de volta com segurança caso o estado seja perdido ou acessado direto pela URL
  useEffect(() => {
    if (!material) {
      navigate('/app/aluno/estoque/materiais', { replace: true });
    }
  }, [material, navigate]);

  if (!material) return null;

  // Estados com os dados iniciais do material herdado
  const [lote, setLote] = useState(material.lote || '');
  const [validade, setValidade] = useState(material.val || '');
  const [quantidade, setQuantidade] = useState(10);
  const [localizacao, setLocalizacao] = useState('Centro Universitário Campo Real Guarapuava');
  const [incluirQR, setIncluirQR] = useState(true);
  const [incluirBarra, setIncluirBarra] = useState(true);
  const [modelo, setModelo] = useState('Padrão - 50mm x 30mm');

  const handleGerarVisualizacao = () => {
    navigate('/app/aluno/estoque/pre-visualizacao', {
      state: {
        material,
        lote,
        validade,
        quantidade,
        localizacao,
        incluirQR,
        incluirBarra,
        modelo
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FD] font-sans pb-10">
      
      {/* HEADER AZUL */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate('/app/aluno/estoque/materiais')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 mr-4"
          aria-label="Voltar para lista de materiais"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide flex-1 text-center mr-8">Configurar etiqueta</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        
        {/* CARD DO MATERIAL SELECIONADO */}
        <div className="space-y-2">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide px-1">Material selecionado</h2>
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex gap-4 items-center">
            {material.imagem ? (
              <img 
                src={material.imagem} 
                alt={material.nome} 
                className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-150 shrink-0" 
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <Package size={28} />
              </div>
            )}
            
            <div className="flex-1 min-w-0 text-[11px] text-gray-500 font-semibold space-y-0.5">
              <h3 className="font-bold text-gray-900 text-sm leading-tight truncate mb-0.5">{material.nome}</h3>
              <p><span className="text-gray-950 font-bold">Código:</span> {material.codigo}</p>
              <p><span className="text-gray-950 font-bold">Estoque:</span> {material.quantidade}</p>
            </div>
          </div>
        </div>

        {/* INFORMAÇÕES DA ETIQUETA */}
        <div className="space-y-3">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide px-1">Informações para etiqueta</h2>
          
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Campo Lote */}
            <div>
              <label htmlFor="lote-input" className="block text-xs font-bold text-gray-900 mb-1">Lote</label>
              <input 
                id="lote-input"
                type="text" 
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                placeholder="Ex: L-2024001"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#3B44A8] shadow-sm"
              />
            </div>

            {/* Linha dupla: Validade e Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="validade-input" className="block text-xs font-bold text-gray-900 mb-1">Validade</label>
                <div className="relative">
                  <input 
                    id="validade-input"
                    type="text" 
                    value={validade}
                    onChange={(e) => setValidade(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 text-xs font-medium focus:outline-none focus:border-[#3B44A8] shadow-sm"
                  />
                  <Calendar size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">Quantidade</label>
                <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm h-[42px]">
                  <button 
                    type="button" 
                    onClick={() => setQuantidade(q => Math.max(1, q - 1))} 
                    className="px-3 h-full hover:bg-gray-50 active:bg-gray-100 border-r border-gray-100 transition flex items-center justify-center text-gray-500 cursor-pointer"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="flex-1 text-center font-bold text-xs text-gray-900">{quantidade}</span>
                  <button 
                    type="button" 
                    onClick={() => setQuantidade(q => q + 1)} 
                    className="px-3 h-full hover:bg-gray-50 active:bg-gray-100 border-l border-gray-100 transition flex items-center justify-center text-gray-500 cursor-pointer"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Campo Localização */}
            <div>
              <label htmlFor="localizacao-select" className="block text-xs font-bold text-gray-900 mb-1">Localização (opcional)</label>
              <div className="relative">
                <select 
                  id="localizacao-select"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#3B44A8] shadow-sm pr-10 cursor-pointer"
                >
                  <option value="Centro Universitário Campo Real Guarapuava">Centro Universitário Campo Real Guarapuava</option>
                  <option value="Clínica Odontológica - Bloco A">Clínica Odontológica - Bloco A</option>
                  <option value="Almoxarifado Central">Almoxarifado Central</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Toggles Interativos */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-bold text-gray-700">Incluir QR-Code</span>
                <input 
                  type="checkbox" 
                  checked={incluirQR} 
                  onChange={() => setIncluirQR(!incluirQR)} 
                  className="w-5 h-5 rounded border-gray-300 text-[#3B44A8] focus:ring-[#3B44A8] cursor-pointer accent-[#3B44A8]" 
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-bold text-gray-700">Incluir Código de Barras</span>
                <input 
                  type="checkbox" 
                  checked={incluirBarra} 
                  onChange={() => setIncluirBarra(!incluirBarra)} 
                  className="w-5 h-5 rounded border-gray-300 text-[#3B44A8] focus:ring-[#3B44A8] cursor-pointer accent-[#3B44A8]" 
                />
              </label>
            </div>

            {/* Modelo de Etiqueta */}
            <div>
              <label htmlFor="modelo-select" className="block text-xs font-bold text-gray-900 mb-1">Modelo de etiqueta</label>
              <div className="relative">
                <select 
                  id="modelo-select"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#3B44A8] shadow-sm pr-10 cursor-pointer"
                >
                  <option value="Padrão - 50mm x 30mm">Padrão - 50mm x 30mm</option>
                  <option value="Compacto - 40mm x 25mm">Compacto - 40mm x 25mm</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* BOTÃO NAVEGAR PARA PRÉ-VISUALIZAÇÃO */}
        <button 
          type="button"
          onClick={handleGerarVisualizacao}
          className="w-full bg-[#F59E0B] text-white font-bold py-4 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 hover:bg-[#D97706] transition active:scale-[0.98] cursor-pointer"
        >
          <Eye size={20} />
          <span>Gerar pré-visualização</span>
        </button>

      </div>
    </div>
  );
}