import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Home,
  Calendar as CalendarIcon,
  Scissors,
  Users,
  CheckCircle,
  Box,
  User,
  X
} from 'lucide-react';

export default function PacientesProfessor() {
  const navigate = useNavigate();

  // Estados da página
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos' | 'ativo' | 'inativo'

  // Fila de pacientes (dados simulados)
  const [pacientes] = useState([
    { id: 1, nome: 'Rhaya Borges', cpf: '01212345689', status: 'ativo' },
    { id: 2, nome: 'Carlos Eduardo Silva', cpf: '98765432100', status: 'ativo' },
    { id: 3, nome: 'Mariana Oliveira', cpf: '45678912344', status: 'ativo' },
    { id: 4, nome: 'João Pedro Santos', cpf: '11122233344', status: 'inativo' },
    { id: 5, nome: 'Ana Beatriz Souza', cpf: '55566677788', status: 'ativo' },
    { id: 6, nome: 'Lucas Mendes', cpf: '99988877766', status: 'inativo' },
  ]);

  // Função utilitária para formatar CPF na exibição
  const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const apenasNumeros = cpf.replace(/\D/g, '');
    if (apenasNumeros.length !== 11) return cpf; // Retorna original se não tiver 11 dígitos
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Filtragem memoizada de pacientes
  const pacientesFiltrados = useMemo(() => {
    const termoBusca = busca.toLowerCase().trim();

    return pacientes.filter((p) => {
      const atendeFiltroStatus =
        filtroStatus === 'todos' ? true : p.status === filtroStatus;

      const cpfLimpo = p.cpf.replace(/\D/g, '');
      const atendeBusca =
        p.nome.toLowerCase().includes(termoBusca) ||
        cpfLimpo.includes(termoBusca) ||
        p.cpf.toLowerCase().includes(termoBusca);

      return atendeFiltroStatus && atendeBusca;
    });
  }, [pacientes, busca, filtroStatus]);

  const handleVoltar = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/app/professor/dashboard');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#3B42B2] text-white flex flex-col justify-between font-sans m-0 p-0 overflow-x-hidden">
      
      {/* TOPO FIXO / HEADER */}
      <div className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={handleVoltar}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-medium tracking-wide text-center flex-1 pr-8">
          Pacientes
        </h1>
      </div>

      {/* CORPO PRINCIPAL (FUNDO BRANCO ARREDONDADO) */}
      <div className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-5 pb-6 flex-1 flex flex-col space-y-4">
        
        {/* BARRA DE PESQUISA */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF..."
            className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B42B2] shadow-sm transition-all"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* BOTÕES DE FILTRO */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
              filtroStatus === 'todos'
                ? 'bg-[#3B42B2] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({pacientes.length})
          </button>

          <button
            onClick={() => setFiltroStatus('ativo')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
              filtroStatus === 'ativo'
                ? 'bg-[#3B42B2] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ativos ({pacientes.filter(p => p.status === 'ativo').length})
          </button>

          <button
            onClick={() => setFiltroStatus('inativo')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
              filtroStatus === 'inativo'
                ? 'bg-[#3B42B2] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inativos ({pacientes.filter(p => p.status === 'inativo').length})
          </button>
        </div>

        {/* LISTA DE PACIENTES */}
        <div className="flex-1 flex flex-col justify-start">
          {pacientesFiltrados.length > 0 ? (
            <div className="border border-slate-200 rounded-2xl bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
              {pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id}
                  onClick={() => navigate(`/app/professor/pacientes/${paciente.id}`)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer active:bg-slate-100 gap-3 group"
                >
                  {/* Ícone do Paciente */}
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center shrink-0 bg-slate-50 text-slate-700 group-hover:border-[#3B42B2]/40 group-hover:bg-[#3B42B2]/5 transition-colors">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                        {paciente.nome}
                      </h4>
                      {paciente.status === 'inativo' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider shrink-0">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {formatarCPF(paciente.cpf)}
                    </p>
                  </div>

                  {/* Seta indicativa */}
                  <ChevronRight className="w-5 h-5 text-[#3B42B2] shrink-0 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-slate-500 font-bold text-sm">
                Nenhum paciente encontrado
              </p>
              <p className="text-slate-400 text-xs mt-1 max-w-[220px]">
                {busca 
                  ? `Não encontramos resultados para "${busca}".`
                  : 'Não existem pacientes para o filtro selecionado.'
                }
              </p>
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="bg-[#3B42B2] px-2 py-3 flex items-center justify-around border-t border-white/10 sticky bottom-0 z-10 shrink-0">
        <button
          onClick={() => navigate('/app/professor/dashboard')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => navigate('/app/professor/agenda')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        <button
          onClick={() => navigate('/app/professor/cirurgias')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer transition-colors"
        >
          <Scissors className="w-5 h-5 rotate-90" />
          <span className="text-[10px] font-medium">Cirurgias</span>
        </button>

        {/* ABA ATIVA COM DESTAQUE AMARELO */}
        <button className="flex flex-col items-center gap-1 text-amber-400 font-bold cursor-pointer">
          <Users className="w-5 h-5 text-amber-400" />
          <span className="text-[10px]">Pacientes</span>
        </button>

        <button 
          onClick={() => navigate('/app/professor/cme')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">CME</span>
        </button>

        <button 
          onClick={() => navigate('/app/professor/estoque')}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer transition-colors"
        >
          <Box className="w-5 h-5" />
          <span className="text-[10px] font-medium">Estoque</span>
        </button>
      </div>

    </div>
  );
}