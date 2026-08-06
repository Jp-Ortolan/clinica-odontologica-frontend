import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronRight, Plus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import api from '../Services/api'; // Ajustado caminho e maiúscula para Services

export default function PacientesRecepcao() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const [listaPacientes, setListaPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Carrega lista de pacientes da API
  const carregarPacientes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const resposta = await api.get('/pacientes');
      setListaPacientes(resposta.data || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
      setErro('Não foi possível carregar a lista de pacientes.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPacientes();
  }, [carregarPacientes]);

  // Filtra pacientes localmente por busca e status
  const pacientesFiltrados = listaPacientes.filter((paciente) => {
    const termoBusca = busca.toLowerCase();
    const nome = (paciente.nome || '').toLowerCase();
    const cpf = (paciente.cpf || '').replace(/\D/g, '');
    const buscaLimpa = termoBusca.replace(/\D/g, '');

    const correspondeBusca = 
      nome.includes(termoBusca) || 
      (buscaLimpa !== '' && cpf.includes(buscaLimpa)) ||
      (paciente.cpf || '').includes(termoBusca);

    const statusPaciente = (paciente.status || (paciente.ativo ? 'ativo' : 'inativo')).toLowerCase();

    if (filtro === 'todos') return correspondeBusca;
    if (filtro === 'ativos') return correspondeBusca && (statusPaciente === 'ativo' || paciente.ativo === true);
    if (filtro === 'inativos') return correspondeBusca && (statusPaciente === 'inativo' || paciente.ativo === false);

    return correspondeBusca;
  });

  return (
    <div className="flex flex-col w-full min-h-full bg-transparent font-sans">
      
      {/* HEADER DA PÁGINA */}
      <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/recepcao/dashboard')}
            className="p-2 text-gray-500 hover:text-[#3B44A8] hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-950">Gerenciamento de Pacientes</h1>
        </div>

        <button 
          onClick={() => navigate('/app/recepcao/pacientes/cadastro')}
          className="hidden sm:flex bg-[#F9A814] hover:bg-[#e0940f] text-white font-bold text-sm h-11 px-5 rounded-xl transition items-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <Plus size={18} className="stroke-[3px]" /> Novo Paciente
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="p-8 max-w-7xl w-full mx-auto space-y-6 flex-1 flex flex-col min-h-0">
        
        {/* BARRA DE FILTROS E PESQUISA */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between select-none">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            {['todos', 'ativos', 'inativos'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`flex-1 md:flex-initial px-6 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  filtro === tipo ? 'bg-white text-[#3B44A8] shadow-sm' : 'text-gray-500 hover:text-gray-950'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-md">
            <span className="absolute left-4 top-3 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] transition shadow-inner"
            />
          </div>
        </div>

        {/* FEEDBACK DE CARREGAMENTO */}
        {carregando ? (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px] text-gray-500 gap-3">
            <Loader2 size={32} className="animate-spin text-[#3B44A8]" />
            <p className="text-sm font-medium">Carregando pacientes...</p>
          </div>
        ) : erro ? (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px] text-gray-500 gap-3">
            <AlertCircle size={36} className="text-red-500" />
            <p className="text-sm font-bold text-gray-800">{erro}</p>
            <button 
              onClick={carregarPacientes}
              className="text-xs text-[#3B44A8] font-bold underline mt-1"
            >
              Tentar novamente
            </button>
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px]">
            <div className="p-4 bg-gray-50 text-gray-400 rounded-full mb-3 border border-gray-100">
              <User size={36} className="stroke-[1.5]" />
            </div>
            <h3 className="text-gray-900 font-bold text-base">Nenhum registro encontrado</h3>
            <p className="text-gray-400 text-xs mt-1 max-w-xs">Não encontramos nenhum paciente correspondente ao filtro selecionado.</p>
          </div>
        ) : (
          /* GRID DE CARD DOS PACIENTES */
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pacientesFiltrados.map((paciente) => {
                const isAtivo = paciente.status === 'ativo' || paciente.ativo === true;

                return (
                  <div 
                    key={paciente.id || paciente._id}
                    onClick={() => navigate('/app/recepcao/pacientes/detalhes', { state: { paciente } })}
                    className="bg-white border border-gray-200 hover:border-[#3B44A8]/40 rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-3 bg-gray-50 group-hover:bg-[#3B44A8]/5 border border-gray-200 text-gray-700 group-hover:text-[#3B44A8] rounded-xl transition-colors shrink-0">
                        <User size={20} className="stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-gray-950 truncate leading-tight group-hover:text-[#3B44A8] transition-colors">
                          {paciente.nome || 'Paciente sem nome'}
                        </h3>
                        <p className="text-gray-500 text-[11px] font-medium mt-1 flex items-center gap-2">
                          <span>CPF: {paciente.cpf || 'Não informado'}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? 'bg-green-500' : 'bg-red-400'}`}></span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-[#3B44A8] transition-transform group-hover:translate-x-0.5 stroke-[2.5px]" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTÃO FLUTUANTE DE CADASTRO MOBILE */}
        <div className="sm:hidden fixed bottom-6 right-6 select-none z-50">
          <button 
            onClick={() => navigate('/app/recepcao/pacientes/cadastro')}
            className="bg-[#F9A814] text-white p-4 rounded-full transition shadow-xl flex items-center justify-center active:scale-95"
          >
            <Plus size={24} className="stroke-[3px]" />
          </button>
        </div>

      </div>
    </div>
  );
}