import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Package, 
  Layers, 
  Sparkles, 
  FileText, 
  Plus, 
  Minus,
  Loader2 
} from 'lucide-react';

const STORAGE_KEYS = {
  CIRURGIAS: '@app_clinica:cirurgias',
};

// Mapeamento de ícones para renderização dinâmica
const ICON_MAP = {
  Package,
  FileText,
  Layers,
  Sparkles,
};

export default function DetalhesCirurgiaProfessor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: cirurgiaId } = useParams();

  const [loading, setLoading] = useState(true);
  const [detalhesCirurgia, setDetalhesCirurgia] = useState(null);
  const [materiais, setMateriais] = useState([]);

  // Carrega e sincroniza os dados dinamicamente
  useEffect(() => {
    const carregarDetalhes = () => {
      setLoading(true);

      // 1. Tenta obter dados via state da navegação ou ID do localStorage
      const cirurgiaState = location.state?.cirurgia;
      const cirurgiasSalvas = JSON.parse(localStorage.getItem(STORAGE_KEYS.CIRURGIAS) || '[]');
      
      const cirurgiaEncontrada = cirurgiaState || 
        cirurgiasSalvas.find(c => String(c.id) === String(cirurgiaId)) || 
        {
          id: cirurgiaId || 1,
          paciente: "Rhaya Borges",
          documento: "012.123.456-89",
          status: "Agendada",
          procedimento: "Exodontia - 36",
          data: "26/05/2026",
          horario: "08:30",
          local: "Centro Cirúrgico",
          equipe: [
            { id: 1, nome: "João Silva", funcao: "Aluno", papel: "Responsável", tagColor: "bg-[#DCE0F5] text-[#3B42B2]" },
            { id: 2, nome: "Matheus Mota", funcao: "Aluno", papel: "Auxiliar", tagColor: "bg-[#FFEED2] text-[#F9A814]" },
            { id: 3, nome: "Alana Lopes", funcao: "Aluno", papel: "Auxiliar", tagColor: "bg-[#FFEED2] text-[#F9A814]" },
            { id: 4, nome: "Dr. Carlos Eduardo", funcao: "Professor", papel: "Supervisor", tagColor: "bg-[#DEF5E9] text-[#2E7D32]" }
          ],
          materiais: [
            { id: 1, nome: "Kit Cirúrgico 01", sub: "(1 Un)", qtd: 1, iconName: "Package" },
            { id: 2, nome: "Seringa Carpule", sub: "(1 Un)", qtd: 1, iconName: "FileText" },
            { id: 3, nome: "Campo Cirúrgico", sub: "(2 Un)", qtd: 1, iconName: "Layers" },
            { id: 4, nome: "Luva Descartável", sub: "(2 Un)", qtd: 4, iconName: "Sparkles" },
            { id: 5, nome: "Avental Cirúrgico", sub: "(1 Un)", qtd: 4, iconName: "Package" },
            { id: 6, nome: "Gaze", sub: "(3 Un)", qtd: 4, iconName: "Layers" },
          ]
        };

      setDetalhesCirurgia(cirurgiaEncontrada);
      setMateriais(cirurgiaEncontrada.materiais || []);
      setLoading(false);
    };

    carregarDetalhes();
  }, [cirurgiaId, location.state]);

  // Altera a quantidade e salva as atualizações no storage local
  const alterarQuantidade = (id, delta) => {
    setMateriais(prev => {
      const novomateriais = prev.map(item => {
        if (item.id === id) {
          const novaQtd = Math.max(0, item.qtd + delta);
          return { ...item, qtd: novaQtd };
        }
        return item;
      });

      // Atualização no localStorage
      if (detalhesCirurgia?.id) {
        const cirurgiasSalvas = JSON.parse(localStorage.getItem(STORAGE_KEYS.CIRURGIAS) || '[]');
        const atualizadas = cirurgiasSalvas.map(c => 
          String(c.id) === String(detalhesCirurgia.id) 
            ? { ...c, materiais: novomateriais } 
            : c
        );
        localStorage.setItem(STORAGE_KEYS.CIRURGIAS, JSON.stringify(atualizadas));
      }

      return novomateriais;
    });
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#3B42B2] flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-[#3B42B2] text-white flex flex-col justify-between font-sans m-0 p-0 overflow-x-hidden">
      
      {/* TOPO FIXO */}
      <div className="pt-8 pb-4 px-6 text-white flex items-center justify-between shrink-0">
        <button 
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold tracking-wide flex-1 text-center mr-6">Detalhes da Cirurgia</h1>
      </div>

      {/* PAINEL INFERIOR ARREDONDADO */}
      <div className="flex-1 bg-white rounded-t-[32px] overflow-y-auto px-5 py-6 space-y-6 shadow-inner text-slate-800">
        
        {/* 1. CARD INFORMATIVO PRINCIPAL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                <User className="text-gray-500" size={24} />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-950 text-sm leading-snug">{detalhesCirurgia?.paciente}</h2>
                <p className="text-gray-400 text-[10px] font-semibold">{detalhesCirurgia?.documento}</p>
              </div>
            </div>
            <span className="bg-[#DEF5E9] text-[#2E7D32] text-[9px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {detalhesCirurgia?.status || 'Agendada'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
            <div>
              <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Procedimento</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight">{detalhesCirurgia?.procedimento}</span>
            </div>
            <div>
              <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Data</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight">{detalhesCirurgia?.data}</span>
            </div>
            <div>
              <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Horário</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight">{detalhesCirurgia?.horario}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Local</span>
            <span className="text-gray-500 font-medium text-[11px]">{detalhesCirurgia?.local}</span>
          </div>
        </div>

        {/* 2. EQUIPE RESPONSÁVEL */}
        <div className="space-y-3">
          <h3 className="text-[#3B42B2] font-extrabold text-sm">Equipe responsável</h3>
          
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {detalhesCirurgia?.equipe?.map((membro) => (
              <div key={membro.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">{membro.nome}</h4>
                    <p className="text-gray-400 text-[10px] font-medium leading-none mt-0.5">{membro.funcao}</p>
                  </div>
                </div>
                <span className={`${membro.tagColor} text-[9px] font-bold px-2.5 py-1 rounded-full`}>
                  {membro.papel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. MATERIAIS PREVISTOS */}
        <div className="space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3B42B2] font-extrabold text-sm">Materiais previstos</h3>
            <button 
              type="button"
              onClick={() => navigate('/app/professor/estoque/materiais')}
              className="text-[#3B42B2] text-xs font-bold hover:underline cursor-pointer"
            >
              Adicionar materiais
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {materiais.map((mat) => {
              const IconComp = ICON_MAP[mat.iconName] || Package;
              return (
                <div key={mat.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#3B42B2] shrink-0">
                      <IconComp size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-950 text-xs truncate leading-tight">{mat.nome}</h4>
                      <p className="text-gray-400 text-[9px] font-semibold">{mat.sub}</p>
                    </div>
                  </div>

                  {/* Botões do Contador */}
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-1 bg-gray-50">
                    <button 
                      type="button"
                      onClick={() => alterarQuantidade(mat.id, -1)}
                      className="p-1 text-gray-500 hover:text-[#3B42B2] transition active:scale-90 cursor-pointer"
                    >
                      <Minus size={12} className="stroke-[3]" />
                    </button>
                    <span className="text-gray-950 font-bold text-xs w-4 text-center select-none">{mat.qtd}</span>
                    <button 
                      type="button"
                      onClick={() => alterarQuantidade(mat.id, 1)}
                      className="p-1 text-gray-500 hover:text-[#3B42B2] transition active:scale-90 cursor-pointer"
                    >
                      <Plus size={12} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}