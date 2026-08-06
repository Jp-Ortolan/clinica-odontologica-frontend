import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, User } from 'lucide-react';
import api from '../../Services/api';

export default function DetalhesPacienteAluno() {
  const navigate = useNavigate();
  const location = useLocation();

  const pacienteState = location.state?.paciente || {};
  const [paciente, setPaciente] = useState(pacienteState);
  const [listaAtendimentos, setListaAtendimentos] = useState([]);

  const pacienteId = pacienteState.id;

  useEffect(() => {
    if (pacienteId) {
      api.get(`/pacientes/${pacienteId}`).then((res) => setPaciente(res.data)).catch((err) => console.error(err));
      api.get(`/pacientes/${pacienteId}/evolucoes`)
        .then((res) => setListaAtendimentos(res.data))
        .catch((err) => console.error('Erro ao carregar evoluções:', err));
    }
  }, [pacienteId]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FD] font-sans">
      
      {/* TOPO FIXO EXCLUSIVO DO ALUNO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between relative z-10 shrink-0 rounded-b-[24px] shadow-md select-none">
        <button 
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para a página anterior"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-bold tracking-wide flex-1 text-center mr-6">Detalhes do paciente</h1>
      </div>

      {/* CONTEÚDO ROLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-8">
        
        {/* IDENTIFICAÇÃO DO PACIENTE */}
        <div className="flex items-center gap-3.5 px-1 select-none">
          <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center bg-white text-gray-400 shadow-xs shrink-0 overflow-hidden">
            <User size={32} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-950 text-base truncate">{paciente.nome}</h2>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                paciente.ativo === false
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {paciente.ativo === false ? 'Inativo' : 'Ativo'}
              </span>
            </div>
            <p className="text-gray-400 text-xs font-semibold mt-0.5">{paciente.cpf}</p>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200/60 w-full my-1"></div>

        {/* INFORMAÇÕES PESSOAIS */}
        <div className="space-y-2">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <h3 className="text-[#3B44A8] font-black text-xs mb-3">Informações pessoais</h3>
            <div>
              <span className="block text-gray-950 font-black text-[11px]">Nome completo</span>
              <span className="block text-gray-500 font-bold text-[11px] mt-0.5">
                {paciente.nome}
              </span>
            </div>
          </div>
        </div>

        {/* HISTÓRICO INTEGRADO DE ATENDIMENTOS */}
        <div className="space-y-2">
          <h3 className="text-[#3B44A8] font-black text-xs px-1">Histórico de atendimentos</h3>
          
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {listaAtendimentos.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">Nenhum atendimento registrado ainda.</div>
            ) : (
              listaAtendimentos.map((atendimento) => (
                <div
                  key={atendimento.id}
                  className="p-4 flex items-center justify-between bg-white hover:bg-gray-50/60 transition"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <span className="text-[#3B44A8] font-black text-[11px] block">
                      {atendimento.criado_em ? new Date(atendimento.criado_em).toLocaleDateString('pt-BR') : '-'}
                    </span>
                    <h4 className="font-bold text-gray-900 text-xs">
                      {atendimento.descricao}
                    </h4>
                  </div>
                  <ChevronRight size={18} className="text-[#3B44A8] shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}