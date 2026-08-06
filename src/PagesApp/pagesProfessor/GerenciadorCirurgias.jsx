import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronRight,
  MapPin,
  Info,
  Home,
  Users,
  Box,
  CheckCircle,
  Scissors,
  User
} from 'lucide-react';

export default function GerenciadorCirurgias() {
  const navigate = useNavigate();

  // Estado com a data selecionada
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  // Converte objeto Date para string YYYY-MM-DD no fuso horário local
  const formatDateToInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Formatação em extensão "Hoje, 28 de Julho de 2026"
  const formatarDataExtenso = (date) => {
    const hoje = new Date();
    const ehHoje = 
      date.getDate() === hoje.getDate() &&
      date.getMonth() === hoje.getMonth() &&
      date.getFullYear() === hoje.getFullYear();

    const dataFormatada = date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const partes = dataFormatada.split(' de ');
    if (partes[1]) {
      partes[1] = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);
    }

    const dataFinal = partes.join(' de ');
    return ehHoje ? `Hoje, ${dataFinal}` : dataFinal;
  };

  const handleDataChange = (e) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      setDataSelecionada(new Date(year, month - 1, day));
    }
  };

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app/professor');
    }
  };

  const [cirurgias] = useState([
    {
      id: 1,
      horario: '08:30',
      paciente: 'Rhaya Borges',
      procedimento: 'Exodontia - 36',
      professor: 'Prof: Dr. Carlos Eduardo',
      local: 'Centro Cirúrgico',
      status: 'confirmada'
    },
    {
      id: 2,
      horario: '15:30',
      paciente: 'Nome do paciente',
      procedimento: 'Extração de siso',
      professor: 'Prof: Dra. Ana Maria',
      local: 'Centro Cirúrgico',
      status: 'pendente'
    }
  ]);

  // Contadores dinâmicos baseados na lista
  const resumo = useMemo(() => {
    return {
      total: cirurgias.length,
      concluidas: cirurgias.filter(c => c.status === 'concluida').length,
      pendentes: cirurgias.filter(c => c.status === 'pendente').length
    };
  }, [cirurgias]);

  return (
    <div className="w-full h-full min-h-screen bg-[#3B42B2] text-white flex flex-col justify-between font-sans m-0 p-0 overflow-x-hidden">
      
      {/* Topo / Header */}
      <header className="pt-6 pb-4 px-4 flex items-center justify-between">
        <button 
          onClick={handleVoltar}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-medium tracking-wide text-center flex-1 pr-8">
          Lista de Cirurgias
        </h1>
      </header>

      {/* Corpo Principal */}
      <main className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-6 pb-6 flex-1 flex flex-col space-y-4">
        
        {/* Seletor 1: Data Dinâmica */}
        <div className="relative flex items-center justify-between border border-slate-200 rounded-2xl px-4 py-3 bg-white shadow-sm hover:border-indigo-300 transition">
          <span className="text-[#3B42B2] font-semibold text-sm">
            {formatarDataExtenso(dataSelecionada)}
          </span>
          <CalendarIcon className="w-5 h-5 text-[#3B42B2]" />

          <input 
            type="date"
            value={formatDateToInputValue(dataSelecionada)}
            onChange={handleDataChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            aria-label="Selecionar data"
          />
        </div>

        {/* Seletor 2: Mutirão Cirúrgico */}
        <button 
          type="button"
          onClick={() => navigate('/app/professor/mutirao')}
          className="w-full flex items-center justify-between border border-slate-200 rounded-2xl px-4 py-3 bg-white shadow-sm hover:border-indigo-300 transition cursor-pointer active:scale-[0.99] text-left"
        >
          <span className="text-[#3B42B2] font-semibold text-sm underline underline-offset-2">
            Mutirão Cirúrgico
          </span>
          <CalendarIcon className="w-5 h-5 text-[#3B42B2]" />
        </button>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-800 leading-tight">Cirurgias do dia</p>
            <p className="text-2xl font-black text-[#3B42B2] my-0.5">{resumo.total}</p>
            <p className="text-[10px] text-slate-500 font-medium">Cadastradas</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-800 leading-tight">Concluídas</p>
            <p className="text-2xl font-black text-[#3B42B2] my-0.5">{resumo.concluidas}</p>
            <p className="text-[10px] text-slate-500 font-medium">Finalizadas</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-800 leading-tight">Pendentes</p>
            <p className="text-2xl font-black text-[#3B42B2] my-0.5">{resumo.pendentes}</p>
            <p className="text-[10px] text-slate-500 font-medium">Aguardando</p>
          </div>
        </div>

        {/* Lista de Cirurgias */}
        <div className="border border-slate-200 rounded-2xl bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
          {cirurgias.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('/app/professor/cirurgias/detalhes', { state: { cirurgiaId: item.id } })}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer gap-2"
            >
              <div className="text-slate-700 font-semibold text-xs pr-3 border-r border-slate-200 whitespace-nowrap">
                {item.horario}
              </div>

              <div className="px-1 shrink-0">
                <div className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center bg-slate-100 text-slate-600">
                  <User className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 text-sm leading-tight truncate">
                  {item.paciente}
                </h2>
                <p className="text-xs font-semibold text-[#6268D2] truncate">
                  {item.procedimento}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{item.professor}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#3B42B2] shrink-0" />
                  <span className="truncate">{item.local}</span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#3B42B2] shrink-0" />
            </div>
          ))}
        </div>

        {/* Alert Box no Rodapé */}
        <div className="mt-auto pt-2">
          <div className="bg-[#C5CAEA] rounded-xl p-3 flex items-center gap-3">
            <Info className="w-7 h-7 text-[#3B42B2] shrink-0" />
            <div className="text-[10px] text-[#3B42B2] font-semibold leading-tight space-y-0.5">
              <p>Chegue ao centro cirúrgico com pelo menos 15 minutos de antecedência.</p>
              <p>Confira os materiais e a equipe antes de iniciar o procedimento.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[#3B42B2] px-2 py-3 flex items-center justify-around border-t border-white/10 sticky bottom-0 z-10">
        <button onClick={() => navigate('/app/professor')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => navigate('/app/professor/agenda')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer">
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-amber-400 font-bold cursor-pointer">
          <Scissors className="w-5 h-5 text-amber-400 rotate-90" />
          <span className="text-[10px]">Cirurgias</span>
        </button>
        <button onClick={() => navigate('/app/professor/pacientes')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer">
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Pacientes</span>
        </button>
        <button onClick={() => navigate('/app/professor/cme')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer">
          <CheckCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">CME</span>
        </button>
        <button onClick={() => navigate('/app/professor/estoque')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white cursor-pointer">
          <Box className="w-5 h-5" />
          <span className="text-[10px] font-medium">Estoque</span>
        </button>
      </nav>

    </div>
  );
}