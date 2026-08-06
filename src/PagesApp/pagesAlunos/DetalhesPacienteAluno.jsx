import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, User } from 'lucide-react';

export default function DetalhesPacienteAluno() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera o paciente enviado via estado ou assume o padrão
  const paciente = location.state?.paciente || {
    nome: 'Rhaya Borges',
    nomeCompleto: 'Rhaya Borges da Silva',
    cpf: '012.123.456-89',
    status: 'Ativo'
  };

  // Histórico de atendimentos do paciente
  const listaAtendimentos = [
    {
      id: 1,
      data: '18/05/2026',
      procedimento: 'Instalação de Aparelho Fixo',
      disciplina: 'Ortodontia',
      professor: 'Prof. Dr. Michel Barros',
      aluno: 'Aluna: Isabela Lima'
    },
    {
      id: 2,
      data: '02/05/2026',
      procedimento: 'Manutenção Preventiva',
      disciplina: 'Ortodontia',
      professor: 'Prof. Dr. Michel Barros',
      aluno: 'Aluna: Isabela Lima'
    },
    {
      id: 3,
      data: '14/04/2026',
      procedimento: 'Profilaxia e Avaliação',
      disciplina: 'Diagnóstico',
      professor: 'Prof. Dra. Ana Costa',
      aluno: 'Aluno: Rhaya Borges'
    }
  ];

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
                paciente.status?.toLowerCase() === 'inativo' 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {paciente.status || 'Ativo'}
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
                {paciente.nomeCompleto || paciente.nome}
              </span>
            </div>
          </div>
        </div>

        {/* HISTÓRICO INTEGRADO DE ATENDIMENTOS */}
        <div className="space-y-2">
          <h3 className="text-[#3B44A8] font-black text-xs px-1">Histórico de atendimentos</h3>
          
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {listaAtendimentos.map((atendimento) => (
              <div 
                key={atendimento.id} 
                className="p-4 flex items-center justify-between bg-white hover:bg-gray-50/60 transition cursor-pointer"
                onClick={() => navigate('/app/aluno/agenda/detalhes', { state: { atendimento, paciente } })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/app/aluno/agenda/detalhes', { state: { atendimento, paciente } });
                  }
                }}
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <span className="text-[#3B44A8] font-black text-[11px] block">
                    {atendimento.data}
                  </span>
                  <h4 className="font-bold text-gray-900 text-xs truncate">
                    {atendimento.procedimento}
                  </h4>
                  <p className="text-gray-400 text-[10px] font-medium">
                    {atendimento.disciplina}
                  </p>
                  <p className="text-gray-400 text-[9px] font-medium pt-0.5">
                    {atendimento.professor} • <span className="text-gray-500 font-semibold">{atendimento.aluno}</span>
                  </p>
                </div>
                
                <ChevronRight size={18} className="text-[#3B44A8] shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}