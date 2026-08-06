import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, History, Keyboard, Barcode, X, Camera, CheckCircle2, Copy } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function LeitorScannerProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  const [abaAtiva, setAbaAtiva] = useState('qrcode');
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erroCamera, setErroCamera] = useState(null);

  // Modais
  const [modalDigitarAberto, setModalDigitarAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);

  // Estados de Entrada e Histórico
  const [codigoManual, setCodigoManual] = useState('');
  const [historicoLeituras, setHistoricoLeituras] = useState([
    { id: '7891234567890', tipo: 'barras', data: '20/05/2026 - 10:15' },
    { id: 'KIT-EST-092', tipo: 'qrcode', data: '20/05/2026 - 09:40' }
  ]);

  const html5QrcodeRef = useRef(null);
  const readerElementId = 'scanner-viewport';

  useEffect(() => {
    if (location.state?.modo) {
      setAbaAtiva(location.state.modo);
    }
  }, [location.state]);

  // Inicializa/Reinicia a Câmera Real quando a aba muda
  useEffect(() => {
    let isMounted = true;

    const iniciarScanner = async () => {
      setErroCamera(null);

      // Encerra scanner anterior se existir
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        await html5QrcodeRef.current.stop();
      }

      const formatos = abaAtiva === 'qrcode'
        ? [Html5QrcodeSupportedFormats.QR_CODE]
        : [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A
          ];

      const config = {
        fps: 10,
        qrbox: abaAtiva === 'qrcode' ? { width: 220, height: 220 } : { width: 280, height: 120 },
        formatsToSupport: formatos,
      };

      try {
        const html5Qrcode = new Html5Qrcode(readerElementId);
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            processarLeitura(decodedText, abaAtiva);
          },
          () => {} // Leitura contínua silenciosa
        );

        if (isMounted) setCameraAtiva(true);
      } catch (err) {
        if (isMounted) {
          console.error('Erro de câmera:', err);
          setErroCamera('Não foi possível acessar a câmera do dispositivo.');
          setCameraAtiva(false);
        }
      }
    };

    iniciarScanner();

    return () => {
      isMounted = false;
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((e) => console.error(e));
      }
    };
  }, [abaAtiva]);

  const processarLeitura = (codigo, tipo) => {
    const novaLeitura = {
      id: codigo,
      tipo,
      data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    };

    setHistoricoLeituras((prev) => [novaLeitura, ...prev]);

    // Redireciona para ação no Estoque
    navigate('/app/professor/estoque/item-detalhes', { state: { codigo } });
  };

  const handleSubmeterManual = (e) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    setModalDigitarAberto(false);
    processarLeitura(codigoManual.trim(), abaAtiva);
    setCodigoManual('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white relative">
      
      {/* HEADER FIXO DINÂMICO */}
      <header className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate('/app/professor/estoque')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para estoque"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide mr-8">
          {abaAtiva === 'qrcode' ? 'Leitura de QR-Code' : 'Leitura de Código de Barras'}
        </h1>
        <div className="w-6" aria-hidden="true" />
      </header>

      {/* ABAS DE SELEÇÃO (TOP TABS) */}
      <nav aria-label="Modo de Leitura" className="flex border-b border-gray-200 select-none shrink-0 mx-6 mt-4">
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'qrcode'}
          onClick={() => setAbaAtiva('qrcode')}
          className={`flex-1 text-center py-3 font-bold text-xs transition-all border-b-2 cursor-pointer ${
            abaAtiva === 'qrcode'
              ? 'text-[#3B44A8] border-[#F9A814]'
              : 'text-gray-400 border-transparent'
          }`}
        >
          QR-Code
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'barras'}
          onClick={() => setAbaAtiva('barras')}
          className={`flex-1 text-center py-3 font-bold text-xs transition-all border-b-2 cursor-pointer ${
            abaAtiva === 'barras'
              ? 'text-[#3B44A8] border-[#F9A814]'
              : 'text-gray-400 border-transparent'
          }`}
        >
          Código de Barras
        </button>
      </nav>

      {/* CONTEÚDO PRINCIPAL - ÁREA DA CÂMERA */}
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-start space-y-6 pb-24">
        
        {/* CONTAINER DA CÂMERA */}
        <div className="relative w-full max-w-[320px] flex items-center justify-center pt-2">
          <div className={`w-full bg-slate-900 rounded-2xl relative transition-all duration-300 overflow-hidden shadow-md ${
            abaAtiva === 'qrcode' ? 'aspect-square' : 'aspect-[16/8]'
          }`}>
            
            {/* Viewport da Câmera HTML5 */}
            <div id={readerElementId} className="w-full h-full object-cover" />

            {/* Cantoneiras Amarelas de Enquadramento */}
            {cameraAtiva && (
              <>
                <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none" />
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#F9A814] rounded-tl-lg pointer-events-none" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#F9A814] rounded-tr-lg pointer-events-none" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#F9A814] rounded-bl-lg pointer-events-none" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#F9A814] rounded-br-lg pointer-events-none" />
              </>
            )}

            {/* Mensagem de Erro / Falha de Câmera */}
            {erroCamera && (
              <div className="absolute inset-0 bg-slate-900/90 text-white p-4 flex flex-col items-center justify-center text-center gap-2">
                <Camera className="w-8 h-8 text-[#F9A814]" />
                <p className="text-xs text-slate-300">{erroCamera}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mensagem Instrutiva */}
        <p className="text-[#3B44A8] text-xs font-bold text-center select-none">
          Posicione o {abaAtiva === 'qrcode' ? 'QR-Code' : 'Código de Barras'} dentro da área
        </p>

        {/* BOTÕES DE AÇÃO INFERIORES */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-[340px] pt-2">
          {/* Botão Histórico */}
          <button
            type="button"
            onClick={() => setModalHistoricoAberto(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl font-bold text-[#3B44A8] text-xs shadow-md transition-all cursor-pointer"
          >
            <History size={16} />
            Histórico
          </button>

          {/* Botão Digitar Código */}
          <button
            type="button"
            onClick={() => setModalDigitarAberto(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl font-bold text-[#3B44A8] text-xs shadow-md transition-all cursor-pointer"
          >
            {abaAtiva === 'qrcode' ? <Keyboard size={16} /> : <Barcode size={16} />}
            Digitar Código
          </button>
        </div>

      </main>

      {/* MODAL: DIGITAR CÓDIGO */}
      {modalDigitarAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-[#3B44A8] text-sm">Entrada Manual de Código</h3>
              <button type="button" onClick={() => setModalDigitarAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmeterManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Digite o número do código ({abaAtiva}):
                </label>
                <input
                  type="text"
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                  placeholder="Ex: 7891234567890"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3B44A8]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalDigitarAberto(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#3B44A8] rounded-xl hover:bg-[#31388d]"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO RECENTE */}
      {modalHistoricoAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-5 shadow-xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-bold text-[#3B44A8] text-sm flex items-center gap-2">
                <History size={18} /> Histórico Recente
              </h3>
              <button type="button" onClick={() => setModalHistoricoAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {historicoLeituras.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Nenhuma leitura gravada nesta sessão.</p>
              ) : (
                historicoLeituras.map((item, index) => (
                  <div key={index} className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{item.id}</p>
                      <p className="text-[10px] text-slate-400">{item.tipo.toUpperCase()} • {item.data}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalHistoricoAberto(false);
                        processarLeitura(item.id, item.tipo);
                      }}
                      className="p-1.5 text-[#3B44A8] hover:bg-indigo-50 rounded-lg"
                      title="Usar este código"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}