import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Search, X, PackageSearch } from 'lucide-react';

export default function MateriaisCadastradosProfessor() {
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState('');

  const materiaisBase = [
    {
      id: 1,
      nome: "Kit Cirúrgico 01",
      codigo: "125794216646",
      lote: "2026-04-15",
      val: "15/04/2030",
      quantidade: "30 unidades",
      qtd: 30,
      status: "Estocado",
      responsavel: "Pedro Guimarães",
      dataHora: "15/05/2026 às 11:37",
      imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Kit"
    },
    {
      id: 2,
      nome: "Luva Descartável",
      codigo: "36589103001645354",
      lote: "2026-02-07",
      val: "06/09/3034",
      quantidade: "81 unidades",
      qtd: 81,
      status: "Estocado",
      responsavel: "Rhaya Borges",
      dataHora: "10/06/2026 às 14:20",
      imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Luva"
    },
    {
      id: 3,
      nome: "Seringa Carpule",
      codigo: "859648430000545",
      lote: "2026-05-02",
      val: "Indeterminado",
      quantidade: "25 unidades",
      qtd: 25,
      status: "Estocado",
      responsavel: "Helena Amaral",
      dataHora: "02/05/2026 às 09:51",
      imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Seringa"
    },
    {
      id: 4,
      nome: "Gaze",
      codigo: "18279813055465",
      lote: "2026-01-31",
      val: "20/07/2029",
      quantidade: "100 unidades",
      qtd: 100,
      status: "Estocado",
      responsavel: "Carlos Lima",
      dataHora: "18/04/2026 às 08:15",
      imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Gaze"
    },
    {
      id: 5,
      nome: "Gorro Descartável",
      codigo: "423254345435",
      lote: "2026-05-02",
      val: "20/08/2029",
      quantidade: "10 unidades",
      qtd: 10,
      observacoes: "Cada pacote tem 100 gorros.",
      status: "Estocado",
      responsavel: "Helena Amaral",
      dataHora: "02/05/2026 às 09:43",
      imagem: "https://placehold.co/100x100/e2e8f0/475569?text=Gorro"
    }
  ];

  // Ordenação e Filtro em Tempo Real por Nome, Código ou Lote
  const materiaisFiltrados = useMemo(() => {
    const termo = termoBusca.toLowerCase().trim();
    
    return [...materiaisBase]
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .filter((item) => 
        item.nome.toLowerCase().includes(termo) ||
        item.codigo.toLowerCase().includes(termo) ||
        item.lote.toLowerCase().includes(termo)
      );
  }, [termoBusca]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      
      {/* TOPO FIXO DE NAVEGAÇÃO */}
      <header className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate('/app/professor/estoque')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para estoque"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide mr-8">Materiais cadastrados</h1>
        <div className="w-6" aria-hidden="true" />
      </header>

      {/* CONTEÚDO ROLÁVEL */}
      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">
        
        {/* CARD INFORMATIVO */}
        <div className="bg-[#DCE0F5] text-[#3B44A8] p-4 rounded-2xl flex items-start gap-3 shadow-sm border border-[#3B44A8]/10 select-none">
          <Info size={20} className="shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold leading-relaxed">
            Selecione um material para configurar e imprimir as etiquetas.
          </p>
        </div>

        {/* CAMPO DE BUSCA */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por nome, código ou lote..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] focus:bg-white transition"
          />
          {termoBusca && (
            <button
              type="button"
              onClick={() => setTermoBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* LISTAGEM DE MATERIAIS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between select-none">
            <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">
              Materiais cadastrados
            </h2>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {materiaisFiltrados.length} {materiaisFiltrados.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="space-y-4">
            {materiaisFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                <PackageSearch size={36} className="text-gray-300" />
                <p className="text-xs font-semibold text-gray-500">Nenhum material encontrado</p>
                <p className="text-[10px]">Tente buscar por outro nome ou código de barras.</p>
              </div>
            ) : (
              materiaisFiltrados.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/app/professor/estoque/configurar-etiqueta', { state: { material: item } })}
                  className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex gap-4 hover:border-gray-300 transition active:scale-[0.99] cursor-pointer relative"
                >
                  <img 
                    src={item.imagem} 
                    alt={item.nome}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-150 bg-gray-50 shrink-0 select-none"
                  />

                  <div className="flex-1 min-w-0 text-[10px] text-gray-500 font-semibold space-y-0.5">
                    <h3 className="text-gray-900 font-bold text-sm leading-tight mb-1 truncate">
                      {item.nome}
                    </h3>
                    <p><span className="text-gray-900 font-bold">Código:</span> {item.codigo}</p>
                    <p><span className="text-gray-900 font-bold">Lote:</span> {item.lote}</p>
                    <p><span className="text-gray-900 font-bold">Val:</span> {item.val}</p>
                    <p><span className="text-gray-900 font-bold">Quantidade:</span> {item.quantidade}</p>
                    {item.observacoes && (
                      <p className="truncate"><span className="text-gray-900 font-bold">Observações:</span> {item.observacoes}</p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end shrink-0 select-none">
                    <span className="bg-[#C1E7C4] text-[#2E7D32] font-bold text-[9px] px-3 py-1 rounded-full">
                      {item.status}
                    </span>
                    <div className="text-right text-[8px] text-gray-400 font-medium leading-tight">
                      <p className="font-semibold">{item.responsavel}</p>
                      <p>{item.dataHora}</p>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}