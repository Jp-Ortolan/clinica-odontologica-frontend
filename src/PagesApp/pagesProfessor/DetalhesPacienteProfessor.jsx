import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import api from '../../Services/api';
import AlergiasMedicamentos from '../../components/AlergiasMedicamentos';

// Constante de tema para facilidade de manutenção
const BRAND_COLOR = 'bg-[#3B42B2]';
const BRAND_TEXT = 'text-[#3B42B2]';
const BRAND_BORDER = 'border-[#3B42B2]';

export default function DetalhesPacienteProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de Controle
  const [modoEvolucao, setModoEvolucao] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('resumo'); // 'resumo' | 'historico' | 'documentos'
  const [filtroHistorico, setFiltroHistorico] = useState('todos');
  const [filtroDoc, setFiltroDoc] = useState('todos');
  const [buscaDoc, setBuscaDoc] = useState('');
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [novaEvolucao, setNovaEvolucao] = useState('');
  const [enviandoEvolucao, setEnviandoEvolucao] = useState(false);

  // Upload de documento (FAB "Enviar"). O backend espera o arquivo em
  // base64 no corpo do POST — ver pacienteService.criarDocumento.
  const inputArquivoRef = useRef(null);
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);

  // Edição do cadastro do paciente (botão do lápis no topo). O professor
  // não tem uma tela de cadastro própria como a recepção, então a edição
  // acontece num modal aqui mesmo, via PUT /pacientes/:id.
  const [editando, setEditando] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [formEdicao, setFormEdicao] = useState({
    nome: '', telefone: '', email: '', endereco: '',
  });

  const pacienteId = location.state?.paciente?.id;
  const [pacienteDb, setPacienteDb] = useState(null);
  const [evolucoes, setEvolucoes] = useState([]);
  const [documentosDb, setDocumentosDb] = useState([]);

  const carregarDados = () => {
    if (!pacienteId) return;
    api.get(`/pacientes/${pacienteId}`).then((res) => setPacienteDb(res.data)).catch((err) => console.error(err));
    api.get(`/pacientes/${pacienteId}/evolucoes`).then((res) => setEvolucoes(res.data)).catch((err) => console.error(err));
    api.get(`/pacientes/${pacienteId}/documentos`).then((res) => setDocumentosDb(res.data)).catch((err) => console.error(err));
  };

  useEffect(carregarDados, [pacienteId]);

  const paciente = {
    nomeHeader: pacienteDb?.nome || 'Carregando...',
    cpfHeader: pacienteDb?.cpf || '',
    status: pacienteDb?.ativo === false ? 'Inativo' : 'Ativo',
    nomeCompleto: pacienteDb?.nome || '',
    telefone: pacienteDb?.telefone || 'Não informado',
    email: pacienteDb?.email || 'Não informado',
    dataNascimento: pacienteDb?.data_nascimento ? new Date(pacienteDb.data_nascimento).toLocaleDateString('pt-BR') : 'Não informada',
    endereco: pacienteDb?.endereco || 'Não informado',
    historico: evolucoes,
    evolucao: {
      ultimoAtendimento: evolucoes[0]?.criado_em ? new Date(evolucoes[0].criado_em).toLocaleDateString('pt-BR') : '-',
      totalAtendimentos: evolucoes.length,
      linhaDoTempo: evolucoes,
    },
    documentos: documentosDb,
  };

  const handleAdicionarEvolucao = async () => {
    if (!novaEvolucao.trim()) return;
    setEnviandoEvolucao(true);
    try {
      await api.post(`/pacientes/${pacienteId}/evolucoes`, { descricao: novaEvolucao.trim() });
      setNovaEvolucao('');
      carregarDados();
    } catch (err) {
      console.error('Erro ao adicionar evolução:', err);
      alert('Não foi possível salvar a evolução.');
    } finally {
      setEnviandoEvolucao(false);
    }
  };

  const abrirEdicao = () => {
    setFormEdicao({
      nome: pacienteDb?.nome || '',
      telefone: pacienteDb?.telefone || '',
      email: pacienteDb?.email || '',
      endereco: pacienteDb?.endereco || '',
    });
    setEditando(true);
  };

  const salvarEdicao = async () => {
    if (!formEdicao.nome.trim()) {
      alert('O nome do paciente é obrigatório.');
      return;
    }
    setSalvandoEdicao(true);
    try {
      // Manda o cadastro inteiro: o backend faz UPDATE de todos os campos,
      // então enviar só os alterados apagaria o resto.
      await api.put(`/pacientes/${pacienteId}`, {
        ...pacienteDb,
        nome: formEdicao.nome.trim(),
        telefone: formEdicao.telefone.trim(),
        email: formEdicao.email.trim(),
        endereco: formEdicao.endereco.trim(),
      });
      setEditando(false);
      carregarDados();
    } catch (err) {
      console.error('Erro ao salvar edição do paciente:', err);
      alert(err.response?.data?.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // Lê o arquivo escolhido e manda pro backend em base64.
  const handleEnviarDocumento = async (evento) => {
    const arquivo = evento.target.files?.[0];
    // Limpa o input pra permitir reenviar o mesmo arquivo depois.
    evento.target.value = '';
    if (!arquivo || !pacienteId) return;

    const LIMITE_MB = 10;
    if (arquivo.size > LIMITE_MB * 1024 * 1024) {
      alert(`O arquivo excede o limite de ${LIMITE_MB}MB.`);
      return;
    }

    setEnviandoDocumento(true);
    try {
      const conteudo_base64 = await new Promise((resolve, reject) => {
        const leitor = new FileReader();
        // O resultado vem como "data:<tipo>;base64,<conteudo>" — o backend
        // quer só a parte depois da vírgula.
        leitor.onload = () => resolve(String(leitor.result).split(',')[1]);
        leitor.onerror = () => reject(new Error('Falha ao ler o arquivo'));
        leitor.readAsDataURL(arquivo);
      });

      await api.post(`/pacientes/${pacienteId}/documentos`, {
        nome_arquivo: arquivo.name,
        tipo_arquivo: arquivo.type || 'application/octet-stream',
        conteudo_base64,
      });
      carregarDados();
    } catch (err) {
      console.error('Erro ao enviar documento:', err);
      alert(err.response?.data?.message || 'Não foi possível enviar o documento.');
    } finally {
      setEnviandoDocumento(false);
    }
  };

  // Filtros (o backend só tem "evolução" — não há categorização por
  // consultas/cirurgias/exames nesse endpoint, então o filtro só reduz
  // a "todos" de forma honesta)
  const historicoFiltrado = filtroHistorico === 'todos' ? paciente.historico : [];

  const documentosFiltrados = paciente.documentos.filter((doc) => {
    const buscaLower = buscaDoc.toLowerCase();
    return (doc.nome_arquivo || '').toLowerCase().includes(buscaLower);
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
            type="button"
            onClick={abrirEdicao}
            disabled={!pacienteDb}
            className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-default"
            aria-label="Editar cadastro do paciente"
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
                        <p>{paciente.endereco || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="p-4 space-y-2">
                    <h3 className={`${BRAND_TEXT} font-extrabold text-sm`}>Últimos atendimentos</h3>

                    {evolucoes.length === 0 ? (
                      <p className="text-[11px] text-slate-400 font-medium py-2">Nenhum atendimento registrado ainda.</p>
                    ) : (
                      <div className="flex items-center justify-between pt-1 cursor-pointer">
                        <div className="space-y-0.5">
                          <span className={`${BRAND_TEXT} font-black text-xs block`}>
                            {new Date(evolucoes[0].criado_em).toLocaleDateString('pt-BR')}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {evolucoes[0].descricao}
                          </h4>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${BRAND_TEXT} shrink-0`} />
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setAbaAtiva('historico')}
                    className={`w-full py-3 border-t border-slate-100 ${BRAND_TEXT} font-extrabold text-xs text-center hover:bg-slate-50 transition cursor-pointer`}
                  >
                    Ver histórico completo
                  </button>
                </div>

                {/* Alergias e medicamentos — o backend já tinha os endpoints,
                    mas nenhuma tela permitia registrar. */}
                <AlergiasMedicamentos pacienteId={pacienteId} />
              </div>
            )}

            {/* ABA: HISTÓRICO */}
            {abaAtiva === 'historico' && (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex-1">
                  {historicoFiltrado.length > 0 ? (
                    <div className="border border-slate-200 rounded-2xl bg-white shadow-xs divide-y divide-slate-100 overflow-hidden">
                      {historicoFiltrado.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
                        >
                          <div className="space-y-0.5">
                            <span className={`${BRAND_TEXT} font-black text-xs block`}>
                              {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs">
                              {item.descricao}
                            </h4>
                          </div>
                          <ChevronRight className={`w-5 h-5 ${BRAND_TEXT} shrink-0`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <p className="font-bold text-xs">Nenhum atendimento registrado</p>
                    </div>
                  )}
                </div>

                {/* Adicionar nova evolução (POST real em /pacientes/:id/evolucoes) */}
                <div className="space-y-2 pt-2 shrink-0">
                  <textarea
                    value={novaEvolucao}
                    onChange={(e) => setNovaEvolucao(e.target.value)}
                    placeholder="Descreva o atendimento realizado..."
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#3B42B2] resize-none"
                  />
                  <button
                    onClick={handleAdicionarEvolucao}
                    disabled={!novaEvolucao.trim() || enviandoEvolucao}
                    className="w-full py-3 px-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95"
                  >
                    {enviandoEvolucao ? 'Salvando...' : '+ Adicionar atendimento'}
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
                            {(doc.tipo_arquivo || '').startsWith('image/') ? (
                              <ImageIcon className={`w-5 h-5 ${BRAND_TEXT}`} />
                            ) : (
                              <FileText className={`w-5 h-5 ${BRAND_TEXT}`} />
                            )}
                            <span className={`text-[9px] font-black ${BRAND_TEXT} mt-0.5 leading-none`}>
                              {(doc.tipo_arquivo || 'PDF').split('/')[1]?.toUpperCase() || 'PDF'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">
                              {doc.nome_arquivo}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {doc.criado_em ? new Date(doc.criado_em).toLocaleDateString('pt-BR') : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {doc.tamanho_bytes ? `${Math.round(doc.tamanho_bytes / 1024)} KB` : ''}
                            </span>
                          </div>

                          <div className="relative z-20">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const resposta = await api.get(`/pacientes/${pacienteId}/documentos/${doc.id}/download`, { responseType: 'blob' });
                                  const url = window.URL.createObjectURL(new Blob([resposta.data]));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = doc.nome_arquivo || 'documento';
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  window.URL.revokeObjectURL(url);
                                } catch (err) {
                                  console.error('Erro ao baixar documento:', err);
                                }
                              }}
                              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
                              aria-label="Baixar documento"
                            >
                              <MoreVertical className="w-5 h-5 text-slate-600" />
                            </button>

                            {false && (
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
                <div className="absolute bottom-6 right-6 z-20">
                  <input
                    ref={inputArquivoRef}
                    type="file"
                    className="hidden"
                    onChange={handleEnviarDocumento}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  />
                  <button
                    type="button"
                    onClick={() => inputArquivoRef.current?.click()}
                    disabled={enviandoDocumento}
                    className="w-14 h-14 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-wait text-white rounded-full shadow-lg flex flex-col items-center justify-center transition transform active:scale-95 cursor-pointer"
                    aria-label="Enviar documento"
                  >
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                    <span className="text-[9px] font-bold mt-0.5">
                      {enviandoDocumento ? '...' : 'Enviar'}
                    </span>
                  </button>
                </div>

              </div>
            )}
          </>
        )}

      </main>

      {/* MODAL DE EDIÇÃO DO CADASTRO DO PACIENTE */}
      {editando && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
          onClick={() => !salvandoEdicao && setEditando(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className={`${BRAND_TEXT} font-black text-sm`}>Editar cadastro</h3>
              <button
                type="button"
                onClick={() => setEditando(false)}
                disabled={salvandoEdicao}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold disabled:opacity-40"
              >
                Cancelar
              </button>
            </div>

            {[
              { campo: 'nome', rotulo: 'Nome completo', tipo: 'text', obrigatorio: true },
              { campo: 'telefone', rotulo: 'Telefone', tipo: 'tel' },
              { campo: 'email', rotulo: 'E-mail', tipo: 'email' },
              { campo: 'endereco', rotulo: 'Endereço', tipo: 'text' },
            ].map(({ campo, rotulo, tipo, obrigatorio }) => (
              <div key={campo} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  {rotulo} {obrigatorio && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type={tipo}
                  value={formEdicao[campo]}
                  onChange={(e) => setFormEdicao((atual) => ({ ...atual, [campo]: e.target.value }))}
                  className={`w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:${BRAND_BORDER}`}
                />
              </div>
            ))}

            <p className="text-[10px] text-slate-400 leading-relaxed">
              CPF e data de nascimento não são editáveis por aqui — são os campos
              usados para identificar o paciente.
            </p>

            <button
              type="button"
              onClick={salvarEdicao}
              disabled={salvandoEdicao}
              className={`w-full py-3 ${BRAND_COLOR} text-white rounded-xl font-bold text-xs transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait`}
            >
              {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}