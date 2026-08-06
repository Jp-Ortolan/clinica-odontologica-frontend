import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Calendar, Image, Barcode, X } from 'lucide-react';

const STORAGE_KEY_MATERIAIS = '@app_clinica:materiais_estoque';

export default function CadastrarMaterialProfessor() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [categoria, setCategoria] = useState('');
  const [unidade, setUnidade] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [estoqueIdeal, setEstoqueIdeal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [validade, setValidade] = useState('');

  // Estados para Imagem / Arquivo
  const [arquivo, setArquivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Limpa URL temporária para evitar memory leak
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Converter Imagem/Arquivo para Base64 (salvar localmente)
  const converterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Gatilho para clicar no input escondido
  const handleAreaImagemClick = () => {
    fileInputRef.current?.click();
  };

  // Processa o arquivo selecionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setArquivo(file);

      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl('');
      }
    }
  };

  // Remove o arquivo selecionado
  const handleRemoverArquivo = (e) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArquivo(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // SALVAR NO BANCO / LOCALSTORAGE
  const handleSalvar = async (e) => {
    e.preventDefault();

    try {
      let imagemBase64 = null;
      
      // Se houver arquivo, converte para armazenar no banco/storage
      if (arquivo && arquivo.type.startsWith('image/')) {
        imagemBase64 = await converterParaBase64(arquivo);
      }

      // Estrutura do objeto completo do Material
      const novoMaterial = {
        id: Date.now(), // Gera um ID único
        nome: nome.trim(),
        codigoBarras: codigoBarras.trim(),
        categoria,
        unidade,
        estoqueAtual: Number(estoqueIdeal) || 0, // Inicia estoque atual com valor ideal
        estoqueMinimo: Number(estoqueMinimo) || 0,
        estoqueIdeal: Number(estoqueIdeal) || 0,
        descricao: descricao.trim(),
        fabricante: fabricante.trim(),
        validade: validade || null,
        imagem: imagemBase64,
        nomeArquivo: arquivo ? arquivo.name : null,
        criadoEm: new Date().toISOString()
      };

      // 1. PERSISTÊNCIA EM LOCALSTORAGE (Simulação de Banco)
      const materiaisExistentes = JSON.parse(localStorage.getItem(STORAGE_KEY_MATERIAIS) || '[]');
      const novosMateriais = [novoMaterial, ...materiaisExistentes];
      localStorage.setItem(STORAGE_KEY_MATERIAIS, JSON.stringify(novosMateriais));

      /* 
      // 2. EXEMPLO DE ENVIO PARA API BACKEND (REST)
      // Se tiver backend, comente o LocalStorage acima e use a chamada abaixo:
      
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('codigoBarras', codigoBarras);
      formData.append('categoria', categoria);
      formData.append('unidade', unidade);
      formData.append('estoqueMinimo', estoqueMinimo);
      formData.append('estoqueIdeal', estoqueIdeal);
      formData.append('descricao', descricao);
      formData.append('fabricante', fabricante);
      formData.append('validade', validade);
      if (arquivo) formData.append('arquivo', arquivo);

      await fetch('https://sua-api.com/materiais', {
        method: 'POST',
        body: formData,
      });
      */

      // Redireciona para a lista de estoque
      navigate('/app/professor/estoque');
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      alert('Erro ao salvar material. Tente novamente.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* TOPO FIXO */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button
          type="button"
          onClick={() => navigate('/app/professor/estoque')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar para estoque"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide mr-8">Novo material</h1>
        <div className="w-6" />
      </div>

      {/* CONTEÚDO ROLÁVEL - FORMULÁRIO */}
      <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pb-24">
        
        {/* SEÇÃO: Informações básicas */}
        <div className="space-y-4">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Informações básicas</h2>

          <div className="space-y-1">
            <label htmlFor="nome-produto" className="text-gray-700 text-xs font-bold block">
              Nome do produto <span className="text-red-500">*</span>
            </label>
            <input
              id="nome-produto"
              type="text"
              placeholder="Digite o nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-xs transition"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="codigo-barras" className="text-gray-700 text-xs font-bold block">
              Código de barras <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="codigo-barras"
                type="text"
                placeholder="Digite ou escaneie o código"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-xs transition"
                required
              />
              <Barcode className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="categoria" className="text-gray-700 text-xs font-bold block">
              Categoria <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-xs transition appearance-none font-medium cursor-pointer"
                required
              >
                <option value="" disabled>Selecione</option>
                <option value="cirurgia">Cirurgia</option>
                <option value="dentistica">Dentística</option>
                <option value="periodontia">Periodontia</option>
                <option value="endodontia">Endodontia</option>
                <option value="ortodontia">Ortodontia</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* SEÇÃO: Unidade e estoque */}
        <div className="space-y-4">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Unidade e estoque</h2>

          <div className="space-y-1">
            <label htmlFor="unidade" className="text-gray-700 text-xs font-bold block">
              Unidade de medida <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="unidade"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-xs transition appearance-none font-medium cursor-pointer"
                required
              >
                <option value="" disabled>Selecione</option>
                <option value="un">Unidade (Un)</option>
                <option value="cx">Caixa (Cx)</option>
                <option value="pct">Pacote (Pct)</option>
                <option value="frasco">Frasco (Fr)</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="estoque-minimo" className="text-gray-700 text-xs font-bold block">
                Estoque mínimo <span className="text-red-500">*</span>
              </label>
              <input
                id="estoque-minimo"
                type="number"
                min="0"
                placeholder="Ex: 5"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-xs transition"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="estoque-ideal" className="text-gray-700 text-xs font-bold block">
                Estoque ideal <span className="text-red-500">*</span>
              </label>
              <input
                id="estoque-ideal"
                type="number"
                min="0"
                placeholder="Ex: 20"
                value={estoqueIdeal}
                onChange={(e) => setEstoqueIdeal(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-xs transition"
                required
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: Detalhes do produto */}
        <div className="space-y-4">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Detalhes do produto</h2>

          <div className="space-y-1">
            <label htmlFor="descricao" className="text-gray-700 text-xs font-bold block">Descrição</label>
            <textarea
              id="descricao"
              placeholder="Descreva as especificações do produto"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-xs transition resize-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="fabricante" className="text-gray-700 text-xs font-bold block">Fabricante/marca</label>
            <input
              id="fabricante"
              type="text"
              placeholder="Digite o nome do fabricante"
              value={fabricante}
              onChange={(e) => setFabricante(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-xs transition"
            />
          </div>

          <div className="space-y-1 w-full sm:w-1/2">
            <label htmlFor="validade" className="text-gray-700 text-xs font-bold block">Data de validade</label>
            <div className="relative">
              <input
                id="validade"
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-xs transition"
              />
              <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* INPUT DE ARQUIVO ESCONDIDO */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf, image/jpeg, image/png"
          className="hidden"
        />

        {/* ÁREA DE ADICIONAR IMAGEM */}
        <div
          onClick={handleAreaImagemClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleAreaImagemClick();
            }
          }}
          className={`w-full border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center select-none transition cursor-pointer relative overflow-hidden ${
            arquivo ? 'border-green-500 bg-green-50/10' : 'border-gray-300 bg-gray-50/30 hover:bg-gray-50'
          }`}
        >
          {arquivo ? (
            <div className="w-full flex flex-col items-center justify-center space-y-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pré-visualização do material"
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-xs"
                />
              ) : (
                <Image className="text-green-600" size={28} />
              )}
              <div className="text-xs font-bold text-gray-900 max-w-[250px] truncate">
                {arquivo.name}
              </div>
              <button
                type="button"
                onClick={handleRemoverArquivo}
                className="flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition mt-1 cursor-pointer"
              >
                <X size={12} /> Remover arquivo
              </button>
            </div>
          ) : (
            <>
              <Image className="text-gray-400 mb-2" size={24} />
              <span className="text-gray-950 font-bold text-xs block">Adicionar imagem ou documento</span>
              <span className="text-gray-400 text-[9px] font-semibold mt-0.5">
                Formatos aceitos: PDF, JPG, PNG • Tamanho máximo: 10MB
              </span>
            </>
          )}
        </div>

        {/* BOTÃO SALVAR PRODUTO */}
        <button
          type="submit"
          className="w-full py-4 bg-[#F9A814] hover:bg-[#e0940f] active:scale-[0.98] rounded-xl font-bold text-white text-xs transition-all shadow-md mt-4 cursor-pointer"
        >
          Salvar produto
        </button>

      </form>
    </div>
  );
}