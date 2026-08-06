import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  Calendar, 
  Image, 
  Barcode, 
  X, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import api from '../../Services/api';

export default function CadastrarMaterial() {
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

  // Estados de Imagem / Arquivo
  const [arquivo, setArquivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Estados de Controle / API
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Gatilho para clicar no input escondido
  const handleAreaImagemClick = () => {
    fileInputRef.current?.click();
  };

  // Processa o arquivo selecionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErro('O arquivo deve ter no máximo 10MB.');
        return;
      }
      setErro('');
      setArquivo(file);

      // Se for uma imagem, gera a URL de visualização prévia
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
    setArquivo(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Envio do formulário para o backend
  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      // Monta o objeto FormData para permitir envio multipart (caso haja imagem)
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

      if (arquivo) {
        formData.append('imagem', arquivo);
      }

      // Envia os dados para a API
      await api.post('/materiais', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redireciona após salvar com sucesso
      navigate('/app/aluno/estoque');
    } catch (err) {
      console.error('Erro ao cadastrar material:', err);
      setErro(err.response?.data?.message || 'Falha ao cadastrar o material. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      
      {/* TOPO FIXO - Novo material */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate('/app/aluno/estoque')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide mr-8">Novo material</h1>
        <div className="w-6"></div>
      </div>

      {/* CONTEÚDO ROLÁVEL - FORMULÁRIO */}
      <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pb-24">
        
        {/* EXIBIÇÃO DE ERRO SE HOUVER */}
        {erro && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* SEÇÃO: Informações básicas */}
        <div className="space-y-4">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Informações básicas</h2>
          
          {/* Nome do produto */}
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">
              Nome do produto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Digite o nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
              required
            />
          </div>

          {/* Código de barras */}
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">
              Código de barras <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Digite ou escaneie o código"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
                required
              />
              <Barcode className="absolute right-4 top-3 text-gray-400" size={18} />
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">
              Categoria <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-sm transition appearance-none font-medium"
                required
              >
                <option value="">Selecione</option>
                <option value="cirurgia">Cirurgia</option>
                <option value="dentistica">Dentística</option>
                <option value="periodontia">Periodontia</option>
                <option value="endodontia">Endodontia</option>
                <option value="ortodontia">Ortodontia</option>
                <option value="protese">Prótese</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* SEÇÃO: Unidade e estoque */}
        <div className="space-y-4">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Unidade e estoque</h2>
          
          {/* Unidade de medida */}
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">
              Unidade de medida <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-sm transition appearance-none font-medium"
                required
              >
                <option value="">Selecione</option>
                <option value="un">Unidade (Un)</option>
                <option value="cx">Caixa (Cx)</option>
                <option value="pct">Pacote (Pct)</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Estoque Mínimo e Ideal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-700 text-xs font-bold block">
                Estoque mínimo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Digite a quantidade"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-700 text-xs font-bold block">
                Estoque ideal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Digite a quantidade"
                value={estoqueIdeal}
                onChange={(e) => setEstoqueIdeal(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
                required
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: Detalhes do produto */}
        <div className="space-y-4">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide">Detalhes do produto</h2>
          
          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Descrição</label>
            <textarea
              placeholder="Descreva o produto"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition resize-none"
            />
          </div>

          {/* Fabricante/marca */}
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Fabricante/marca</label>
            <input
              type="text"
              placeholder="Digite o nome do fabricante"
              value={fabricante}
              onChange={(e) => setFabricante(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
            />
          </div>

          {/* Data de validade */}
          <div className="space-y-1 w-1/2 pr-1.5">
            <label className="text-gray-700 text-xs font-bold block">Data de validade</label>
            <div className="relative">
              <input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
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

        {/* ÁREA DE ADICIONAR IMAGEM (Borda tracejada dinâmica) */}
        <div 
          onClick={handleAreaImagemClick}
          className={`w-full border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center select-none transition cursor-pointer relative overflow-hidden ${
            arquivo ? 'border-green-500 bg-green-50/10' : 'border-gray-300 bg-gray-50/30 hover:bg-gray-50'
          }`}
        >
          {arquivo ? (
            <div className="w-full flex flex-col items-center justify-center space-y-2">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
              ) : (
                <Image className="text-green-600" size={24} />
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
              <span className="text-gray-950 font-bold text-xs block">Adicionar imagem</span>
              <span className="text-gray-400 text-[9px] font-semibold mt-0.5">
                Formatos aceitos: PDF, JPG, PNG • Tamanho máximo: 10MB
              </span>
            </>
          )}
        </div>

        {/* BOTÃO SALVAR PRODUTO */}
        <button
          type="submit"
          disabled={salvando}
          className="w-full py-4 bg-[#F9A814] hover:bg-[#e0940f] active:scale-[0.98] rounded-xl font-bold text-white text-xs transition-all shadow-md mt-4 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {salvando ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Salvando material...</span>
            </>
          ) : (
            <span>Salvar produto</span>
          )}
        </button>

      </form>
    </div>
  );
}