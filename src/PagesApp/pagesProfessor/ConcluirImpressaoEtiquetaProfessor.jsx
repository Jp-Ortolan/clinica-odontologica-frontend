import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Printer, Home } from 'lucide-react';

const STORAGE_KEY_HISTORICO_IMPRESSOES = '@app_clinica:historico_impressoes_etiquetas';

export default function ConcluirImpressaoEtiquetaProfessor() {
  const navigate = useNavigate();
  const location = useLocation();
  const [salvo, setSalvo] = useState(false);

  // Recupera os dados vindos da navegação ou aplica valores padrão
  const dados = location.state || {
    id: Date.now(),
    nome: 'Kit Cirúrgico 01',
    lote: '2026-05-15',
    validade: '15/04/2030',
    quantidadeImpressa: 10,
    dataHora: new Date().toLocaleString('pt-BR'),
    usuario: 'Prof. Dr. Ricardo Silva'
  };

  // Registra a impressão no localStorage ao carregar a página
  useEffect(() => {
    try {
      const historicoExistente = JSON.parse(
        localStorage.getItem(STORAGE_KEY_HISTORICO_IMPRESSOES) || '[]'
      );

      // Evita duplicidades caso o ID já tenha sido gravado
      const jaExiste = historicoExistente.some((item) => item.id === dados.id && item.id);

      if (!jaExiste) {
        const novoRegistro = {
          id: dados.id || Date.now(),
          ...dados,
          registradoEm: new Date().toISOString()
        };

        const novoHistorico = [novoRegistro, ...historicoExistente];
        localStorage.setItem(STORAGE_KEY_HISTORICO_IMPRESSOES, JSON.stringify(novoHistorico));
      }

      setSalvo(true);
    } catch (error) {
      console.error('Erro ao salvar no histórico de impressões:', error);
    }
  }, [dados]);

  // Função para simular ou disparar uma nova impressão do mesmo lote
  const handleImprimirNovamente = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FD] font-sans pb-10">
      
      {/* HEADER AZUL */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center shadow-md rounded-b-[24px] shrink-0 select-none">
        <button 
          type="button"
          onClick={() => navigate('/app/professor/estoque/materiais')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 mr-4 cursor-pointer"
          aria-label="Voltar aos materiais"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide flex-1 text-center mr-8">
          Impressão de etiquetas
        </h1>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        
        {/* CARD ALERT DE SUCESSO */}
        <div className="bg-[#DCE0F5] border border-[#C6CDEE] rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <CheckCircle2 className="text-[#3B44A8] shrink-0" size={28} strokeWidth={2} />
          <div className="flex flex-col">
            <span className="text-[#3B44A8] font-black text-sm">
              Impressão concluída!
            </span>
            <span className="text-[#555EBF] text-xs font-semibold">
              {dados.quantidadeImpressa} etiqueta(s) impressa(s) e registradas no sistema.
            </span>
          </div>
        </div>

        {/* DETALHES DO RESUMO DA IMPRESSÃO */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[#3B44A8] font-black text-base tracking-wide">
              Resumo da impressão
            </h2>
            {salvo && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Registrado
              </span>
            )}
          </div>
          
          {/* Grid de 3 colunas para a primeira linha */}
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500">
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Material</span>
              <p className="truncate text-gray-700 font-medium">{dados.nome}</p>
            </div>
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Lote</span>
              <p className="truncate text-gray-700 font-medium">{dados.lote}</p>
            </div>
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Validade</span>
              <p className="truncate text-gray-700 font-medium">{dados.validade}</p>
            </div>
          </div>

          {/* Grid de 2 colunas para a segunda linha */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Quantidade impressa</span>
              <p className="text-gray-700 font-medium">{dados.quantidadeImpressa} etiquetas</p>
            </div>
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Data e hora</span>
              <p className="text-gray-700 font-medium">{dados.dataHora}</p>
            </div>
          </div>

          {/* Linha final para o usuário */}
          <div className="text-xs font-semibold text-gray-500 pt-1">
            <span className="block text-gray-950 font-black mb-0.5">Usuário</span>
            <p className="text-gray-700 font-medium">{dados.usuario}</p>
          </div>
        </div>

        {/* AÇÕES ADICIONAIS DE NAVEGAÇÃO / IMPRESSÃO */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={handleImprimirNovamente}
            className="w-full py-3.5 bg-white border border-[#3B44A8] text-[#3B44A8] hover:bg-indigo-50 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-98 shadow-xs cursor-pointer"
          >
            <Printer size={16} />
            Imprimir novamente
          </button>

          <button
            type="button"
            onClick={() => navigate('/app/professor/estoque/materiais')}
            className="w-full py-3.5 bg-[#F9A814] hover:bg-[#e0940f] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-98 shadow-md cursor-pointer"
          >
            <Home size={16} />
            Voltar para o estoque
          </button>
        </div>

      </div>
    </div>
  );
}