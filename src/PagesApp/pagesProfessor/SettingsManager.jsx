import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, ChevronRight, CloudDownload,
  User, Users, ShieldCheck, FileText, FileSearch, LogOut, Plus, X, Trash2
} from 'lucide-react';
import api from '../../Services/api';
import { useAuth } from '../../context/AuthContext';

// Mapa entre o "perfil" real do backend e o rótulo em português usado na UI
const LABEL_PERFIL = { professor: 'Professor', aluno: 'Aluno', recepcionista: 'Recepção' };

export default function SettingsManager({ onClose, onLogout }) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // Estado para controlar qual tela está ativa internamente
  const [telaInterna, setTelaInterna] = useState('configuracoes');

  // Estados para a tela de Usuários
  // Edição e desativação de usuário. PUT/DELETE /usuarios/:id existiam no
  // backend mas o app só sabia criar — não havia como corrigir um cadastro
  // nem tirar o acesso de quem saiu.
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formUsuario, setFormUsuario] = useState({ nome: '', email: '', telefone: '', setor: '', perfil: 'aluno', ativo: true });
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);
  const [erroUsuario, setErroUsuario] = useState('');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [buscaUsuarios, setBuscaUsuarios] = useState('');
  const [filtroUsuarios, setFiltroUsuarios] = useState('Todos');

  // Estados para Permissões
  const [perfilSelecionado, setPerfilSelecionado] = useState('Professor');

  // Estados para Logs
  const [buscaLogs, setBuscaLogs] = useState('');
  const [filtroLogs, setFiltroLogs] = useState('Todos');

  // Estados para Auditoria
  const [buscaAuditoria, setBuscaAuditoria] = useState('');
  const [filtroAuditoria, setFiltroAuditoria] = useState('Todos');

  // Usuários reais do backend (GET /usuarios)
  const [usuariosData, setUsuariosData] = useState([]);

  // Mesmo formato usado por recarregarUsuarios(), abaixo — inclusive o
  // campo `ativo`, que a carga inicial não trazia e por isso o selo
  // "Inativo" nunca aparecia até a lista ser recarregada.
  const mapearUsuario = (u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    setor: u.setor,
    ativo: u.ativo,
    perfil: LABEL_PERFIL[u.perfil] || u.perfil,
    perfilBruto: u.perfil,
  });

  useEffect(() => {
    api.get('/usuarios')
      .then((res) => setUsuariosData(res.data.map(mapearUsuario)))
      .catch((err) => console.error('Erro ao carregar usuários:', err));
  }, [telaInterna]);

  // Perfis reais do sistema — o backend só reconhece estes 3 (constraint
  // chk_usuario_perfil). "Administrador" não existe como perfil aqui.
  const perfis = ['professor', 'recepcionista', 'aluno'].map((perfilBruto) => ({
    id: LABEL_PERFIL[perfilBruto],
    perfilBruto,
    titulo: LABEL_PERFIL[perfilBruto],
    usuarios: `${usuariosData.filter((u) => u.perfilBruto === perfilBruto).length} usuários`,
  }));

  // Matriz de permissões real (GET /permissoes) — o mesmo que já está
  // escrito nas rotas via autorizar(...), só que consultável de uma vez.
  const [permissoesMatriz, setPermissoesMatriz] = useState([]);

  useEffect(() => {
    if (telaInterna === 'permissoes') {
      api.get('/permissoes')
        .then((res) => setPermissoesMatriz(res.data))
        .catch((err) => console.error('Erro ao carregar permissões:', err));
    }
  }, [telaInterna]);

  const ACAO_LABEL = { listar: 'Visualizar', criar: 'Criar', editar: 'Editar', remover: 'Remover' };

  // Deriva, no cliente, o mesmo resultado que GET /permissoes?perfil=X
  // devolveria — evita 3 chamadas extras já que a matriz completa cabe numa só.
  const permissoesPorPerfil = perfis.reduce((acc, p) => {
    acc[p.id] = permissoesMatriz
      .map((m) => ({
        modulo: m.modulo.replace(/\./g, ' › '),
        acoes: Object.entries(m.perfis || {})
          .filter(([, lista]) => lista.includes(p.perfilBruto))
          .map(([acao]) => ACAO_LABEL[acao] || acao),
      }))
      .filter((m) => m.acoes.length > 0)
      .map((m) => ({ modulo: m.modulo, nivel: m.acoes.join(', ') }));
    return acc;
  }, {});

  // Backup: não existe endpoint HTTP para isso no backend — o único
  // mecanismo real é um serviço do docker-compose local (pg_dump a cada
  // 6h em ./backups), que não é acionável pela API. Tela fica como
  // demonstração, deixado claro na interface.
  const backupsDisponiveis = [];

  // Logs e auditoria reais (GET /logs) — lidos do arquivo logs/audit.log
  // gerado pelo Winston. Cada evento vem como { level, message, timestamp,
  // ...meta }; não existe um campo "categoria" pronto, então os filtros
  // usam o nível real (info | warn | error) em vez de categorias fictícias.
  const [logsData, setLogsData] = useState([]);
  const [auditoriaData, setAuditoriaData] = useState([]);

  useEffect(() => {
    if (telaInterna === 'logs') {
      api.get('/logs', { params: { limite: 200 } })
        .then((res) => setLogsData(res.data))
        .catch((err) => console.error('Erro ao carregar logs:', err));
    }
    if (telaInterna === 'auditoria') {
      api.get('/logs', { params: { limite: 200 } })
        .then((res) => setAuditoriaData(res.data))
        .catch((err) => console.error('Erro ao carregar auditoria:', err));
    }
  }, [telaInterna]);

  const nomePorUsuarioId = usuariosData.reduce((acc, u) => { acc[u.id] = u.nome; return acc; }, {});

  // Agrupa a lista crua de eventos por data (dd/mm/aaaa), no formato que
  // a UI já espera: [{ data, itens: [{ usuario, acao, hora, cat }] }]
  function agruparEventosPorData(eventos) {
    const grupos = {};
    eventos.forEach((ev) => {
      const [dataParte, horaParte] = (ev.timestamp || '').split(' ');
      const dataFormatada = dataParte
        ? dataParte.split('-').reverse().join('/')
        : 'Data desconhecida';

      if (!grupos[dataFormatada]) grupos[dataFormatada] = [];
      grupos[dataFormatada].push({
        usuario: ev.usuario_id ? (nomePorUsuarioId[ev.usuario_id] || `Usuário #${ev.usuario_id}`) : 'Sistema',
        acao: ev.message || 'Evento sem descrição',
        hora: horaParte || '',
        cat: ev.level || 'info',
      });
    });
    return Object.entries(grupos).map(([data, itens]) => ({ data, itens }));
  }

  const dadosLogs = agruparEventosPorData(logsData);
  const dadosAuditoria = agruparEventosPorData(auditoriaData);
  const NIVEL_LABEL = { info: 'Informação', warn: 'Aviso', error: 'Erro' };

  // Filtro protegido de usuários
  const recarregarUsuarios = () => {
    api.get('/usuarios')
      .then((res) => setUsuariosData(res.data.map(mapearUsuario)))
      .catch((err) => console.error('Erro ao recarregar usuários:', err));
  };

  const abrirEdicaoUsuario = async (item) => {
    setErroUsuario('');
    setConfirmandoExclusao(false);
    try {
      const { data } = await api.get(`/usuarios/${item.id}`);
      setFormUsuario({
        nome: data.nome || '', email: data.email || '', telefone: data.telefone || '',
        setor: data.setor || '', perfil: data.perfil || 'aluno', ativo: data.ativo !== false,
      });
      setUsuarioEditando(data);
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      setErroUsuario('Não foi possível carregar os dados do usuário.');
    }
  };

  const salvarUsuario = async () => {
    if (!formUsuario.nome.trim() || !formUsuario.email.trim()) {
      setErroUsuario('Nome e e-mail são obrigatórios.');
      return;
    }
    setSalvandoUsuario(true); setErroUsuario('');
    try {
      await api.put(`/usuarios/${usuarioEditando.id}`, {
        ...usuarioEditando,
        nome: formUsuario.nome.trim(),
        email: formUsuario.email.trim(),
        telefone: formUsuario.telefone.trim() || null,
        setor: formUsuario.setor.trim() || null,
        perfil: formUsuario.perfil,
        ativo: formUsuario.ativo,
      });
      setUsuarioEditando(null);
      recarregarUsuarios();
    } catch (err) {
      setErroUsuario(err.response?.data?.message || 'Não foi possível salvar as alterações.');
    } finally { setSalvandoUsuario(false); }
  };

  const excluirUsuario = async () => {
    setSalvandoUsuario(true); setErroUsuario('');
    try {
      await api.delete(`/usuarios/${usuarioEditando.id}`);
      setUsuarioEditando(null);
      setConfirmandoExclusao(false);
      recarregarUsuarios();
    } catch (err) {
      setErroUsuario(err.response?.data?.message || 'Não foi possível excluir o usuário.');
    } finally { setSalvandoUsuario(false); }
  };

  const usuariosFiltrados = (usuariosData || []).filter((u) => {
    if (!u) return false;
    const termoBusca = (buscaUsuarios || '').toLowerCase();
    
    const perfilMatch = filtroUsuarios === 'Todos' || u.perfil === filtroUsuarios;
    const nomeMatch = u.nome ? u.nome.toLowerCase().includes(termoBusca) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(termoBusca) : false;

    return perfilMatch && (nomeMatch || emailMatch);
  });

  const navegarPara = (e, destino) => {
    e?.preventDefault();
    e?.stopPropagation();
    setTelaInterna(destino);
  };

  const handleVoltarParaDashboard = (e) => {
    e?.preventDefault();
    if (onClose) {
      onClose();
    } else {
      navigate('/app/professor/dashboard');
    }
  };

  const handleSairSistema = (e) => {
    e?.preventDefault();
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="w-full h-full bg-[#F8F9FD] flex flex-col overflow-hidden relative">
      
      {/* 1. TELA PRINCIPAL DE CONFIGURAÇÕES */}
      {telaInterna === 'configuracoes' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-[#3B44A8] pt-8 pb-6 px-6 text-white rounded-b-[28px] shadow-md shrink-0 relative">
            <div className="flex items-center justify-center relative">
              <button 
                type="button"
                onClick={handleVoltarParaDashboard}
                className="absolute left-0 p-2 hover:bg-white/10 rounded-xl transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold tracking-wide">Configurações</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 space-y-6 scrollbar-hide">
            
            {/* CARD DE USUÁRIO */}
            <button 
              type="button"
              onClick={(e) => navegarPara(e, 'usuarios')}
              className="w-full bg-white border border-gray-100 rounded-3xl p-4 flex items-center justify-between shadow-sm hover:bg-gray-50 active:scale-[0.99] transition cursor-pointer text-left select-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 text-gray-700 shrink-0">
                  <User size={30} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">{usuario?.nome || 'Usuário'}</h3>
                  <p className="text-xs font-semibold text-gray-500">{LABEL_PERFIL[usuario?.perfil] || usuario?.perfil || ''}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#3B44A8] shrink-0" />
            </button>

            <div className="space-y-3">
              <h3 className="text-[#3B44A8] font-black text-sm px-1">Configurações do sistema</h3>

              <div className="bg-white border border-gray-100 rounded-3xl divide-y divide-gray-100 shadow-sm overflow-hidden">
                
                {/* BOTÃO USUÁRIOS */}
                <button 
                  type="button"
                  onClick={(e) => navegarPara(e, 'usuarios')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left active:bg-gray-100 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 pointer-events-none">
                    <div className="text-[#3B44A8]"><Users size={24} /></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Usuários</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Gerenciar usuários do sistema</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#3B44A8] pointer-events-none" />
                </button>

                {/* BOTÃO PERMISSÕES */}
                <button 
                  type="button"
                  onClick={(e) => navegarPara(e, 'permissoes')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left active:bg-gray-100 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 pointer-events-none">
                    <div className="text-[#3B44A8]"><ShieldCheck size={24} /></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Permissões</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Gerenciar permissões</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#3B44A8] pointer-events-none" />
                </button>

                {/* BOTÃO BACKUP */}
                <button 
                  type="button"
                  onClick={(e) => navegarPara(e, 'backup')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left active:bg-gray-100 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 pointer-events-none">
                    <div className="text-[#3B44A8]"><CloudDownload size={24} /></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Backup</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Configurar e restaurar backups</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#3B44A8] pointer-events-none" />
                </button>

                {/* BOTÃO LOGS */}
                <button 
                  type="button"
                  onClick={(e) => navegarPara(e, 'logs')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left active:bg-gray-100 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 pointer-events-none">
                    <div className="text-[#3B44A8]"><FileText size={24} /></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Logs</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Verificar logs do sistema</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#3B44A8] pointer-events-none" />
                </button>

                {/* BOTÃO AUDITORIA */}
                <button 
                  type="button"
                  onClick={(e) => navegarPara(e, 'auditoria')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left active:bg-gray-100 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 pointer-events-none">
                    <div className="text-[#3B44A8]"><FileSearch size={24} /></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Auditoria</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Histórico de auditoria e acessos</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#3B44A8] pointer-events-none" />
                </button>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleSairSistema}
              className="w-full bg-[#F59E0B] hover:bg-amber-600 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sair do sistema</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TELA DE USUÁRIOS */}
      {telaInterna === 'usuarios' && (
        <div className="flex-1 flex flex-col h-full bg-[#F8F9FD] overflow-hidden">
          <div className="bg-[#3B44A8] pt-8 pb-6 px-6 text-white rounded-b-[28px] shadow-md shrink-0 relative">
            <div className="flex items-center justify-center relative">
              <button 
                type="button"
                onClick={(e) => navegarPara(e, 'configuracoes')}
                className="absolute left-0 p-2 hover:bg-white/10 rounded-xl transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold tracking-wide">Usuários</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 space-y-4 scrollbar-hide">
            <div className="relative">
              <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Buscar usuário"
                value={buscaUsuarios}
                onChange={(e) => setBuscaUsuarios(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] transition shadow-xs"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {/* Os rótulos precisam bater com o que `perfil` recebe ao carregar
                  a lista (Professor | Recepção | Aluno). "Administrador" não
                  existe em lugar nenhum do sistema: filtrar por ele devolvia
                  sempre uma lista vazia, e não havia como filtrar professores. */}
              {['Todos', 'Professor', 'Recepção', 'Aluno'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroUsuarios(f)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    filtroUsuarios === f 
                      ? 'bg-[#3B44A8] text-white shadow-xs' 
                      : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-2 shadow-sm divide-y divide-gray-100">
              {usuariosFiltrados.map((item) => (
                <div
                  key={item.id}
                  onClick={() => abrirEdicaoUsuario(item)}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition rounded-2xl cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-700 shrink-0">
                      <User size={22} />
                    </div>
                    <div className="truncate space-y-0.5">
                      <h4 className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                        {item.nome}
                        {item.ativo === false && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 uppercase shrink-0">
                            Inativo
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium truncate">{item.email}</p>
                      <p className="text-[10px] font-bold text-[#3B44A8]">{item.perfil}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#3B44A8] shrink-0" />
                </div>
              ))}
              {usuariosFiltrados.length === 0 && (
                <div className="py-8 text-center text-xs font-semibold text-gray-400">
                  Nenhum usuário encontrado para esta categoria.
                </div>
              )}
            </div>
            {/* Antes este botão só aparecia com o filtro em "Todos": bastava
                filtrar por um perfil para o "Adicionar usuário" sumir da tela. */}
            <button
              type="button"
              onClick={() => navigate('/app/professor/configuracoes/novo-usuario')}
              className="w-full bg-[#F59E0B] hover:bg-amber-600 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer mt-2"
            >
              <Plus size={18} />
              <span>Adicionar usuário</span>
            </button>

            <p className="text-center text-[10px] text-gray-400 font-medium pt-1">
              Toque em um usuário da lista para editar, trocar o perfil ou desativar.
            </p>
          </div>
        </div>
      )}

      {/* 3. TELA DE LOGS */}
      {telaInterna === 'logs' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-[#3B44A8] pt-8 pb-6 px-6 text-white rounded-b-[28px] shadow-md shrink-0 relative">
            <div className="flex items-center justify-center relative">
              <button 
                type="button"
                onClick={(e) => navegarPara(e, 'configuracoes')}
                className="absolute left-0 p-2 hover:bg-white/10 rounded-xl transition active:scale-95 cursor-pointer">
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold tracking-wide">Logs</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 space-y-4 scrollbar-hide">
            <div className="relative">
              <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Buscar logs"
                value={buscaLogs}
                onChange={(e) => setBuscaLogs(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] transition shadow-xs"/>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {['Todos', 'info', 'warn', 'error'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroLogs(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    filtroLogs === f ? 'bg-[#3B44A8] text-white shadow-xs' : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {f === 'Todos' ? 'Todos' : NIVEL_LABEL[f]}
                </button>
              ))}
            </div>
            {dadosLogs.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-6">Nenhum evento registrado ainda.</p>
            )}
            {dadosLogs.map((grupo, gIdx) => (
              <div key={gIdx} className="space-y-2 pt-1">
                <h3 className="text-[#3B44A8] font-bold text-xs px-1">{grupo.data}</h3>
                <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm divide-y divide-gray-100">
                  {grupo.itens
                    .filter(item => filtroLogs === 'Todos' || item.cat === filtroLogs)
                    .filter(item => item.usuario.toLowerCase().includes(buscaLogs.toLowerCase()) || item.acao.toLowerCase().includes(buscaLogs.toLowerCase()))
                    .map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-[#3B44A8]">{item.usuario}</h4>
                          <p className="text-[10px] text-gray-500 font-medium leading-tight">{item.acao}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold shrink-0 pt-0.5">{item.hora}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TELA DE AUDITORIA */}
      {telaInterna === 'auditoria' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-[#3B44A8] pt-8 pb-6 px-6 text-white rounded-b-[28px] shadow-md shrink-0 relative">
            <div className="flex items-center justify-center relative">
              <button 
                type="button"
                onClick={(e) => navegarPara(e, 'configuracoes')}
                className="absolute left-0 p-2 hover:bg-white/10 rounded-xl transition active:scale-95 cursor-pointer">
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold tracking-wide">Auditoria</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24 space-y-4 scrollbar-hide">
            <div className="relative">
              <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Buscar logs"
                value={buscaAuditoria}
                onChange={(e) => setBuscaAuditoria(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-[#3B44A8] transition shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {['Todos', 'info', 'warn', 'error'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroAuditoria(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    filtroAuditoria === f ? 'bg-[#3B44A8] text-white shadow-xs' : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {f === 'Todos' ? 'Todos' : NIVEL_LABEL[f]}
                </button>
              ))}
            </div>
            {dadosAuditoria.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-6">Nenhum evento registrado ainda.</p>
            )}
            {dadosAuditoria.map((grupo, gIdx) => (
              <div key={gIdx} className="space-y-2 pt-1">
                <h3 className="text-[#3B44A8] font-bold text-xs px-1">{grupo.data}</h3>
                <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm divide-y divide-gray-100">
                  {grupo.itens
                    .filter(item => filtroAuditoria === 'Todos' || item.cat === filtroAuditoria)
                    .filter(item => item.usuario.toLowerCase().includes(buscaAuditoria.toLowerCase()) || item.acao.toLowerCase().includes(buscaAuditoria.toLowerCase()))
                    .map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-[#3B44A8]">{item.usuario}</h4>
                          <p className="text-[10px] text-gray-500 font-medium leading-tight whitespace-pre-line">{item.acao}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold shrink-0 pt-0.5">{item.hora}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TELA DE BACKUP */}
      {telaInterna === 'backup' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-[#3B44A8] pt-8 pb-6 px-6 text-white rounded-b-[28px] shadow-md shrink-0 relative">
            <div className="flex items-center justify-center relative">
              <button 
                type="button"
                onClick={(e) => navegarPara(e, 'configuracoes')}
                className="absolute left-0 p-2 hover:bg-white/10 rounded-xl transition active:scale-95 cursor-pointer">
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold tracking-wide">Backup</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 space-y-5 scrollbar-hide">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
              <h4 className="text-xs font-bold text-amber-800">Backup ainda não tem API</h4>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                O único backup real do sistema roda localmente via Docker (um dump automático do
                Postgres a cada 6h, guardado na pasta <code>backups/</code> do servidor). Não existe
                endpoint HTTP para disparar ou listar backups a partir do app — por isso esta tela
                é só uma demonstração visual, sem dados reais.
              </p>
            </div>
            <div className="space-y-2.5">
              <h3 className="text-[#3B44A8] font-bold text-sm px-1">Backups disponíveis</h3>
              <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                {backupsDisponiveis.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-2">Nenhum backup consultável por aqui.</p>
                ) : (
                  backupsDisponiveis.map((b, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-500 text-[11px]">{b.dataHora}</span>
                      <span className="font-semibold text-gray-500 text-[11px]">{b.tamanho}</span>
                      <span className="font-semibold text-gray-500 text-[11px]">{b.tipo}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TELA DE PERMISSÕES */}
      {telaInterna === 'permissoes' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-[#3B44A8] pt-8 pb-6 px-6 text-white rounded-b-[28px] shadow-md shrink-0 relative">
            <div className="flex items-center justify-center relative">
              <button 
                type="button"
                onClick={(e) => navegarPara(e, 'configuracoes')}
                className="absolute left-0 p-2 hover:bg-white/10 rounded-xl transition active:scale-95 cursor-pointer">
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-xl font-bold tracking-wide">Permissões</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 space-y-6 scrollbar-hide">
            <div className="bg-white border border-gray-100 rounded-3xl divide-y divide-gray-100 shadow-sm overflow-hidden">
              {perfis.map((item) => (
                <button 
                  key={item.id}
                  type="button"
                  onClick={() => setPerfilSelecionado(item.id)}
                  className={`w-full p-4 flex items-center justify-between transition text-left active:bg-gray-100 cursor-pointer ${
                    perfilSelecionado === item.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                  }`}>
                  <div>
                    <h4 className="text-sm font-bold text-[#3B44A8]">{item.titulo}</h4>
                    <p className="text-[11px] text-gray-400 font-medium">Perfil: {item.perfilBruto}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#3B44A8]/10 text-[#3B44A8] text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                      {item.usuarios}
                    </span>
                    <ChevronRight size={18} className="text-[#3B44A8]" />
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[#3B44A8] font-black text-xs">
                  Permissões do perfil selecionado
                </h3>
                <span className="bg-[#3B44A8]/10 text-[#3B44A8] text-[10px] font-bold px-3 py-1 rounded-full">
                  {perfilSelecionado}
                </span>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm divide-y divide-gray-100">
                {(permissoesPorPerfil[perfilSelecionado] || []).map((perm, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{perm.modulo}</span>
                    <span className="text-xs font-semibold text-[#3B44A8]">{perm.nivel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE USUÁRIO (PUT/DELETE /usuarios/:id) */}
      {usuarioEditando && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
          onClick={() => !salvandoUsuario && setUsuarioEditando(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[#3B44A8] font-black text-sm">Editar usuário</h3>
              <button type="button" onClick={() => setUsuarioEditando(null)} disabled={salvandoUsuario}
                className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {erroUsuario && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-xl font-semibold">
                {erroUsuario}
              </div>
            )}

            {[
              { campo: 'nome', rotulo: 'Nome completo', tipo: 'text' },
              { campo: 'email', rotulo: 'E-mail', tipo: 'email' },
              { campo: 'telefone', rotulo: 'Telefone', tipo: 'tel' },
              { campo: 'setor', rotulo: 'Setor', tipo: 'text' },
            ].map(({ campo, rotulo, tipo }) => (
              <div key={campo} className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">{rotulo}</label>
                <input
                  type={tipo}
                  value={formUsuario[campo]}
                  onChange={(e) => setFormUsuario((f) => ({ ...f, [campo]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8]"
                />
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-600">Perfil de acesso</label>
              <select
                value={formUsuario.perfil}
                onChange={(e) => setFormUsuario((f) => ({ ...f, perfil: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8]"
              >
                <option value="professor">Professor</option>
                <option value="aluno">Aluno</option>
                <option value="recepcionista">Recepção</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formUsuario.ativo}
                onChange={(e) => setFormUsuario((f) => ({ ...f, ativo: e.target.checked }))}
                className="w-4 h-4 accent-[#3B44A8]"
              />
              <span className="text-gray-700 text-xs font-bold">
                Usuário ativo (pode entrar no sistema)
              </span>
            </label>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Para tirar o acesso de alguém que saiu, prefira desmarcar "ativo" a
              excluir: o histórico de quem fez o quê continua fazendo sentido.
            </p>

            <button
              type="button" onClick={salvarUsuario} disabled={salvandoUsuario}
              className="w-full py-3 bg-[#3B44A8] text-white rounded-xl font-bold text-xs disabled:opacity-50"
            >
              {salvandoUsuario ? 'Salvando...' : 'Salvar alterações'}
            </button>

            {!confirmandoExclusao ? (
              <button
                type="button" onClick={() => setConfirmandoExclusao(true)} disabled={salvandoUsuario}
                className="w-full py-2.5 text-rose-600 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-rose-50 rounded-xl transition"
              >
                <Trash2 size={14} /> Excluir usuário em definitivo
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
                <p className="text-[11px] text-rose-700 font-semibold leading-relaxed">
                  Excluir <strong>{formUsuario.nome}</strong>? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setConfirmandoExclusao(false)} disabled={salvandoUsuario}
                    className="flex-1 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg font-bold text-[11px]">
                    Cancelar
                  </button>
                  <button type="button" onClick={excluirUsuario} disabled={salvandoUsuario}
                    className="flex-1 py-2 bg-rose-500 text-white rounded-lg font-bold text-[11px] disabled:opacity-50">
                    {salvandoUsuario ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
