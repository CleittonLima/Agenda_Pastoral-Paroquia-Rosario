import { createClient } from "@supabase/supabase-js";

const CARGOS = [
  "PADRE",
  "PASCOM",
  "COORDENADOR",
  "PROGRAMADOR",
] as const;

type Cargo = (typeof CARGOS)[number];

const CABECALHOS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function resposta(
  dados: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(dados), {
    status,
    headers: CABECALHOS,
  });
}

Deno.serve(async (req: Request) => {
  // Tratamento CORS para requisições do navegador.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: CABECALHOS,
    });
  }

  // Aceita somente POST para as operações administrativas.
  if (req.method !== "POST") {
    return resposta(
      { erro: "Método não permitido." },
      405,
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get(
      "SERVICE_ROLE_KEY",
    );

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey
    ) {
      console.error("Configuração do Supabase incompleta.");

      return resposta(
        { erro: "Configuração interna incompleta." },
        500,
      );
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return resposta(
        { erro: "Não autenticado." },
        401,
      );
    }

    // Cliente que valida a sessão do usuário solicitante.
    const supabaseUsuario = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const {
      data: { user },
      error: erroUsuario,
    } = await supabaseUsuario.auth.getUser();

    if (erroUsuario || !user) {
      return resposta(
        { erro: "Sessão inválida ou expirada." },
        401,
      );
    }

    // Cliente administrativo: utilizado somente no servidor.
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    // Verifica se o solicitante é um PROGRAMADOR ativo.
    const {
      data: perfilSolicitante,
      error: erroPerfil,
    } = await supabaseAdmin
      .from("perfis_admin")
      .select("id, nome, cargo, ativo")
      .eq("id", user.id)
      .maybeSingle();

    if (
      erroPerfil ||
      !perfilSolicitante ||
      !perfilSolicitante.ativo ||
      perfilSolicitante.cargo !== "PROGRAMADOR"
    ) {
      return resposta(
        {
          erro:
            "Acesso negado. Somente um PROGRAMADOR ativo pode gerenciar usuários.",
        },
        403,
      );
    }

    const corpo = await req.json();
    const acao = corpo?.acao;

    // ==========================================
    // LISTAR USUÁRIOS
    // ==========================================
    if (acao === "listar") {
      const {
        data: perfis,
        error: erroLista,
      } = await supabaseAdmin
        .from("perfis_admin")
        .select(
          "id, nome, cargo, ativo, criado_em, atualizado_em",
        )
        .order("nome");

      if (erroLista) {
        return resposta(
          { erro: erroLista.message },
          500,
        );
      }

      const {
        data: resultadoAuth,
        error: erroAuth,
      } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (erroAuth) {
        return resposta(
          { erro: erroAuth.message },
          500,
        );
      }

      const emails = new Map(
        resultadoAuth.users.map((usuario) => [
          usuario.id,
          usuario.email ?? "",
        ]),
      );

      const usuarios = (perfis ?? []).map((perfil) => ({
        ...perfil,
        email: emails.get(perfil.id) ?? "",
      }));

      return resposta({ usuarios });
    }

    // ==========================================
    // CRIAR USUÁRIO
    // ==========================================
    if (acao === "criar") {
      const nome = String(corpo.nome ?? "").trim();
      const email = String(corpo.email ?? "")
        .trim()
        .toLowerCase();
      const senha = String(corpo.senha ?? "");
      const cargo = corpo.cargo as Cargo;

      if (!nome || !email || !senha || !cargo) {
        return resposta(
          {
            erro:
              "Preencha nome, e-mail, senha e cargo.",
          },
          400,
        );
      }

      if (senha.length < 8) {
        return resposta(
          {
            erro:
              "A senha precisa ter pelo menos 8 caracteres.",
          },
          400,
        );
      }

      if (!CARGOS.includes(cargo)) {
        return resposta(
          { erro: "Cargo inválido." },
          400,
        );
      }

      const {
        data: novoUsuario,
        error: erroCriacao,
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome },
      });

      if (erroCriacao || !novoUsuario.user) {
        return resposta(
          {
            erro:
              erroCriacao?.message ??
              "Não foi possível criar o usuário.",
          },
          400,
        );
      }

      const {
        data: novoPerfil,
        error: erroCriarPerfil,
      } = await supabaseAdmin
        .from("perfis_admin")
        .insert({
          id: novoUsuario.user.id,
          nome,
          cargo,
          ativo: true,
        })
        .select("id, nome, cargo, ativo, criado_em")
        .single();

      if (erroCriarPerfil || !novoPerfil) {
        // Evita deixar uma conta sem perfil administrativo.
        const {
          error: erroExcluir,
        } = await supabaseAdmin.auth.admin.deleteUser(
          novoUsuario.user.id,
        );

        if (erroExcluir) {
          console.error(
            "Falha ao limpar conta após erro no perfil:",
            erroExcluir.message,
          );
        }

        return resposta(
          {
            erro:
              erroCriarPerfil?.message ??
              "Não foi possível criar o perfil administrativo.",
          },
          500,
        );
      }

      return resposta(
        {
          mensagem: "Usuário criado com sucesso.",
          usuario: {
            ...novoPerfil,
            email,
          },
        },
        201,
      );
    }

    // ==========================================
    // EDITAR NOME E CARGO
    // ==========================================
    if (acao === "atualizar") {
      const id = String(corpo.id ?? "");
      const nome = String(corpo.nome ?? "").trim();
      const cargo = corpo.cargo as Cargo;

      if (!id || !nome || !cargo) {
        return resposta(
          {
            erro:
              "Informe o usuário, o nome e o cargo.",
          },
          400,
        );
      }

      if (id === user.id) {
        return resposta(
          {
            erro:
              "Não é permitido alterar o próprio cargo nesta operação.",
          },
          400,
        );
      }

      if (!CARGOS.includes(cargo)) {
        return resposta(
          { erro: "Cargo inválido." },
          400,
        );
      }

      const {
        data: perfilExistente,
        error: erroConsulta,
      } = await supabaseAdmin
        .from("perfis_admin")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (erroConsulta || !perfilExistente) {
        return resposta(
          { erro: "Usuário não encontrado." },
          404,
        );
      }

      const { error: erroAtualizar } = await supabaseAdmin
        .from("perfis_admin")
        .update({
          nome,
          cargo,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", id);

      if (erroAtualizar) {
        return resposta(
          { erro: erroAtualizar.message },
          500,
        );
      }

      const {
        error: erroMetadata,
      } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          user_metadata: { nome },
        },
      );

      if (erroMetadata) {
        console.error(
          "Não foi possível atualizar os metadados:",
          erroMetadata.message,
        );
      }

      return resposta({
        mensagem: "Usuário atualizado com sucesso.",
      });
    }

    // ==========================================
    // ATIVAR OU DESATIVAR USUÁRIO
    // ==========================================
    if (acao === "alterar_status") {
      const id = String(corpo.id ?? "");
      const ativo = corpo.ativo;

      if (!id || typeof ativo !== "boolean") {
        return resposta(
          {
            erro:
              "Informe o usuário e o novo status.",
          },
          400,
        );
      }

      if (id === user.id && !ativo) {
        return resposta(
          {
            erro:
              "Você não pode desativar a própria conta.",
          },
          400,
        );
      }

      const {
        data: perfilAlvo,
        error: erroConsulta,
      } = await supabaseAdmin
        .from("perfis_admin")
        .select("id, cargo, ativo")
        .eq("id", id)
        .maybeSingle();

      if (erroConsulta || !perfilAlvo) {
        return resposta(
          { erro: "Usuário não encontrado." },
          404,
        );
      }

      // Protege o último PROGRAMADOR ativo.
      if (
        !ativo &&
        perfilAlvo.ativo &&
        perfilAlvo.cargo === "PROGRAMADOR"
      ) {
        const {
          count,
          error: erroContagem,
        } = await supabaseAdmin
          .from("perfis_admin")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("cargo", "PROGRAMADOR")
          .eq("ativo", true);

        if (erroContagem) {
          return resposta(
            { erro: erroContagem.message },
            500,
          );
        }

        if ((count ?? 0) <= 1) {
          return resposta(
            {
              erro:
                "Não é possível desativar o último PROGRAMADOR ativo.",
            },
            400,
          );
        }
      }

      const { error: erroStatus } = await supabaseAdmin
        .from("perfis_admin")
        .update({
          ativo,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", id);

      if (erroStatus) {
        return resposta(
          { erro: erroStatus.message },
          500,
        );
      }

      return resposta({
        mensagem: ativo
          ? "Usuário ativado com sucesso."
          : "Usuário desativado com sucesso.",
      });
    }

    // ==========================================
    // REDEFINIR SENHA DE OUTRO USUÁRIO
    // ==========================================
    if (acao === "redefinir_senha") {
      const id = String(corpo.id ?? "");
      const senha = String(corpo.senha ?? "");

      if (!id || !senha) {
        return resposta(
          {
            erro:
              "Informe o usuário e a nova senha.",
          },
          400,
        );
      }

      if (id === user.id) {
        return resposta(
          {
            erro:
              "Para alterar sua própria senha, utilize a opção de perfil.",
          },
          400,
        );
      }

      if (senha.length < 8) {
        return resposta(
          {
            erro:
              "A senha precisa ter pelo menos 8 caracteres.",
          },
          400,
        );
      }

      const {
        data: perfilAlvo,
        error: erroConsulta,
      } = await supabaseAdmin
        .from("perfis_admin")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (erroConsulta || !perfilAlvo) {
        return resposta(
          { erro: "Usuário não encontrado." },
          404,
        );
      }

      const {
        error: erroSenha,
      } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          password: senha,
        },
      );

      if (erroSenha) {
        return resposta(
          { erro: erroSenha.message },
          400,
        );
      }

      return resposta({
        mensagem: "Senha redefinida com sucesso.",
      });
    }

    // ==========================================
    // AÇÃO DESCONHECIDA
    // ==========================================
    return resposta(
      { erro: "Ação desconhecida." },
      400,
    );
  } catch (erro) {
    console.error(
      "Erro na função gerenciar-usuarios:",
      erro,
    );

    return resposta(
      {
        erro:
          "Ocorreu um erro interno ao processar a solicitação.",
      },
      500,
    );
  }
});