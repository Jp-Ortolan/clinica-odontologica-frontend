import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import api from './Services/api';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(location.state?.token || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (!token.trim()) {
      setErro('Cole o token de recuperação recebido.');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/auth/redefinir-senha', { token, nova_senha: novaSenha });
      setMensagemSucesso('Senha redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      const msg = err.response?.data?.message || 'Não foi possível redefinir a senha. Confira o token e tente de novo.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#3B44A8] flex items-center justify-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[820px] bg-[#3B44A8] flex flex-col justify-between shadow-2xl overflow-hidden sm:rounded-[32px] border border-[#4853c5]/30">

        <div className="relative flex items-center justify-center pt-14 pb-8 px-6 text-center select-none">
          <button
            onClick={() => navigate('/recuperar-senha')}
            className="absolute left-6 top-14 text-white hover:opacity-80 transition active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-semibold tracking-wide">
            Redefinir senha
          </h1>
        </div>

        <div className="bg-white flex-1 rounded-t-[36px] px-8 pt-10 pb-8 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col items-center">

            <div className="relative w-24 h-24 bg-[#DCE0F5] rounded-full flex items-center justify-center mb-1">
              <KeyRound className="text-[#3B44A8]" size={32} />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-[#3B44A8] text-xl font-bold">Digite o token e a nova senha</h2>
              <p className="text-gray-600 text-xs font-normal max-w-[280px] mx-auto leading-relaxed">
                Cole o token que você recebeu na etapa anterior e defina uma nova senha.
              </p>
            </div>

            {erro && (
              <div className="w-full p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
                {erro}
              </div>
            )}

            {mensagemSucesso && (
              <div className="w-full p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl text-center font-medium flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                {mensagemSucesso}
              </div>
            )}

            <div className="w-full space-y-3 pt-1">
              <input
                type="text"
                placeholder="Token de recuperação"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-[#3B44A8] focus:ring-1 focus:ring-[#3B44A8] placeholder-gray-400 shadow-sm transition"
                required
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-[#3B44A8] focus:ring-1 focus:ring-[#3B44A8] placeholder-gray-400 shadow-sm transition"
                required
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-[#3B44A8] focus:ring-1 focus:ring-[#3B44A8] placeholder-gray-400 shadow-sm transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className={`w-full py-3.5 rounded-xl font-bold text-center text-white transition-all shadow-md mt-1 ${
                carregando
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#F9A814] hover:bg-[#e0940f] active:scale-[0.98]'
              }`}
            >
              {carregando ? 'Redefinindo...' : 'Redefinir senha'}
            </button>

            <Link to="/login" className="text-[#3B44A8] text-xs font-semibold hover:underline">
              Voltar para o login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
