import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, ChevronRight, CloudDownload, Download, 
  ChevronDown, User, Users, ShieldCheck, FileText, FileSearch, LogOut, Plus 
} from 'lucide-react';

export default function SettingsManager({ onClose, onLogout }) {
  const navigate = useNavigate();

  // Estado para controlar qual tela está ativa internamente
  const [telaInterna, setTelaInterna] = useState('configuracoes');
  
  // Estados para a tela de Usuários
  const [buscaUsuarios, setBuscaUsuarios] = useState('');
  const [filtroUsuarios, setFiltroUsuarios] = useState('Todos');
  
  // Estados para Permissões
  const [perfilSelecionado, setPerfilSelecionado] = useState('Administrador');
  
  // Estados para Logs
  const [buscaLogs, setBuscaLogs] = useState('');
  const [filtroLogs, setFiltroLogs] = useState('Todos');
  
  // Estados para Auditoria
  const [buscaAuditoria, setBuscaAuditoria] = useState('');
  const [filtroAuditoria, setFiltroAuditoria] = useState('Todos');

  // Dados Mockados - Usuários
  const usuariosData = [
    { id: 1, nome: 'Rhaya Borges', email: 'engs-rhayannatonete@camporeal.edu.br', perfil: 'Administrador' },
    { id: 2, nome: 'Nome do usuário', email: 'Email', perfil: 'Recepção' },
    { id: 3, nome: 'Nome do usuário', email: 'Email', perfil: 'Aluno' },
    { id: 4, nome: 'Nome do usuário', email: 'Email', perfil: 'Aluno' },
    { id: 5, nome: 'Nome do usuário', email: 'Email', perfil: 'Recepção' },
    { id: 6, nome: 'Nome do usuário', email: 'Email', perfil: 'Administrador' },
  ];

  // Dados Mockados - Perfis
  const perfis = [
    { id: 'Administrador', titulo: 'Administrador', desc: 'Acesso total ao sistema', usuarios: '3 usuários' },
    { id: 'Recepção', titulo: 'Recepção', desc: 'Atendimento e agendamento', usuarios: '6 usuários' },
    { id: 'Aluno', titulo: 'Aluno', desc: 'Atendimentos clínicos', usuarios: '54 usuários' },
    { id: 'Professor', titulo: 'Professor', desc: 'Supervisão', usuarios: '9 usuários' },
  ];

  const permissoesPorPerfil = {
    'Administrador': [
      { modulo: 'Usuários', nivel: 'Acesso total' },
      { modulo: 'Pacientes', nivel: 'Acesso total' },
      { modulo: 'Agenda', nivel: 'Acesso total' },
      { modulo: 'Estoque', nivel: 'Acesso total' },
      { modulo: 'CME', nivel: 'Acesso total' },
      { modulo: 'Relatórios', nivel: 'Acesso total' },
    ],
    'Recepção': [
      { modulo: 'Pacientes', nivel: 'Cadastro e Edição' },
      { modulo: 'Agenda', nivel: 'Agendamento total' },
      { modulo: 'Estoque', nivel: 'Apenas leitura' },
      { modulo: 'Relatórios', nivel: 'Relatórios básicos' },
    ],
    'Aluno': [
      { modulo: 'Pacientes', nivel: 'Consulta e Prontuário' },
      { modulo: 'Agenda', nivel: 'Consulta de horários' },
      { modulo: 'Estoque', nivel: 'Solicitação de materiais' },
      { modulo: 'CME', nivel: 'Envio de kits' },
    ],
    'Professor': [
      { modulo: 'Pacientes', nivel: 'Validação e Supervisão' },
      { modulo: 'Agenda', nivel: 'Supervisão de agenda' },
      { modulo: 'Estoque', nivel: 'Aprovação de materiais' },
      { modulo: 'CME', nivel: 'Aprovação de esterilização' },
      { modulo: 'Relatórios', nivel: 'Relatórios de desempenho' },
    ]
  };

  const backupsDisponiveis = [
    { dataHora: '13/05/2026 - 07:00', tamanho: '1,2 GB', tipo: 'Automático' },
    { dataHora: '06/05/2026 - 07:00', tamanho: '1,1 GB', tipo: 'Automático' },
    { dataHora: '30/04/2026 - 07:00', tamanho: '1,5 GB', tipo: 'Automático' },
    { dataHora: '23/04/2026 - 07:00', tamanho: '1,0 GB', tipo: 'Automático' },
  ];

  const dadosLogs = [
    {
      data: '20/05/2026',
      itens: [
        { usuario: 'Mariana Santos', acao: 'Login realizado com sucesso', hora: '10:45:24', cat: 'Login' },
        { usuario: 'Pietro Antunes', acao: 'Cadastro de paciente: Luísa Mattos', hora: '09:51:36', cat: 'Cadastro' },
        { usuario: 'Rafael Silva', acao: 'Alteração de agendamento', hora: '09:53:14', cat: 'Alteração' },
        { usuario: 'Juliana Mendes', acao: 'Login realizado com sucesso', hora: '09:37:59', cat: 'Login' },
        { usuario: 'Judite Guimarães', acao: 'Exclusão de agendamento ID: 13456', hora: '09:22:10', cat: 'Exclusão' },
        { usuario: 'André Marques', acao: 'Login realizado com sucesso', hora: '08:30:32', cat: 'Login' },
      ]
    },
    {
      data: '19/05/2026',
      itens: [
        { usuario: 'Jéssica Ruiz', acao: 'Login realizado com sucesso', hora: '17:37:15', cat: 'Login' },
        { usuario: 'Débora Andrade', acao: 'Alteração de dados do paciente', hora: '15:17:48', cat: 'Alteração' },
        { usuario: 'Lucas Emanoel', acao: 'Login realizado com sucesso', hora: '15:17:05', cat: 'Login' },
      ]
    }
  ];

  const dadosAuditoria = [
    {
      data: '20/05/2026',
      itens: [
        { usuario: 'Mariana Santos', acao: 'Alterou permissões do usuário Marcos Pontes\nAntes: Recepção | Depois: Administrador', hora: '11:08:24', cat: 'Permissões' },
        { usuario: 'Pietro Antunes', acao: 'Acessou dados da paciente Ana Clara Lima\nProntuário ID: 13456', hora: '11:00:07', cat: 'Dados' },
        { usuario: 'Juliana Mendes', acao: 'Criou novo agendamento\nPaciente: Bruno Pereira', hora: '10:56:34', cat: 'Dados' },
        { usuario: 'Judite Guimarães', acao: 'Tentativa de acesso negado\nMódulo: Estoque', hora: '08:47:23', cat: 'Acessos' },
      ]
    },
    {
      data: '19/05/2026',
      itens: [
        { usuario: 'Jéssica Ruiz', acao: 'Backup realizado manualmente', hora: '16:04:51', cat: 'Sistema' },
        { usuario: 'Débora Andrade', acao: 'Tentativa de acesso negado\nMódulo: CME', hora: '15:56:01', cat: 'Acessos' },
        { usuario: 'Lucas Emanoel', acao: 'Alterou dados do paciente\nPaciente: Antônio Marques', hora: '15:55:00', cat: 'Dados' },
      ]
    }
  ];

  // Filtro protegido de usuários
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
                  <h3 className="text-base font-black text-gray-900">Rhaya Borges</h3>
                  <p className="text-xs font-semibold text-gray-500">Administrador / Professor</p>
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
              {['Todos', 'Recepção', 'Administrador', 'Aluno'].map((f) => (
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
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-700 shrink-0">
                      <User size={22} />
                    </div>
                    <div className="truncate space-y-0.5">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.nome}</h4>
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
            {filtroUsuarios === 'Todos' && (
              <button 
                type="button"
                onClick={() => navigate('/app/professor/configuracoes/novo-usuario')}
                className="w-full bg-[#F59E0B] hover:bg-amber-600 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer mt-2"
                >
                <Plus size={18} />
                <span>Adicionar usuário</span>
              </button>
            )}
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
              {['Todos', 'Login', 'Cadastro', 'Alteração', 'Exclusão'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroLogs(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    filtroLogs === f ? 'bg-[#3B44A8] text-white shadow-xs' : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
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
              {['Todos', 'Dados', 'Permissões', 'Acessos', 'Sistema'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltroAuditoria(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    filtroAuditoria === f ? 'bg-[#3B44A8] text-white shadow-xs' : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
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
            <div className="bg-white border border-gray-100 rounded-3xl divide-y divide-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900">Próximo backup automático</h4>
                <p className="text-xs font-bold text-[#3B44A8]">27/05/2026 às 07:00</p>
              </div>
              <div className="p-4 space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900">Último backup realizado</h4>
                <p className="text-xs font-bold text-[#3B44A8]">20/05/2026 às 07:00</p>
              </div>
            </div>
            <button 
              type="button"
              className="w-full bg-[#F59E0B] hover:bg-amber-600 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <CloudDownload size={22} />
              <span>Realizar backup agora</span>
            </button>
            <div className="space-y-2.5">
              <h3 className="text-[#3B44A8] font-bold text-sm px-1">Backups disponíveis</h3>
              <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm divide-y divide-gray-100">
                {backupsDisponiveis.map((b, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-500 text-[11px]">{b.dataHora}</span>
                    <span className="font-semibold text-gray-500 text-[11px]">{b.tamanho}</span>
                    <span className="font-semibold text-gray-500 text-[11px]">{b.tipo}</span>
                    <button type="button" className="text-[#3B44A8] hover:text-indigo-800 transition active:scale-90 p-1 cursor-pointer">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-[#3B44A8] font-bold text-sm px-1">Configurações de backup</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3B44A8] px-1">Frequência</label>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-xs cursor-pointer">
                    <span className="text-xs font-bold text-[#3B44A8]">Semanal</span>
                    <ChevronDown size={18} className="text-[#3B44A8]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3B44A8] px-1">Horário</label>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-xs cursor-pointer">
                    <span className="text-xs font-bold text-[#3B44A8]">07:00</span>
                    <ChevronDown size={18} className="text-[#3B44A8]" />
                  </div>
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-[#3B44A8] px-1">Manter backups por</label>
                <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between shadow-xs cursor-pointer">
                  <span className="text-xs font-bold text-[#3B44A8]">60 dias</span>
                  <ChevronDown size={18} className="text-[#3B44A8]" />
                </div>
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
                    <p className="text-[11px] text-gray-400 font-medium">{item.desc}</p>
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

    </div>
  );
}