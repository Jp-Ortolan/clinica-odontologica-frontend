import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Bell, CheckCircle2, AlertCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import api from '../Services/api'; // Caminho ajustado para a pasta Services

export default function DashboardRecepcao() {
  const navigate = useNavigate();
  const [dataAtual, setDataAtual] = useState('');
  
  // Estados dos Dados da API
  const [resumo, setResumo] = useState({ confirmadas: 0, pendentes: 0, faltas: 0 });
  const [pacientesAguardando, setPacientesAguardando] = useState([]);
  const [confirmacoesPendentes, setConfirmacoesPendentes] = useState([]);
  
  // Estados de Controle de UI
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const obterDataFormatada = () => {
    const data = new Date();
    const opcoesMesAno = { day: 'numeric', month: 'long', year: 'numeric' };
    const dataFormatada = data.toLocaleDateString('pt-BR', opcoesMesAno);
    const partes = dataFormatada.split(' de ');
    if (partes[1]) {
      partes[1] = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);
    }
    return `Hoje, ${partes.join(' de ')}`;
  };

  // Função para buscar dados do backend no Railway
  const carregarDadosDashboard = useCallback(async (isManual = false) => {
    if (isManual) setAtualizando(true);
    
    try {
      // Data de hoje no formato YYYY-MM-DD para filtragem exata
      const hojeIso = new Date().toISOString().split('T')[0];

      // Recomposição de chamadas paralelas para otimização
      const [resumoRes, agendamentosRes] = await Promise.allSettled([
        api.get('/agendamentos/resumo-dia', { params: { data: hojeIso } }),
        api.get('/agendamentos', { params: { data: hojeIso } })
      ]);

      // Tratamento dos Agendamentos do dia
      if (agendamentosRes.status === 'fulfilled') {
        const agendamentos = agendamentosRes.value.data || [];
        
        // Separação por status
        const aguardando = agendamentos.filter(a => 
          (a.status || '').toLowerCase() === 'aguardando'
        );
        const pendentes = agendamentos.filter(a => 
          (a.status || '').toLowerCase() === 'pendente'
        );

        setPacientesAguardando(aguardando);
        setConfirmacoesPendentes(pendentes);

        // Caso a rota /resumo-dia não exista no backend, calcula dinamicamente
        if (resumoRes.status !== 'fulfilled') {
          const confirmadasCount = agendamentos.filter(a => 
            ['confirmada', 'confirmado', 'atendido'].includes((a.status || '').toLowerCase())
          ).length;
          const pendentesCount = pendentes.length;
          const faltasCount = agendamentos.filter(a => 
            ['falta', 'cancelada', 'cancelado'].includes((a.status || '').toLowerCase())
          ).length;

          setResumo({
            confirmadas: confirmadasCount,
            pendentes: pendentesCount,
            faltas: faltasCount
          });
        }
      }

      // Tratamento do Resumo retornado da API (se rota dedicada existir)
      if (resumoRes.status === 'fulfilled' && resumoRes.value.data) {
        setResumo({
          confirmadas: resumoRes.value.data.confirmadas || 0,
          pendentes: resumoRes.value.data.pendentes || 0,
          faltas: resumoRes.value.data.faltas || 0
        });
      }

    } catch (err) {
      console.error('Erro ao carregar painel da recepção:', err);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    setDataAtual(obterDataFormatada());
    carregarDadosDashboard();

    // Polling automático a cada 30 segundos
    const interval = setInterval(() => {
      carregarDadosDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [carregarDadosDashboard]);

  return (
    <div className="flex flex-col w-full min-h-full font-sans">
      
      {/* BARRA SUPERIOR (HEADER WEB) */}
      <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-gray-950">Painel de Controle</h1>
          <button 
            onClick={() => carregarDadosDashboard(true)} 
            disabled={atualizando}
            title="Atualizar dados"
            className="p-1.5 text-gray-400 hover:text-[#3B44A8] hover:bg-gray-100 rounded-lg transition"
          >
            <RefreshCw size={16} className={atualizando ? 'animate-spin text-[#3B44A8]' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          {/* Caixa de Data Estilizada */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2.5 text-xs text-[#3B44A8] font-bold shadow-sm">
            <CalendarIcon size={16} className="text-[#F9A814]" />
            <span>{dataAtual}</span>
          </div>

          {/* Notificações */}
          <button className="p-2.5 bg-gray-50 text-gray-600 hover:text-[#3B44A8] hover:bg-gray-100 rounded-xl transition relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* CONTAINER DAS INFORMAÇÕES */}
      <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
        
        {/* Boas-Vindas */}
        <div className="select-none">
          <h2 className="text-gray-900 text-3xl font-black tracking-tight leading-none">Olá, Rhay</h2>
          <p className="text-gray-500 text-sm font-medium mt-1.5">Gerenciamento e fluxo da recepção da clínica.</p>
        </div>

        {/* CONSULTAS DO DIA */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm select-none">
          <h3 className="text-gray-900 font-extrabold text-sm mb-4 tracking-wide uppercase">Consultas do Dia</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="block text-3xl font-black text-green-600">
                  {carregando ? <Loader2 size={24} className="animate-spin text-green-600 my-1" /> : resumo.confirmadas}
                </span>
                <span className="block text-xs font-bold text-gray-500 mt-0.5">Confirmadas</span>
              </div>
              <div className="p-3 bg-green-500 text-white rounded-xl">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="block text-3xl font-black text-amber-600">
                  {carregando ? <Loader2 size={24} className="animate-spin text-amber-600 my-1" /> : resumo.pendentes}
                </span>
                <span className="block text-xs font-bold text-gray-500 mt-0.5">Pendentes</span>
              </div>
              <div className="p-3 bg-amber-500 text-white rounded-xl">
                <AlertCircle size={24} />
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="block text-3xl font-black text-red-600">
                  {carregando ? <Loader2 size={24} className="animate-spin text-red-600 my-1" /> : resumo.faltas}
                </span>
                <span className="block text-xs font-bold text-gray-500 mt-0.5">Faltas / Canceladas</span>
              </div>
              <div className="p-3 bg-red-500 text-white rounded-xl">
                <XCircle size={24} />
              </div>
            </div>

          </div>
        </section>

        {/* LAYOUT WEB EM GRID DUPLO PARA FILAS E CONFIRMAÇÕES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coluna: Pacientes Aguardando */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-gray-900 font-black text-base">Pacientes Aguardando</h3>
              <button 
                onClick={() => navigate('/app/recepcao/fila-completa')} 
                className="text-[#3B44A8] text-xs font-bold hover:underline"
              >
                Ver fila completa
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {carregando ? (
                <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#3B44A8]" /> Carregando fila...
                </div>
              ) : pacientesAguardando.length > 0 ? (
                pacientesAguardando.map((p, idx) => (
                  <div key={p.id || p._id || idx} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="text-[#3B44A8] font-black text-xs w-12 text-center bg-gray-50 py-1.5 rounded-lg border border-gray-200">
                        {p.hora || p.horario || '--:--'}
                      </div>
                      <div className="w-[1px] h-8 bg-gray-200 mx-4"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-950 text-xs truncate">
                          {p.pacienteNome || p.paciente?.nome || 'Paciente sem nome'}
                        </h4>
                        <p className="text-gray-600 text-[11px] font-medium mt-0.5">
                          {p.tipoConsulta || p.procedimento || 'Consulta'} • <span className="text-gray-400 text-[10px]">{p.disciplina || p.especialidade || 'Geral'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Aguardando
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs font-medium">
                  Nenhum paciente aguardando no momento.
                </div>
              )}
            </div>
          </div>

          {/* Coluna: Confirmações Pendentes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-gray-900 font-black text-base">Confirmações Pendentes</h3>
              <button 
                onClick={() => navigate('/app/recepcao/status-consultas', { state: { abaInicial: 'pendentes' } })} 
                className="text-[#3B44A8] text-xs font-bold hover:underline"
              >
                Ver todas
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {carregando ? (
                <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#3B44A8]" /> Carregando pendências...
                </div>
              ) : confirmacoesPendentes.length > 0 ? (
                confirmacoesPendentes.map((p, idx) => (
                  <div key={p.id || p._id || idx} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="text-[#3B44A8] font-black text-xs w-12 text-center bg-gray-50 py-1.5 rounded-lg border border-gray-200">
                        {p.hora || p.horario || '--:--'}
                      </div>
                      <div className="w-[1px] h-8 bg-gray-200 mx-4"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-950 text-xs truncate">
                          {p.pacienteNome || p.paciente?.nome || 'Paciente sem nome'}
                        </h4>
                        <p className="text-gray-600 text-[11px] font-medium mt-0.5">
                          {p.tipoConsulta || p.procedimento || 'Consulta'} • <span className="text-gray-400 text-[10px]">{p.disciplina || p.especialidade || 'Geral'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Pendente
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs font-medium">
                  Nenhuma confirmação pendente para hoje.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}