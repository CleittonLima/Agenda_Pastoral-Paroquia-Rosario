import { supabase } from './supabase/config';

export async function testarHistorico() {
  try {
    // Verifica a sessão do administrador
    const {
      data: { session },
      error: erroSessao,
    } = await supabase.auth.getSession();

    if (erroSessao) {
      console.error('Erro ao verificar sessão:', erroSessao.message);
      return;
    }

    if (!session) {
      console.log('Nenhum administrador autenticado.');
      return;
    }

    console.log('Sessão autenticada:', session.user.id);

    // Testa o registro no histórico
    const { data, error } = await supabase.functions.invoke(
      'registrar-historico',
      {
        body: {
          acao: 'CRIAR',
          entidade: 'EVENTO',
          descricao: 'Teste do registro de histórico',
          detalhes: {
            origem: 'teste_manual',
          },
        },
      }
    );

    if (error) {
      console.error('Erro ao chamar a função:', error.message);
      return;
    }

    console.log('Resposta da função:', data);
  } catch (erro) {
    console.error('Erro inesperado:', erro);
  }
}