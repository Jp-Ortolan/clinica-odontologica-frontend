import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2, Users, X, Plus } from 'lucide-react';
import api from '../../Services/api';
import { useAuth } from '../../context/AuthContext';

// Agendamento de cirurgia. O backend tinha POST /cirurgias, PUT /cirurgias/:id
// e POST /cirurgias/:id/alunos desde sempre, mas não havia tela nenhuma que
// chamasse esses endpoints — dava só pra listar o que já estivesse no banco.
//
// A mesma tela serve para criar e editar: se vier `cirurgia` no state da
// navegação, entra em modo de edição.
const STATUS = ['agendada', 'realizada', 'cancelada'];
const PAPEIS = ['executante', 'auxiliar', 'observador'];

export default function NovaCirurgia() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const cirurgiaEdicao = location.state?.cirurgia || null;
  const editando = Boolean(cirurgiaEdicao?.id);

  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mutiroes, setMutiroes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [pacienteId, setPacienteId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [tipoCirurgia, setTipoCirurgia] = useState('');
  const [status, setStatus] = useState('agendada');
  const [mutiraoId, setMutiraoId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [disciplina, setDisciplina] = useState('');

  // Alunos vinculados (compartilhamento de curso)
  const [alunosVinculados, setAlunosVinculados] = useState([]);
  const [alunoParaVincular, setAlunoParaVincular] = useState('');
  const [papelAluno, setPapelAluno] = useState('executante');

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/pacientes')
      .then((r) => setPacientes(r.data))
      .catch((err) => {
        console.error('Erro ao carregar pacientes:', err);
        setErro('Não foi possível carregar a lista de pacientes.');
      });

    api.get('/usuarios')
      .then((r) => setUsuarios(r.data))
      .catch((err) => {
        console.error('Erro ao carregar responsáveis:', err);
        // Sem a lista de usuários o campo "Responsável" ficaria vazio e o
        // formulário travava sem explicar o motivo. Ao menos o próprio
        // professor logado continua selecionável.
        if (usuario?.id) setUsuarios([usuario]);
        setErro('Não foi possível carregar a lista de responsáveis. Você aparece como opção.');
      });

    api.get('/cirurgias/mutiroes').then((r) => setMutiroes(r.data)).catch(() => {});
    api.get('/consultas/disciplinas').then((r) => setDisciplinas(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Numa cirurgia nova, quem está agendando costuma ser o responsável —
  // deixa pré-selecionado em vez de exigir o passo extra.
  useEffect(() => {
    if (!cirurgiaEdicao && !usuarioId && usuario?.id) {
      setUsuarioId(String(usuario.id));
    }
  }, [usuario, cirurgiaEdicao, usuarioId]);

  useEffect(() => {
    if (!cirurgiaEdicao) return;
    setPacienteId(String(cirurgiaEdicao.paciente_id || ''));
    setUsuarioId(String(cirurgiaEdicao.usuario_id || ''));
    // input datetime-local espera "AAAA-MM-DDTHH:MM"
    if (cirurgiaEdicao.data_hora) {
      const d = new Date(cirurgiaEdicao.data_hora);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
      setDataHora(iso.slice(0, 16));
    }
    setTipoCirurgia(cirurgiaEdicao.tipo_cirurgia || '');
    setStatus(cirurgiaEdicao.status || 'agendada');
    setMutiraoId(cirurgiaEdicao.mutirao_id ? String(cirurgiaEdicao.mutirao_id) : '');
    setObservacoes(cirurgiaEdicao.observacoes || '');
    setDisciplina(cirurgiaEdicao.disciplina || '');
    api.get(`/cirurgias/${cirurgiaEdicao.id}/alunos`)
      .then((r) => setAlunosVinculados(r.data))
      .catch(() => {});
  }, [cirurgiaEdicao]);

  const alunos = usuarios.filter((u) => u.perfil === 'aluno' && u.ativo !== false);
  const profissionais = usuarios.filter((u) => ['professor', 'aluno'].includes(u.perfil) && u.ativo !== false);
  const idsVinculados = new Set(alunosVinculados.map((a) => a.usuario_id));

  const vincularAluno = async (cirurgiaId) => {
    if (!alunoParaVincular) return;
    try {
      const { data } = await api.post(`/cirurgias/${cirurgiaId}/alunos`, {
        usuario_id: Number(alunoParaVincular),
        papel: papelAluno,
      });
      setAlunosVinculados((atuais) => [...atuais, data]);
      setAlunoParaVincular('');
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível vincular o aluno.');
    }
  };

  const desvincularAluno = async (vinculoId) => {
    const anterior = alunosVinculados;
    setAlunosVinculados((l) => l.filter((a) => a.id !== vinculoId));
    try {
      await api.delete(`/cirurgias/${cirurgiaEdicao.id}/alunos/${vinculoId}`);
    } catch (err) {
      console.error('Erro ao desvincular aluno:', err);
      setAlunosVinculados(anterior);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!pacienteId || !usuarioId || !dataHora) {
      setErro('Paciente, responsável e data/hora são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      const payload = {
        paciente_id: Number(pacienteId),
        usuario_id: Number(usuarioId),
        data_hora: new Date(dataHora).toISOString(),
        tipo_cirurgia: tipoCirurgia || undefined,
        disciplina: disciplina || undefined,
        status,
        observacoes: observacoes || undefined,
        mutirao_id: mutiraoId ? Number(mutiraoId) : undefined,
      };

      if (editando) {
        await api.put(`/cirurgias/${cirurgiaEdicao.id}`, payload);
      } else {
        const { data } = await api.post('/cirurgias', payload);
        // Se o professor já escolheu um aluno antes de salvar, vincula agora
        // que a cirurgia tem id.
        if (alunoParaVincular) await vincularAluno(data.id);
      }
      navigate('/app/professor/cirurgias');
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível salvar a cirurgia.');
    } finally {
      setSalvando(false);
    }
  };

  const cls = 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#3B44A8] shadow-sm transition';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="bg-[#3B44A8] pt-12 pb-6 px-6 text-white flex items-center justify-between shadow-md rounded-b-[24px] shrink-0 select-none">
        <button type="button" onClick={() => navigate('/app/professor/cirurgias')}
          className="p-1 hover:bg-white/10 rounded-lg transition active:scale-95" aria-label="Voltar">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-wide mr-8">
          {editando ? 'Editar cirurgia' : 'Nova cirurgia'}
        </h1>
        <div className="w-6" />
      </div>

      <form onSubmit={salvar} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-24">
        {erro && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle size={18} className="shrink-0" /> <span>{erro}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Paciente <span className="text-red-500">*</span></label>
          <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} className={cls} required>
            <option value="">Selecione o paciente</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Responsável <span className="text-red-500">*</span></label>
          <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className={cls} required>
            <option value="">Selecione o responsável</option>
            {profissionais.map((u) => (
              <option key={u.id} value={u.id}>{u.nome} ({u.perfil})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Data e hora <span className="text-red-500">*</span></label>
          <input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} className={cls} required />
        </div>

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Disciplina</label>
          <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className={cls}>
            <option value="">Selecione a disciplina</option>
            {disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Tipo de cirurgia</label>
          <input type="text" placeholder="Ex.: Exodontia de terceiro molar" value={tipoCirurgia}
            onChange={(e) => setTipoCirurgia(e.target.value)} className={cls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={cls}>
              {STATUS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-gray-700 text-xs font-bold block">Mutirão</label>
            <select value={mutiraoId} onChange={(e) => setMutiraoId(e.target.value)} className={cls}>
              <option value="">Nenhum</option>
              {mutiroes.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-gray-700 text-xs font-bold block">Observações</label>
          <textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
            className={`${cls} resize-none`} placeholder="Preparo, cuidados, materiais especiais..." />
        </div>

        {/* ALUNOS VINCULADOS (compartilhamento de curso) */}
        <div className="space-y-2 pt-2">
          <h2 className="text-[#3B44A8] font-bold text-sm tracking-wide flex items-center gap-1.5">
            <Users size={15} /> Alunos participantes
          </h2>

          <div className="flex gap-2">
            <select value={alunoParaVincular} onChange={(e) => setAlunoParaVincular(e.target.value)}
              className={`${cls} flex-1`}>
              <option value="">Selecione um aluno</option>
              {alunos.filter((a) => !idsVinculados.has(a.id)).map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
            <select value={papelAluno} onChange={(e) => setPapelAluno(e.target.value)} className={`${cls} w-32`}>
              {PAPEIS.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
            </select>
            {editando && (
              <button type="button" onClick={() => vincularAluno(cirurgiaEdicao.id)}
                disabled={!alunoParaVincular}
                className="px-4 bg-[#3B44A8] text-white rounded-xl text-xs font-bold disabled:opacity-40 shrink-0">
                <Plus size={16} />
              </button>
            )}
          </div>

          {!editando && (
            <p className="text-gray-400 text-[10px] font-medium">
              O aluno selecionado é vinculado assim que a cirurgia for criada.
              Depois é possível adicionar mais pela edição.
            </p>
          )}

          {alunosVinculados.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {alunosVinculados.map((a) => (
                <div key={a.id} className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">{a.usuario_nome || `Aluno #${a.usuario_id}`}</p>
                    {a.papel && <p className="text-gray-400 text-[10px] font-semibold capitalize">{a.papel}</p>}
                  </div>
                  <button type="button" onClick={() => desvincularAluno(a.id)}
                    className="p-1.5 text-gray-300 hover:text-rose-500" aria-label="Remover aluno">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={salvando}
          className="w-full py-4 bg-[#F9A814] hover:bg-[#e0940f] active:scale-[0.98] rounded-xl font-bold text-white text-xs transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
          {salvando ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : (editando ? 'Salvar alterações' : 'Agendar cirurgia')}
        </button>
      </form>
    </div>
  );
}
