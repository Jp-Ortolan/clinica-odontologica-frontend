import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, User, Calendar, Phone, Mail, MapPin, 
  Search, MoreVertical, Eye, Download, FileText, Image as ImageIcon, Loader2, AlertCircle 
} from 'lucide-react';
import api from '../Services/api'; // Ajustado caminho e maiúscula para Services

export default function DetalhesPacienteRecepcao() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();

  // Tenta obter o paciente vindo do state da navegação
  const pacienteState = location.state?.paciente || null;
  const pacienteId = pacienteState?.id || pacienteState?._id || paramId;

  // Estados dos Dados da API
  const [paciente, setPaciente] = useState(pacienteState);
  const [itensHistorico, setItensHistorico] = useState([]);
  const [listaDocumentos, setListaDocumentos] = useState([]);

  // Estados de Controle de UI
  const [abaAtiva, setAbaAtiva] = useState('resumo'); 
  const [filtroHistorico, setFiltroHistorico] = useState('Todos');
  const [buscaDocumento, setBuscaDocumento] = useState('');
  const [filtroDocumento, setFiltroDocumento] = useState('Todos');
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  const [carregando, setCarregando] = useState(!pacienteState);
  const [erro, setErro] = useState('');

  // Busca os dados completos do paciente do banco de dados
  const carregarDadosPaciente = useCallback(async () => {
    if (!pacienteId) {
      setErro('Identificador do paciente não encontrado.');
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErro('');

      // Executa requisições em paralelo
      const [pacienteRes, historicoRes, documentosRes] = await Promise.allSettled([
        api.get(`/pacientes/${pacienteId}`),
        api.get(`/pacientes/${pacienteId}/historico`).catch(() => api.get(`/agendamentos?pacienteId=${pacienteId}`)),
        api.get(`/pacientes/${pacienteId}/documentos`)
      ]);

      // Define dados cadastrais do paciente
      if (pacienteRes.status === 'fulfilled') {
        setPaciente(pacienteRes.value.data);
      } else {
        setErro('Erro ao carregar dados do paciente.');
      }

      // Define dados do histórico clínico
      if (historicoRes.status === 'fulfilled') {
        setItensHistorico(historicoRes.value.data || []);
      }

      // Define documentos do paciente
      if (documentosRes.status === 'fulfilled') {
        setListaDocumentos(documentosRes.value.data || []);
      }

    } catch (err) {
      console.error('Erro ao buscar paciente:', err);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    carregarDadosPaciente();
  }, [carregarDadosPaciente]);

  // Filtros aplicados ao histórico
  const historicoFiltrado = itensHistorico.filter(item => {
    if (filtroHistorico === 'Todos') return true;
    return item.categoria === filtroHistorico || item.tipo === filtroHistorico;
  });

  // Filtros aplicados aos documentos
  const documentosFiltrados = listaDocumentos.filter(doc => {
    const nome = doc.nome || doc.titulo || '';
    const sub = doc.sub || doc.descricao || '';
    const correspondeBusca = nome.toLowerCase().includes(buscaDocumento.toLowerCase()) || 
                             sub.toLowerCase().includes(buscaDocumento.toLowerCase());
    if (filtroDocumento === 'Todos') return correspondeBusca;
    return correspondeBusca && doc.categoria === filtroDocumento;
  });

  const alternarMenu = (id) => {
    setMenuAbertoId(menuAbertoId === id ? null : id);
  };

  const handleBaixarDocumento = (doc) => {
    setMenuAbertoId(null);
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      alert(`Iniciando download do arquivo: ${doc.nome}`);
    }
  };

  if (carregando) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-500 font-sans min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#3B44A8]" />
        <p className="text-sm font-medium">Buscando informações do paciente no banco de dados...</p>
      </div>
    );
  }

  if (erro || !paciente) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-4 text-gray-500 font-sans">
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-sm font-bold text-gray-800">{erro || 'Paciente não encontrado.'}</p>
        <button 
          onClick={() => navigate('/app/recepcao/pacientes')}
          className="bg-[#3B44A8] text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Voltar para Lista de Pacientes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full bg-transparent font-sans">
      
      {/* HEADER DA PÁGINA */}
      <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/recepcao/pacientes')}
            className="p-2 text-gray-500 hover:text-[#3B44A8] hover:bg-gray-100 rounded-xl transition"
            title="Voltar para listagem"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-950">Detalhe do Paciente</h1>
        </div>

        <button 
          onClick={() => navigate('/app/recepcao/pacientes/cadastro', { state: { pacienteEdicao: paciente } })}
          className="flex bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm h-11 px-5 rounded-xl transition items-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <Edit3 size={16} className="text-[#3B44A8]" />
          <span>Editar Cadastro</span>
        </button>
      </header>

      {/* CONTAINER PRINCIPAL */}
      <div className="p-8 max-w-5xl w-full mx-auto space-y-6 flex-1 pb-16">
        
        {/* CARD PRINCIPAL: IDENTIFICAÇÃO E STATUS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl">
              <User size={32} className="stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{paciente.nome}</h2>
              <p className="text-gray-500 text-xs font-semibold mt-0.5">CPF: {paciente.cpf || 'Não informado'}</p>
            </div>
          </div>

          <span className={`text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider select-none ${
            (paciente.status || 'ativo').toLowerCase() === 'ativo' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {paciente.status || 'ativo'}
          </span>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex border-b border-gray-200 select-none">
          {['resumo', 'histórico', 'documentos'].map((aba) => {
            const idAba = aba.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return (
              <button
                key={idAba}
                onClick={() => setAbaAtiva(idAba)}
                className={`px-6 py-3 font-bold text-xs capitalize border-b-2 transition-all -mb-px ${
                  abaAtiva === idAba
                    ? 'border-[#3B44A8] text-[#3B44A8]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {aba}
              </button>
            );
          })}
        </div>

        {/* ABA: RESUMO */}
        {abaAtiva === 'resumo' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-gray-900 font-black text-sm border-b border-gray-100 pb-2">Informações pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="block text-gray-400 font-bold mb-0.5">Nome completo</span>
                <span className="text-gray-800 font-medium">{paciente.nome}</span>
              </div>
              <div>
                <span className="block text-gray-400 font-bold mb-0.5">Data de nascimento</span>
                <span className="text-gray-800 font-medium flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" /> {paciente.dataNascimento || paciente.nascimento || 'Não informada'}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 font-bold mb-0.5">Telefone</span>
                <span className="text-gray-800 font-medium flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" /> {paciente.telefone || 'Não informado'}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 font-bold mb-0.5">E-mail</span>
                <span className="text-gray-800 font-medium flex items-center gap-1.5 break-all">
                  <Mail size={14} className="text-gray-400" /> {paciente.email || 'Não informado'}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-gray-400 font-bold mb-0.5">Endereço</span>
                <span className="text-gray-800 font-medium flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400 shrink-0" /> 
                  {paciente.endereco 
                    ? `${paciente.endereco}${paciente.bairro ? ` - ${paciente.bairro}` : ''}${paciente.cidade ? `, ${paciente.cidade}` : ''}${paciente.uf ? ` - ${paciente.uf}` : ''}`
                    : 'Endereço não cadastrado'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ABA: HISTÓRICO */}
        {abaAtiva === 'historico' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex flex-wrap gap-2 select-none">
              {['Todos', 'Consultas', 'Cirurgias', 'Exames'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroHistorico(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    filtroHistorico === cat ? 'bg-[#3B44A8] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
              {historicoFiltrado.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 font-medium">
                  Nenhum procedimento registrado no histórico.
                </div>
              ) : (
                historicoFiltrado.map((item, index) => (
                  <div key={item.id || item._id || index} className="flex items-start justify-between p-4 hover:bg-gray-50/60 transition">
                    <div className="flex items-start gap-12 text-xs">
                      <span className="font-bold text-gray-900 w-24 shrink-0 pt-0.5">
                        {item.data || item.createdAt?.split('T')[0] || '--/--/----'}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm leading-snug">
                          {item.tipo || item.tipoConsulta || item.procedimento || 'Procedimento'}
                        </h4>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {item.profissional || item.dentista || 'Profissional não especificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA: DOCUMENTOS */}
        {abaAtiva === 'documentos' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between select-none">
              <h3 className="text-gray-900 font-black text-sm self-start sm:self-auto">Documentos</h3>
              
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute left-3.5 top-2.5 text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar documento..."
                  value={buscaDocumento}
                  onChange={(e) => setBuscaDocumento(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] transition"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 select-none border-b border-gray-100 pb-4">
              {['Todos', 'Exames', 'Radiografias', 'Formulários'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroDocumento(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    filtroDocumento === cat
                      ? 'bg-[#3B44A8] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentosFiltrados.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-gray-400 font-medium">
                  Nenhum documento encontrado correspondente aos filtros.
                </div>
              ) : (
                documentosFiltrados.map((doc, index) => {
                  const docId = doc.id || doc._id || index;
                  const formato = (doc.formato || doc.extensao || 'PDF').toUpperCase();

                  return (
                    <div key={docId} className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between bg-white hover:shadow-sm transition relative">
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl shrink-0 flex flex-col items-center justify-center min-w-[52px]">
                          {formato === 'PDF' ? <FileText size={20} className="text-red-500" /> : <ImageIcon size={20} className="text-blue-500" />}
                          <span className="text-[9px] font-black mt-0.5 text-gray-500">{formato}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-xs truncate">{doc.nome || doc.titulo || 'Documento'}</h4>
                          <p className="text-gray-400 text-[11px] mt-0.5 truncate">
                            {doc.sub || doc.descricao || 'Sem descrição'} • {doc.data || 'Data N/I'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-gray-400 text-[10px] font-bold">{doc.tamanho || 'N/A'}</span>
                        
                        <div className="relative">
                          <button 
                            onClick={() => alternarMenu(docId)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {menuAbertoId === docId && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuAbertoId(null)}></div>
                              
                              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20">
                                <button 
                                  onClick={() => handleBaixarDocumento(doc)}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                                >
                                  <Eye size={14} className="text-gray-400" />
                                  Ver documento
                                </button>
                                <button 
                                  onClick={() => handleBaixarDocumento(doc)}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 transition"
                                >
                                  <Download size={14} className="text-gray-400" />
                                  Baixar documento
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}