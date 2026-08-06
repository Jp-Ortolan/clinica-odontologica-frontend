import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, History, Keyboard, Barcode, X, Search } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import api from '../../Services/api';
import { buscarMaterialPorLeitura } from '../../utils/lerCodigo';

// A caixa de leitura precisa caber no vídeo real do aparelho. Com valores
// fixos (220x220 / 280x120) ela estourava em telas menores e a região de
// leitura saía desalinhada da imagem. A html5-qrcode aceita uma função que
// recebe as dimensões reais do viewfinder.
function calcularQrbox(modo) {
  return (larguraVideo, alturaVideo) => {
    const menorLado = Math.min(larguraVideo, alturaVideo);
    if (modo === 'qrcode') {
      // Quadrado com 70% do menor lado, limitado para não ficar gigante.
      const lado = Math.max(140, Math.min(Math.floor(menorLado * 0.7), 320));
      return { width: lado, height: lado };
    }
    // Código de barras: faixa larga e baixa.
    const largura = Math.max(180, Math.min(Math.floor(larguraVideo * 0.85), 400));
    const altura = Math.max(80, Math.min(Math.floor(alturaVideo * 0.45), 160));
    return { width: largura, height: altura };
  };
}

export default function LeitorScanner() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define a aba inicial com base no botão que o usuário clicou na tela anterior
  const [abaAtiva, setAbaAtiva] = useState('qrcode');
  const [modalDigitarAberto, setModalDigitarAberto] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');

  // Câmera de verdade. Esta tela só tinha um placeholder animado e busca
  // por código digitado — a leitura por QR/código de barras existia apenas
  // na versão do professor.
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erroCamera, setErroCamera] = useState(null);
  const [historicoLeituras, setHistoricoLeituras] = useState([]);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const html5QrcodeRef = useRef(null);
  const readerElementId = 'scanner-viewport-aluno';

  useEffect(() => {
    let montado = true;

    const iniciarScanner = async () => {
      setErroCamera(null);
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        await html5QrcodeRef.current.stop().catch(() => {});
      }

      const formatos = abaAtiva === 'qrcode'
        ? [Html5QrcodeSupportedFormats.QR_CODE]
        : [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
          ];

      try {
        const leitor = new Html5Qrcode(readerElementId);
        html5QrcodeRef.current = leitor;
        await leitor.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: calcularQrbox(abaAtiva),
            aspectRatio: abaAtiva === 'qrcode' ? 1 : 1.7778,
            formatsToSupport: formatos,
          },
          (textoLido) => {
            if (!montado) return;
            processarLeitura(textoLido);
          },
          () => {} // frames sem leitura
        );
        if (montado) setCameraAtiva(true);
      } catch (err) {
        if (montado) {
          console.error('Erro de câmera:', err);
          setErroCamera('Não foi possível acessar a câmera. Use "Digitar código".');
          setCameraAtiva(false);
        }
      }
    };

    iniciarScanner();

    return () => {
      montado = false;
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaAtiva]);

  // Caminho único de leitura: serve pra câmera e pro código digitado.
  const processarLeitura = async (texto) => {
    setHistoricoLeituras((anteriores) => [
      { id: texto, tipo: abaAtiva, data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) },
      ...anteriores,
    ]);

    try {
      const { material, leitura } = await buscarMaterialPorLeitura(api, texto);

      if (leitura.tipo === 'pacote') {
        setErroCamera('Esta etiqueta é de um pacote do CME, não de um material do estoque.');
        return;
      }
      if (!material) {
        setErroCamera(
          leitura.tipo === 'codigo'
            ? `Nenhum material cadastrado com o código ${leitura.valor}.`
            : 'Nenhum material encontrado para esta etiqueta.'
        );
        return;
      }

      setModalDigitarAberto(false);
      navigate('/app/aluno/estoque/detalhes', { state: { material } });
    } catch (err) {
      console.error('Erro ao buscar material:', err);
      setErroCamera('Erro ao buscar material pelo código lido.');
    }
  };

  useEffect(() => {
    if (location.state?.modo) {
      setAbaAtiva(location.state.modo);
    }
  }, [location.state]);

  // Não há câmera real integrada — a leitura de fato acontece digitando
  // o código, que buscamos direto no material real via /materiais?busca=
  const handleBuscarManual = async (e) => {
    e.preventDefault();
    if (!codigoDigitado.trim()) return;

    setBuscando(true);
    setErroBusca('');
    try {
      // Mesmo caminho da câmera: aceita o código impresso e o conteúdo do
      // QR gerado pelo sistema ("material:ID|codigo_barras:...|nome:...").
      const { material, leitura } = await buscarMaterialPorLeitura(api, codigoDigitado.trim());

      if (!material) {
        setErroBusca(
          leitura.tipo === 'codigo'
            ? `Nenhum material cadastrado com o código ${leitura.valor}.`
            : 'Nenhum material encontrado para esta etiqueta.'
        );
        return;
      }

      setModalDigitarAberto(false);
      navigate('/app/aluno/estoque/detalhes', { state: { material } });
    } catch (err) {
      console.error('Erro ao buscar material:', err);
      setErroBusca('Erro ao buscar material.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans relative">
      
      {/* HEADER FIXO DINÂMICO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate('/app/aluno/estoque')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para o estoque"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide flex-1 text-center mr-6">
          {abaAtiva === 'qrcode' ? 'Leitura de QR-Code' : 'Leitura de Código de Barras'}
        </h1>
      </div>

      {/* ABAS DE SELEÇÃO (TOP TABS) */}
      <div className="flex border-b border-gray-200 select-none shrink-0 mx-6 mt-4" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={abaAtiva === 'qrcode'}
          onClick={() => setAbaAtiva('qrcode')}
          className={`flex-1 text-center py-3 font-bold text-xs transition-all border-b-2 cursor-pointer ${
            abaAtiva === 'qrcode'
              ? 'text-[#3B44A8] border-[#F9A814]'
              : 'text-gray-400 border-transparent hover:text-gray-600'
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
              : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          Código de Barras
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL - ÁREA DA CÂMERA */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-start space-y-6 pb-24">
        
        {/* CONTAINER DA CÂMERA COM BORDAS ENQUADRADAS */}
        <div className="relative w-full max-w-[320px] flex items-center justify-center pt-2">
          
          {/* Caixa do Scanner */}
          <div className={`w-full bg-slate-900 rounded-2xl relative transition-all duration-300 overflow-hidden shadow-inner ${
            abaAtiva === 'qrcode' ? 'aspect-square max-h-[300px]' : 'aspect-video max-h-[220px]'
          }`}>
            
            {/* Viewport real da câmera */}
            <div id={readerElementId} className="w-full h-full object-cover" />

            {/* Mensagem sobreposta enquanto a câmera não está ativa */}
            {!cameraAtiva && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium text-xs text-center p-4 select-none pointer-events-none">
                <span>{erroCamera || 'Iniciando câmera...'}</span>
              </div>
            )}

            {/* Linha laser de escaneamento */}
            {cameraAtiva && (
              <div className="absolute top-0 left-0 w-full h-1 bg-[#F9A814] shadow-[0_0_12px_#F9A814] animate-[bounce_2s_infinite] pointer-events-none" />
            )}

            {/* Cantoneiras de Foco Amarelas */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-[#F9A814] rounded-tl-lg pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-[#F9A814] rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-[#F9A814] rounded-bl-lg pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-[#F9A814] rounded-br-lg pointer-events-none"></div>
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
            onClick={() => navigate('/app/aluno/estoque/materiais')}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl font-bold text-[#3B44A8] text-xs shadow-xs transition-all cursor-pointer"
          >
            <History size={16} />
            Materiais
          </button>

          {/* Botão Digitar Código */}
          <button
            type="button"
            onClick={() => setModalDigitarAberto(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl font-bold text-[#3B44A8] text-xs shadow-xs transition-all cursor-pointer"
          >
            {abaAtiva === 'qrcode' ? <Keyboard size={16} /> : <Barcode size={16} />}
            Digitar Código
          </button>
        </div>

      </div>

      {/* MODAL DE DIGITAR CÓDIGO */}
      {modalDigitarAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
            className="bg-white rounded-3xl p-6 w-full max-w-[360px] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center">
              <h2 id="titulo-modal" className="text-base font-bold text-[#3B44A8]">
                Digitar {abaAtiva === 'qrcode' ? 'QR-Code' : 'Código de Barras'}
              </h2>
              <button 
                type="button" 
                onClick={() => setModalDigitarAberto(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBuscarManual} className="space-y-4">
              <div>
                <label htmlFor="codigo-input" className="block text-xs font-semibold text-gray-600 mb-1">
                  Insira a numeração do código:
                </label>
                <input
                  id="codigo-input"
                  type="text"
                  placeholder="Ex: 7891234567890"
                  value={codigoDigitado}
                  onChange={(e) => setCodigoDigitado(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#3B44A8] text-gray-800"
                  autoFocus
                />
                {erroBusca && <p className="text-red-500 text-[10px] font-bold mt-1.5">{erroBusca}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalDigitarAberto(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!codigoDigitado.trim() || buscando}
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#3B44A8] hover:bg-[#2E3583] disabled:opacity-50 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search size={14} />
                  {buscando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}