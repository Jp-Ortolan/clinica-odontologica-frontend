import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, AlertTriangle, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../Services/api'; // Ajustado caminho e maiúscula para Services

export default function StatusConsultas() {
  const navigate = useNavigate();
  const location = useLocation();

  // Captura se o dashboard enviou alguma aba preferencial, senão assume 'confirmadas'
  const abaInicial = location.state?.abaInicial || 'confirmadas';
  const [abaAtiva, setAbaAtiva] = useState(abaInicial); // 'confirmadas', 'pendentes', 'faltas'

  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Busca agendamentos filtrados pela aba na API
  const carregarConsultas = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      // Mapeamento das abas para o status do backend
      const mapaStatus = {
        confirmadas: 'CONFIRMADO',
        pendentes: 'PENDENTE',
        faltas: 'FALTA' // ou 'NAO_COMPARECEU' / 'CANCELADO' conforme convenção da API
      };

      const statusParam = mapaStatus[abaAtiva] || 'CONFIRMADO';
      const resposta = await api.get('/agendamentos', {
        params: { status: statusParam }
      });

      setConsultas(resposta.data || []);
    } catch (err) {
      console.error('Erro ao buscar consultas por status:', err);
      setErro('Não foi possível carregar as consultas.');
    } finally {
      setCarregando(false);
    }
  }, [abaAtiva]);

  useEffect(() => {
    carregarConsultas();
  }, [carregarConsultas]);

  return (
    <div className="flex flex-col w-full min-h-full font-sans">
      
      {/* HEADER WEB COM BOTÃO VOLTAR */}
      <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/recepcao/dashboard')}
            className="p-2 bg-gray-50 text-[#3B44A8] hover:bg-gray-100 rounded-xl transition active:scale-95 border border-gray-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black text-gray-950">
            {abaAtiva === 'confirmadas' && 'Confirmados'}
            {abaAtiva === 'pendentes' && 'Confirmações pendentes'}
            {abaAtiva === 'faltas' && 'Faltas'}
          </h1>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="p-8 space-y-6 max-w-7xl w-full mx-auto flex-1">
        
        {/* FILTROS / ABAS (TABS) */}
        <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex items-center gap-1.5 select-none border border-gray-200">
          <button
            onClick={() => setAbaAtiva('confirmadas')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
              abaAtiva === 'confirmadas'
                ? 'bg-[#3B44A8] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Confirmadas
          </button>
          <button
            onClick={() => setAbaAtiva('pendentes')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
              abaAtiva === 'pendentes'
                ? 'bg-[#3B44A8] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setAbaAtiva('faltas')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
              abaAtiva === 'faltas'
                ? 'bg-[#3B44A8] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Faltas
          </button>
        </div>

        {/* BANNER INFORMATIVO DINÂMICO */}
        {abaAtiva === 'confirmadas' && (
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-blue-800">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold">Atendimentos confirmados pelos pacientes.</p>
            </div>
          </div>
        )}

        {abaAtiva === 'pendentes' && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3 text-purple-900">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black">Aguardando confirmação</h4>
              <p className="text-[11px] font-medium text-purple-700 mt-0.5">
                Entre em contato com os pacientes para confirmar os atendimentos agendados.
              </p>
            </div>
          </div>
        )}

        {abaAtiva === 'faltas' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-900">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold">Pacientes que não compareceram ao atendimento.</p>
            </div>
          </div>
        )}

        {/* CARREGAMENTO E ERRO */}
        {carregando ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm text-gray-500 gap-3 min-h-[300px]">
            <Loader2 size={32} className="animate-spin text-[#3B44A8]" />
            <p className="text-sm font-medium">Carregando consultas...</p>
          </div>
        ) : erro ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm text-gray-500 gap-3 min-h-[300px]">
            <AlertCircle size={36} className="text-red-500" />
            <p className="text-sm font-bold text-gray-800">{erro}</p>
            <button 
              onClick={carregarConsultas}
              className="text-xs text-[#3B44A8] font-bold underline mt-1"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          /* RENDERIZAÇÃO DA LISTA DE CONSULTAS */
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {consultas.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium">
                Nenhuma consulta encontrada nesta categoria.
              </div>
            ) : (
              consultas.map((item, idx) => (
                <ItemLista 
                  key={item.id || item._id || idx} 
                  paciente={{
                    id: item.id || item._id,
                    data: item.data || '---',
                    hora: item.horario || item.hora || '--:--',
                    nome: item.pacienteNome || item.paciente?.nome || 'Paciente sem nome',
                    proc: item.procedimento || item.servico || 'Consulta Geral',
                    esp: item.especialidade || item.categoria || 'Odontologia',
                    raw: item
                  }} 
                  onSelect={(agendamento) => navigate('/app/recepcao/agenda', { state: { agendamento } })}
                />
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// Subcomponente interno para os itens da lista
function ItemLista({ paciente, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(paciente.raw)}
      className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition cursor-pointer group"
    >
      <div className="flex items-center flex-1 min-w-0">
        {/* Data e Hora agrupados */}
        <div className="text-gray-500 font-bold text-[11px] w-20 text-center bg-gray-50 py-1 rounded-lg border border-gray-200 space-y-0.5 select-none">
          <div className="font-black text-gray-700">{paciente.data}</div>
          <div className="text-[10px] text-gray-400 font-medium">{paciente.hora}</div>
        </div>
        
        <div className="w-[1px] h-8 bg-gray-200 mx-4"></div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-950 text-sm truncate">{paciente.nome}</h4>
          <p className="text-gray-600 text-xs font-medium mt-0.5">
            {paciente.proc} • <span className="text-gray-400 text-[11px]">{paciente.esp}</span>
          </p>
        </div>
      </div>

      <div className="ml-4 text-gray-400 group-hover:text-[#3B44A8] transition-colors">
        <ChevronRight size={18} />
      </div>
    </div>
  );
}