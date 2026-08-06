import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Scan, QrCode, Printer, Plus, ChevronRight, Package
} from 'lucide-react';
import api from '../../Services/api';

export default function EstoqueProfessor() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/materiais')
      .then((res) => setMateriais(res.data))
      .catch((err) => console.error('Erro ao carregar materiais:', err))
      .finally(() => setCarregando(false));
  }, []);

  // Resumo calculado a partir dos campos já vindos prontos do backend
  // (status_estoque e em_falta são calculados lá, não aqui)
  const resumo = {
    totalItens: materiais.length,
    materiaisCriticos: materiais.filter((m) => m.status_estoque === 'Crítico').length,
    proximosVencimento: materiais.filter((m) => m.validade && new Date(m.validade) < new Date(Date.now() + 30 * 86400000)).length,
    semEstoque: materiais.filter((m) => m.quantidade === 0).length,
  };

  // Filtro dinâmico da busca
  const materiaisFiltrados = materiais.filter((item) => {
    const termo = busca.toLowerCase().trim();
    return (
      item.nome.toLowerCase().includes(termo) ||
      (item.codigo_barras || '').toLowerCase().includes(termo) ||
      (item.lote || '').toLowerCase().includes(termo) ||
      (item.categoria_nome || '').toLowerCase().includes(termo)
    );
  });

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
            {carregando ? (
              <div className="p-6 text-center text-gray-400 text-xs font-medium">Carregando materiais...</div>
            ) : materiaisFiltrados.length > 0 ? (
              materiaisFiltrados.map((item) => {
                const isCritico = item.status_estoque === 'Crítico';

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate('/app/professor/estoque/detalhes', { state: { material: item } })}
                    className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 shrink-0 flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs leading-tight truncate">{item.nome}</h3>
                        <p className="text-gray-500 text-[9px] font-semibold leading-tight">{item.categoria_nome}</p>
                        <p className="text-gray-400 text-[8px] mt-0.5 leading-none">Código: {item.codigo_barras}</p>

                        <div className="flex gap-2.5 mt-1 text-[8px] text-gray-400 font-semibold leading-none">
                          <span>Lote: {item.lote || 'N/I'}</span>
                          <span>Val: {item.validade ? new Date(item.validade).toLocaleDateString('pt-BR') : 'Indeterminado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
                        isCritico
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-[#DCE0F5] text-[#3B44A8]'
                      }`}>
                        Qtd: {item.quantidade}
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
