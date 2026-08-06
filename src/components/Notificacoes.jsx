import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, CheckCheck, Trash2, CalendarDays,
  Scissors, Package, ShieldCheck, User, Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotificacoes } from '../hooks/useNotificacoes';

// Tela de notificações compartilhada pelos três perfis. O conteúdo é o
// mesmo (a API já devolve só as notificações do usuário logado), então
// aqui só muda a rota do botão "voltar", derivada do perfil.
const ROTA_VOLTAR = {
  aluno: '/app/aluno/dashboard',
  professor: '/app/professor/dashboard',
  recepcionista: '/app/recepcao/dashboard',
};

// Ícone e cor por tipo de evento, como definido no backend
// (migrations/009_notificacoes.sql).
const ESTILO_POR_TIPO = {
  consulta: { Icone: CalendarDays, cor: 'text-[#3B44A8]', fundo: 'bg-[#3B44A8]/10' },
  cirurgia: { Icone: Scissors, cor: 'text-amber-600', fundo: 'bg-amber-100' },
  estoque: { Icone: Package, cor: 'text-emerald-600', fundo: 'bg-emerald-100' },
  cme: { Icone: ShieldCheck, cor: 'text-cyan-600', fundo: 'bg-cyan-100' },
  paciente: { Icone: User, cor: 'text-violet-600', fundo: 'bg-violet-100' },
  sistema: { Icone: Info, cor: 'text-gray-600', fundo: 'bg-gray-100' },
};

function formatarQuando(criadoEm) {
  const data = new Date(criadoEm);
  if (Number.isNaN(data.getTime())) return '';

  const segundos = Math.floor((Date.now() - data.getTime()) / 1000);
  if (segundos < 60) return 'agora';
  if (segundos < 3600) return `há ${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `há ${Math.floor(segundos / 3600)} h`;
  if (segundos < 604800) return `há ${Math.floor(segundos / 86400)} d`;
  return data.toLocaleDateString('pt-BR');
}

export default function Notificacoes() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const {
    notificacoes, carregando, erro,
    marcarComoLida, marcarTodasComoLidas, remover,
  } = useNotificacoes();

  const rotaVoltar = ROTA_VOLTAR[usuario?.perfil] || '/login';
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const aoClicar = (notificacao) => {
    if (!notificacao.lida) marcarComoLida(notificacao.id);
    if (notificacao.link) navigate(notificacao.link);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">

      {/* TOPO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button
          onClick={() => navigate(rotaVoltar)}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold tracking-wide">Notificações</h1>
          {naoLidas > 0 && (
            <p className="text-[#F9A814] text-[10px] font-semibold uppercase tracking-wider">
              {naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}
            </p>
          )}
        </div>

        <button
          onClick={marcarTodasComoLidas}
          disabled={naoLidas === 0}
          className={`p-1 rounded-lg transition active:scale-95 ${
            naoLidas > 0 ? 'hover:bg-white/10' : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Marcar todas como lidas"
          title="Marcar todas como lidas"
        >
          <CheckCheck size={22} />
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 px-4 pt-5 pb-6 space-y-2.5 overflow-y-auto">

        {carregando && (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-[#3B44A8]/20 border-t-[#3B44A8] rounded-full animate-spin" />
          </div>
        )}

        {!carregando && erro && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
            {erro}
          </div>
        )}

        {!carregando && !erro && notificacoes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-700 font-bold text-sm">Nenhuma notificação</p>
            <p className="text-gray-400 text-xs mt-1 max-w-[240px]">
              Avisos sobre consultas, cirurgias e estoque aparecem aqui.
            </p>
          </div>
        )}

        {!carregando && notificacoes.map((n) => {
          const estilo = ESTILO_POR_TIPO[n.tipo] || ESTILO_POR_TIPO.sistema;
          const { Icone } = estilo;

          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                n.lida
                  ? 'bg-white border-gray-200'
                  : 'bg-[#3B44A8]/[0.04] border-[#3B44A8]/25 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${estilo.fundo}`}>
                <Icone size={18} className={estilo.cor} />
              </div>

              <button
                type="button"
                onClick={() => aoClicar(n)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-[13px] leading-snug ${n.lida ? 'font-semibold text-gray-700' : 'font-bold text-gray-950'}`}>
                    {n.titulo}
                  </h3>
                  {!n.lida && (
                    <span className="w-2 h-2 bg-[#F9A814] rounded-full shrink-0 mt-1.5" />
                  )}
                </div>

                {n.mensagem && (
                  <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed break-words">
                    {n.mensagem}
                  </p>
                )}

                <p className="text-gray-400 text-[10px] font-semibold mt-1.5 uppercase tracking-wide">
                  {formatarQuando(n.criado_em)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => remover(n.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                aria-label="Remover notificação"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
