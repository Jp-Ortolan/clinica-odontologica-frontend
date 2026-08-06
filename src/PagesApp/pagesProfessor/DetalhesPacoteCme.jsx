import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';
import api from '../../Services/api';

// Constantes de Identidade Visual
const BRAND_COLOR = 'bg-[#3B42B2]';
const BRAND_TEXT = 'text-[#3B42B2]';
const BUTTON_BG = 'bg-[#C5CBE9] hover:bg-[#b4bce0]';

const STATUS_CONFIG = {
  esterilizado: { bg: 'bg-[#B8D8B2]', text: 'text-emerald-900', label: 'Válido' },
  vencido: { bg: 'bg-rose-200', text: 'text-rose-900', label: 'Vencido' },
  utilizado: { bg: 'bg-slate-200', text: 'text-slate-800', label: 'Utilizado' },
};

const TIPO_CICLO_LABEL = {
  vapor: 'Vapor',
  calor_seco: 'Calor seco',
  plasma: 'Plasma',
};

export default function DetalhesPacoteCme() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pacoteId } = useParams();

  // Caminho rápido: a tela anterior (lista de pacotes / dashboard CME) já
  // manda o pacote inteiro (com o "ciclo" embutido) via state, evitando
  // uma nova requisição. Se o state não estiver disponível — recarregou a
  // página, abriu o link direto, veio do leitor de QR-code — buscamos o
  // pacote isolado por GET /esterilizacoes/pacotes/:pacoteId e completamos
  // com os dados do ciclo numa segunda chamada.
  const [pacote, setPacote] = useState(location.state?.pacote || null);
  const [carregando, setCarregando] = useState(!location.state?.pacote);
  const [erro, setErro] = useState(null);
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    if (pacote || !pacoteId) return;

    let cancelado = false;
    setCarregando(true);
    api.get(`/esterilizacoes/pacotes/${pacoteId}`)
      .then(async ({ data: pacoteBase }) => {
        let ciclo = null;
        try {
          const { data } = await api.get(`/esterilizacoes/${pacoteBase.esterilizacao_id}`);
          ciclo = data;
        } catch (err) {
          console.error('Erro ao carregar dados do ciclo do pacote:', err);
        }
        if (!cancelado) setPacote({ ...pacoteBase, ciclo });
      })
      .catch((err) => {
        console.error('Erro ao carregar pacote:', err);
        if (!cancelado) setErro('Pacote não encontrado.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => { cancelado = true; };
  }, [pacote, pacoteId]);

  if (carregando) {
    return (
      <div className="w-full h-screen bg-[#3B42B2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!pacote || erro) {
    return (
      <div className="w-full h-screen bg-[#3B42B2] text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-bold text-sm">{erro || 'Nenhum pacote selecionado.'}</p>
        <button
          onClick={() => navigate('/app/professor/cme/pacotes-esterilizados')}
          className="bg-white text-[#3B42B2] px-4 py-2 rounded-xl text-sm font-bold"
        >
          Ver pacotes esterilizados
        </button>
      </div>
    );
  }

  // Dispara a impressão nativa
  const handleImprimir = () => {
    window.print();
  };

  const handleRegistrarUso = async () => {
    setRegistrando(true);
    try {
      await api.patch(`/esterilizacoes/pacotes/${pacote.id}/status`, { status: 'utilizado' });
      setPacote((prev) => ({ ...prev, status: 'utilizado' }));
      alert(`Uso do pacote ${pacote.material_nome} registrado com sucesso!`);
    } catch (err) {
      console.error('Erro ao registrar uso do pacote:', err);
      alert('Falha ao registrar o uso do pacote. Tente novamente.');
    } finally {
      setRegistrando(false);
    }
  };

  const status = STATUS_CONFIG[pacote.status] || STATUS_CONFIG.esterilizado;

  return (
    <div className={`w-full h-screen ${BRAND_COLOR} text-white flex flex-col font-sans overflow-hidden relative select-none`}>

      {/* ESTILOS DE IMPRESSÃO - Visível apenas quando window.print() for chamado */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #etiqueta-impressao, #etiqueta-impressao * { visibility: visible; }
          #etiqueta-impressao { position: absolute; left: 0; top: 0; width: 100%; color: #000; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* HEADER TOPO (no-print) */}
      <header className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0 no-print">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar à tela anterior"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          Detalhes do Pacote
        </h1>

        <div className="w-9" aria-hidden="true" />
      </header>

      {/* CARD PRINCIPAL BRANCO */}
      <main className="bg-white text-slate-800 rounded-t-[32px] px-5 pt-6 pb-8 flex-1 overflow-y-auto flex flex-col space-y-6 shadow-inner relative">

        {/* ÁREA DA ETIQUETA / CÓDIGO (Identificada para impressão) */}
        <section id="etiqueta-impressao" className="space-y-4 text-center">

          <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
            {pacote.material_nome}
          </h2>

          {/* QR CODE REAL GERADO PELO BACKEND */}
          <div className="flex items-center justify-center py-1">
            {pacote.qr_code ? (
              <img src={pacote.qr_code} alt="QR Code do pacote" className="w-28 h-28 object-contain" />
            ) : (
              <div className="w-28 h-28 flex items-center justify-center text-slate-300 text-xs font-bold border border-dashed border-slate-200 rounded-xl">
                Sem QR Code
              </div>
            )}
          </div>
          <span className="text-xs font-black text-slate-800 tracking-wider block">
            Pacote #{pacote.id}
          </span>

          {/* BADGE DE STATUS */}
          <div className="flex justify-center">
            <span className={`${status.bg} ${status.text} text-xs font-extrabold px-8 py-1.5 rounded-full inline-block`}>
              {status.label}
            </span>
          </div>
        </section>

        {/* BOTÕES DE AÇÃO (no-print) */}
        <div className="grid grid-cols-2 gap-3 pt-1 no-print">
          <button
            onClick={handleImprimir}
            className={`${BUTTON_BG} ${BRAND_TEXT} font-extrabold py-3 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer text-xs`}
          >
            <Printer className="w-5 h-5 shrink-0" />
            <span>Imprimir etiqueta</span>
          </button>

          <button
            onClick={handleRegistrarUso}
            disabled={registrando || pacote.status === 'utilizado'}
            className={`${BUTTON_BG} ${BRAND_TEXT} font-extrabold py-3 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer text-xs disabled:opacity-50`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{registrando ? 'Registrando...' : 'Registrar uso'}</span>
          </button>
        </div>

        {/* SEÇÃO INFORMAÇÕES DO PACOTE */}
        <section className="space-y-2 pt-2">
          <h3 className={`font-extrabold ${BRAND_TEXT} text-sm`}>
            Informações do pacote
          </h3>

          <div className="border border-slate-200/80 rounded-2xl p-4 bg-white shadow-xs">
            <dl className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">

              <div>
                <dt className="font-extrabold text-slate-800">Material:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.material_nome}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Cadastrado em:</dt>
                <dd className="text-slate-600 font-semibold">
                  {pacote.criado_em ? new Date(pacote.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'N/I'}
                </dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Validade:</dt>
                <dd className="text-slate-600 font-semibold">
                  {pacote.validade ? new Date(pacote.validade).toLocaleDateString('pt-BR') : 'N/I'}
                </dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Tipo de ciclo:</dt>
                <dd className="text-slate-600 font-semibold">
                  {TIPO_CICLO_LABEL[pacote.ciclo?.tipo_ciclo] || pacote.ciclo?.tipo_ciclo || 'N/I'}
                </dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Equipamento:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.ciclo?.equipamento || 'N/I'}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Ciclo:</dt>
                <dd className="text-slate-600 font-semibold">#{pacote.esterilizacao_id}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Operador do ciclo:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.ciclo?.operador_nome || 'N/I'}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Status:</dt>
                <dd className={`font-extrabold ${status.text}`}>{status.label}</dd>
              </div>

            </dl>
          </div>
        </section>

      </main>
    </div>
  );
}
