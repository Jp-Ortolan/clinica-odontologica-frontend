import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Package, Camera, RefreshCw } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import api from '../../Services/api';
import { interpretarLeitura } from '../../utils/lerCodigo';

// A caixa de leitura precisa caber no vídeo real do aparelho. Com valores
// fixos ela estourava em telas menores e a região de leitura saía
// desalinhada da imagem da câmera.
function calcularQrbox(modo) {
  return (larguraVideo, alturaVideo) => {
    const menorLado = Math.min(larguraVideo, alturaVideo);
    if (modo === 'qrcode') {
      const lado = Math.max(140, Math.min(Math.floor(menorLado * 0.7), 320));
      return { width: lado, height: lado };
    }
    const largura = Math.max(180, Math.min(Math.floor(larguraVideo * 0.85), 400));
    const altura = Math.max(80, Math.min(Math.floor(alturaVideo * 0.45), 160));
    return { width: largura, height: altura };
  };
}

export default function LeitorCmeProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  const [abaAtiva, setAbaAtiva] = useState(location.state?.abaInicial || 'qrcode');
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erroCamera, setErroCamera] = useState(null);
  const [ultimoCodigoLido, setUltimoCodigoLido] = useState(null);
  const [resolvendo, setResolvendo] = useState(false);

  const html5QrcodeRef = useRef(null);
  const scannerContainerId = 'reader-container';

  // Inicia ou altera o modo da câmera conforme a aba selecionada
  useEffect(() => {
    let isMounted = true;

    const iniciarCamera = async () => {
      setErroCamera(null);

      // Parar qualquer instância prévia
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        await html5QrcodeRef.current.stop();
      }

      // Configuração de formatos aceitos de acordo com a aba
      const formatosSuportados = abaAtiva === 'qrcode'
        ? [Html5QrcodeSupportedFormats.QR_CODE]
        : [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
          ];

      const config = {
        fps: 10,
        qrbox: calcularQrbox(abaAtiva),
        aspectRatio: abaAtiva === 'qrcode' ? 1 : 1.7778,
        formatsToSupport: formatosSuportados,
      };

      try {
        const html5Qrcode = new Html5Qrcode(scannerContainerId);
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' }, // Usa a câmera traseira do celular
          config,
          (decodedText, decodedResult) => {
            if (!isMounted) return;

            // Sucesso na leitura
            setUltimoCodigoLido({
              id: decodedText,
              nome: 'Identificando...',
              data: new Date().toLocaleString('pt-BR'),
              formato: decodedResult?.result?.format?.formatName || abaAtiva,
            });

            // Resolve o pacote na hora. Antes era preciso tocar no card
            // "Última leitura" para isso acontecer, o que dava a impressão
            // de que ler o QR não fazia nada.
            resolverLeitura(decodedText);
          },
          () => {
            // Callback de escaneamento contínuo (frame a frame sem leitura)
          }
        );

        if (isMounted) setCameraAtiva(true);
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao acessar a câmera:', err);
          setErroCamera('Permissão negada ou câmera indisponível neste dispositivo.');
          setCameraAtiva(false);
        }
      }
    };

    iniciarCamera();

    return () => {
      isMounted = false;
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((e) => console.error(e));
      }
    };
  }, [abaAtiva]);

  // Resolve o texto lido para um pacote real e navega. Chamada tanto pela
  // câmera quanto pelo botão "Digitar código".
  const resolverLeitura = async (texto) => {
    const leitura = interpretarLeitura(texto);

    if (leitura.tipo !== 'pacote' || !leitura.cicloId) {
      // Não é etiqueta de pacote (ex.: QR de material ou código de barras).
      setUltimoCodigoLido((atual) => atual && {
        ...atual,
        nome: leitura.tipo === 'material'
          ? (leitura.nome || 'Material do estoque')
          : 'Código não reconhecido como pacote',
      });
      return;
    }

    setResolvendo(true);
    try {
      const { data: pacotes } = await api.get(`/esterilizacoes/${leitura.cicloId}/pacotes`);
      const candidatos = pacotes.filter((p) => Number(p.material_id) === leitura.materialId);

      if (candidatos.length === 1) {
        const pacote = candidatos[0];
        setUltimoCodigoLido((atual) => atual && {
          ...atual,
          nome: pacote.material_nome || `Pacote #${pacote.id}`,
        });
        navigate(`/app/professor/cme/pacote-detalhes/${pacote.id}`, { state: { pacote } });
        return;
      }

      setUltimoCodigoLido((atual) => atual && {
        ...atual,
        nome: candidatos.length === 0
          ? 'Pacote não encontrado neste ciclo'
          : `${candidatos.length} pacotes iguais neste ciclo — toque para escolher`,
      });
    } catch (err) {
      console.error('Erro ao resolver pacote a partir do QR-code:', err);
      setUltimoCodigoLido((atual) => atual && { ...atual, nome: 'Erro ao consultar o ciclo' });
    } finally {
      setResolvendo(false);
    }
  };

  // Tenta resolver o texto lido pra um pacote específico: o QR-code
  // codifica "ciclo:X|material:Y|...", então buscamos os pacotes daquele
  // ciclo e filtramos pelo material. Se sobrar exatamente um candidato,
  // vamos direto pra tela de detalhes com dado real; se for ambíguo (mais
  // de um pacote do mesmo material no mesmo ciclo) ou o texto não bater
  // nesse formato (ex.: código de barras), caímos na busca textual.
  const handleAbrirLeitura = async () => {
    if (!ultimoCodigoLido?.id || resolvendo) return;

    const match = ultimoCodigoLido.id.match(/ciclo:(\d+)\|material:(\d+)/);
    if (match) {
      const [, cicloId, materialId] = match;
      setResolvendo(true);
      try {
        const { data: pacotesDoCiclo } = await api.get(`/esterilizacoes/${cicloId}/pacotes`);
        const candidatos = pacotesDoCiclo.filter((p) => String(p.material_id) === materialId);
        if (candidatos.length === 1) {
          navigate(`/app/professor/cme/pacote-detalhes/${candidatos[0].id}`, {
            state: { pacote: candidatos[0] },
          });
          return;
        }
      } catch (err) {
        console.error('Erro ao resolver pacote a partir do QR-code:', err);
      } finally {
        setResolvendo(false);
      }
    }

    navigate('/app/professor/cme/pacotes-esterilizados', { state: { buscaInicial: ultimoCodigoLido.id } });
  };

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app/professor/cme');
    }
  };

  return (
    <div className="w-full h-full bg-[#3B42B2] text-white flex flex-col font-sans m-0 p-0 overflow-hidden relative">
      
      {/* HEADER / TOPO */}
      <header className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0 z-10">
        <button
          type="button"
          onClick={handleVoltar}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          {abaAtiva === 'qrcode' ? 'Leitura de QR-Code' : 'Leitura de Código de Barras'}
        </h1>

        <div className="w-9" aria-hidden="true" />
      </header>

      {/* CARD PRINCIPAL BRANCO COM SCROLL */}
      <main className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-4 pb-8 flex-1 overflow-y-auto flex flex-col space-y-5 shadow-inner relative">
        
        {/* TABS / SELEÇÃO SUPERIOR */}
        <div role="tablist" className="flex border-b border-slate-200 shrink-0">
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'qrcode'}
            onClick={() => setAbaAtiva('qrcode')}
            className={`flex-1 py-2 text-xs font-bold text-center relative transition cursor-pointer ${
              abaAtiva === 'qrcode' ? 'text-[#3B42B2]' : 'text-slate-400'
            }`}
          >
            QR-Code
            {abaAtiva === 'qrcode' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'barras'}
            onClick={() => setAbaAtiva('barras')}
            className={`flex-1 py-2 text-xs font-bold text-center relative transition cursor-pointer ${
              abaAtiva === 'barras' ? 'text-[#3B42B2]' : 'text-slate-400'
            }`}
          >
            Código de Barras
            {abaAtiva === 'barras' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>

        {/* ÁREA DO SCANNER REAL DA CÂMERA */}
        <section aria-label="Visor da Câmera" className="flex flex-col items-center justify-center pt-2 shrink-0">
          <div 
            className={`w-full bg-slate-900 rounded-2xl relative transition-all duration-300 overflow-hidden shadow-inner flex items-center justify-center ${
              abaAtiva === 'qrcode' ? 'aspect-square max-h-[280px]' : 'aspect-video max-h-[200px]'
            }`}
          >
            {/* Div Alvo da Biblioteca html5-qrcode */}
            <div id={scannerContainerId} className="w-full h-full object-cover" />

            {/* Overlay das Cantoneiras e Laser */}
            {cameraAtiva && (
              <>
                <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none" />
                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-lg pointer-events-none" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-lg pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-lg pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-lg pointer-events-none" />
              </>
            )}

            {/* Feedback Visual de Erro / Carregando Câmera */}
            {erroCamera && (
              <div className="absolute inset-0 bg-slate-900/90 text-white p-4 flex flex-col items-center justify-center text-center gap-2 z-10">
                <Camera className="w-8 h-8 text-amber-500" />
                <p className="text-xs text-slate-300">{erroCamera}</p>
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-[#3B42B2] mt-4 text-center">
            {abaAtiva === 'qrcode' 
              ? 'Posicione o QR-Code dentro da área' 
              : 'Posicione o código de barras dentro da área'
            }
          </p>
        </section>

        {/* ÚLTIMA LEITURA CAPTURADA DA CÂMERA */}
        <section className="space-y-2 pt-1 flex-1">
          <h2 className="font-extrabold text-[#3B42B2] text-xs">
            Última leitura
          </h2>

          <div
            onClick={handleAbrirLeitura}
            className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 text-[#3B42B2] shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="font-extrabold text-[#3B42B2] text-xs truncate">
                  {ultimoCodigoLido ? ultimoCodigoLido.nome : 'Nenhum código lido ainda'}
                </h3>
                <p className="text-[9px] text-slate-500 font-bold truncate">
                  Código: {ultimoCodigoLido ? ultimoCodigoLido.id : '---'}
                </p>
                <p className="text-[9px] text-slate-500 font-bold">
                  Data: {ultimoCodigoLido ? ultimoCodigoLido.data : '---'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0 ml-2">
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                ultimoCodigoLido ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {resolvendo ? 'Buscando...' : ultimoCodigoLido ? 'Lido' : 'Aguardando'}
              </span>
              <ChevronRight className="w-5 h-5 text-[#3B42B2]" />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}