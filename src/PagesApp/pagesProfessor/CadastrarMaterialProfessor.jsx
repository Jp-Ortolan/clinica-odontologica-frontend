import { useState, useRef, useEffect } from 'react';
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

export default function CadastrarMaterialProfessor() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [unidade, setUnidade] = useState('');
  // Quantidade que entra no estoque junto com o cadastro. Antes não
  // existia campo pra isso e o backend assumia 0 — todo material nascia
  // zerado, sem jeito de informar o que estava chegando.
  const [quantidade, setQuantidade] = useState('');
  const [lote, setLote] = useState('');
  // Criação rápida de categoria: sem isto, se a lista estivesse vazia não
  // havia como cadastrar material nenhum (categoria_id é obrigatório) e o
  // endpoint POST /categorias não tinha tela em lugar nenhum do app.
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [registroAnvisa, setRegistroAnvisa] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [estoqueIdeal, setEstoqueIdeal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [validade, setValidade] = useState('');

  // O backend exige um categoria_id real (FK) — carrega as categorias
  // já cadastradas para popular o seletor.
  useEffect(() => {
    api.get('/categorias')
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error('Erro ao carregar categorias:', err));
  }, []);

  // Estados de Imagem / Arquivo — o backend guarda a foto como data URL
  // base64 direto na coluna imagem_base64 (sem storage externo), então só
  // aceita imagem (não PDF) e tem um limite de ~6MB de texto codificado.
  const [arquivo, setArquivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imagemBase64, setImagemBase64] = useState('');

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
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErro('Só é possível anexar imagens (JPG, PNG etc).');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 4MB.');
      return;
    }
    setErro('');
    setArquivo(file);

    const leitor = new FileReader();
    leitor.onload = () => {
      setPreviewUrl(leitor.result);
      setImagemBase64(leitor.result);
    };
    leitor.readAsDataURL(file);
  };

  // Remove o arquivo selecionado
  const handleRemoverArquivo = (e) => {
    e.stopPropagation();
    setArquivo(null);
    setPreviewUrl('');
    setImagemBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Envio do formulário para o backend
  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      const payload = {
        nome,
        codigo_barras: codigoBarras,
        categoria_id: Number(categoria),
        unidade_medida: unidade,
        quantidade: quantidade === '' ? 0 : Number(quantidade),
        estoque_minimo: Number(estoqueMinimo),
        estoque_ideal: estoqueIdeal ? Number(estoqueIdeal) : null,
        // A descrição já era digitada na tela, mas nunca ia junto no envio.
        descricao: descricao || undefined,
        lote: lote || undefined,
        registro_anvisa: registroAnvisa || undefined,
        // Se já entra material no cadastro, a data de entrada é hoje.
        data_entrada: quantidade && Number(quantidade) > 0
          ? new Date().toISOString().slice(0, 10)
          : undefined,
        fabricante: fabricante || undefined,
        validade: validade || undefined,
        imagem_base64: imagemBase64 || undefined,
      };

      await api.post('/materiais', payload);

      // Redireciona após salvar com sucesso
      navigate('/app/professor/estoque');
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
          onClick={() => navigate('/app/professor/estoque')}
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
            <div className="flex items-center justify-between">
              <label className="text-gray-700 text-xs font-bold block">
                Categoria <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setCriandoCategoria((v) => !v)}
                className="text-[#3B44A8] text-[10px] font-bold hover:underline"
              >
                {criandoCategoria ? 'Cancelar' : '+ Nova categoria'}
              </button>
            </div>

            {criandoCategoria && (
              <div className="flex gap-2 pb-1">
                <input
                  type="text"
                  placeholder="Nome da nova categoria"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8]"
                />
                <button
                  type="button"
                  disabled={salvandoCategoria || !novaCategoria.trim()}
                  onClick={async () => {
                    setSalvandoCategoria(true);
                    try {
                      const { data } = await api.post('/categorias', { nome: novaCategoria.trim() });
                      setCategorias((atuais) => [...atuais, data]);
                      setCategoria(String(data.id));
                      setNovaCategoria('');
                      setCriandoCategoria(false);
                    } catch (err) {
                      setErro(err.response?.data?.message || 'Não foi possível criar a categoria.');
                    } finally {
                      setSalvandoCategoria(false);
                    }
                  }}
                  className="px-4 bg-[#3B44A8] text-white rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  {salvandoCategoria ? '...' : 'Criar'}
                </button>
              </div>
            )}
            <div className="relative">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-sm transition appearance-none font-medium"
                required
              >
                <option value="">Selecione</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
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

          {/* Quantidade inicial em estoque */}
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">
              Quantidade inicial em estoque
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ex.: 50 (deixe 0 se ainda não recebeu)"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
            />
            <p className="text-gray-400 text-[10px] font-medium pt-0.5">
              Quantas unidades já estão disponíveis hoje. Depois use as
              movimentações de entrada e saída para alterar esse número.
            </p>
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

          {/* Lote e registro ANVISA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-700 text-xs font-bold block">Lote</label>
              <input
                type="text"
                placeholder="Nº do lote"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-700 text-xs font-bold block">Registro ANVISA</label>
              <input
                type="text"
                placeholder="Nº do registro"
                value={registroAnvisa}
                onChange={(e) => setRegistroAnvisa(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] shadow-sm transition"
              />
            </div>
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
          accept="image/*"
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
                Formatos aceitos: JPG, PNG • Tamanho máximo: 4MB
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
