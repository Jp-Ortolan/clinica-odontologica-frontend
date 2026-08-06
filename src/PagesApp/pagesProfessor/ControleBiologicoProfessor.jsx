import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_CONTROLE = '@app_clinica:controle_biologico';

// Dados iniciais de fallback caso o localStorage esteja vazio
const INITIAL_CONTROLE = [
  {
    id: '1',
    autoclave: '01',
    ciclo: '2548',
    dataInicio: '20/05/2026 - 12:30',
    dataResultado: '20/05/2026 - 17:30',
    status: 'Em incubação',
  },
  {
    id: '2',
    autoclave: '02',
    ciclo: '2550',
    dataInicio: '20/05/2026 - 11:50',
    dataResultado: '21/05/2026 - 11:50',
    status: 'Em incubação',
  },
  {
    id: '3',
    autoclave: '03',
    ciclo: '2547',
    dataInicio: '19/05/2026 - 14:40',
    dataResultado: '20/05/2026 - 10:00',
    status: 'Concluído',
  },
  {
    id: '4',
    autoclave: '01',
    ciclo: '2546',
    dataInicio: '19/05/2026 - 09:30',
    lidoEm: '20/05/2026 - 09:00',
    resultadoFinal: 'Satisfatório',
    status: 'Negativo',
  }
];

const AutoclaveIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="5" y="9" width="14" height="11" rx="2" />
    <path d="M7 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    <circle cx="10" cy="5" r="2" />
    <path d="M10 5l1 -1" />
    <path d="M5 13H3" />
    <path d="M21 13h-2" />
    <circle cx="9" cy="16" r="1.5" />
    <circle cx="15" cy="16" r="1.5" />
  </svg>
);

export default function ControleBiologicoProfessor() {
  const navigate = useNavigate();
  const [listaControle, setListaControle] = useState([]);

  // Carrega os registros salvos ou inicializa com o mock
  useEffect(() => {
    try {
      const dadosSalvos = localStorage.getItem(STORAGE_KEY_CONTROLE);
      if (dadosSalvos) {
        setListaControle(JSON.parse(dadosSalvos));
      } else {
        localStorage.setItem(STORAGE_KEY_CONTROLE, JSON.stringify(INITIAL_CONTROLE));
        setListaControle(INITIAL_CONTROLE);
      }
    } catch (error) {
      console.error('Erro ao ler controle biológico do localStorage:', error);
      setListaControle(INITIAL_CONTROLE);
    }
  }, []);

  // Cálculos dinâmicos para as métricas da interface
  const totalIncubacao = listaControle.filter(item => item.status === 'Em incubação').length;
  const totalLeitura = listaControle.filter(item => item.status === 'Concluído').length;
  const totalNaoConformes = listaControle.filter(item => item.status === 'Não Conforme' || item.status === 'Positivo').length;

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Em incubação':
        return 'bg-[#C5CBE9] text-[#3B42B2]';
      case 'Concluído':
        return 'bg-[#FDE6C5] text-amber-600';
      case 'Negativo':
        return 'bg-[#B8D8B2] text-emerald-800';
      case 'Não Conforme':
      case 'Positivo':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="w-full h-full bg-[#3B42B2] text-white flex flex-col font-sans m-0 p-0 overflow-hidden relative">
      
      {/* HEADER / TOPO */}
      <div className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          Controle Biológico
        </h1>

        <button
          onClick={() => navigate('/app/professor/cme/controle-biologico/novo')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer active:scale-95 text-white flex items-center justify-center"
          title="Novo Teste"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* CARD PRINCIPAL BRANCO COM SCROLL */}
      <div className="bg-white text-slate-800 rounded-t-[32px] px-5 pt-6 pb-20 flex-1 overflow-y-auto flex flex-col space-y-6 shadow-inner relative">
        
        {/* CARDS DE RESUMO (KPIs) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-slate-900 mb-0.5">Em incubação</span>
            <span className="text-3xl font-black text-[#3B42B2] leading-none mb-1">
              {totalIncubacao}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Testes</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-slate-900 mb-0.5">Para leitura</span>
            <span className="text-3xl font-black text-[#3B42B2] leading-none mb-1">
              {totalLeitura}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Testes</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-slate-900 mb-0.5">Não conformes</span>
            <span className="text-3xl font-black text-red-600 leading-none mb-1">
              {totalNaoConformes}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Teste</span>
          </div>
        </div>

        {/* LISTA DE TESTES BIOLÓGICOS */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs overflow-hidden divide-y divide-slate-100">
          {listaControle.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold">
              Nenhum registro de controle biológico encontrado.
            </div>
          ) : (
            listaControle.map((item) => (
              <div key={item.id} className="p-4 flex gap-3 hover:bg-slate-50/50 transition">
                
                {/* Ícone */}
                <div className="shrink-0 mt-1">
                  <AutoclaveIcon className="w-8 h-8 text-[#3B42B2]" />
                </div>

                {/* Informações */}
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-[#3B42B2] text-sm">
                    Autoclave {item.autoclave} - Ciclo {item.ciclo}
                  </h4>
                  
                  <p className="text-[10px] text-slate-500 font-medium">
                    {item.dataInicio}
                  </p>
                  
                  {item.status === 'Negativo' ? (
                    <>
                      <p className="text-[10px] text-slate-700 font-bold mt-1">
                        Lido em: <span className="font-medium text-slate-500">{item.lidoEm || item.dataResultado}</span>
                      </p>
                      <p className="text-[10px] text-slate-700 font-bold">
                        Resultado: <span className="font-black text-emerald-700">{item.resultadoFinal || 'Satisfatório'}</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-[10px] text-slate-700 font-bold mt-1">
                      Resultado em: <span className="font-medium text-slate-500">{item.dataResultado}</span>
                    </p>
                  )}
                </div>

                {/* Badge de Status */}
                <div className="shrink-0 flex items-start">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getBadgeStyle(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
