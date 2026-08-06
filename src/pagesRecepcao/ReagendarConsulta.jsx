import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, ChevronRight, Info, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../Services/api'; // Módulo de API do projeto

export default function ReagendarConsulta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Tenta obter os dados do agendamento passados via state ou usa objeto padrão
  const consultaAtual = location.state?.agendamento || location.state?.consulta || {};
  const agendamentoId = id || consultaAtual.id || consultaAtual._id;

  const paciente = consultaAtual.paciente || {
    nome: consultaAtual.pacienteNome || 'Paciente não informado',
    cpf: consultaAtual.pacienteCpf || '---.---.---',
    status: 'Ativo'
  };

  // Formulário de Reagendamento
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Estados de Controle de Requisição
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Submissão do Reagendamento para a API
  const handleReagendar = async (e) => {
    e.preventDefault();

    if (!novaData || !novoHorario) {
      setErro('Por favor, preencha a nova data e horário.');
      return;
    }

    if (!motivo.trim()) {
      setErro('Por favor, informe o motivo da alteração.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      const payload = {
        data: novaData,
        horario: novoHorario,
        motivoAlteracao: motivo,
        observacoes,
        status: 'AGENDADO'
      };

      // Chamada PUT para reagendar
      await api.put(`/agendamentos/${agendamentoId}/reagendar`, payload)
        .catch(async () => {
          // Fallback para rota padrão caso a rota específica não exista
          await api.put(`/agendamentos/${agendamentoId}`, {
            ...consultaAtual,
            ...payload
          });
        });

      setSucesso(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error('Erro ao reagendar consulta:', err);
      setErro(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao reagendar consulta. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 select-none font-sans">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex items-center gap-4 text-[#3B44A8]">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black">Reagendar Consulta</h1>
      </div>

      {/* CARD DO PACIENTE */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">{paciente.nome}</h3>
              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                {paciente.status || 'Ativo'}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">{paciente.cpf}</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => navigate('/app/recepcao/pacientes/detalhes', { state: { paciente } })}
          className="text-[#3B44A8] text-xs font-bold flex items-center gap-0.5 hover:underline"
        >
          Ver histórico <ChevronRight size={14} />
        </button>
      </div>

      {/* FORMULÁRIO DE REAGENDAMENTO */}
      <form onSubmit={handleReagendar} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
        
        {/* MENSAGEM DE SUCESSO OU ERRO */}
        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 size={18} />
            <span>Consulta reagendada com sucesso! Redirecionando...</span>
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold">
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        {/* CONSULTA ATUAL */}
        <div className="space-y-1.5">
          <label className="text-sm font-black text-[#3B44A8]">Consulta atual</label>
          <div className="bg-[#E4E6F4] border border-blue-100 rounded-2xl p-4 relative">
            <span className="absolute right-4 top-4 bg-[#B7BCED] text-[#3B44A8] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {consultaAtual.status || 'Agendada'}
            </span>
            <div className="flex gap-4 text-[#3B44A8] font-black text-sm mb-2">
              <span>{consultaAtual.data || consultaAtual.dataAgendamento || 'Data não informada'}</span>
              <span>{consultaAtual.horario || consultaAtual.hora || 'Horário não informado'}</span>
            </div>
            <div className="text-[11px] text-gray-700 font-bold space-y-0.5">
              <p>{consultaAtual.procedimento || consultaAtual.procedimentoNome || 'Avaliação'}</p>
              <p className="text-gray-500 font-medium">
                Profissional responsável: {consultaAtual.profissional || consultaAtual.dentista || 'Não informado'}
              </p>
              {consultaAtual.aluno && (
                <p className="text-gray-500 font-medium">Aluno: {consultaAtual.aluno}</p>
              )}
              {consultaAtual.especialidade && (
                <p className="text-gray-500 font-medium">Especialidade: {consultaAtual.especialidade}</p>
              )}
              {consultaAtual.consultorio && (
                <p className="text-gray-500 font-medium">Local: {consultaAtual.consultorio}</p>
              )}
            </div>
          </div>
        </div>

        {/* NOVA DATA E HORÁRIO */}
        <div className="space-y-1.5">
          <label className="text-sm font-black text-[#3B44A8]">Nova data e horário</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input 
                type="date" 
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#3B44A8]" 
                required
              />
              <Calendar size={18} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <input 
                type="time" 
                value={novoHorario}
                onChange={(e) => setNovoHorario(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#3B44A8]" 
                required
              />
              <Clock size={18} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* MOTIVO DA ALTERAÇÃO */}
        <div className="space-y-1.5">
          <label className="text-sm font-black text-[#3B44A8]">Motivo da alteração *</label>
          <input 
            type="text" 
            placeholder="Adicione o motivo" 
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#3B44A8]" 
            required
          />
        </div>

        {/* OBSERVAÇÕES */}
        <div className="space-y-1.5">
          <label className="text-sm font-black text-[#3B44A8]">Observações</label>
          <textarea 
            rows="2" 
            placeholder="Adicione observações (opcional)" 
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#3B44A8] resize-none" 
          />
        </div>

        {/* ALERTA INFORMATIVO */}
        <div className="bg-[#E4E6F4] border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-[#3B44A8]">
          <Info size={16} className="shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold leading-tight">
            O paciente será notificado sobre a alteração do agendamento.
          </p>
        </div>

        {/* BOTÃO SUBMIT */}
        <button 
          type="submit"
          disabled={salvando || sucesso}
          className="w-full bg-[#F9A814] text-white font-black text-sm p-4 rounded-xl shadow-md hover:bg-orange-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {salvando ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Salvando Reagendamento...</span>
            </>
          ) : (
            'Confirmar reagendamento'
          )}
        </button>
      </form>
    </div>
  );
}