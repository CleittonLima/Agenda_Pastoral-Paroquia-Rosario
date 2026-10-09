import { supabase } from '../supabase/config';

export async function registrarHistorico({
  acao,
  entidade,
  descricao,
  detalhes = {},
}) {
  try {
    const {
      data: { session },
      error: erroSessao,
    } = await supabase.auth.getSession();

    if (erroSessao) {
      console.error(
        'Erro ao verificar sessão para o histórico:',
        erroSessao.message
      );

      return { ok: false };
    }

    if (!session) {
      console.warn(
        'Histórico não registrado: nenhum administrador autenticado.'
      );

      return { ok: false };
    }

    const { data, error } = await supabase.functions.invoke(
      'registrar-historico',
      {
        body: {
          acao,
          entidade,
          descricao,
          detalhes,
        },
      }
    );

    if (error) {
      console.error(
        'Erro ao registrar histórico:',
        error.message
      );

      return { ok: false };
    }

    if (!data?.ok) {
      console.error(
        'A função não confirmou o registro do histórico:',
        data
      );

      return { ok: false };
    }

    return { ok: true };
  } catch (erro) {
    console.error(
      'Erro inesperado ao registrar histórico:',
      erro
    );

    return { ok: false };
  }
}