import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

export default function MateriaisCadastrados() {
  const navigate = useNavigate();

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

  const materiaisOrdenados = [...materiaisBase].sort((a, b) => 
    a.nome.localeCompare(b.nome)
  );

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
            {materiaisOrdenados.map((item) => (
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
                <img 
                  src={item.imagem} 
                  alt={`Imagem ilustrativa do material ${item.nome}`}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-150 bg-gray-50 shrink-0 select-none"
                />

                <div className="flex-1 min-w-0 text-[10px] text-gray-500 font-semibold space-y-0.5">
                  <h3 className="text-gray-900 font-bold text-sm leading-tight mb-1 truncate">
                    {item.nome}
                  </h3>
                  <p className="truncate"><span className="text-gray-900 font-bold">Código:</span> {item.codigo}</p>
                  <p className="truncate"><span className="text-gray-900 font-bold">Lote:</span> {item.lote}</p>
                  <p className="truncate"><span className="text-gray-900 font-bold">Val:</span> {item.val}</p>
                  <p className="truncate"><span className="text-gray-900 font-bold">Quantidade:</span> {item.quantidade}</p>
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
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}