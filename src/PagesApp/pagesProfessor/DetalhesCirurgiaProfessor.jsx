import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Package,
  Layers,
  Sparkles,
  FileText,
  Plus,
  Minus
} from 'lucide-react';
import api from '../../Services/api';

export default function DetalhesCirurgiaProfessor() {
  const navigate = useNavigate();
  const location = useLocation();

  // Linha crua vinda do backend (id, paciente_id, usuario_id, data_hora,
  // tipo_cirurgia, status, observacoes, mutirao_id)
  const cirurgiaRaw = location.state?.cirurgia || {};
  const [paciente, setPaciente] = useState(null);
  const [equipe, setEquipe] = useState([]);

  useEffect(() => {
    if (cirurgiaRaw.paciente_id) {
      api.get(`/pacientes/${cirurgiaRaw.paciente_id}`).then((res) => setPaciente(res.data)).catch((err) => console.error(err));
    }
    if (cirurgiaRaw.id) {
      api.get(`/cirurgias/${cirurgiaRaw.id}/alunos`).then((res) => setEquipe(res.data)).catch((err) => console.error(err));
    }
  }, [cirurgiaRaw.id, cirurgiaRaw.paciente_id]);

  const dataHoraObj = cirurgiaRaw.data_hora ? new Date(cirurgiaRaw.data_hora) : null;
  const detalhesCirurgia = {
    paciente: paciente?.nome || 'Carregando...',
    documento: paciente?.cpf || '',
    procedimento: cirurgiaRaw.tipo_cirurgia || 'Cirurgia',
    data: dataHoraObj ? dataHoraObj.toLocaleDateString('pt-BR') : '-',
    horario: dataHoraObj ? dataHoraObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
    status: cirurgiaRaw.status || 'agendada',
  };

  // O backend não vincula materiais a cirurgias — esta lista fica só
  // local, como um checklist de apoio em sala.
  const [materiais, setMateriais] = useState([
    { id: 1, nome: "Kit Cirúrgico 01", sub: "(1 Un)", qtd: 1, icon: Package },
    { id: 2, nome: "Seringa Carpule", sub: "(1 Un)", qtd: 1, icon: FileText },
    { id: 3, nome: "Campo Cirúrgico", sub: "(2 Un)", qtd: 1, icon: Layers },
    { id: 4, nome: "Luva Descartável", sub: "(2 Un)", qtd: 4, icon: Sparkles },
    { id: 5, nome: "Avental Cirúrgico", sub: "(1 Un)", qtd: 4, icon: Package },
    { id: 6, nome: "Gaze", sub: "(3 Un)", qtd: 4, icon: Layers },
  ]);

  const alterarQuantidade = (id, delta) => {
    setMateriais(prev =>
      prev.map(item => {
        if (item.id === id) {
          const novaQtd = Math.max(0, item.qtd + delta);
          return { ...item, qtd: novaQtd };
        }
        return item;
      })
    );
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#3B42B2] text-white flex flex-col justify-between font-sans m-0 p-0 overflow-x-hidden">

      {/* TOPO FIXO */}
      <div className="pt-8 pb-4 px-6 text-white flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition active:scale-95 cursor-pointer"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold tracking-wide flex-1 text-center mr-6">Detalhes da Cirurgia</h1>
      </div>

      {/* PAINEL INFERIOR ARREDONDADO */}
      <div className="flex-1 bg-white rounded-t-[32px] overflow-y-auto px-5 py-6 space-y-6 shadow-inner text-slate-800">

        {/* 1. CARD INFORMATIVO PRINCIPAL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                <User className="text-gray-500" size={24} />
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-gray-950 text-sm leading-snug truncate">{detalhesCirurgia.paciente}</h2>
                <p className="text-gray-400 text-[10px] font-semibold">{detalhesCirurgia.documento}</p>
              </div>
            </div>
            <span className="bg-[#DEF5E9] text-[#2E7D32] text-[9px] font-bold px-3 py-1 rounded-full whitespace-nowrap capitalize">
              {detalhesCirurgia.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
            <div>
              <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Procedimento</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight block mt-0.5">{detalhesCirurgia.procedimento}</span>
            </div>
            <div>
              <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Data</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight block mt-0.5">{detalhesCirurgia.data}</span>
            </div>
            <div>
              <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Horário</span>
              <span className="text-gray-500 font-medium text-[11px] leading-tight block mt-0.5">{detalhesCirurgia.horario}</span>
            </div>
          </div>

          {cirurgiaRaw.observacoes && (
            <div className="pt-1">
              <span className="block text-gray-950 font-bold text-[10px] uppercase tracking-wider">Observações</span>
              <span className="text-gray-500 font-medium text-[11px] block mt-0.5">{cirurgiaRaw.observacoes}</span>
            </div>
          )}
        </div>

        {/* 2. EQUIPE RESPONSÁVEL */}
        <div className="space-y-3">
          <h3 className="text-[#3B42B2] font-extrabold text-sm">Equipe responsável</h3>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {equipe.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-[11px]">Nenhum vínculo de equipe cadastrado.</div>
            ) : (
              equipe.map((membro) => (
                <div key={membro.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{membro.usuario_nome || `Aluno #${membro.usuario_id}`}</h4>
                      <p className="text-gray-400 text-[10px] font-medium leading-none mt-0.5">{membro.curso || 'Aluno'}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    membro.papel === 'executante' ? 'bg-[#DCE0F5] text-[#3B42B2]' : 'bg-[#FFEED2] text-[#B45309]'
                  }`}>
                    {membro.papel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. MATERIAIS PREVISTOS */}
        <div className="space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3B42B2] font-extrabold text-sm">Materiais previstos</h3>
            <button
              type="button"
              onClick={() => navigate('/app/professor/estoque/materiais')}
              className="text-[#3B42B2] text-xs font-bold hover:underline cursor-pointer"
            >
              Adicionar materiais
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
            {materiais.map((mat) => {
              const IconComp = mat.icon;
              return (
                <div key={mat.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#3B42B2] shrink-0">
                      <IconComp size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-950 text-xs truncate leading-tight">{mat.nome}</h4>
                      <p className="text-gray-400 text-[9px] font-semibold">{mat.sub}</p>
                    </div>
                  </div>

                  {/* Botões do Contador */}
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-1 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(mat.id, -1)}
                      className="p-1 text-gray-500 hover:text-[#3B42B2] transition active:scale-90 cursor-pointer"
                    >
                      <Minus size={12} className="stroke-[3]" />
                    </button>
                    <span className="text-gray-950 font-bold text-xs w-4 text-center select-none">{mat.qtd}</span>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(mat.id, 1)}
                      className="p-1 text-gray-500 hover:text-[#3B42B2] transition active:scale-90 cursor-pointer"
                    >
                      <Plus size={12} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
