import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Printer, Home } from 'lucide-react';

export default function ConcluirImpressaoEtiqueta() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data e hora atual formatada como fallback
  const dataHoraAtual = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' -');

  // Recupera os dados vindos do formulário anterior com fallback seguro
  const dados = {
    nome: location.state?.nome || 'Material não informado',
    lote: location.state?.lote || 'N/A',
    validade: location.state?.validade || 'N/A',
    quantidadeImpressa: location.state?.quantidadeImpressa || 1,
    dataHora: location.state?.dataHora || dataHoraAtual,
    usuario: location.state?.usuario || 'Usuário Atual'
  };

  const handleVoltarEstoque = () => {
    navigate('/app/aluno/estoque/materiais');
  };

  const handleReimprimir = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FD] font-sans pb-10">
      
      {/* HEADER AZUL */}
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center shadow-md rounded-b-[24px] shrink-0 select-none print:hidden">
        <button 
          onClick={handleVoltarEstoque}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95 mr-4 cursor-pointer"
          aria-label="Voltar para o estoque"
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
        <div className="bg-[#DCE0F5] border border-[#C6CDEE] rounded-2xl p-4 flex items-center gap-4 shadow-sm print:hidden">
          <CheckCircle2 className="text-[#3B44A8] shrink-0" size={28} strokeWidth={2} />
          <div className="flex flex-col">
            <span className="text-[#3B44A8] font-black text-sm">Impressão concluída!</span>
            <span className="text-[#555EBF] text-xs font-semibold">
              {dados.quantidadeImpressa} etiqueta(s) processada(s) com sucesso.
            </span>
          </div>
        </div>

        {/* DETALHES DO RESUMO DA IMPRESSÃO */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-5">
          <h2 className="text-[#3B44A8] font-black text-base tracking-wide">Resumo da impressão</h2>
          
          {/* Grid de 3 colunas */}
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-500">
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Material</span>
              <p className="truncate text-gray-700 font-medium" title={dados.nome}>{dados.nome}</p>
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

          {/* Grid de 2 colunas */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Quantidade impressa</span>
              <p className="text-gray-700 font-medium">{dados.quantidadeImpressa} etiqueta(s)</p>
            </div>
            <div>
              <span className="block text-gray-950 font-black mb-0.5">Data e hora</span>
              <p className="text-gray-700 font-medium">{dados.dataHora}</p>
            </div>
          </div>

          {/* Usuário */}
          <div className="text-xs font-semibold text-gray-500 pt-1">
            <span className="block text-gray-950 font-black mb-0.5">Usuário</span>
            <p className="text-gray-700 font-medium">{dados.usuario}</p>
          </div>
        </div>

        {/* AÇÕES DE NAVEGAÇÃO E IMPRESSÃO */}
        <div className="pt-2 space-y-3 print:hidden">
          <button
            onClick={handleReimprimir}
            className="w-full py-3.5 bg-[#3B44A8] hover:bg-[#2f378a] active:scale-[0.98] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Printer size={16} />
            <span>Reimprimir comprovante</span>
          </button>

          <button
            onClick={handleVoltarEstoque}
            className="w-full py-3.5 bg-white border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Home size={16} />
            <span>Voltar ao Estoque</span>
          </button>
        </div>

      </div>
    </div>
  );
}