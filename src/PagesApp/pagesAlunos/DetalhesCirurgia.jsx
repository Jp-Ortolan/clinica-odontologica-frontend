import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Package, 
  Layers, 
  Sparkles, 
  FileText, 
  Plus, 
  Minus 
} from 'lucide-react';

export default function DetalhesCirurgia() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dados com fallback para testes ou navegação direta
  const cirurgia = location.state?.cirurgia || {
    paciente: "Rhaya Borges",
    cpf: "012.123.456-89",
    procedimento: "Exodontia - 36",
    data: "26/05/2026",
    horario: "08:30",
    local: "Centro Cirúrgico",
    status: "Agendada"
  };

  // Estado para controlar as quantidades interativas dos materiais médicos
  const [materiais, setMateriais] = useState([
    { id: 1, nome: "Kit Cirúrgico 01", sub: "(1 Un)", qtd: 1, icon: Package },
    { id: 2, nome: "Seringa Carpule", sub: "(1 Un)", qtd: 1, icon: FileText },
    { id: 3, nome: "Campo Cirúrgico", sub: "(2 Un)", qtd: 1, icon: Layers },
    { id: 4, nome: "Luva Descartável", sub: "(2 Un)", qtd: 4, icon: Sparkles },
    { id: 5, nome: "Avental Cirúrgico", sub: "(1 Un)", qtd: 4, icon: Package },
    { id: 6, nome: "Gaze", sub: "(3 Un)", qtd: 4, icon: Layers },
  ]);

  const alterarQuantidade = (id, delta) => {
    setMateriais(prev => 
      prev.map(item => {
        if (item.id === id) {
          const novaQtd = Math.max(0, item.qtd + delta);
          return { ...item, qtd: novaQtd };
        }
        return item;
      })
    );
  };

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

          <div className="pt-1">
            <span className="block text-gray-950 font-black text-[10px] uppercase tracking-wider">Local</span>
            <span className="text-gray-500 font-medium text-[11px] block mt-0.5">{cirurgia.local}</span>
          </div>
        </div>

        {/* 2. EQUIPE RESPONSÁVEL */}
        <div className="space-y-2.5">
          <h3 className="text-[#3B44A8] font-black text-xs px-1">Equipe responsável</h3>
          
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {/* Responsável */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-xs">João Silva</h4>
                  <p className="text-gray-400 text-[10px] font-medium leading-none mt-0.5">Aluno</p>
                </div>
              </div>
              <span className="bg-[#DCE0F5] text-[#3B44A8] text-[9px] font-bold px-2.5 py-1 rounded-full">
                Responsável
              </span>
            </div>

            {/* Auxiliar 1 */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-xs">Matheus Mota</h4>
                  <p className="text-gray-400 text-[10px] font-medium leading-none mt-0.5">Aluno</p>
                </div>
              </div>
              <span className="bg-[#FFEED2] text-[#B45309] text-[9px] font-bold px-2.5 py-1 rounded-full">
                Auxiliar
              </span>
            </div>

            {/* Auxiliar 2 */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-xs">Alana Lopes</h4>
                  <p className="text-gray-400 text-[10px] font-medium leading-none mt-0.5">Aluno</p>
                </div>
              </div>
              <span className="bg-[#FFEED2] text-[#B45309] text-[9px] font-bold px-2.5 py-1 rounded-full">
                Auxiliar
              </span>
            </div>

            {/* Supervisor */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-xs">Dr. Carlos Eduardo</h4>
                  <p className="text-gray-400 text-[10px] font-medium leading-none mt-0.5">Professor</p>
                </div>
              </div>
              <span className="bg-[#DEF5E9] text-[#0f5132] text-[9px] font-bold px-2.5 py-1 rounded-full">
                Supervisor
              </span>
            </div>
          </div>
        </div>

        {/* 3. MATERIAIS PREVISTOS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[#3B44A8] font-black text-xs">Materiais previstos</h3>
            <button className="text-[#3B44A8] text-[10px] font-bold hover:underline cursor-pointer">
              + Adicionar materiais
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {materiais.map((mat) => {
              const IconComp = mat.icon;
              return (
                <div key={mat.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#3B44A8] shrink-0">
                      <IconComp size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-950 text-xs truncate leading-tight">{mat.nome}</h4>
                      <p className="text-gray-400 text-[9px] font-semibold mt-0.5">{mat.sub}</p>
                    </div>
                  </div>

                  {/* Contador de Quantidade */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shrink-0 shadow-2xs">
                    <button 
                      onClick={() => alterarQuantidade(mat.id, -1)}
                      className="p-1.5 px-2 text-gray-500 hover:text-[#3B44A8] hover:bg-gray-100 transition active:scale-95 cursor-pointer"
                      aria-label={`Diminuir quantidade de ${mat.nome}`}
                    >
                      <Minus size={11} className="stroke-[3]" />
                    </button>
                    <span className="text-gray-950 font-bold text-xs min-w-[20px] text-center select-none px-1">
                      {mat.qtd}
                    </span>
                    <button 
                      onClick={() => alterarQuantidade(mat.id, 1)}
                      className="p-1.5 px-2 text-gray-500 hover:text-[#3B44A8] hover:bg-gray-100 transition active:scale-95 cursor-pointer"
                      aria-label={`Aumentar quantidade de ${mat.nome}`}
                    >
                      <Plus size={11} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RODAPÉ FIXO DE AÇÕES */}
      <div className="p-4 border-t border-gray-100 bg-white flex gap-3 shrink-0 shadow-lg relative z-10">
        <button 
          onClick={() => navigate('/app/aluno/cirurgias')}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition active:scale-[0.98] cursor-pointer"
        >
          Voltar
        </button>
        <button 
          onClick={() => alert('Lista de materiais cirúrgicos salva!')}
          className="flex-1 py-3 bg-[#3B44A8] text-white rounded-xl font-bold text-xs hover:bg-[#30388d] transition active:scale-[0.98] shadow-sm cursor-pointer"
        >
          Salvar Materiais
        </button>
      </div>

    </div>
  );
}