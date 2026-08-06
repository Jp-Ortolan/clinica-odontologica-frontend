import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MoreVertical, User, Plus, Loader2, AlertCircle } from 'lucide-react';
import api from '../Services/api'; // Ajustado para ../Services/api

export default function AgendaGeral() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [dataAncorada, setDataAncorada] = useState(new Date()); 
  const [diaSelecionado, setDiaSelecionado] = useState(new Date()); 
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const ano = dataAncorada.getFullYear();
  const mesId = dataAncorada.getMonth(); 

  // Carrega os agendamentos da API quando o mês ou ano mudar
  useEffect(() => {
    buscarAgendamentos();
  }, [ano, mesId]);

  const buscarAgendamentos = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get('/agendamentos', {
        params: { mes: mesId + 1, ano }
      });
      
      const dadosTratados = response.data.map((item) => {
        const dataObj = new Date(item.dataHora || item.data);
        return {
          id: item.id || item._id,
          nome: item.pacienteNome || item.paciente?.nome || item.nome || "Paciente sem nome",
          hora: item.hora || item.horario || dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          procedimento: item.procedimento || item.procedimentoNome || "Consulta",
          confirmado: item.status ? item.status.toUpperCase() === 'CONFIRMADO' : (item.confirmado ?? true),
          dia: dataObj.getDate(),
          mes: dataObj.getMonth(),
          ano: dataObj.getFullYear(),
          objetoOriginal: item
        };
      });

      setAgendamentos(dadosTratados);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setErro('Não foi possível carregar as consultas agendadas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbertoId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nomeMesAno = dataAncorada.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const nomeMesFormatado = nomeMesAno.charAt(0).toUpperCase() + nomeMesAno.slice(1);

  const diasDaSemanaLetras = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const primeiroDiaDoMes = new Date(ano, mesId, 1).getDay(); 
  const totalDiasNoMes = new Date(ano, mesId + 1, 0).getDate();

  const mesAnterior = () => setDataAncorada(new Date(ano, mesId - 1, 1));
  const mesSeguinte = () => setDataAncorada(new Date(ano, mesId + 1, 1));

  const agendamentosFiltrados = agendamentos.filter(
    (ag) => ag.dia === diaSelecionado.getDate() && 
            ag.mes === diaSelecionado.getMonth() && 
            ag.ano === diaSelecionado.getFullYear()
  );

  const alternarMenu = (id, e) => {
    e.stopPropagation();
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 select-none relative min-h-full pb-24 font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Calendário no Topo */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
          <div className="flex items-center justify-between mb-6">
            <button onClick={mesAnterior} className="p-2 text-[#3B44A8] hover:bg-gray-200/60 rounded-full transition">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-[#3B44A8] font-black text-lg">{nomeMesFormatado}</h2>
            <button onClick={mesSeguinte} className="p-2 text-[#3B44A8] hover:bg-gray-200/60 rounded-full transition">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {diasDaSemanaLetras.map((letra, idx) => (
              <span key={idx} className="text-gray-400 text-xs font-bold">{letra}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {Array.from({ length: primeiroDiaDoMes }).map((_, idx) => (
              <div key={`empty-${idx}`} className="w-9 h-9"></div>
            ))}

            {Array.from({ length: totalDiasNoMes }).map((_, idx) => {
              const numeroDia = idx + 1;
              const dataCard = new Date(ano, mesId, numeroDia);
              
              const isSelected = 
                diaSelecionado.getDate() === numeroDia && 
                diaSelecionado.getMonth() === mesId &&
                diaSelecionado.getFullYear() === ano;

              return (
                <button key={numeroDia} onClick={() => setDiaSelecionado(dataCard)} className="flex justify-center items-center py-1">
                  <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-black transition-all ${
                    isSelected 
                      ? 'bg-[#3B44A8] text-white shadow-md shadow-blue-900/20 scale-105' 
                      : 'text-gray-600 hover:bg-gray-200/70'
                  }`}>
                    {numeroDia}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback visual de erro */}
        {erro && (
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-600 text-xs font-medium">
            <AlertCircle size={16} />
            {erro}
          </div>
        )}

        {/* Lista de Consultas */}
        <div className="divide-y divide-gray-100 bg-white rounded-b-3xl">
          {carregando ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 size={24} className="animate-spin text-[#3B44A8]" />
              <span className="text-xs font-medium">Carregando consultas...</span>
            </div>
          ) : agendamentosFiltrados.length > 0 ? (
            agendamentosFiltrados.map((item, index) => {
              const esUltimoItem = index === agendamentosFiltrados.length - 1;

              return (
                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50/60 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{item.nome}</h3>
                      <p className="text-gray-500 text-xs mt-0.5 font-medium">
                        {item.hora} • <span className="text-gray-400">{item.procedimento}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    {item.confirmado ? (
                      <span className="bg-blue-50 text-[#3B44A8] border border-blue-100 text-[11px] font-bold px-3 py-1 rounded-full">
                        Agendada
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-600 border border-red-100 text-[11px] font-bold px-3 py-1 rounded-full">
                        Confirmação pendente
                      </span>
                    )}

                    <button 
                      onClick={(e) => alternarMenu(item.id, e)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {menuAbertoId === item.id && (
                      <div 
                        ref={menuRef}
                        className={`absolute right-0 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 ${
                          esUltimoItem ? 'bottom-9' : 'top-9'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setMenuAbertoId(null);
                            navigate('/app/recepcao/agenda/reagendar', { state: { agendamento: item.objetoOriginal } });
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                        >
                          Reagendar consulta
                        </button>
                        <button
                          onClick={() => {
                            setMenuAbertoId(null);
                            navigate('/app/recepcao/agenda/cancelar', { state: { agendamento: item.objetoOriginal } });
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          Cancelar consulta
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 font-medium text-sm">
              Nenhuma consulta marcada para este dia.
            </div>
          )}
        </div>
      </div>

      {/* Botão Novo Agendamento */}
      <button 
        onClick={() => navigate('/app/recepcao/agenda/novo-agendamento')}
        className="fixed bottom-6 right-8 bg-[#F9A814] text-white p-4 rounded-full shadow-lg shadow-orange-500/20 hover:bg-orange-500 hover:scale-105 transition-all z-40"
      >
        <Plus size={24} className="stroke-[3]" />
      </button>
    </div>
  );
}