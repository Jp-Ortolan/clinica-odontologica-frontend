import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, BriefcaseMedical, ConciergeBell } from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Importa a sua logo oficial diretamente da pasta de assets conforme sua estrutura física
import logoOdonto from './assets/images/odontologia-branca-scaled.png';

// Perfis que o usuário escolhe na tela. O `valor` é exatamente o que o
// backend devolve em usuario.perfil, pra dar pra comparar direto.
const PERFIS = [
  { valor: 'aluno', rotulo: 'Aluno', Icone: GraduationCap },
  { valor: 'professor', rotulo: 'Professor', Icone: BriefcaseMedical },
  { valor: 'recepcionista', rotulo: 'Recepção', Icone: ConciergeBell },
];

const ROTULO_PERFIL = {
  aluno: 'Aluno',
  professor: 'Professor',
  recepcionista: 'Recepção',
};

export default function Login() {
  const navigate = useNavigate();
  const { login, logout, rotaInicial } = useAuth();
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // A escolha do perfil é obrigatória e serve como validação: quem
    // manda de verdade continua sendo o perfil que o backend devolve,
    // mas se o usuário escolheu errado a gente avisa em vez de jogar
    // ele numa área que não é a dele.
    if (!perfilSelecionado) {
      setErro('Selecione o seu perfil de acesso para continuar.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const usuarioLogado = await login(email, senha);

      if (usuarioLogado.perfil !== perfilSelecionado) {
        // Credenciais válidas, mas perfil errado. Desfaz a sessão que o
        // login acabou de gravar no localStorage antes de recusar.
        logout();
        const rotuloReal = ROTULO_PERFIL[usuarioLogado.perfil] || usuarioLogado.perfil;
        setErro(`Esta conta é do perfil "${rotuloReal}". Selecione o perfil correto para entrar.`);
        return;
      }

      navigate(rotaInicial(usuarioLogado.perfil));
    } catch (err) {
      console.error('Erro ao realizar login:', err);
      const mensagemErro = err.response?.data?.message || 'E-mail ou senha inválidos. Tente novamente!';
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

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

            {/* Seleção de perfil de acesso */}
            <div className="space-y-2">
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide">
                Perfil de acesso
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PERFIS.map(({ valor, rotulo, Icone }) => {
                  const ativo = perfilSelecionado === valor;
                  return (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => {
                        setPerfilSelecionado(valor);
                        setErro('');
                      }}
                      aria-pressed={ativo}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border text-[11px] font-bold transition-all active:scale-[0.97] ${
                        ativo
                          ? 'border-[#3B44A8] bg-[#3B44A8]/5 text-[#3B44A8] ring-1 ring-[#3B44A8]'
                          : 'border-gray-300 bg-white text-gray-500 hover:border-[#3B44A8]/40 hover:text-gray-700'
                      }`}
                    >
                      <Icone size={18} />
                      {rotulo}
                    </button>
                  );
                })}
              </div>
            </div>

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
              disabled={carregando}
              className={`w-full py-3.5 rounded-xl font-bold text-center text-white transition-all shadow-md ${
                !carregando
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
