import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ChevronRight, Info } from 'lucide-react';
import api from '../../Services/api';

export default function ListaCirurgias() {
  const navigate = useNavigate();

  // Data atual do sistema
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [cirurgias, setCirurgias] = useState([]);
  const [pacientesPorId, setPacientesPorId] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/cirurgias'),
      api.get('/pacientes'),
    ]).then(([cirurgiasRes, pacientesRes]) => {
      const nomePorId = {};
      pacientesRes.data.forEach((p) => { nomePorId[p.id] = p.nome; });
      setPacientesPorId(nomePorId);
      setCirurgias(cirurgiasRes.data);
    }).catch((err) => console.error('Erro ao carregar cirurgias:', err));
  }, []);

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

  const cirurgiasDoDia = cirurgias
    .filter((c) => {
      const d = new Date(c.data_hora);
      return d.getDate() === dataSelecionada.getDate() &&
        d.getMonth() === dataSelecionada.getMonth() &&
        d.getFullYear() === dataSelecionada.getFullYear();
    })
    .map((c) => ({
      id: c.id,
      horario: new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      paciente: pacientesPorId[c.paciente_id] || 'Paciente',
      procedimento: c.tipo_cirurgia || 'Cirurgia',
      status: c.status === 'agendada' ? 'Confirmada' : c.status === 'realizada' ? 'Concluída' : 'Cancelada',
      dadosOriginais: c,
    }));

  const totalConcluidas = cirurgiasDoDia.filter((c) => c.status === 'Concluída').length;
  const totalPendentes = cirurgiasDoDia.filter((c) => c.status === 'Confirmada').length;

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
            <span className="block text-2xl font-extrabold text-[#3B44A8] my-0.5">{cirurgiasDoDia.length}</span>
            <span className="block text-[8px] sm:text-[9px] font-semibold text-gray-800">Total</span>
          </div>
          <div className="bg-white border border-gray-150 rounded-2xl p-2.5 text-center shadow-xs">
            <span className="block text-gray-900 font-extrabold text-[9px] sm:text-[10px] leading-tight truncate">Concluídas</span>
            <span className="block text-2xl font-extrabold text-[#3B44A8] my-0.5">{totalConcluidas}</span>
            <span className="block text-[8px] sm:text-[9px] font-semibold text-gray-400">-</span>
          </div>
          <div className="bg-white border border-gray-150 rounded-2xl p-2.5 text-center shadow-xs">
            <span className="block text-gray-900 font-extrabold text-[9px] sm:text-[10px] leading-tight truncate">Pendentes</span>
            <span className="block text-2xl font-extrabold text-[#3B44A8] my-0.5">{totalPendentes}</span>
            <span className="block text-[8px] sm:text-[9px] font-semibold text-gray-400">-</span>
          </div>
        </div>

        {/* LISTA DAS CIRURGIAS */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100 mt-2">
          {cirurgiasDoDia.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-xs">Nenhuma cirurgia nesta data.</div>
          )}
          {cirurgiasDoDia.map((cirurgia) => (
            <div
              key={cirurgia.id}
              onClick={() => navigate('/app/aluno/cirurgias/detalhes', { state: { cirurgia: cirurgia.dadosOriginais } })}
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