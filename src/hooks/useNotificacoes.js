import { useState, useEffect, useCallback } from 'react';
import api from '../Services/api';

// Contador de notificações não lidas — alimenta o badge vermelho do sino
// nas telas de aluno, professor e recepção.
//
// Faz um poll leve (padrão: 60s) porque o backend não tem WebSocket. Se um
// dia tiver, é só trocar o setInterval por uma subscrição aqui, sem mexer
// nas telas que usam o hook.
export function useContagemNaoLidas({ intervaloMs = 60000 } = {}) {
  const [total, setTotal] = useState(0);

  const buscar = useCallback(async () => {
    try {
      const { data } = await api.get('/notificacoes/nao-lidas');
      setTotal(data?.total ?? 0);
    } catch {
      // Silencioso de propósito: o badge é acessório e não deve poluir o
      // console nem quebrar a tela se a requisição falhar.
      setTotal(0);
    }
  }, []);

  useEffect(() => {
    buscar();
    if (!intervaloMs) return undefined;

    const id = setInterval(buscar, intervaloMs);

    // Além do poll, revalida quando a pessoa volta pra aba/tela. Sem isso o
    // badge podia ficar até um minuto desatualizado logo depois de uma ação
    // que gera notificação, dando a impressão de que nada aconteceu.
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') buscar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    window.addEventListener('focus', buscar);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', aoVoltar);
      window.removeEventListener('focus', buscar);
    };
  }, [buscar, intervaloMs]);

  return { total, recarregar: buscar };
}

// Lista completa de notificações do usuário logado, com as ações de
// marcar como lida e apagar.
export function useNotificacoes({ apenasNaoLidas = false } = {}) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get('/notificacoes', {
        params: apenasNaoLidas ? { naoLidas: 'true' } : {},
      });
      setNotificacoes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setErro('Não foi possível carregar as notificações.');
      setNotificacoes([]);
    } finally {
      setCarregando(false);
    }
  }, [apenasNaoLidas]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const marcarComoLida = useCallback(async (id) => {
    // Atualiza a tela na hora e só depois confirma com o servidor —
    // se falhar, recarrega pra voltar ao estado real.
    setNotificacoes((atuais) =>
      atuais.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    try {
      await api.patch(`/notificacoes/${id}/lida`);
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      carregar();
    }
  }, [carregar]);

  const marcarTodasComoLidas = useCallback(async () => {
    setNotificacoes((atuais) => atuais.map((n) => ({ ...n, lida: true })));
    try {
      await api.patch('/notificacoes/marcar-todas-lidas');
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
      carregar();
    }
  }, [carregar]);

  const remover = useCallback(async (id) => {
    const anteriores = notificacoes;
    setNotificacoes((atuais) => atuais.filter((n) => n.id !== id));
    try {
      await api.delete(`/notificacoes/${id}`);
    } catch (err) {
      console.error('Erro ao remover notificação:', err);
      setNotificacoes(anteriores);
    }
  }, [notificacoes]);

  return {
    notificacoes,
    carregando,
    erro,
    recarregar: carregar,
    marcarComoLida,
    marcarTodasComoLidas,
    remover,
  };
}
