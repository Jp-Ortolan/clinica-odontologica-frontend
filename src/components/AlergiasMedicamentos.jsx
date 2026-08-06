import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Pill, Plus, X, Trash2 } from 'lucide-react';
import api from '../Services/api';
import { useAuth } from '../context/AuthContext';

// Alergias e medicamentos em uso do paciente.
//
// O backend já tinha os seis endpoints (listar/criar/remover para cada um)
// desde o começo, mas nenhuma tela do app chamava criar ou remover — dava
// só pra ver o que estivesse no banco, sem forma de registrar. Numa clínica
// odontológica isso é informação de segurança do paciente (anestésico,
// anticoagulante), então vale ter em tela.
//
// Permissões conforme pacienteRoutes.js:
//   listar  → professor, aluno, recepcionista
//   criar   → alergia: os três | medicamento: professor e aluno
//   remover → professor e aluno
const GRAVIDADES = ['leve', 'moderada', 'grave'];

const COR_GRAVIDADE = {
  leve: 'bg-amber-100 text-amber-700',
  moderada: 'bg-orange-100 text-orange-700',
  grave: 'bg-rose-100 text-rose-700',
};

export default function AlergiasMedicamentos({ pacienteId }) {
  const { usuario } = useAuth();
  const perfil = usuario?.perfil;
  const podeEditarMedicamento = perfil === 'professor' || perfil === 'aluno';
  const podeRemover = perfil === 'professor' || perfil === 'aluno';

  const [alergias, setAlergias] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [formAlergia, setFormAlergia] = useState(null); // {substancia, gravidade}
  const [formMedicamento, setFormMedicamento] = useState(null); // {nome_medicamento, dosagem}
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!pacienteId) return;
    setCarregando(true);
    try {
      const [a, m] = await Promise.all([
        api.get(`/pacientes/${pacienteId}/alergias`),
        api.get(`/pacientes/${pacienteId}/medicamentos`),
      ]);
      setAlergias(Array.isArray(a.data) ? a.data : []);
      setMedicamentos(Array.isArray(m.data) ? m.data : []);
    } catch (err) {
      console.error('Erro ao carregar alergias/medicamentos:', err);
    } finally {
      setCarregando(false);
    }
  }, [pacienteId]);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarAlergia = async () => {
    if (!formAlergia?.substancia?.trim()) { setErro('Informe a substância.'); return; }
    setSalvando(true); setErro('');
    try {
      await api.post(`/pacientes/${pacienteId}/alergias`, {
        substancia: formAlergia.substancia.trim(),
        gravidade: formAlergia.gravidade || undefined,
      });
      setFormAlergia(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível salvar a alergia.');
    } finally { setSalvando(false); }
  };

  const salvarMedicamento = async () => {
    if (!formMedicamento?.nome_medicamento?.trim()) { setErro('Informe o medicamento.'); return; }
    setSalvando(true); setErro('');
    try {
      await api.post(`/pacientes/${pacienteId}/medicamentos`, {
        nome_medicamento: formMedicamento.nome_medicamento.trim(),
        dosagem: formMedicamento.dosagem?.trim() || undefined,
      });
      setFormMedicamento(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível salvar o medicamento.');
    } finally { setSalvando(false); }
  };

  const remover = async (tipo, id) => {
    const rota = tipo === 'alergia'
      ? `/pacientes/${pacienteId}/alergias/${id}`
      : `/pacientes/${pacienteId}/medicamentos/${id}`;
    const anteriorA = alergias, anteriorM = medicamentos;
    if (tipo === 'alergia') setAlergias((l) => l.filter((x) => x.id !== id));
    else setMedicamentos((l) => l.filter((x) => x.id !== id));
    try {
      await api.delete(rota);
    } catch (err) {
      console.error('Erro ao remover:', err);
      setAlergias(anteriorA); setMedicamentos(anteriorM);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3B44A8]';

  return (
    <div className="space-y-4">
      {erro && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-xl font-semibold">
          {erro}
        </div>
      )}

      {/* ALERGIAS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[#3B44A8] font-black text-xs flex items-center gap-1.5">
            <AlertTriangle size={14} /> Alergias
          </h3>
          <button
            type="button"
            onClick={() => setFormAlergia(formAlergia ? null : { substancia: '', gravidade: '' })}
            className="text-[#3B44A8] text-[10px] font-bold hover:underline"
          >
            {formAlergia ? 'Cancelar' : '+ Adicionar'}
          </button>
        </div>

        {formAlergia && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
            <input
              type="text" autoFocus placeholder="Substância (ex.: Penicilina, Látex)"
              value={formAlergia.substancia}
              onChange={(e) => setFormAlergia((f) => ({ ...f, substancia: e.target.value }))}
              className={inputCls}
            />
            <select
              value={formAlergia.gravidade}
              onChange={(e) => setFormAlergia((f) => ({ ...f, gravidade: e.target.value }))}
              className={inputCls}
            >
              <option value="">Gravidade (opcional)</option>
              {GRAVIDADES.map((g) => (
                <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>
              ))}
            </select>
            <button
              type="button" disabled={salvando} onClick={salvarAlergia}
              className="w-full py-2.5 bg-[#3B44A8] text-white rounded-xl font-bold text-xs disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar alergia'}
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {carregando ? (
            <div className="p-4 text-center text-gray-400 text-[11px]">Carregando...</div>
          ) : alergias.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-[11px]">Nenhuma alergia registrada.</div>
          ) : (
            alergias.map((a) => (
              <div key={a.id} className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle size={15} className="text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">{a.substancia}</p>
                    {a.gravidade && (
                      <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-0.5 uppercase ${COR_GRAVIDADE[a.gravidade] || 'bg-gray-100 text-gray-600'}`}>
                        {a.gravidade}
                      </span>
                    )}
                  </div>
                </div>
                {podeRemover && (
                  <button type="button" onClick={() => remover('alergia', a.id)}
                    className="p-1.5 text-gray-300 hover:text-rose-500 shrink-0" aria-label="Remover alergia">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MEDICAMENTOS EM USO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[#3B44A8] font-black text-xs flex items-center gap-1.5">
            <Pill size={14} /> Medicamentos em uso
          </h3>
          {podeEditarMedicamento && (
            <button
              type="button"
              onClick={() => setFormMedicamento(formMedicamento ? null : { nome_medicamento: '', dosagem: '' })}
              className="text-[#3B44A8] text-[10px] font-bold hover:underline"
            >
              {formMedicamento ? 'Cancelar' : '+ Adicionar'}
            </button>
          )}
        </div>

        {formMedicamento && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
            <input
              type="text" autoFocus placeholder="Medicamento (ex.: Varfarina)"
              value={formMedicamento.nome_medicamento}
              onChange={(e) => setFormMedicamento((f) => ({ ...f, nome_medicamento: e.target.value }))}
              className={inputCls}
            />
            <input
              type="text" placeholder="Dosagem (opcional, ex.: 5mg/dia)"
              value={formMedicamento.dosagem}
              onChange={(e) => setFormMedicamento((f) => ({ ...f, dosagem: e.target.value }))}
              className={inputCls}
            />
            <button
              type="button" disabled={salvando} onClick={salvarMedicamento}
              className="w-full py-2.5 bg-[#3B44A8] text-white rounded-xl font-bold text-xs disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar medicamento'}
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {carregando ? (
            <div className="p-4 text-center text-gray-400 text-[11px]">Carregando...</div>
          ) : medicamentos.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-[11px]">Nenhum medicamento registrado.</div>
          ) : (
            medicamentos.map((m) => (
              <div key={m.id} className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                    <Pill size={15} className="text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">{m.nome_medicamento}</p>
                    {m.dosagem && <p className="text-gray-400 text-[10px] font-semibold">{m.dosagem}</p>}
                  </div>
                </div>
                {podeRemover && (
                  <button type="button" onClick={() => remover('medicamento', m.id)}
                    className="p-1.5 text-gray-300 hover:text-rose-500 shrink-0" aria-label="Remover medicamento">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
