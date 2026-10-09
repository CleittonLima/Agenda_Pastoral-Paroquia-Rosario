import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { supabase } from '../supabase/config';
import { buscarTudoAdmin } from '../api/api';

const DADOS_VAZIOS = {
  igrejas: [],
  horarios: [],
  avisos: [],
  eventos: [],
  pix: {},
  config: {},
};

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);

  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [dados, setDados] = useState(DADOS_VAZIOS);
  const [carregando, setCarregando] = useState(false);

  // ==========================================================
  // BUSCAR PERFIL DO USUÁRIO
  // ==========================================================
  async function carregarPerfil(user) {
    if (!user) {
      setPerfil(null);
      return null;
    }

    const { data, error } = await supabase
      .from('perfis_admin')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error(
        'Erro ao buscar perfil administrativo:',
        error
      );

      setPerfil(null);
      return null;
    }

    if (!data) {
      console.error(
        'Usuário autenticado não possui perfil administrativo.'
      );

      setPerfil(null);
      return null;
    }

    if (!data.ativo) {
      console.error('Usuário administrativo está inativo.');

      setPerfil(null);
      return null;
    }

    setPerfil(data);

    return data;
  }

  // ==========================================================
  // CARREGAR DADOS
  // ==========================================================
  const carregarDados = useCallback(async () => {
    setCarregando(true);

    try {
      const resposta = await buscarTudoAdmin();

      if (resposta && resposta.ok !== false) {
        setDados({
          igrejas: resposta.igrejas || [],
          horarios: resposta.horarios || [],
          avisos: resposta.avisos || [],
          eventos: resposta.eventos || [],
          pix: resposta.pix || {},
          config: resposta.config || {},
        });
      }
    } catch (erro) {
      console.error(
        'Erro ao carregar dados administrativos:',
        erro
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  // ==========================================================
  // VERIFICAR SESSÃO AO ABRIR O APP
  // ==========================================================
  useEffect(() => {
    let montado = true;

    async function verificarSessao() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!montado) return;

        if (session?.user) {
          const perfilEncontrado = await carregarPerfil(
            session.user
          );

          if (perfilEncontrado) {
            setUsuario(session.user);

            await carregarDados();
          } else {
            await supabase.auth.signOut();
          }
        }
      } catch (erro) {
        console.error(
          'Erro ao verificar sessão:',
          erro
        );
      } finally {
        if (montado) {
          setVerificandoSessao(false);
        }
      }
    }

    verificarSessao();

    return () => {
      montado = false;
    };
  }, [carregarDados]);

  // ==========================================================
  // ENTRAR
  // ==========================================================
  async function entrar(email, senhaDigitada) {
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: String(email || '').trim(),
          password: senhaDigitada,
        });

      if (error) {
        console.error('Erro no login:', error);

        return {
          ok: false,
          erro: 'E-mail ou senha incorretos.',
        };
      }

      if (!data?.user) {
        return {
          ok: false,
          erro: 'Não foi possível identificar o usuário.',
        };
      }

      const perfilEncontrado = await carregarPerfil(
        data.user
      );

      if (!perfilEncontrado) {
        await supabase.auth.signOut();

        return {
          ok: false,
          erro:
            'Este usuário não possui acesso ao painel administrativo.',
        };
      }

      setUsuario(data.user);

      await carregarDados();

      return {
        ok: true,
        perfil: perfilEncontrado,
      };
    } catch (erro) {
      console.error(
        'Erro inesperado no login:',
        erro
      );

      return {
        ok: false,
        erro: 'Não foi possível realizar o login.',
      };
    }
  }

  // ==========================================================
  // SAIR
  // ==========================================================
  async function sair() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao sair da conta:', error);
      }
    } catch (erro) {
      console.error(
        'Erro inesperado ao sair da conta:',
        erro
      );
    } finally {
      setUsuario(null);
      setPerfil(null);
      setDados(DADOS_VAZIOS);
    }
  }

  // ==========================================================
  // NOME DA IGREJA PELO ID
  // ==========================================================
  function nomeIgrejaPorId(id) {
    const igreja = dados.igrejas.find(
      item => item.ID === id
    );

    return igreja ? igreja.Nome : '—';
  }

  // ==========================================================
  // CONTEXTO
  // ==========================================================
  return (
    <AdminContext.Provider
      value={{
        // Usuário autenticado
        usuario,

        // Perfil administrativo
        perfil,

        // Informações úteis diretamente no contexto
        nomeUsuario: perfil?.nome || '',
        cargo: perfil?.cargo || '',

        // Mantido temporariamente para compatibilidade
        // com as telas administrativas antigas.
        // Não contém a senha do usuário.
        senha: null,

        logado: !!usuario && !!perfil,
        verificandoSessao,

        dados,
        carregando,

        entrar,
        sair,

        recarregar: () => carregarDados(),

        nomeIgrejaPorId,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);

  if (!ctx) {
    throw new Error(
      'useAdmin deve ser usado dentro de AdminProvider'
    );
  }

  return ctx;
}