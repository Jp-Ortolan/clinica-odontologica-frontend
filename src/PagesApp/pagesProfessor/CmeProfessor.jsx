import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  Barcode,
  ChevronRight,
  PackageCheck
} from 'lucide-react';

const STORAGE_KEY_MATERIAIS = '@app_clinica:materiais_estoque';

export default function CmeProfessor() {
  const navigate = useNavigate();
  const [materiais, setMateriais] = useState([]);

  // Carrega os materiais cadastrados no localStorage
  useEffect(() => {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY_MATERIAIS);
    if (dadosSalvos) {
      try {
        setMateriais(JSON.parse(dadosSalvos));
      } catch (error) {
        console.error('Erro ao ler materiais do localStorage:', error);
      }
    }
  }, []);

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
          {/* Pacotes esterilizados */}
          <div 
            onClick={() => navigate('/app/professor/cme/pacotes-esterilizados')}
            className="border border-slate-100 rounded-2xl p-3 bg-white shadow-xs text-center flex flex-col justify-between cursor-pointer hover:bg-slate-50 transition active:scale-95"
          >
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Pacotes cadastrados
            </span>
            <div className="my-1">
              <span className="text-2xl font-black text-[#3B42B2]">
                {materiais.length}
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
              <span className="text-2xl font-black text-[#3B42B2]">2</span>
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
                {materiais.filter(item => item.estoqueAtual <= item.estoqueMinimo).length || 3}
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

        {/* 3. AUTOCLAVES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#3B42B2] text-xs">
              Autoclaves
            </h3>
            <button 
              onClick={() => navigate('/app/professor/cme/controle-biologico')}
              className="text-[10px] font-bold text-[#3B42B2] hover:underline cursor-pointer active:scale-95 transition"
            >
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Autoclave 01 */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs space-y-2">
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs">Autoclave 01</h4>
                <p className="text-[10px] text-slate-500 font-bold">120º - 25 min</p>
              </div>
              <span className="inline-block bg-amber-100 text-amber-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                Em andamento
              </span>
              <p className="text-[9px] text-slate-500 font-bold pt-1">
                Início: 25/05 - 10:30
              </p>
            </div>

            {/* Autoclave 02 */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs space-y-2">
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs">Autoclave 02</h4>
                <p className="text-[10px] text-slate-500 font-bold">134º - 18 min</p>
              </div>
              <span className="inline-block bg-indigo-100 text-[#3B42B2] text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                Aguardando
              </span>
              <p className="text-[9px] text-slate-500 font-bold pt-1">
                Início previsto: 25/05 - 10:30
              </p>
            </div>
          </div>
        </div>

        {/* 4. PACOTES ESTERILIZADOS / MATERIAIS */}
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
            {materiais.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center text-slate-400 text-xs font-semibold">
                Nenhum material cadastrado recentemente.
              </div>
            ) : (
              materiais.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => navigate('/app/professor/cme/pacotes-esterilizados')}
                  className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/60 shrink-0">
                      {item.imagem ? (
                        <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                      ) : (
                        <PackageCheck className="w-6 h-6 text-[#3B42B2]" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-[#3B42B2] text-xs">{item.nome}</h4>
                      <p className="text-[9px] text-slate-500 font-bold">Código: {item.codigoBarras}</p>
                      <p className="text-[9px] text-slate-500 font-bold">Categoria: {item.categoria || 'Geral'}</p>
                      <p className="text-[8px] text-slate-400 font-medium">
                        {item.criadoEm ? new Date(item.criadoEm).toLocaleDateString('pt-BR') : 'Hoje'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">
                      Válido
                    </span>
                    <ChevronRight className="w-5 h-5 text-[#3B42B2]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. ESTERILIZAÇÕES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#3B42B2] text-xs">
              Esterilizações
            </h3>
            <button className="text-[10px] font-bold text-[#3B42B2] hover:underline cursor-pointer">
              Ver todas
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-3 bg-white shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[#3B42B2] shrink-0">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-[#3B42B2] text-xs">Ciclo 2548</h4>
                <p className="text-[9px] text-slate-500 font-bold">Autoclave: 02 • 134º - 18 min</p>
                <p className="text-[9px] text-slate-500 font-bold">Início: 25/05 - 10:30 | Fim: 25/05 - 10:50</p>
                <p className="text-[9px] text-slate-500 font-bold">Responsável: Aline Soares</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                Concluído
              </span>
              <ChevronRight className="w-5 h-5 text-[#3B42B2]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}