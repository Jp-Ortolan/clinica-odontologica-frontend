import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Search,
  ChevronDown,
  Check,
  Package,
  X
} from 'lucide-react';
import api from '../../Services/api';

const STATUS_LABEL = {
  esterilizado: 'Válido',
  vencido: 'Vencido',
  utilizado: 'Utilizado',
};

const TIPO_CICLO_LABEL = {
  vapor: 'Vapor',
  calor_seco: 'Calor seco',
  plasma: 'Plasma',
};

export default function PacotesEsterilizadosProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  // ESTADOS DE BUSCA E SELEÇÃO DE FILTROS
  const [busca, setBusca] = useState(location.state?.buscaInicial || '');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');

  // ESTADOS PARA CONTROLAR A ABERTURA DOS MENUS
  const [openStatus, setOpenStatus] = useState(false);
  const [openTipo, setOpenTipo] = useState(false);

  // DADOS REAIS
  const [pacotes, setPacotes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // REFERÊNCIAS PARA DETECTAR CLIQUE FORA
  const dropdownRef = useRef(null);

  const opcoesStatus = ['Todos', 'esterilizado', 'vencido', 'utilizado'];
  const opcoesTipo = ['Todos', 'vapor', 'calor_seco', 'plasma'];

  // Fecha os dropdowns ao clicar fora do contêiner de filtros
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenStatus(false);
        setOpenTipo(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carrega todos os ciclos e, para cada um, seus pacotes (sub-recurso do backend)
  useEffect(() => {
    api.get('/esterilizacoes')
      .then(async (res) => {
        const ciclos = res.data;
        const resultados = await Promise.all(
          ciclos.map((c) =>
            api.get(`/esterilizacoes/${c.id}/pacotes`)
              .then((r) => r.data.map((p) => ({ ...p, ciclo: c })))
              .catch(() => [])
          )
        );
        setPacotes(resultados.flat().sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)));
      })
      .catch((err) => console.error('Erro ao carregar pacotes esterilizados:', err))
      .finally(() => setCarregando(false));
  }, []);

  // LÓGICA DE FILTRAGEM MEMOIZADA
  const pacotesFiltrados = useMemo(() => {
    const termoBusca = busca.toLowerCase().trim();

    return pacotes.filter((item) => {
      const atendeBusca =
        (item.material_nome || '').toLowerCase().includes(termoBusca) ||
        String(item.id).includes(termoBusca);

      const atendeStatus =
        statusFiltro === 'Todos' || item.status === statusFiltro;

      const atendeTipo =
        tipoFiltro === 'Todos' || item.ciclo?.tipo_ciclo === tipoFiltro;

      return atendeBusca && atendeStatus && atendeTipo;
    });
  }, [pacotes, busca, statusFiltro, tipoFiltro]);

  const handleVoltar = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/app/professor/cme');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#3B42B2] text-white flex flex-col font-sans m-0 p-0 overflow-x-hidden">

      {/* HEADER / TOPO */}
      <div className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={handleVoltar}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1 pr-8">
          Pacotes Esterilizados
        </h1>
      </div>

      {/* CARD PRINCIPAL BRANCO COM SCROLL */}
      <div className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-5 pb-8 flex-1 flex flex-col space-y-4 shadow-inner relative">

        {/* BARRA DE PESQUISA */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3B42B2] transition-all"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* SELETORES EM MODO DROPDOWN / REFLUXO */}
        <div ref={dropdownRef} className="grid grid-cols-2 gap-3 relative z-10">

          {/* 1. SELETOR DE STATUS */}
          <div className="relative">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Status:
            </label>

            <button
              onClick={() => {
                setOpenStatus(!openStatus);
                setOpenTipo(false);
              }}
              className="w-full bg-slate-100 border border-slate-200 text-[#3B42B2] font-extrabold text-xs px-3 py-2 rounded-xl flex items-center justify-between shadow-xs cursor-pointer active:scale-98 transition"
            >
              <span className="truncate">{statusFiltro === 'Todos' ? 'Todos' : STATUS_LABEL[statusFiltro]}</span>
              <ChevronDown className={`w-4 h-4 text-[#3B42B2] transition-transform duration-200 shrink-0 ${openStatus ? 'rotate-180' : ''}`} />
            </button>

            {openStatus && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 space-y-0.5 p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {opcoesStatus.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFiltro(st);
                      setOpenStatus(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      statusFiltro === st
                        ? 'bg-[#3B42B2] text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{st === 'Todos' ? 'Todos' : STATUS_LABEL[st]}</span>
                    {statusFiltro === st && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. SELETOR DE TIPO DE CICLO */}
          <div className="relative">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Tipo de ciclo:
            </label>

            <button
              onClick={() => {
                setOpenTipo(!openTipo);
                setOpenStatus(false);
              }}
              className="w-full bg-slate-100 border border-slate-200 text-[#3B42B2] font-extrabold text-xs px-3 py-2 rounded-xl flex items-center justify-between shadow-xs cursor-pointer active:scale-98 transition"
            >
              <span className="truncate">{tipoFiltro === 'Todos' ? 'Todos' : TIPO_CICLO_LABEL[tipoFiltro]}</span>
              <ChevronDown className={`w-4 h-4 text-[#3B42B2] transition-transform duration-200 shrink-0 ${openTipo ? 'rotate-180' : ''}`} />
            </button>

            {openTipo && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 space-y-0.5 p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {opcoesTipo.map((tp) => (
                  <button
                    key={tp}
                    onClick={() => {
                      setTipoFiltro(tp);
                      setOpenTipo(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      tipoFiltro === tp
                        ? 'bg-[#3B42B2] text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{tp === 'Todos' ? 'Todos' : TIPO_CICLO_LABEL[tp]}</span>
                    {tipoFiltro === tp && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* LISTA DE PACOTES FILTRADOS */}
        <div className="space-y-3 pt-2 flex-1">
          {carregando ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">Carregando pacotes...</div>
          ) : pacotesFiltrados.length > 0 ? (
            pacotesFiltrados.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/app/professor/cme/pacote-detalhes/${item.id}`, { state: { pacote: item } })}
                className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-98 gap-2 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200/60 shrink-0 text-[#3B42B2] group-hover:bg-[#3B42B2]/10 transition-colors">
                    <Package className="w-6 h-6 text-[#3B42B2]" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-extrabold text-[#3B42B2] text-xs truncate">
                      {item.material_nome}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-bold truncate">
                      Pacote #{item.id}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold">
                      Ciclo: {item.esterilizacao_id} ({TIPO_CICLO_LABEL[item.ciclo?.tipo_ciclo] || item.ciclo?.tipo_ciclo || 'N/I'})
                    </p>
                    <p className="text-[8px] text-slate-400 font-medium mt-0.5">
                      {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-3 shrink-0 self-stretch">
                  <span
                    className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.status === 'esterilizado'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'vencido'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {STATUS_LABEL[item.status] || item.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#3B42B2] transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500">
                Nenhum pacote encontrado
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tente ajustar os termos da busca ou os filtros aplicados.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
