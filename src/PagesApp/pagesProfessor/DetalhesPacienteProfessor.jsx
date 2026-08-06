import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  SquarePen,
  ChevronRight,
  User,
  Search,
  MoreVertical,
  Upload,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

// Constante de tema para facilidade de manutenção
const BRAND_COLOR = 'bg-[#3B42B2]';
const BRAND_TEXT = 'text-[#3B42B2]';
const BRAND_BORDER = 'border-[#3B42B2]';

export default function DetalhesPacienteProfessor() {
  const navigate = useNavigate();
  
  // Estados de Controle
  const [modoEvolucao, setModoEvolucao] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('resumo'); // 'resumo' | 'historico' | 'documentos'
  const [filtroHistorico, setFiltroHistorico] = useState('todos');
  const [filtroDoc, setFiltroDoc] = useState('todos');
  const [buscaDoc, setBuscaDoc] = useState('');
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  // Dados Mockados
  const [paciente] = useState({
    nomeHeader: 'Rhaya Borges',
    cpfHeader: '012.123.456-89',
    status: 'Ativo',
    nomeCompleto: 'Rhaya Borges',
    telefone: '(42) 99999-9999',
    email: 'engs-rhayannatonete@camporeal.edu.br',
    dataNascimento: '14/02/2005',
    endereco: {
      rua: 'Rua Diogo Emanoel de Almeida, 200',
      bairro: 'Centro',
      cidadeEstado: 'Guamiranga - PR'
    },
    responsavel: {
      nome: 'Nome do responsável',
      telefone: '(42) 88888-8888'
    },
    ultimoAtendimento: {
      data: '18/05/2026',
      procedimento: 'Instalação de Aparelho Fixo',
      especialidade: 'Ortodontia',
      professor: 'Prof. Dr. Michel Barros',
      aluno: 'Isabela Lima'
    },
    historico: [
      {
        id: 1,
        data: '18/05/2026',
        procedimento: 'Instalação de Aparelho Fixo',
        especialidade: 'Ortodontia',
        professor: 'Prof. Dr. Michel Barros',
        aluno: 'Isabela Lima',
        categoria: 'consultas'
      },
      {
        id: 2,
        data: '01/07/2024',
        procedimento: 'Tratamento de Canal',
        especialidade: 'Endodontia',
        professor: 'Profª. Dra. Cláudia Silva',
        aluno: 'Iara Magalhães',
        categoria: 'consultas'
      },
      {
        id: 3,
        data: '25/06/2024',
        procedimento: 'Extração de Siso',
        especialidade: 'Cirurgia Bucal',
        professor: 'Profª. Dra. Cláudia Silva',
        aluno: 'Pedro Pereira',
        categoria: 'cirurgias'
      }
    ],
    evolucao: {
      ultimoAtendimento: '18/05/2026',
      totalAtendimentos: 3,
      linhaDoTempo: [
        {
          id: 1,
          dataTipo: '18/05/2026 - Cirurgia',
          professor: 'Prof: Dra. Luzia Maria',
          aluno: 'Aluno: Douglas Henrique',
          rotulo: 'Procedimento:',
          descricao: 'Restauração do dente inferior direito.'
        },
        {
          id: 2,
          dataTipo: '15/05/2026 - Procedimento',
          professor: 'Prof: Dr. Mário Luiz',
          aluno: 'Aluno: Ana Maria',
          rotulo: 'Procedimento:',
          descricao: 'Radiografia do elemento 26.'
        },
        {
          id: 3,
          dataTipo: '12/05/2026 - Avaliação',
          professor: 'Prof: Dr. Sérgio Amaral',
          aluno: 'Aluno: Olívia Santos',
          rotulo: 'Queixa principal:',
          descricao: 'Dor no dente inferior direito.'
        }
      ]
    },
    documentos: [
      {
        id: 1,
        titulo: 'Radiografia Periapical',
        subtitulo: 'Elemento 46',
        data: '18/05/2025',
        formato: 'JPG',
        tamanho: '1.2 MB',
        categoria: 'radiografias'
      },
      {
        id: 2,
        titulo: 'Exame Clínico',
        subtitulo: 'Exame Clínico Inicial',
        data: '01/07/2024',
        formato: 'PDF',
        tamanho: '180 KB',
        categoria: 'exames'
      }
    ]
  });

  // Filtros
  const historicoFiltrado = paciente.historico.filter((item) => {
    if (filtroHistorico === 'todos') return true;
    return item.categoria === filtroHistorico;
  });

  const documentosFiltrados = paciente.documentos.filter((doc) => {
    const atendeCategoria = filtroDoc === 'todos' || doc.categoria === filtroDoc;
    const buscaLower = buscaDoc.toLowerCase();
    const atendeBusca = doc.titulo.toLowerCase().includes(buscaLower) || 
                        doc.subtitulo.toLowerCase().includes(buscaLower);
    return atendeCategoria && atendeBusca;
  });

  const getHeaderTitle = () => {
    if (modoEvolucao) return 'Evolução do paciente';
    if (abaAtiva === 'historico') return 'Histórico do paciente';
    if (abaAtiva === 'documentos') return 'Documentos do paciente';
    return 'Detalhe do paciente';
  };

  const handleVoltar = () => {
    if (modoEvolucao) {
      setModoEvolucao(false);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`w-full h-screen ${BRAND_COLOR} text-white flex flex-col font-sans overflow-hidden relative select-none`}>
      
      {/* Backdrop transparente para fechar menus suspensos ao clicar fora */}
      {menuAbertoId && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setMenuAbertoId(null)} 
        />
      )}

      {/* HEADER TOP BAR */}
      <header className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={handleVoltar}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          {getHeaderTitle()}
        </h1>

        {!modoEvolucao ? (
          <button 
            className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
            aria-label="Editar"
          >
            <SquarePen className="w-5 h-5 text-white" />
          </button>
        ) : (
          <div className="w-9" aria-hidden="true" />
        )}
      </header>

      {/* PAINEL CONTEÚDO BRANCO */}
      <main className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-5 pb-24 flex-1 overflow-y-auto flex flex-col space-y-4 shadow-inner relative">
        
        {/* MODAL / TELA DE EVOLUÇÃO */}
        {modoEvolucao ? (
          <div className="flex-1 flex flex-col space-y-5">
            {/* Cabeçalho Paciente */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 bg-slate-50">
                <User className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base leading-tight">
                  {paciente.nomeHeader}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {paciente.cpfHeader}
                </p>
              </div>
            </div>

            {/* Indicadores KPIS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 rounded-2xl p-3.5 text-center bg-white shadow-xs">
                <span className="text-[11px] font-bold text-slate-800 block">
                  Último atendimento
                </span>
                <span className={`${BRAND_TEXT} font-extrabold text-sm block mt-1`}>
                  {paciente.evolucao.ultimoAtendimento}
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl p-3.5 text-center bg-white shadow-xs">
                <span className="text-[11px] font-bold text-slate-800 block">
                  Atendimentos realizados
                </span>
                <span className={`${BRAND_TEXT} font-extrabold text-base block mt-1`}>
                  {paciente.evolucao.totalAtendimentos}
                </span>
              </div>
            </div>

            {/* Linha do Tempo */}
            <div className="pt-2">
              <h3 className={`${BRAND_TEXT} font-extrabold text-sm mb-4`}>
                Linha do tempo da evolução
              </h3>

              <div className="relative pl-6 space-y-4">
                <div className={`absolute left-[7px] top-3 bottom-6 w-[2px] ${BRAND_COLOR}`} />

                {paciente.evolucao.linhaDoTempo.map((item) => (
                  <div key={item.id} className="relative">
                    <div className={`absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-white border-2 ${BRAND_BORDER} z-10`} />

                    <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs space-y-1">
                      <h4 className={`${BRAND_TEXT} font-extrabold text-xs`}>
                        {item.dataTipo}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.professor} • {item.aluno}
                      </p>
                      <div className="pt-1.5 text-xs">
                        <span className={`${BRAND_TEXT} font-bold block text-[11px]`}>
                          {item.rotulo}
                        </span>
                        <p className="text-slate-500 font-medium text-[11px]">
                          {item.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* NAVEGAÇÃO POR ABAS PADRÃO */
          <>
            {/* Resumo do Paciente & Status */}
            <div className="flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 bg-slate-50">
                  <User className="w-7 h-7 text-slate-900" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                    {paciente.nomeHeader}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {paciente.cpfHeader}
                  </p>
                </div>
              </div>

              <span className={`px-3.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                paciente.status === 'Ativo'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {paciente.status}
              </span>
            </div>

            {/* Abas */}
            <nav className="flex items-center justify-around border-b border-slate-200 pb-2 shrink-0">
              {['resumo', 'historico', 'documentos'].map((aba) => (
                <button
                  key={aba}
                  onClick={() => setAbaAtiva(aba)}
                  className={`text-xs font-bold pb-2 relative transition cursor-pointer capitalize ${
                    abaAtiva === aba ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {aba === 'historico' ? 'Histórico' : aba}
                  {abaAtiva === aba && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-amber-500 rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* ABA: RESUMO */}
            {abaAtiva === 'resumo' && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white shadow-xs">
                  <h3 className={`${BRAND_TEXT} font-extrabold text-sm`}>Informações pessoais</h3>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="block font-bold text-slate-900">Nome completo</span>
                      <span className="text-slate-500 font-medium">{paciente.nomeCompleto}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900">Telefone</span>
                      <span className="text-slate-500 font-medium">{paciente.telefone}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900">E-mail</span>
                      <span className="text-slate-500 font-medium">{paciente.email}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900">Data de nascimento</span>
                      <span className="text-slate-500 font-medium">{paciente.dataNascimento}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900">Endereço</span>
                      <div className="text-slate-500 font-medium leading-tight">
                        <p>{paciente.endereco.rua}</p>
                        <p>{paciente.endereco.bairro}</p>
                        <p>{paciente.endereco.cidadeEstado}</p>
                      </div>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900">Responsável</span>
                      <div className="text-slate-500 font-medium leading-tight">
                        <p>{paciente.responsavel.nome}</p>
                        <p>{paciente.responsavel.telefone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="p-4 space-y-2">
                    <h3 className={`${BRAND_TEXT} font-extrabold text-sm`}>Últimos atendimentos</h3>

                    <div className="flex items-center justify-between pt-1 cursor-pointer">
                      <div className="space-y-0.5">
                        <span className={`${BRAND_TEXT} font-black text-xs block`}>
                          {paciente.ultimoAtendimento.data}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {paciente.ultimoAtendimento.procedimento}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {paciente.ultimoAtendimento.especialidade}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium pt-0.5">
                          {paciente.ultimoAtendimento.professor} • Aluna: {paciente.ultimoAtendimento.aluno}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${BRAND_TEXT} shrink-0`} />
                    </div>
                  </div>

                  <button 
                    onClick={() => setAbaAtiva('historico')}
                    className={`w-full py-3 border-t border-slate-100 ${BRAND_TEXT} font-extrabold text-xs text-center hover:bg-slate-50 transition cursor-pointer`}
                  >
                    Ver histórico completo
                  </button>
                </div>
              </div>
            )}

            {/* ABA: HISTÓRICO */}
            {abaAtiva === 'historico' && (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                  {['todos', 'consultas', 'cirurgias', 'exames'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFiltroHistorico(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                        filtroHistorico === cat
                          ? `${BRAND_COLOR} text-white`
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex-1">
                  {historicoFiltrado.length > 0 ? (
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
                      {historicoFiltrado.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <span className={`${BRAND_TEXT} font-black text-xs block`}>
                              {item.data}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs">
                              {item.procedimento}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {item.especialidade}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium pt-0.5">
                              {item.professor} • {item.aluno.includes('Alun') ? item.aluno : `Aluno: ${item.aluno}`}
                            </p>
                          </div>
                          <ChevronRight className={`w-5 h-5 ${BRAND_TEXT} shrink-0`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <p className="font-bold text-xs">Nenhum atendimento nesta categoria</p>
                    </div>
                  )}
                </div>

                {/* Ações inferiores */}
                <div className="grid grid-cols-2 gap-3 pt-2 shrink-0">
                  <button 
                    onClick={() => setModoEvolucao(true)}
                    className={`w-full py-3 px-2 border-2 ${BRAND_BORDER} ${BRAND_TEXT} font-extrabold text-xs rounded-2xl hover:bg-indigo-50 transition cursor-pointer flex items-center justify-center active:scale-95`}
                  >
                    Ver evolução
                  </button>

                  <button className="w-full py-3 px-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95">
                    + Adicionar atendimento
                  </button>
                </div>
              </div>
            )}

            {/* ABA: DOCUMENTOS */}
            {abaAtiva === 'documentos' && (
              <div className="flex-1 flex flex-col space-y-4 min-h-[350px]">
                
                {/* Search */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Documentos</h3>
                  <div className="relative flex-1 max-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar documento"
                      value={buscaDoc}
                      onChange={(e) => setBuscaDoc(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-full py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'exames', label: 'Exames' },
                    { id: 'radiografias', label: 'Radiografias' },
                    { id: 'formularios', label: 'Formulários' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFiltroDoc(f.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                        filtroDoc === f.id
                          ? `${BRAND_COLOR} text-white`
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Lista */}
                <div className="space-y-3 flex-1 pb-16">
                  {documentosFiltrados.length > 0 ? (
                    documentosFiltrados.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs flex items-center justify-between relative"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                            {doc.formato === 'JPG' ? (
                              <ImageIcon className={`w-5 h-5 ${BRAND_TEXT}`} />
                            ) : (
                              <FileText className={`w-5 h-5 ${BRAND_TEXT}`} />
                            )}
                            <span className={`text-[9px] font-black ${BRAND_TEXT} mt-0.5 leading-none`}>
                              {doc.formato}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">
                              {doc.titulo}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {doc.subtitulo}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {doc.data}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">
                              {doc.formato}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {doc.tamanho}
                            </span>
                          </div>

                          <div className="relative z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuAbertoId(menuAbertoId === doc.id ? null : doc.id);
                              }}
                              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
                              aria-label="Mais opções"
                            >
                              <MoreVertical className="w-5 h-5 text-slate-600" />
                            </button>

                            {menuAbertoId === doc.id && (
                              <div className="absolute right-0 top-7 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30">
                                <button
                                  onClick={() => setMenuAbertoId(null)}
                                  className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                  Baixar documento
                                </button>
                                <button
                                  onClick={() => setMenuAbertoId(null)}
                                  className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                  Ver documento
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <p className="font-bold text-xs">Nenhum documento encontrado</p>
                    </div>
                  )}
                </div>

                {/* FAB - Enviar Documento */}
                <div className="fixed bottom-6 right-6 z-10">
                  <button className="w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex flex-col items-center justify-center transition transform active:scale-95 cursor-pointer">
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                    <span className="text-[9px] font-bold mt-0.5">Enviar</span>
                  </button>
                </div>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}