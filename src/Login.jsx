import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown, User, GraduationCap, Laptop } from 'lucide-react';
import api from './Services/api'; // Import da API conectada ao Railway

// Importa a sua logo oficial diretamente da pasta de assets conforme sua estrutura física
import logoOdonto from './assets/images/odontologia-branca-scaled.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [perfil, setPerfil] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // Perfis mapeados para as respectivas pastas e rotas
  const perfis = [
    { id: 'aluno', label: 'Aluno', icon: GraduationCap },
    { id: 'professor', label: 'Professor', icon: User },
    { id: 'recepcao', label: 'Recepção', icon: Laptop },
  ];

  const handleSelectPerfil = (perfilId) => {
    setPerfil(perfilId);
    setShowDropdown(false);
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!perfil) {
      setErro('Por favor, selecione seu perfil de acesso.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      // 1. Envia a requisição real de login para o Railway
      const response = await api.post('/auth/login', {
        email,
        senha,
        perfil // envia o perfil selecionado caso a API exija
      });

      // 2. Salva o token de acesso no navegador
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data?.usuario) {
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      }

      // 3. Redirecionamento baseado no perfil com as rotas do App.jsx
      if (perfil === 'aluno') {
        navigate('/app/aluno');
      } else if (perfil === 'professor') {
        navigate('/app/professor');
      } else if (perfil === 'recepcao') {
        navigate('/app/recepcao'); 
      }
    } catch (err) {
      console.error('Erro ao realizar login:', err);
      
      // Mensagem personalizada com base na resposta do backend ou erro genérico
      const mensagemErro = err.response?.data?.message || 'E-mail ou senha inválidos. Tente novamente!';
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  const perfilSelecionado = perfis.find(p => p.id === perfil);

  return (
    <div className="min-h-screen w-full bg-[#3B44A8] flex items-center justify-center p-0 sm:p-4 font-sans">
      
      {/* Container principal - Simula o formato de app mobile no desktop e tela cheia no celular */}
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[820px] bg-[#3B44A8] flex flex-col justify-between shadow-2xl overflow-hidden sm:rounded-[32px] border border-[#4853c5]/30">
        
        {/* Topo - Azul com a Imagem da Logo Oficial */}
        <div className="flex flex-col items-center justify-center pt-14 pb-8 px-8 text-center select-none">
          <div className="w-full max-w-[280px] flex items-center justify-center">
            <img 
              src={logoOdonto} 
              alt="Centro Universitário Campo Real - Odontologia" 
              className="w-full h-auto object-contain max-h-[120px]"
            />
          </div>

          <h1 className="text-white text-2xl font-bold tracking-wide mt-6">
            Clínica Odontológica
          </h1>
          <p className="text-white/80 text-sm font-light mt-1">
            Sistema Integrado
          </p>
        </div>

        {/* Formulário - Card Branco Arredondado */}
        <div className="bg-white flex-1 rounded-t-[36px] px-8 pt-10 pb-8 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5 flex-1">
            <div>
              <h2 className="text-gray-950 text-xl font-bold">Bem-vindo(a)!</h2>
              <p className="text-gray-500 text-xs mt-1">Faça login para continuar</p>
            </div>

            {/* Mensagem de Erro Visual */}
            {erro && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
                {erro}
              </div>
            )}

            {/* Input E-mail */}
            <div className="space-y-1">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-[#3B44A8] focus:ring-1 focus:ring-[#3B44A8] placeholder-gray-400 transition"
                required
              />
            </div>

            {/* Input Senha */}
            <div className="relative space-y-1">
              <input
                type={showSenha ? 'text' : 'password'}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-[#3B44A8] focus:ring-1 focus:ring-[#3B44A8] placeholder-gray-400 pr-12 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition"
              >
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Select Customizado de Perfis */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-400 text-sm text-left flex items-center justify-between hover:border-gray-400 transition"
              >
                <span className={perfilSelecionado ? 'text-gray-850 font-medium' : 'text-gray-400'}>
                  {perfilSelecionado ? perfilSelecionado.label : 'Selecione seu perfil de acesso'}
                </span>
                <ChevronDown size={18} className={`text-[#F9A814] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Opções do Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden divide-y divide-gray-100">
                  {perfis.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPerfil(item.id)}
                        className="w-full px-4 py-3.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                      >
                        <div className="p-1.5 bg-[#F9A814]/10 rounded-full text-[#F9A814]">
                          <Icon size={16} />
                        </div>
                        <span className="font-semibold text-gray-800">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Link Esqueci Minha Senha */}
            <div className="text-center pt-1">
              <Link to="/recuperar-senha" className="text-[#3B44A8] text-xs font-semibold hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          </form>

          {/* Botão Entrar fixado na base do card branco */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!perfil || carregando}
              className={`w-full py-3.5 rounded-xl font-bold text-center text-white transition-all shadow-md ${
                perfil && !carregando
                  ? 'bg-[#F9A814] hover:bg-[#e0940f] active:scale-[0.98]' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}