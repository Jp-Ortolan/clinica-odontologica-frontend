import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  Barcode,
  ChevronRight,
  PackageCheck
} from 'lucide-react';
import api from '../../Services/api';

export default function CmeProfessor() {
  const navigate = useNavigate();
  const [ciclos, setCiclos] = useState([]);
  const [pacotesRecentes, setPacotesRecentes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/esterilizacoes')
      .then(async (res) => {
        const listaCiclos = res.data;
        setCiclos(listaCiclos);

        // O backend não expõe uma listagem global de pacotes — eles vivem
        // como sub-recurso de cada ciclo. Buscamos os pacotes dos ciclos
        // mais recentes (limite para não disparar N+1 requisições sem fim).
        const ciclosRecentes = [...listaCiclos]
          .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
          .slice(0, 5);

        const resultados = await Promise.all(
          ciclosRecentes.map((c) =>
            api.get(`/esterilizacoes/${c.id}/pacotes`)
              .then((r) => r.data.map((p) => ({ ...p, ciclo: c })))
              .catch(() => [])
          )
        );

        const todosPacotes = resultados.flat().sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
        setPacotesRecentes(todosPacotes.slice(0, 3));
      })
      .catch((err) => console.error('Erro ao carregar esterilizações:', err))
      .finally(() => setCarregando(false));
  }, []);

  const emAndamento = ciclos.filter((c) => c.status === 'em_andamento').length;
  const pendencias = ciclos.filter((c) => c.status === 'pendente' || c.resultado === 'reprovado').length;
  const autoclavesRecentes = [...ciclos]
    .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
    .slice(0, 2);
  const ultimoCiclo = autoclavesRecentes[0];

  const STATUS_LABEL = {
    pendente: { texto: 'Pendente', cor: 'bg-indigo-100 text-[#3B42B2]' },
    em_andamento: { texto: 'Em andamento', cor: 'bg-amber-100 text-amber-700' },
    concluido: { texto: 'Concluído', cor: 'bg-emerald-100 text-emerald-700' },
    falhou: { texto: 'Falhou', cor: 'bg-rose-100 text-rose-700' },
  };

  return (
    <div className="w-full h-full bg-[#3B42B2] text-white flex flex-col font-sans m-0 p-0 overflow-hidden relative">

      {/* HEADER / TOPO */}
      <div className="pt-8 pb-4 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-semibold tracking-wide text-center flex-1">
          Central de Esterilização
        </h1>

        <div className="w-9" />
      </div>

      {/* CARD PRINCIPAL BRANCO COM SCROLL */}
      <div className="bg-white text-slate-800 rounded-t-[32px] px-4 pt-5 pb-8 flex-1 overflow-y-auto flex flex-col space-y-6 shadow-inner relative">

        {/* 1. CARDS DE MÉTRICAS / RESUMO */}
        <div className="grid grid-cols-3 gap-2">
          {/* Ciclos cadastrados */}
          <div
            onClick={() => navigate('/app/professor/cme/pacotes-esterilizados')}
            className="border border-slate-100 rounded-2xl p-3 bg-white shadow-xs text-center flex flex-col justify-between cursor-pointer hover:bg-slate-50 transition active:scale-95"
          >
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Ciclos cadastrados
            </span>
            <div className="my-1">
              <span className="text-2xl font-black text-[#3B42B2]">
                {ciclos.length}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Total</span>
          </div>

          {/* Em andamento */}
          <div className="border border-slate-100 rounded-2xl p-3 bg-white shadow-xs text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Em andamento
            </span>
            <div className="my-1">
              <span className="text-2xl font-black text-[#3B42B2]">{emAndamento}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Processos</span>
          </div>

          {/* Pendências */}
          <div className="border border-slate-100 rounded-2xl p-3 bg-white shadow-xs text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Pendências
            </span>
            <div className="my-1">
              <span className="text-2xl font-black text-rose-600">
                {pendencias}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Ações</span>
          </div>
        </div>

        {/* 2. LEITURA DE CÓDIGO CME */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-[#3B42B2] text-xs">
            Leitura de código CME
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Escanear QR-Code */}
            <button
              onClick={() => navigate('/app/professor/cme/leitor', { state: { abaInicial: 'qrcode' } })}
              className="bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100/50 rounded-2xl p-3 flex items-center justify-center gap-3 transition active:scale-95 cursor-pointer"
            >
              <div className="p-2 bg-[#3B42B2]/10 rounded-xl text-[#3B42B2]">
                <QrCode className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-extrabold text-[#3B42B2] text-left leading-tight">
                Escanear<br />QR-Code
              </span>
            </button>

            {/* Escanear Código de Barras */}
            <button
              onClick={() => navigate('/app/professor/cme/leitor', { state: { abaInicial: 'barras' } })}
              className="bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100/50 rounded-2xl p-3 flex items-center justify-center gap-3 transition active:scale-95 cursor-pointer"
            >
              <div className="p-2 bg-[#3B42B2]/10 rounded-xl text-[#3B42B2]">
                <Barcode className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-extrabold text-[#3B42B2] text-left leading-tight">
                Escanear<br />Código de<br />Barras
              </span>
            </button>
          </div>
        </div>

        {/* 3. CICLOS DE ESTERILIZAÇÃO RECENTES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#3B42B2] text-xs">
              Ciclos recentes
            </h3>
            <button
              onClick={() => navigate('/app/professor/cme/controle-biologico')}
              className="text-[10px] font-bold text-[#3B42B2] hover:underline cursor-pointer active:scale-95 transition"
            >
              Controle biológico
            </button>
          </div>

          {carregando ? (
            <div className="text-center text-slate-400 text-xs font-semibold py-4">Carregando ciclos...</div>
          ) : autoclavesRecentes.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center text-slate-400 text-xs font-semibold">
              Nenhum ciclo de esterilização registrado.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {autoclavesRecentes.map((ciclo) => {
                const status = STATUS_LABEL[ciclo.status] || { texto: ciclo.status, cor: 'bg-slate-100 text-slate-600' };
                return (
                  <div key={ciclo.id} className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs space-y-2">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs">{ciclo.equipamento || `Ciclo ${ciclo.id}`}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {ciclo.temperatura ? `${ciclo.temperatura}º` : ''}{ciclo.duracao_minutos ? ` - ${ciclo.duracao_minutos} min` : ''}
                      </p>
                    </div>
                    <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full ${status.cor}`}>
                      {status.texto}
                    </span>
                    <p className="text-[9px] text-slate-500 font-bold pt-1">
                      {ciclo.data_hora ? new Date(ciclo.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. PACOTES ESTERILIZADOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#3B42B2] text-xs">
              Pacotes esterilizados
            </h3>
            <button
              onClick={() => navigate('/app/professor/cme/pacotes-esterilizados')}
              className="text-[10px] font-bold text-[#3B42B2] hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {pacotesRecentes.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center text-slate-400 text-xs font-semibold">
                Nenhum pacote cadastrado recentemente.
              </div>
            ) : (
              pacotesRecentes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/app/professor/cme/pacote-detalhes/${item.id}`, { state: { pacote: item } })}
                  className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/60 shrink-0">
                      <PackageCheck className="w-6 h-6 text-[#3B42B2]" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-[#3B42B2] text-xs">{item.material_nome}</h4>
                      <p className="text-[9px] text-slate-500 font-bold">
                        Validade: {item.validade ? new Date(item.validade).toLocaleDateString('pt-BR') : 'N/I'}
                      </p>
                      <p className="text-[8px] text-slate-400 font-medium">
                        {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.status === 'esterilizado' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'vencido' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status === 'esterilizado' ? 'Válido' : item.status === 'vencido' ? 'Vencido' : 'Utilizado'}
                    </span>
                    <ChevronRight className="w-5 h-5 text-[#3B42B2]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. ÚLTIMO CICLO DE ESTERILIZAÇÃO */}
        {ultimoCiclo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#3B42B2] text-xs">
                Última esterilização
              </h3>
            </div>

            <div className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[#3B42B2] shrink-0">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-[#3B42B2] text-xs">Ciclo {ultimoCiclo.id}</h4>
                  <p className="text-[9px] text-slate-500 font-bold">
                    {ultimoCiclo.equipamento || 'Equipamento não informado'} • {ultimoCiclo.tipo_ciclo}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold">
                    {ultimoCiclo.data_hora ? new Date(ultimoCiclo.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold">Responsável: {ultimoCiclo.operador_nome || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${(STATUS_LABEL[ultimoCiclo.status] || {}).cor || 'bg-slate-100 text-slate-600'}`}>
                  {(STATUS_LABEL[ultimoCiclo.status] || {}).texto || ultimoCiclo.status}
                </span>
                <ChevronRight className="w-5 h-5 text-[#3B42B2]" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
