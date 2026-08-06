import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, ToggleLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../Services/api';

export default function CadastroPacienteRecepcao() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const pacienteEdicao = location.state?.pacienteEdicao || null;
  const isEditing = !!pacienteEdicao;

  // Estados dos dados pessoais e endereço
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('PR');
  const [status, setStatus] = useState('ativo');

  // Estados do responsável
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
  const [parentesco, setParentesco] = useState('');

  // Estados de submissão e controle da UI
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Preenchimento dos dados em caso de edição
  useEffect(() => {
    if (isEditing && pacienteEdicao) {
      setNome(pacienteEdicao.nome || '');
      setDataNascimento(pacienteEdicao.dataNascimento ? pacienteEdicao.dataNascimento.split('T')[0] : '');
      setSexo(pacienteEdicao.sexo || '');
      setCpf(pacienteEdicao.cpf || '');
      setTelefone(pacienteEdicao.telefone || '');
      setEmail(pacienteEdicao.email || '');
      setEndereco(pacienteEdicao.endereco || '');
      setNumero(pacienteEdicao.numero || '');
      setComplemento(pacienteEdicao.complemento || '');
      setBairro(pacienteEdicao.bairro || '');
      setCep(pacienteEdicao.cep || '');
      setCidade(pacienteEdicao.cidade || '');
      setUf(pacienteEdicao.uf || 'PR');
      setStatus(pacienteEdicao.status || 'ativo');

      if (pacienteEdicao.responsavel) {
        setNomeResponsavel(pacienteEdicao.responsavel.nomeResponsavel || pacienteEdicao.responsavel.nome || '');
        setTelefoneResponsavel(pacienteEdicao.responsavel.telefoneResponsavel || pacienteEdicao.responsavel.telefone || '');
        setParentesco(pacienteEdicao.responsavel.parentesco || '');
      }
    }
  }, [isEditing, pacienteEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');
    
    const dadosPaciente = {
      nome, 
      dataNascimento, 
      sexo, 
      cpf, 
      telefone, 
      email,
      endereco, 
      numero, 
      complemento, 
      bairro, 
      cep, 
      cidade, 
      uf, 
      status,
      responsavel: { nomeResponsavel, telefoneResponsavel, parentesco }
    };

    try {
      if (isEditing) {
        const id = pacienteEdicao.id || pacienteEdicao._id;
        await api.put(`/pacientes/${id}`, dadosPaciente);
        setSucesso('Paciente atualizado com sucesso!');
      } else {
        await api.post('/pacientes', dadosPaciente);
        setSucesso('Paciente cadastrado com sucesso!');
      }

      setTimeout(() => {
        navigate('/app/recepcao/pacientes');
      }, 1500);

    } catch (err) {
      console.error('Erro ao salvar paciente:', err);
      const msg = err.response?.data?.message || 'Falha ao salvar paciente. Verifique os dados fornecidos.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full bg-transparent font-sans">
      
      <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate('/app/recepcao/pacientes')}
            className="p-2 text-gray-500 hover:text-[#3B44A8] hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-950">
            {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
        </div>
      </header>

      <div className="p-8 max-w-5xl w-full mx-auto flex-1 pb-24">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Mensagens de Feedback */}
          {erro && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3 font-medium">
              <AlertCircle size={20} className="shrink-0" />
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-3 font-medium">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
              {sucesso}
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-[#3B44A8] font-black text-base tracking-wide">Dados pessoais</h2>
              
              <div className="flex items-center gap-2 select-none">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <ToggleLeft size={16} className={status === 'ativo' ? 'text-green-500' : 'text-gray-400'} />
                  Status do Cadastro:
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={!isEditing}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition ${
                    status === 'ativo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                  } ${!isEditing ? 'cursor-not-allowed opacity-85' : 'cursor-pointer'}`}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Nome completo *</label>
                <input type="text" required placeholder="Digite o nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Data de nascimento *</label>
                <input type="date" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Sexo *</label>
                <select required value={sexo} onChange={(e) => setSexo(e.target.value)} className="input-web">
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">CPF *</label>
                <input type="text" required placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Telefone *</label>
                <input type="tel" required placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-12">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">E-mail</label>
                <input type="email" placeholder="Digite seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-8">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Endereço</label>
                <input type="text" placeholder="Digite seu endereço completo" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-4">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Número</label>
                <input type="text" placeholder="Nº" value={numero} onChange={(e) => setNumero(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Complemento</label>
                <input type="text" placeholder="Apto, Bloco, etc." value={complemento} onChange={(e) => setComplemento(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Bairro</label>
                <input type="text" placeholder="Digite o bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-4">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">CEP</label>
                <input type="text" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-5">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Cidade</label>
                <input type="text" placeholder="Digite a cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-3">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">UF</label>
                <select value={uf} onChange={(e) => setUf(e.target.value)} className="input-web">
                  <option value="PR">PR</option>
                  <option value="SP">SP</option>
                  <option value="SC">SC</option>
                  <option value="RS">RS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados do Responsável */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-[#3B44A8] font-black text-base tracking-wide">
                Responsável <span className="text-gray-400 text-xs font-normal">(se menor de idade)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Nome do responsável</label>
                <input type="text" placeholder="Digite o nome do responsável" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Telefone do responsável</label>
                <input type="tel" placeholder="(00) 00000-0000" value={telefoneResponsavel} onChange={(e) => setTelefoneResponsavel(e.target.value)} className="input-web" />
              </div>

              <div className="md:col-span-6">
                <label className="block text-gray-700 text-xs font-bold mb-1.5">Grau de parentesco</label>
                <select value={parentesco} onChange={(e) => setParentesco(e.target.value)} className="input-web">
                  <option value="">Selecione</option>
                  <option value="Pai">Pai</option>
                  <option value="Mãe">Mãe</option>
                  <option value="Tutor">Tutor Legal</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="flex justify-end pt-2 select-none">
            <button 
              type="submit"
              disabled={carregando}
              className={`w-full sm:w-auto min-w-[200px] bg-[#F9A814] hover:bg-[#e0940f] text-white font-bold text-sm py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-[0.98] ${
                carregando ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {carregando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar paciente
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        .input-web {
          width: 100%;
          background-color: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #1f2937;
          transition: all 0.2s;
        }
        .input-web:focus {
          outline: none;
          border-color: #3B44A8;
          box-shadow: 0 0 0 1px #3B44A8;
        }
        .input-web::placeholder {
          color: #9ca3af;
        }
      `}</style>

    </div>
  );
}