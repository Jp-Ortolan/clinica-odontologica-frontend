import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Printer } from 'lucide-react';

export default function PreVisualizacaoEtiqueta() {
  const navigate = useNavigate();
  const location = useLocation();

  const dados = location.state || {
    material: { nome: 'GAZE', codigo: '18279813055465' },
    lote: '2026-01-31',
    validade: '20/07/2029',
    quantidade: 10,
    localizacao: 'Centro Universitário Campo Real Guarapuava',
    incluirQR: true,
    incluirBarra: true,
    modelo: '50mm x 30mm'
  };

  const [qtdEtiquetas, setQtdEtiquetas] = useState(dados.quantidade);

  // =========================================================================
  // GERADOR DE QR CODE EM SVG
  // =========================================================================
  const gerarQRCodeSVG = (textoUnico) => {
    let hash = 0;
    const str = textoUnico || 'gaze';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const tamanho = 21; 
    const matriz = Array(tamanho).fill(null).map(() => Array(tamanho).fill(false));

    const desenharLocalizador = (rowStart, colStart) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const bordaExterna = r === 0 || r === 6 || c === 0 || c === 6;
          const mioloInterno = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          
          if (bordaExterna || mioloInterno) {
            matriz[rowStart + r][colStart + c] = true;
          }
        }
      }
    };

    desenharLocalizador(0, 0); 
    desenharLocalizador(0, tamanho - 7); 
    desenharLocalizador(tamanho - 7, 0); 

    for (let r = 0; r < tamanho; r++) {
      for (let c = 0; c < tamanho; c++) {
        const areaLocalizador = (r < 8 && c < 8) || (r < 8 && c >= tamanho - 8) || (r >= tamanho - 8 && c < 8);
        
        if (!areaLocalizador) {
          const pseudoAleatorio = Math.abs(Math.sin(hash + (r * 13) + (c * 37)));
          if (pseudoAleatorio > 0.48) {
            matriz[r][c] = true;
          }
        }
      }
    }

    return (
      <svg 
        width="68" 
        height="68" 
        viewBox={`0 0 ${tamanho} ${tamanho}`} 
        className="w-16 h-16"
        role="img"
        aria-label="QR Code da etiqueta"
      >
        <g fill="#000000">
          {matriz.map((row, rIdx) => 
            row.map((preenchido, cIdx) => 
              preenchido ? (
                <rect 
                  key={`${rIdx}-${cIdx}`} 
                  x={cIdx} 
                  y={rIdx} 
                  width="1" 
                  height="1" 
                  shapeRendering="crispEdges" 
                />
              ) : null
            )
          )}
        </g>
      </svg>
    );
  };

  // =========================================================================
  // GERADOR DE CÓDIGO DE BARRAS EM SVG
  // =========================================================================
  const gerarCodigoDeBarrasSVG = (codigo) => {
    const strCodigo = String(codigo || '000000000000');
    let padraoLinhas = '';
    for (let i = 0; i < strCodigo.length; i++) {
      const num = parseInt(strCodigo[i], 10) || 1;
      padraoLinhas += (num % 2 === 0) ? '11001' : '10110';
    }
    padraoLinhas = (padraoLinhas + '101011001101').repeat(2);

    return (
      <svg 
        width="100%" 
        height="42" 
        viewBox={`0 0 ${padraoLinhas.length} 42`} 
        preserveAspectRatio="none" 
        className="w-full"
        role="img"
        aria-label={`Código de barras: ${strCodigo}`}
      >
        <g fill="#000000">
          {padraoLinhas.split('').map((char, index) => {
            if (char === '1') {
              return <rect key={index} x={index} y="0" width="1" height="42" />;
            }
            return null;
          })}
        </g>
      </svg>
    );
  };

  const handleImprimir = () => {
    const agora = new Date();
    const dataHoraFormatada = `${String(agora.getDate()).padStart(2, '0')}/${String(agora.getMonth() + 1).padStart(2, '0')}/${agora.getFullYear()} - ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    navigate('/app/aluno/estoque/impressao-concluida', {
      state: {
        nome: dados.material?.nome,
        lote: dados.lote,
        validade: dados.validade,
        quantidadeImpressa: qtdEtiquetas,
        dataHora: dataHoraFormatada,
        usuario: "Pedro Guimarães"
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FD] font-sans pb-10">
      
      {/* HEADER FIXO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para a página anterior"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide flex-1 text-center mr-8">
          Pré-visualização
        </h1>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        
        <div className="space-y-3">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide px-1">
            Visualização da etiqueta
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-6 flex flex-col items-center">
            
            {/* CORPO DA ETIQUETA IMPRESSA */}
            <div className="w-full border border-gray-300 rounded-2xl p-4 bg-white shadow-xs flex flex-col justify-between min-h-[260px] relative overflow-hidden">
              
              <h3 className="text-center font-black text-gray-950 text-base uppercase tracking-tight truncate">
                {dados.material?.nome}
              </h3>

              {/* GRÁFICOS */}
              <div className="flex items-center justify-between gap-4 py-3 px-1">
                {dados.incluirQR && (
                  <div className="w-16 h-16 bg-white flex items-center justify-center shrink-0 p-0.5 border border-gray-100 rounded-md shadow-inner">
                    {gerarQRCodeSVG(dados.material?.nome + dados.material?.codigo)}
                  </div>
                )}

                {dados.incluirBarra && (
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="w-full px-1">
                      {gerarCodigoDeBarrasSVG(dados.material?.codigo)}
                    </div>
                    <span className="text-[10px] font-bold text-gray-950 mt-1 tracking-widest truncate w-full text-center">
                      {dados.material?.codigo}
                    </span>
                  </div>
                )}
              </div>

              {/* INFORMAÇÕES DA ETIQUETA */}
              <div className="text-[11px] space-y-0.5 px-1 font-bold text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Lote:</span>
                  <span className="font-black text-gray-950">{dados.lote || 'Não informado'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Validade:</span>
                  <span className="font-black text-gray-950">{dados.validade || 'Não informada'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Quantidade:</span>
                  <span className="font-black text-gray-950">{qtdEtiquetas} unidades</span>
                </div>
              </div>

              {/* RODAPÉ */}
              <div className="bg-[#3B44A8] text-white text-[9px] font-semibold text-center py-2 px-3 rounded-xl mt-4 -mx-1 -mb-1 truncate shadow-inner">
                {dados.localizacao}
              </div>

            </div>

            <p className="text-xs font-bold text-gray-500 select-none">
              Modelo: <span className="text-gray-950 font-black">{dados.modelo?.replace('Padrão - ', '')}</span>
            </p>

          </div>
        </div>

        {/* CONTADOR DE ETIQUETAS */}
        <div className="space-y-2 select-none">
          <h3 className="text-[#3B44A8] font-bold text-sm tracking-wide px-1">
            Configurações
          </h3>
          <div className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <span className="text-xs font-bold text-gray-900">Quantidade de etiquetas</span>
            <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-xs h-[36px]">
              <button 
                type="button"
                onClick={() => setQtdEtiquetas(q => Math.max(1, q - 1))} 
                className="px-3 h-full hover:bg-gray-50 text-gray-500 border-r border-gray-100 transition flex items-center cursor-pointer"
                aria-label="Diminuir quantidade de etiquetas"
              >
                <Minus size={13} strokeWidth={2.5} />
              </button>
              <span className="px-4 text-xs font-black text-gray-950 min-w-[32px] text-center">
                {qtdEtiquetas}
              </span>
              <button 
                type="button"
                onClick={() => setQtdEtiquetas(q => q + 1)} 
                className="px-3 h-full hover:bg-gray-50 text-gray-500 border-l border-gray-100 transition flex items-center cursor-pointer"
                aria-label="Aumentar quantidade de etiquetas"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTÃO IMPRIMIR */}
        <button 
          type="button"
          onClick={handleImprimir}
          className="w-full bg-[#F59E0B] text-white font-bold py-4 rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 hover:bg-[#D97706] transition active:scale-[0.98] cursor-pointer"
        >
          <Printer size={18} strokeWidth={2.5} />
          Imprimir Etiqueta
        </button>

      </div>
    </div>
  );
}