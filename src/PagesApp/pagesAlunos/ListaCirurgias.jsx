import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ChevronRight, Info } from 'lucide-react';

export default function ListaCirurgias() {
  const navigate = useNavigate();

  // Data atual do sistema
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  // Formata para "Hoje, DD de Mês de AAAA" ou "DD de Mês de AAAA"
  const formatarDataExtenso = (date) => {
    const hoje = new Date();
    const ehHoje = 
      date.getDate() === hoje.getDate() &&
      date.getMonth() === hoje.getMonth() &&
      date.getFullYear() === hoje.getFullYear();

    const dataFormatada = date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Capitaliza o mês (ex: "julho" -> "Julho")
    const partes = dataFormatada.split(' de ');
    if (partes[1]) {
      partes[1] = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);
    }

    const dataFinal = partes.join(' de ');
    return ehHoje ? `Hoje, ${dataFinal}` : dataFinal;
  };

  // Converte objeto Date para string YYYY-MM-DD local sem desvio de fuso horário
  const formatarParaInputDate = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const handleDataChange = (e) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      setDataSelecionada(new Date(year, month - 1, day));
    }
  };

  const cirurgiasHoje = [
    {
      id: 1,
      horario: "08:30",
      paciente: "Rhaya Borges",
      procedimento: "Exodontia - 36",
      professor: "Prof. Dr. Carlos Eduardo",
      local: "Centro Cirúrgico",
      status: "Confirmada"
    },
    {
      id: 2,
      horario: "15:30",
      paciente: "Nome do paciente",
      procedimento: "Extração de siso",
      professor: "Prof. Dra. Ana Maria",
      local: "Centro Cirúrgico",
      status: "Pendente"
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans">
      {/* TOPO FIXO */}
      <div className="bg-[#3B44A8] pt-10 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0">
        <button 
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar para tela anterior"
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={22} />
        </button>
        
        <h1 className="text-lg font-bold tracking-wide flex-1 text-center mr-6">
          Lista de Cirurgias
        </h1>
      </div>

      {/* CONTEÚDO ROLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-20">
        
        {/* CARD DA DATA DINÂMICA */}
        <div 
          role="region"
          aria-label="Seleção de data para filtragem de cirurgias"
          className="relative w-full border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xs bg-white select-none hover:border-[#3B44A8] transition cursor-pointer"
        >
          <span className="text-[#3B44A8] font-bold text-xs">
            {formatarDataExtenso(dataSelecionada)}
          </span>
          <Calendar className="text-[#3B44A8]" size={18} />

          <input 
            type="date"
            aria-label="Alterar data selecionada"
            value={formatarParaInputDate(dataSelecionada)}
            onChange={handleDataChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>

        {/* SELECTOR SECUNDÁRIO (MUTIRÃO) */}
        <div className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xs bg-white select-none">
          <span className="text-[#3B44A8] font-bold text-xs">Mutirão Cirúrgico</span>
          <Calendar className="text-[#3B44A8]" size={18} />
        </div>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-3 gap-2 select-none pt-1">
          <div className="bg-white border border-gray-150 rounded-2xl p-2.5 text-center shadow-xs">
            <span className="block text-gray-900 font-extrabold text-[9px] sm:text-[10px] leading-tight truncate">Cirurgias do dia</span>
            <span className="block text-2xl font-extrabold text-[#3B44A8] my-0.5">2</span>
            <span className="block text-[8px] sm:text-[9px] font-semibold text-gray-800">Confirmadas</span>
          </div>
          <div className="bg-white border border-gray-150 rounded-2xl p-2.5 text-center shadow-xs">
            <span className="block text-gray-900 font-extrabold text-[9px] sm:text-[10px] leading-tight truncate">Concluídas</span>
            <span className="block text-2xl font-extrabold text-[#3B44A8] my-0.5">0</span>
            <span className="block text-[8px] sm:text-[9px] font-semibold text-gray-400">-</span>
          </div>
          <div className="bg-white border border-gray-150 rounded-2xl p-2.5 text-center shadow-xs">
            <span className="block text-gray-900 font-extrabold text-[9px] sm:text-[10px] leading-tight truncate">Pendentes</span>
            <span className="block text-2xl font-extrabold text-[#3B44A8] my-0.5">1</span>
            <span className="block text-[8px] sm:text-[9px] font-semibold text-gray-400">-</span>
          </div>
        </div>

        {/* LISTA DAS CIRURGIAS */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100 mt-2">
          {cirurgiasHoje.map((cirurgia) => (
            <div 
              key={cirurgia.id} 
              onClick={() => navigate('/app/aluno/cirurgias/detalhes', { state: { cirurgia } })}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer select-none active:bg-gray-100"
            >
              <div className="text-gray-500 font-medium text-xs w-10 pr-1 text-center shrink-0">
                {cirurgia.horario}
              </div>
              
              <div className="w-[1px] h-10 bg-gray-200 mr-3 shrink-0"></div>
              
              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 8a7 7 0 0114 0H5z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-gray-950 text-xs truncate">
                      {cirurgia.paciente}
                    </h2>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      cirurgia.status === 'Confirmada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {cirurgia.status}
                    </span>
                  </div>
                  <p className="text-[#3B44A8] text-[11px] font-semibold truncate">
                    {cirurgia.procedimento}
                  </p>
                  <p className="text-gray-500 text-[9px] font-medium leading-none mt-0.5 truncate">
                    {cirurgia.professor}
                  </p>
                  <div className="flex items-center gap-1 text-[8px] text-gray-400 font-semibold mt-1">
                    <MapPin size={8} className="text-gray-400 shrink-0" />
                    <span className="truncate">{cirurgia.local}</span>
                  </div>
                </div>
              </div>
              
              <div className="pl-2 text-[#3B44A8] shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>

        {/* CAIXA INFORMATIVA */}
        <div className="bg-[#DCE0F5] p-3.5 rounded-xl flex items-start gap-2.5 border border-[#3B44A8]/10 shadow-inner">
          <Info className="text-[#3B44A8] shrink-0 mt-0.5" size={16} />
          <p className="text-[10px] text-[#3B44A8] leading-tight">
            Chegue ao centro cirúrgico com pelo menos 15 minutos de antecedência.<br />
            Confira os materiais e a equipe antes de iniciar o procedimento.
          </p>
        </div>

      </div>
    </div>
  );
}