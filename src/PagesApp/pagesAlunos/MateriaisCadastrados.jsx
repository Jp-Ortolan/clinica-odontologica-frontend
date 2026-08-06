import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Package } from 'lucide-react';
import api from '../../Services/api';

export default function MateriaisCadastrados() {
  const navigate = useNavigate();
  const [materiaisOrdenados, setMateriaisOrdenados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/materiais')
      .then((res) => {
        setMateriaisOrdenados([...res.data].sort((a, b) => a.nome.localeCompare(b.nome)));
      })
      .catch((err) => console.error('Erro ao carregar materiais:', err))
      .finally(() => setCarregando(false));
  }, []);

  const handleSelecionarMaterial = (material) => {
    navigate('/app/aluno/estoque/configurar-etiqueta', { state: { material } });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans">
      
      {/* TOPO FIXO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate('/app/aluno/estoque')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para a tela de estoque"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide flex-1 text-center mr-6">
          Materiais cadastrados
        </h1>
      </div>

      {/* CONTEÚDO ROLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">
        
        {/* CAIXA INFORMATIVA */}
        <div className="bg-[#DCE0F5] text-[#3B44A8] p-4 rounded-2xl flex items-start gap-3 shadow-xs border border-[#3B44A8]/10 select-none">
          <Info size={20} className="shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold leading-relaxed">
            Selecione um material para configurar e imprimir as etiquetas.
          </p>
        </div>

        {/* LISTA DE MATERIAIS */}
        <div className="space-y-4">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide select-none">
            Materiais recentes
          </h2>

          <div className="space-y-4" role="list">
            {carregando ? (
              <div className="p-6 text-center text-gray-400 text-xs">Carregando materiais...</div>
            ) : materiaisOrdenados.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">Nenhum material cadastrado ainda.</div>
            ) : (
              materiaisOrdenados.map((item) => (
                <div
                  key={item.id}
                  role="listitem"
                  tabIndex={0}
                  onClick={() => handleSelecionarMaterial(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelecionarMaterial(item);
                    }
                  }}
                  className="bg-white border border-gray-150 rounded-2xl p-4 shadow-xs flex gap-4 hover:border-gray-300 transition active:scale-[0.99] cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#3B44A8]"
                >
                  <div className="w-16 h-16 rounded-xl border border-gray-150 bg-gray-50 shrink-0 select-none flex items-center justify-center text-gray-400">
                    <Package size={24} />
                  </div>

                  <div className="flex-1 min-w-0 text-[10px] text-gray-500 font-semibold space-y-0.5">
                    <h3 className="text-gray-900 font-bold text-sm leading-tight mb-1 truncate">
                      {item.nome}
                    </h3>
                    <p className="truncate"><span className="text-gray-900 font-bold">Código:</span> {item.codigo_barras}</p>
                    <p className="truncate"><span className="text-gray-900 font-bold">Lote:</span> {item.lote || 'N/I'}</p>
                    <p className="truncate"><span className="text-gray-900 font-bold">Val:</span> {item.validade ? new Date(item.validade).toLocaleDateString('pt-BR') : 'Indeterminado'}</p>
                    <p className="truncate"><span className="text-gray-900 font-bold">Quantidade:</span> {item.quantidade} {item.unidade_medida}</p>
                  </div>

                  <div className="flex flex-col justify-between items-end shrink-0 select-none">
                    <span className={`font-bold text-[9px] px-3 py-1 rounded-full ${
                      item.status_estoque === 'Crítico' ? 'bg-red-100 text-red-700' :
                      item.status_estoque === 'Baixo' ? 'bg-amber-100 text-amber-700' :
                      'bg-[#C1E7C4] text-[#2E7D32]'
                    }`}>
                      {item.status_estoque}
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}