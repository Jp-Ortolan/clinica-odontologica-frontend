import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';

// Constantes de Identidade Visual
const BRAND_COLOR = 'bg-[#3B42B2]';
const BRAND_TEXT = 'text-[#3B42B2]';
const BUTTON_BG = 'bg-[#C5CBE9] hover:bg-[#b4bce0]';

export default function DetalhesPacoteCme() {
  const navigate = useNavigate();

  // Dados Mockados do Pacote CME
  const [pacote] = useState({
    id: '125794216646',
    nome: 'KIT CIRÚRGICO 01',
    tipo: 'Kit cirúrgico',
    dataEsterilizacao: '20/05/2026 - 09:38',
    conteudo: '10 itens',
    validade: '27/08/2026',
    autoclave: '01',
    responsavel: 'Vitória Taques',
    ciclo: '2549',
    status: 'Valido' // 'Valido' | 'Vencido' | 'UsoRegistrado'
  });

  // Dispara a impressão nativa
  const handleImprimir = () => {
    window.print();
  };

  const handleRegistrarUso = () => {
    // Lógica para registrar uso do pacote no sistema
    alert(`Uso do pacote ${pacote.nome} registrado com sucesso!`);
  };

  // Helper para Badge de Status
  const renderStatusBadge = (status) => {
    const config = {
      Valido: { bg: 'bg-[#B8D8B2]', text: 'text-emerald-900', label: 'Válido' },
      Vencido: { bg: 'bg-rose-200', text: 'text-rose-900', label: 'Vencido' },
      UsoRegistrado: { bg: 'bg-slate-200', text: 'text-slate-800', label: 'Utilizado' }
    };

    const current = config[status] || config.Valido;

    return (
      <span className={`${current.bg} ${current.text} text-xs font-extrabold px-8 py-1.5 rounded-full inline-block`}>
        {current.label}
      </span>
    );
  };

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
        
        {/* ÁREA DA ETIQUETA / CÓDIGOS (Identificada para impressão) */}
        <section id="etiqueta-impressao" className="space-y-4 text-center">
          
          <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
            {pacote.nome}
          </h2>

          {/* CÓDIGOS DE BARRAS / QR CODE */}
          <div className="flex items-center justify-center gap-6 py-1">
            {/* QR Code SVG */}
            <div className="w-24 h-24 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900" aria-label="QR Code do Pacote">
                <path d="M0,0 h40 v40 h-40 z M10,10 v20 h20 v-20 z M15,15 h10 v10 h-10 z" />
                <path d="M60,0 h40 v40 h-40 z M70,10 v20 h20 v-20 z M75,15 h10 v10 h-10 z" />
                <path d="M0,60 h40 v40 h-40 z M10,70 v20 h20 v-20 z M15,75 h10 v10 h-10 z" />
                <rect x="50" y="50" width="10" height="10" />
                <rect x="70" y="50" width="10" height="10" />
                <rect x="50" y="70" width="10" height="10" />
                <rect x="80" y="80" width="20" height="20" />
                <rect x="60" y="90" width="10" height="10" />
              </svg>
            </div>

            {/* Código de Barras Simulado */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-16 flex items-stretch gap-1 bg-white p-1">
                <div className="w-1 bg-slate-900" />
                <div className="w-0.5 bg-slate-900" />
                <div className="w-1.5 bg-slate-900" />
                <div className="w-0.5 bg-slate-900" />
                <div className="w-1 bg-slate-900" />
                <div className="w-2 bg-slate-900" />
                <div className="w-0.5 bg-slate-900" />
                <div className="w-1 bg-slate-900" />
                <div className="w-1.5 bg-slate-900" />
                <div className="w-0.5 bg-slate-900" />
                <div className="w-1 bg-slate-900" />
                <div className="w-2 bg-slate-900" />
                <div className="w-0.5 bg-slate-900" />
                <div className="w-1 bg-slate-900" />
              </div>
              <span className="text-xs font-black text-slate-800 tracking-wider mt-1">
                {pacote.id}
              </span>
            </div>
          </div>

          {/* BADGE DE STATUS */}
          <div className="flex justify-center">
            {renderStatusBadge(pacote.status)}
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
            className={`${BUTTON_BG} ${BRAND_TEXT} font-extrabold py-3 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer text-xs`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Registrar uso</span>
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
                <dt className="font-extrabold text-slate-800">Tipo de pacote:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.tipo}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Data de esterilização:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.dataEsterilizacao}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Conteúdo:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.conteudo}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Validade:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.validade}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Autoclave:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.autoclave}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Responsável:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.responsavel}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Ciclo:</dt>
                <dd className="text-slate-600 font-semibold">{pacote.ciclo}</dd>
              </div>

              <div>
                <dt className="font-extrabold text-slate-800">Status:</dt>
                <dd className="text-emerald-600 font-extrabold">Válido</dd>
              </div>

            </dl>
          </div>
        </section>

      </main>
    </div>
  );
}