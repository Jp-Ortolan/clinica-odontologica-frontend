import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Info, ChevronDown } from 'lucide-react';

export default function NovoUsuario() {
  const navigate = useNavigate();

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    sexo: '',
    status: '',
    perfil: '',
    senhaTemporaria: '',
    permissoes: {
      pacientes: false,
      cirurgias: false,
      cme: false,
      consultas: false,
      estoque: false,
      configuracoes: false,
    }
  });

  // Funções para aplicar máscaras nos campos de texto
  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') formattedValue = maskCPF(value);
    if (name === 'telefone') formattedValue = maskPhone(value);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleCheckboxChange = (key) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [key]: !prev.permissoes[key]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Payload limpo para envio à API (remove formatação de CPF e telefone)
    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, '')
    };

    console.log('Dados do usuário prontos para a API:', payload);
    navigate(-1);
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
        <h1 className="text-lg font-bold tracking-wide flex-1 text-center mr-6">
          Novo usuário
        </h1>
      </div>

      {/* PAINEL INFERIOR BRANCO ARREDONDADO */}
      <div className="flex-1 bg-white rounded-t-[32px] overflow-y-auto px-5 py-6 shadow-inner text-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SEÇÃO 1: DADOS PESSOAIS */}
          <div className="space-y-3">
            <h2 className="text-[#3B42B2] font-extrabold text-sm">Dados pessoais</h2>

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome completo"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#3B42B2] placeholder:text-slate-400 shadow-sm"
                required
              />
            </div>

            {/* Email Institucional */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                E-mail institucional <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite o e-mail institucional"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#3B42B2] placeholder:text-slate-400 shadow-sm"
                required
              />
            </div>

            {/* CPF e Telefone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#3B42B2] placeholder:text-slate-400 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#3B42B2] placeholder:text-slate-400 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Sexo e Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#3B42B2] appearance-none bg-white shadow-sm cursor-pointer ${
                      formData.sexo === '' ? 'text-slate-400' : 'text-slate-800'
                    }`}
                    required
                  >
                    <option value="" disabled hidden>Selecione</option>
                    <option value="M" className="text-slate-800">Masculino</option>
                    <option value="F" className="text-slate-800">Feminino</option>
                    <option value="O" className="text-slate-800">Outro</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#3B42B2] appearance-none bg-white shadow-sm cursor-pointer ${
                      formData.status === '' ? 'text-slate-400' : 'text-slate-800'
                    }`}
                    required
                  >
                    <option value="" disabled hidden>Selecione</option>
                    <option value="ativo" className="text-slate-800">Ativo</option>
                    <option value="inativo" className="text-slate-800">Inativo</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: ACESSO AO SISTEMA */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[#3B42B2] font-extrabold text-sm">Acesso ao sistema</h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Perfil de acesso */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Perfil de acesso <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="perfil"
                    value={formData.perfil}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#3B42B2] appearance-none bg-white shadow-sm cursor-pointer ${
                      formData.perfil === '' ? 'text-slate-400' : 'text-slate-800'
                    }`}
                    required
                  >
                    <option value="" disabled hidden>Selecione</option>
                    <option value="professor" className="text-slate-800">Professor</option>
                    <option value="aluno" className="text-slate-800">Aluno</option>
                    <option value="recepcao" className="text-slate-800">Recepção</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Senha temporária */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Senha temporária <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    name="senhaTemporaria"
                    value={formData.senhaTemporaria}
                    onChange={handleChange}
                    placeholder="Digite a senha"
                    className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#3B42B2] placeholder:text-slate-400 shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Aviso de Senha */}
            <div className="bg-[#DCE0F5]/60 border border-[#3B42B2]/20 rounded-xl p-3 flex items-start gap-2.5">
              <Info size={18} className="text-[#3B42B2] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#3B42B2] font-semibold leading-snug">
                O usuário deverá alterar a senha no primeiro acesso.
              </p>
            </div>
          </div>

          {/* SEÇÃO 3: PERMISSÕES ADICIONAIS */}
          <div className="space-y-3 pt-2">
            <div>
              <h2 className="text-[#3B42B2] font-extrabold text-sm">Permissões adicionais</h2>
              <p className="text-[11px] text-slate-400 font-medium">Defina as permissões específicas para esse usuário.</p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { id: 'pacientes', label: 'Pacientes', desc: 'Acesso ao cadastro e histórico' },
                { id: 'cirurgias', label: 'Cirurgias', desc: 'Gestão de cirurgias e mutirões' },
                { id: 'cme', label: 'CME', desc: 'Central de Material Esterilizado' },
                { id: 'consultas', label: 'Consultas', desc: 'Agendamento e gestão' },
                { id: 'estoque', label: 'Estoque', desc: 'Controle de estoque e materiais' },
                { id: 'configuracoes', label: 'Configurações', desc: 'Acesso às configurações' },
              ].map((item) => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.permissoes[item.id]}
                    onChange={() => handleCheckboxChange(item.id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#3B42B2] focus:ring-[#3B42B2] mt-0.5 cursor-pointer accent-[#3B42B2]"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs leading-tight">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* BOTÃO SALVAR USUÁRIO */}
          <div className="pt-4 pb-2">
            <button
              type="submit"
              className="w-full bg-[#F9A814] text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-md hover:bg-amber-500 transition active:scale-[0.98] cursor-pointer"
            >
              Salvar usuário
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}