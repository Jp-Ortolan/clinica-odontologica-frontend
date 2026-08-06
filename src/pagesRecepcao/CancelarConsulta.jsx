import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, User, ChevronRight, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../Services/api'; // Import ajustado para subir uma pasta e respeitar a letra maiúscula

export default function CancelarConsulta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();

  // Tenta obter os dados do agendamento vindo pela navegação (state)
  const agendamentoState = location.state?.agendamento || null;

  const [agendamento, setAgendamento] = useState(agendamentoState);
  const [motivo, setMotivo] = useState('');
  const [carregandoDados, setCarregandoDados] = useState(!agendamentoState);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const agendamentoId = agendamento?.id || agendamento?._id || paramId;

  // Busca os dados da consulta se não tiverem sido passados pelo state
  useEffect(() => {
    if (!agendamento && agendamentoId) {
      setCarregandoDados(true);
      api.get(`/agendamentos/${agendamentoId}`)
        .then((response) => {
          setAgendamento(response.data);
        })
        .catch((err) => {
          console.error('Erro ao buscar consulta:', err);
          setErro('Não foi possível carregar os detalhes da consulta.');
        })
        .finally(() => {
          setCarregandoDados(false);
        });
    }
  }, [agendamento, agendamentoId]);

  const handleCancelar = async (e) => {
    e.preventDefault();

    if (!motivo.trim()) {
      setErro('Por favor, informe o motivo do cancelamento.');
      return;
    }

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      // Tenta rota específica de cancelamento
      await api.put(`/agendamentos/${agendamentoId}/cancelar`, {
        motivo,
        status: 'CANCELADO'
      }).catch(async () => {
        // Fallback para rota padrão de atualização de agendamento
        await api.put(`/agendamentos/${agendamentoId}`, {
          ...agendamento,
          status: 'CANCELADO',
          motivoCancelamento: motivo
        });
      });

      setSucesso('Consulta cancelada com sucesso!');

      setTimeout(() => {
        navigate(-1);
      }, 1500);

    } catch (err) {
      console.error('Erro ao cancelar consulta:', err);
      const msg = err.response?.data?.message || err.response?.data?.mensagem || 'Erro ao cancelar a consulta. Tente novamente.';
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (carregandoDados) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-500 font-sans min-h-[300px]">
        <Loader2 size={32} className="animate-spin text-[#3B44A8]" />
        <p className="text-sm font-medium">Carregando dados da consulta...</p>
      </div>
    );
  }

  // Mapeamento dinâmico de informações do paciente e da consulta
  const pacienteNome = agendamento?.pacienteNome || agendamento?.paciente?.nome || 'Paciente não identificado';
  const pacienteCpf = agendamento?.pacienteCpf || agendamento?.paciente?.cpf || 'CPF não informado';
  const pacienteStatus = agendamento?.paciente?.status || (agendamento?.paciente?.ativo ? 'Ativo' : 'Ativo');
  
  const dataConsulta = agendamento?.data || agendamento?.dataAgendamento || 'Data não definida';
  const horaConsulta = agendamento?.hora || agendamento?.horario || 'Horário não definido';
  const tipoConsulta = agendamento?.tipoConsulta || agendamento?.procedimento || agendamento?.procedimentoNome || 'Consulta';
  const profissional = agendamento?.profissional || agendamento?.dentista || agendamento?.usuario?.nome || 'Não informado';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 select-none font-sans">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 text-[#3B44A8]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black">Cancelar Consulta</h1>
      </div>

      {/* Card do Paciente */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">{pacienteNome}</h3>
              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                {pacienteStatus}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">{pacienteCpf}</p>
          </div>
        </div>

        {(agendamento?.pacienteId || agendamento?.paciente?._id || agendamento?.paciente?.id) && (
          <button 
            type="button"
            onClick={() => navigate('/app/recepcao/pacientes/detalhes', { state: { paciente: agendamento.paciente } })}
            className="text-[#3B44A8] text-xs font-bold flex items-center gap-0.5 hover:underline"
          >
            Ver histórico <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Formulário e Detalhes da Consulta */}
      <form onSubmit={handleCancelar} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
        
        {/* Alertas de Erro ou Sucesso */}
        {erro && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertTriangle size={16} className="shrink-0" />
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            {sucesso}
          </div>
        )}

        {/* Resumo da Consulta */}
        <div className="space-y-1.5">
          <label className="text-sm font-black text-[#3B44A8]">Consulta a ser cancelada</label>
          <div className="bg-[#E4E6F4] border border-blue-100 rounded-2xl p-4 relative">
            <span className="absolute right-4 top-4 bg-[#B7BCED] text-[#3B44A8] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {agendamento?.status || 'Agendada'}
            </span>
            <div className="flex gap-4 text-[#3B44A8] font-black text-sm mb-2">
              <span>{dataConsulta}</span>
              <span>{horaConsulta}</span>
            </div>
            <div className="text-[11px] text-gray-700 font-bold space-y-0.5">
              <p>{tipoConsulta}</p>
              <p className="text-gray-500 font-medium">Profissional responsável: {profissional}</p>
              {agendamento?.aluno && (
                <p className="text-gray-500 font-medium">Aluno: {agendamento.aluno}</p>
              )}
              {agendamento?.disciplina && (
                <p className="text-gray-500 font-medium">{agendamento.disciplina}</p>
              )}
              {agendamento?.consultorio && (
                <p className="text-gray-500 font-medium">{agendamento.consultorio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Campo do Motivo */}
        <div className="space-y-1.5">
          <label className="text-sm font-black text-[#3B44A8]">Motivo do cancelamento *</label>
          <input 
            type="text" 
            required
            placeholder="Adicione o motivo (ex: Imprevisto pessoal, desistência)" 
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 transition-colors" 
          />
        </div>

        {/* Alerta de confirmação */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2.5 text-red-600">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold leading-tight">
            Ao cancelar, o horário ficará disponível para outros agendamentos.
          </p>
        </div>

        {/* Botão de Ação */}
        <button 
          type="submit"
          disabled={enviando || !!sucesso}
          className="w-full bg-[#D32F2F] text-white font-black text-sm p-4 rounded-xl shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {enviando ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Cancelando...
            </>
          ) : (
            'Confirmar cancelamento'
          )}
        </button>
      </form>
    </div>
  );
}