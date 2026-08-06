import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Minus, Check, X, AlertTriangle } from 'lucide-react';

export default function DetalhesAtendimento() {
  const navigate = useNavigate();
  const location = useLocation();

  // Resgata o paciente vindo da navegação
  const paciente = location.state?.paciente || {
    nome: 'Maria Silva',
    cpf: '012.123.456-89',
    telefone: '(42) 99999-7777',
    procedimento: 'Clareamento Dental'
  };

  // ESTADO DO STATUS ATUAL (0 = Agendado, 1 = Em andamento, 2 = Finalizado, 3 = Cancelado)
  const [statusAtual, setStatusAtual] = useState(1);

  // Lista dos passos do status
  const [listaStatus, setListaStatus] = useState([
    { id: 0, label: 'Agendado', hora: '06/05/2026\n08:45' },
    { id: 1, label: 'Em andamento', hora: '09:00' },
    { id: 2, label: 'Finalizado', hora: '' },
    { id: 3, label: 'Cancelado', hora: '' }
  ]);

  // Estado para controlar as quantidades dos materiais previstos
  const [materiais, setMateriais] = useState([
    { id: 1, nome: 'Kit Cirúrgico 01', un: '1 Un', qtd: 1, img: 'https://placehold.co/40x40/e2e8f0/475569?text=Kit' },
    { id: 2, nome: 'Seringa Carpule', un: '1 Un', qtd: 1, img: 'https://placehold.co/40x40/e2e8f0/475569?text=Ser' },
    { id: 3, nome: 'Campo Cirúrgico', un: '2 Un', qtd: 1, img: 'https://placehold.co/40x40/e2e8f0/475569?text=Cam' },
  ]);

  const alterarQuantidade = (id, delta) => {
    setMateriais(prev => prev.map(m => {
      if (m.id === id) {
        const novaQtd = m.qtd + delta;
        return { ...m, qtd: novaQtd < 0 ? 0 : novaQtd };
      }
      return m;
    }));
  };

  const handleMudarStatus = (novoStatusId) => {
    setStatusAtual(novoStatusId);

    // Registra a hora atual na etapa clicada caso não tenha
    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setListaStatus(prev => prev.map(step => {
      if (step.id === novoStatusId && !step.hora && novoStatusId !== 0) {
        return { ...step, hora: horaFormatada };
      }
      return step;
    }));
  };

  // Calcula a porcentagem de preenchimento da barra de progresso
  const calcularLarguraProgresso = () => {
    if (statusAtual === 3) return '100%'; // Cancelado
    if (statusAtual === 0) return '0%';
    const totalEtapasNormais = 2; // Agendado (0) -> Em andamento (1) -> Finalizado (2)
    return `${(Math.min(statusAtual, totalEtapasNormais) / totalEtapasNormais) * 100}%`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans">
      
      {/* TOPO FIXO AZUL */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center relative z-10 shrink-0 rounded-b-[24px] shadow-md select-none">
        <button 
          onClick={() => navigate('/app/aluno/agenda')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 absolute left-5 cursor-pointer"
          aria-label="Voltar para agenda"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-bold tracking-wide mx-auto">Detalhes do atendimento</h1>
      </div>

      {/* CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-24">
        
        {/* CARD DO PACIENTE */}
        <div 
          onClick={() => navigate('/app/aluno/pacientes/detalhes', { state: { paciente } })}
          className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-xs bg-white cursor-pointer hover:bg-gray-50/50 transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden text-gray-400 shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 8a7 7 0 0114 0H5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-950 text-sm">{paciente.nome}</h3>
                <span className="bg-[#D1E7DD] text-[#0f5132] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Ativo
                </span>
              </div>
              <p className="text-gray-400 text-[11px] font-medium mt-0.5">{paciente.cpf}</p>
              <p className="text-gray-400 text-[11px] font-medium">{paciente.telefone}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#3B44A8]" />
        </div>

        {/* DETALHES DO ATENDIMENTO */}
        <div className="space-y-2">
          <h2 className="text-[#3B44A8] font-black text-xs px-1">Detalhes do atendimento</h2>
          
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs space-y-3.5">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Data</span>
                <span className="block text-gray-500 font-bold text-[11px] mt-0.5">06/05/2026</span>
              </div>
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Horário</span>
                <span className="block text-gray-500 font-bold text-[11px] mt-0.5">08:45</span>
              </div>
              <div>
                <span className="block text-gray-950 font-black text-[11px]">Local</span>
                <span className="block text-gray-500 font-bold text-[11px] mt-0.5">Consultório 03</span>
              </div>
            </div>

            <div>
              <span className="block text-gray-950 font-black text-[11px]">Procedimento</span>
              <span className="block text-gray-500 font-bold text-[11px] mt-0.5">{paciente.procedimento}</span>
            </div>

            <div>
              <span className="block text-gray-950 font-black text-[11px]">Responsável</span>
              <span className="block text-gray-500 font-bold text-[11px] mt-0.5">Prof. Dr. Miguel Antunes</span>
            </div>

            <div>
              <span className="block text-gray-950 font-black text-[11px]">Observações</span>
              <p className="text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 text-[11px] font-semibold mt-1 leading-relaxed flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                Paciente tem alergia a Dipirona.
              </p>
            </div>
          </div>
        </div>

        {/* MATERIAIS PREVISTOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[#3B44A8] font-black text-xs">Materiais previstos</h2>
            <button className="text-[#3B44A8] font-bold text-[10px] hover:underline cursor-pointer">
              + Adicionar materiais
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-100">
            {materiais.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <img src={item.img} alt={item.nome} className="w-9 h-9 object-cover rounded-lg border border-gray-100 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-950 text-xs">{item.nome}</h4>
                    <p className="text-gray-400 text-[9px] font-medium">({item.un})</p>
                  </div>
                </div>

                {/* CONTADOR DE QUANTIDADE */}
                <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs shrink-0">
                  <button 
                    onClick={() => alterarQuantidade(item.id, -1)}
                    className="p-1.5 px-2.5 text-gray-500 hover:bg-gray-50 transition active:bg-gray-100 cursor-pointer"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={11} className="stroke-[3px]" />
                  </button>
                  <span className="px-2 text-xs font-black text-gray-950 min-w-[20px] text-center select-none">
                    {item.qtd}
                  </span>
                  <button 
                    onClick={() => alterarQuantidade(item.id, 1)}
                    className="p-1.5 px-2.5 text-gray-500 hover:bg-gray-50 transition active:bg-gray-100 cursor-pointer"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={11} className="stroke-[3px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATUS DO ATENDIMENTO (INTERATIVO E DINÂMICO) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-[#3B44A8] font-black text-xs px-1">Status do Atendimento</h2>
          
          <div className="relative flex items-start justify-between px-2 select-none">
            {/* Linha base cinza */}
            <div className="absolute left-6 right-6 top-[13px] h-[2px] bg-gray-200 -z-10"></div>
            
            {/* Linha de progresso verde/vermelha */}
            <div 
              className={`absolute left-6 top-[13px] h-[2px] transition-all duration-300 -z-10 ${
                statusAtual === 3 ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `calc(${calcularLarguraProgresso()} - 24px)` }}
            ></div>

            {/* Renderização dos Passos */}
            {listaStatus.map((step) => {
              const isAtual = step.id === statusAtual;
              const isAnterior = step.id < statusAtual && statusAtual !== 3;
              const isCancelado = statusAtual === 3 && step.id === 3;

              return (
                <div 
                  key={step.id} 
                  onClick={() => handleMudarStatus(step.id)}
                  className="flex flex-col items-center text-center cursor-pointer group w-16"
                >
                  {/* Círculo do Status */}
                  <div 
                    className={`w-7 h-7 rounded-full border-4 border-white shadow-xs flex items-center justify-center text-white transition-all duration-300 active:scale-90 ${
                      isCancelado
                        ? 'bg-red-500 scale-110'
                        : isAtual 
                        ? 'bg-amber-500 scale-110' 
                        : isAnterior 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-200 group-hover:bg-gray-300'
                    }`}
                  >
                    {isCancelado ? (
                      <X size={14} className="stroke-[3px]" />
                    ) : isAnterior ? (
                      <Check size={12} className="stroke-[3px]" />
                    ) : isAtual ? (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    ) : null}
                  </div>

                  {/* Nome do Status */}
                  <span className={`text-[9px] mt-1.5 leading-tight transition-colors ${
                    isCancelado
                      ? 'font-black text-red-600'
                      : isAtual 
                      ? 'font-black text-amber-600' 
                      : isAnterior 
                      ? 'font-black text-emerald-600' 
                      : 'font-bold text-gray-400'
                  }`}>
                    {step.label}
                  </span>

                  {/* Horário (se houver) */}
                  {step.hora && (
                    <span className="text-[7.5px] text-gray-400 font-bold mt-0.5 leading-none whitespace-pre-line">
                      {step.hora}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RODAPÉ FIXO DE AÇÕES */}
      <div className="p-4 border-t border-gray-100 bg-white flex gap-3 shrink-0 shadow-lg">
        <button 
          onClick={() => navigate('/app/aluno/agenda')}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition active:scale-[0.98] cursor-pointer"
        >
          Voltar
        </button>
        <button 
          onClick={() => alert('Atendimento atualizado com sucesso!')}
          className="flex-1 py-3 bg-[#3B44A8] text-white rounded-xl font-bold text-xs hover:bg-[#30388d] transition active:scale-[0.98] shadow-sm cursor-pointer"
        >
          Salvar Alterações
        </button>
      </div>

    </div>
  );
}