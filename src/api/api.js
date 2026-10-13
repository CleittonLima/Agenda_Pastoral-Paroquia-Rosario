import { supabase } from '../supabase/config';
import { decode } from 'base64-arraybuffer';

// ============================================================
// BUSCAR DADOS PÚBLICOS
// Mantém o mesmo formato que o aplicativo recebia do Apps Script
// ============================================================
export async function buscarTudo() {
  try {
    // ==========================================================
    // IGREJAS
    // ==========================================================
    const { data: igrejasDB, error: igrejasError } = await supabase
      .from('igrejas')
      .select('*')
      .order('ordem', { ascending: true });

    if (igrejasError) throw igrejasError;

    // Apenas igrejas ativas, como acontecia no Apps Script
    const igrejas = (igrejasDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Nome: item.nome,
        Cor: item.cor,
        Logo: item.logo,
        FotoPrincipal: item.foto_principal,
        Galeria: item.galeria,
        Endereco: item.endereco,
        GoogleMaps: item.google_maps,
        WhatsApp: item.whatsapp,
        Instagram: item.instagram,
        Facebook: item.facebook,
        Youtube: item.youtube,
        Ordem: item.ordem,
        Status: item.status,
      }));

    // ==========================================================
    // HORÁRIOS
    // ==========================================================
    const { data: horariosDB, error: horariosError } = await supabase
      .from('horarios')
      .select('*');

    if (horariosError) throw horariosError;

    const horarios = (horariosDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Igreja: item.igreja_id || '',
        Nome: item.nome,
        Tipo: item.tipo,
        Data: item.data,
        Hora: item.hora,
        HoraFim: item.hora_fim,
        Recorrencia: item.recorrencia,
        Observacao: item.observacao,
        Status: item.status,
      }));

    // ==========================================================
    // AVISOS
    // ==========================================================
    const { data: avisosDB, error: avisosError } = await supabase
      .from('avisos')
      .select('*');

    if (avisosError) throw avisosError;

    const avisos = (avisosDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Igreja: item.igreja_id || '',
        Titulo: item.titulo,
        Texto: item.texto,
        Prioridade: item.prioridade,
        Data: item.data,
        Status: item.status,
      }));

    // ==========================================================
    // EVENTOS
    // ==========================================================
    const { data: eventosDB, error: eventosError } = await supabase
      .from('eventos')
      .select('*');

    if (eventosError) throw eventosError;

    const eventos = (eventosDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Igreja: item.igreja_id || '',
        Nome: item.nome,
        Descricao: item.descricao,
        Data: item.data,
        Hora: item.hora,
        HoraFim: item.hora_fim,
        Local: item.local,
        Status: item.status,
      }));

    // ==========================================================
    // PIX
    // ==========================================================
    const { data: pixDB, error: pixError } = await supabase
      .from('pix')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (pixError) throw pixError;

    const pix = pixDB
      ? {
          QRCode: pixDB.qrcode,
          TipoChave: pixDB.tipo_chave,
          Chave: pixDB.chave,
          Favorecido: pixDB.favorecido,
          Banco: pixDB.banco,
          Mensagem: pixDB.mensagem,
          Tutorial: pixDB.tutorial,
        }
      : {};

    // ==========================================================
    // CONFIGURAÇÕES
    // ==========================================================
    const { data: configDB, error: configError } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (configError) throw configError;

    const config = configDB
      ? {
          NomeParoquia: configDB.nome_paroquia,
          LogoPrincipal: configDB.logo_principal,
          ImagemTelaInicial: configDB.imagem_tela_inicial,
          MensagemBoasVindas: configDB.mensagem_boas_vindas || '',
          MensagemRetorno: configDB.mensagem_retorno || '',
          TextoBotaoBoasVindas: configDB.texto_botao_boas_vindas || '',
          TextoBotaoRetorno: configDB.texto_botao_retorno || '',
          FraseRodape: configDB.frase_rodape,
          Telefone: configDB.telefone,
          Email: configDB.email,
          WhatsApp: configDB.whatsapp,
          Instagram: configDB.instagram,
          Facebook: configDB.facebook,
          Youtube: configDB.youtube,
          Site: configDB.site,
          Drive: configDB.drive,
          Endereco: configDB.endereco,
          RedeSocialNome: configDB.rede_social_nome,
          RedeSocialImagem: configDB.rede_social_imagem,

          // Campos usados pelo PDF
          PdfLogo: configDB.pdf_logo,
          PdfTitulo: configDB.pdf_titulo,
          PdfSubtitulo: configDB.pdf_subtitulo,
          PdfInfo: configDB.pdf_info,
        }
      : {};

    // ==========================================================
// PASTORAIS, MOVIMENTOS E GRUPOS
// ==========================================================

const { data: pastoraisDB, error: pastoraisError } = await supabase
  .from('pastorais_movimentos')
  .select('*')
  .eq('status', 'Ativo')
  .order('ordem', { ascending: true })
  .order('nome', { ascending: true });

if (pastoraisError) throw pastoraisError;

const pastoraisMovimentos = (pastoraisDB || []).map(item => ({
  ID: item.id,
  Nome: item.nome || '',
  Categoria: item.categoria || 'Outro',
  CategoriaPersonalizada: item.categoria_personalizada || '',
  Capa: item.capa || '',
  Lema: item.lema || '',
  Galeria: Array.isArray(item.galeria) ? item.galeria : [],
  Sobre: item.sobre || '',
  Atividades: item.atividades || '',
  Objetivo: item.objetivo || '',
  DiasEncontros: item.dias_encontros || '',
  Logo: item.logo || '',
  WhatsApp: item.whatsapp || '',
  TextoBotaoContato: item.texto_botao_contato || '',
  Ordem: item.ordem ?? 0,
  Status: item.status || 'Inativo',
  CreatedAt: item.created_at,
  UpdatedAt: item.updated_at,
}));

    // ==========================================================
    // RETORNO
    // ==========================================================
    return {
      ok: true,
      igrejas,
      horarios,
      avisos,
      eventos,
      pastoraisMovimentos,
      pix,
      config,
    };

  } catch (erro) {
    console.error('Erro ao buscar dados do Supabase:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ============================================================
// BUSCAR DADOS ADMINISTRATIVOS
// Retorna dados ativos e inativos para o painel
// ============================================================
export async function buscarTudoAdmin() {
  try {
    // ==========================================================
    // IGREJAS
    // ==========================================================
    const { data: igrejasDB, error: igrejasError } = await supabase
      .from('igrejas')
      .select('*')
      .order('ordem', { ascending: true });

    if (igrejasError) throw igrejasError;

    const igrejas = (igrejasDB || []).map(item => ({
      ID: item.id,
      Nome: item.nome,
      Cor: item.cor,
      Logo: item.logo,
      FotoPrincipal: item.foto_principal,
      Galeria: item.galeria,
      Endereco: item.endereco,
      GoogleMaps: item.google_maps,
      WhatsApp: item.whatsapp,
      Instagram: item.instagram,
      Facebook: item.facebook,
      Youtube: item.youtube,
      Ordem: item.ordem,
      Status: item.status,
    }));

    // ==========================================================
    // HORÁRIOS
    // ==========================================================
    const { data: horariosDB, error: horariosError } = await supabase
      .from('horarios')
      .select('*');

    if (horariosError) throw horariosError;

    const horarios = (horariosDB || []).map(item => ({
      ID: item.id,
      Igreja: item.igreja_id || '',
      Nome: item.nome,
      Tipo: item.tipo,
      Data: item.data,
      Hora: item.hora,
      HoraFim: item.hora_fim,
      Recorrencia: item.recorrencia,
      Observacao: item.observacao,
      Status: item.status,
    }));

    // ==========================================================
    // AVISOS
    // ==========================================================
    const { data: avisosDB, error: avisosError } = await supabase
      .from('avisos')
      .select('*');

    if (avisosError) throw avisosError;

    const avisos = (avisosDB || []).map(item => ({
      ID: item.id,
      Igreja: item.igreja_id || '',
      Titulo: item.titulo,
      Texto: item.texto,
      Prioridade: item.prioridade,
      Data: item.data,
      Status: item.status,
    }));

    // ==========================================================
    // EVENTOS
    // ==========================================================
    const { data: eventosDB, error: eventosError } = await supabase
      .from('eventos')
      .select('*');

    if (eventosError) throw eventosError;

    const eventos = (eventosDB || []).map(item => ({
      ID: item.id,
      Igreja: item.igreja_id || '',
      Nome: item.nome,
      Descricao: item.descricao,
      Data: item.data,
      Hora: item.hora,
      HoraFim: item.hora_fim,
      Local: item.local,
      Status: item.status,
    }));

    // ==========================================================
    // PIX
    // ==========================================================
    const { data: pixDB, error: pixError } = await supabase
      .from('pix')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (pixError) throw pixError;

    const pix = pixDB
      ? {
          QRCode: pixDB.qrcode,
          TipoChave: pixDB.tipo_chave,
          Chave: pixDB.chave,
          Favorecido: pixDB.favorecido,
          Banco: pixDB.banco,
          Mensagem: pixDB.mensagem,
          Tutorial: pixDB.tutorial,
        }
      : {};

    // ==========================================================
    // CONFIGURAÇÕES
    // ==========================================================
    const { data: configDB, error: configError } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (configError) throw configError;

    const config = configDB
      ? {
          NomeParoquia: configDB.nome_paroquia,
          LogoPrincipal: configDB.logo_principal,
          ImagemTelaInicial: configDB.imagem_tela_inicial,
          MensagemBoasVindas: configDB.mensagem_boas_vindas || '',
          MensagemRetorno: configDB.mensagem_retorno || '',
          TextoBotaoBoasVindas: configDB.texto_botao_boas_vindas || '',
          TextoBotaoRetorno: configDB.texto_botao_retorno || '',
          FraseRodape: configDB.frase_rodape,
          Telefone: configDB.telefone,
          Email: configDB.email,
          WhatsApp: configDB.whatsapp,
          Instagram: configDB.instagram,
          Facebook: configDB.facebook,
          Youtube: configDB.youtube,
          Site: configDB.site,
          Drive: configDB.drive,
          Endereco: configDB.endereco,
          RedeSocialNome: configDB.rede_social_nome,
          RedeSocialImagem: configDB.rede_social_imagem,

          // Campos usados pelo PDF
          PdfLogo: configDB.pdf_logo,
          PdfTitulo: configDB.pdf_titulo,
          PdfSubtitulo: configDB.pdf_subtitulo,
          PdfInfo: configDB.pdf_info,
        }
      : {};
// ==========================================================
// PASTORAIS, MOVIMENTOS E GRUPOS
// O painel administrativo precisa carregar ativos e inativos.
// ==========================================================

const {
  data: pastoraisDB,
  error: pastoraisError,
} = await supabase
  .from('pastorais_movimentos')
  .select('*')
  .order('ordem', { ascending: true })
  .order('nome', { ascending: true });

if (pastoraisError) throw pastoraisError;

const pastoraisMovimentos = (pastoraisDB || []).map(item => ({
  ID: item.id,
  Nome: item.nome || '',
  Categoria: item.categoria || 'Outro',
  CategoriaPersonalizada: item.categoria_personalizada || '',
  Capa: item.capa || '',
  Lema: item.lema || '',
  Galeria: Array.isArray(item.galeria) ? item.galeria : [],
  Sobre: item.sobre || '',
  Atividades: item.atividades || '',
  Objetivo: item.objetivo || '',
  DiasEncontros: item.dias_encontros || '',
  Logo: item.logo || '',
  WhatsApp: item.whatsapp || '',
  TextoBotaoContato: item.texto_botao_contato || '',
  Ordem: item.ordem ?? 0,
  Status: item.status || 'Inativo',
  CreatedAt: item.created_at,
  UpdatedAt: item.updated_at,
}));
    // ==========================================================
    // RETORNO
    // ==========================================================
    return {
      ok: true,
      igrejas,
      horarios,
      avisos,
      eventos,
      pastoraisMovimentos,
      pix,
      config,
    };

  } catch (erro) {
    console.error('Erro ao buscar dados administrativos:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// SALVAR IGREJA
// Cria uma nova igreja ou atualiza uma existente
// ============================================================
export async function salvarIgreja(igreja) {
  try {
    const dados = {
      nome: igreja.Nome || '',
      cor: igreja.Cor || '',
      logo: igreja.Logo || '',
      foto_principal: igreja.FotoPrincipal || '',
      galeria: igreja.Galeria || '',
      endereco: igreja.Endereco || '',
      google_maps: igreja.GoogleMaps || '',
      whatsapp: igreja.WhatsApp || '',
      instagram: igreja.Instagram || '',
      facebook: igreja.Facebook || '',
      youtube: igreja.Youtube || '',
      ordem: igreja.Ordem || 1,
      status: igreja.Status || 'Ativo',
    };

    let resultado;

    // Se já possui ID, atualiza
    if (igreja.ID) {
      // Busca a foto de capa que está atualmente no banco
      const { data: igrejaAtual, error: erroBusca } = await supabase
        .from('igrejas')
        .select('foto_principal')
        .eq('id', igreja.ID)
        .maybeSingle();

      if (erroBusca) {
        throw erroBusca;
      }

      const fotoAntiga = igrejaAtual?.foto_principal || '';
      const fotoNova = dados.foto_principal || '';

      // Atualiza a igreja primeiro
      resultado = await supabase
        .from('igrejas')
        .update(dados)
        .eq('id', igreja.ID);

      if (resultado.error) {
        throw resultado.error;
      }

      // Se a capa realmente mudou, exclui a antiga do Storage
      if (fotoAntiga && fotoAntiga !== fotoNova) {
        const excluida = await excluirImagem(fotoAntiga);

        if (!excluida.ok) {
          console.warn(
            'A igreja foi salva, mas a foto antiga não pôde ser excluída:',
            excluida.erro
          );
        }
      }
    }

    // Se não possui ID, cria uma nova
    else {
      resultado = await supabase
        .from('igrejas')
        .insert(dados);

      if (resultado.error) {
        throw resultado.error;
      }
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao salvar igreja:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// EXCLUIR IGREJA
// ============================================================
export async function excluirIgreja(id) {
  try {
    // Busca as imagens antes de excluir a igreja
    const { data: igreja, error: erroBusca } = await supabase
      .from('igrejas')
      .select('logo, foto_principal, galeria')
      .eq('id', id)
      .maybeSingle();

    if (erroBusca) {
      throw erroBusca;
    }

    if (!igreja) {
      return {
        ok: false,
        erro: 'Igreja não encontrada.',
      };
    }

    // Guarda todas as URLs que precisam ser excluídas
    const imagens = [];

    if (igreja.logo) {
      imagens.push(igreja.logo);
    }

    if (igreja.foto_principal) {
      imagens.push(igreja.foto_principal);
    }

    if (igreja.galeria) {
      const fotosGaleria = String(igreja.galeria)
        .split(',')
        .map(foto => foto.trim())
        .filter(Boolean);

      imagens.push(...fotosGaleria);
    }

    // Remove a igreja do banco
    const { error: erroExclusao } = await supabase
      .from('igrejas')
      .delete()
      .eq('id', id);

    if (erroExclusao) {
      throw erroExclusao;
    }

    // Depois que a igreja foi excluída com sucesso,
    // remove as imagens correspondentes do Storage
    for (const imagem of imagens) {
      const resultado = await excluirImagem(imagem);

      if (!resultado.ok) {
        console.warn(
          'Igreja excluída, mas uma imagem não pôde ser removida:',
          resultado.erro
        );
      }
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao excluir igreja:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// SALVAR HORÁRIO
// Cria um novo horário ou atualiza um existente
// ============================================================
export async function salvarHorario(horario) {
  try {
    const dados = {
      igreja_id: horario.Igreja || null,
      nome: horario.Nome || '',
      tipo: horario.Tipo || '',
      data: horario.Data || null,
      hora: horario.Hora || '',
      hora_fim: horario.HoraFim || '',
      recorrencia: horario.Recorrencia || '',
      observacao: horario.Observacao || '',
      status: horario.Status || 'Ativo',
    };

    let resultado;

    if (horario.ID) {
      resultado = await supabase
        .from('horarios')
        .update(dados)
        .eq('id', horario.ID);
    } else {
      resultado = await supabase
        .from('horarios')
        .insert(dados);
    }

    if (resultado.error) {
      throw resultado.error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao salvar horário:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ============================================================
// EXCLUIR HORÁRIO
// ============================================================
export async function excluirHorario(id) {
  try {
    const { error } = await supabase
      .from('horarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao excluir horário:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// SALVAR AVISO
// Cria um novo aviso ou atualiza um existente
// ============================================================
export async function salvarAviso(aviso) {
  try {
    const dados = {
      igreja_id: aviso.Igreja || null,
      titulo: aviso.Titulo || '',
      texto: aviso.Texto || '',
      prioridade: aviso.Prioridade || 'Normal',
      data: aviso.Data || null,
      status: aviso.Status || 'Ativo',
    };

    let resultado;

    if (aviso.ID) {
      resultado = await supabase
        .from('avisos')
        .update(dados)
        .eq('id', aviso.ID);
    } else {
      resultado = await supabase
        .from('avisos')
        .insert(dados);
    }

    if (resultado.error) {
      throw resultado.error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao salvar aviso:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ============================================================
// EXCLUIR AVISO
// ============================================================
export async function excluirAviso(id) {
  try {
    const { error } = await supabase
      .from('avisos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao excluir aviso:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// SALVAR EVENTO
// Cria um novo evento ou atualiza um existente
// ============================================================
export async function salvarEvento(evento) {
  try {
    const dados = {
      igreja_id: evento.Igreja || null,
      nome: evento.Nome || '',
      descricao: evento.Descricao || '',
      data: evento.Data || null,
      hora: evento.Hora || '',
      hora_fim: evento.HoraFim || '',
      local: evento.Local || '',
      status: evento.Status || 'Ativo',
    };

    let resultado;

    if (evento.ID) {
      resultado = await supabase
        .from('eventos')
        .update(dados)
        .eq('id', evento.ID);
    } else {
      resultado = await supabase
        .from('eventos')
        .insert(dados);
    }

    if (resultado.error) {
      throw resultado.error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao salvar evento:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ============================================================
// EXCLUIR EVENTO
// ============================================================
export async function excluirEvento(id) {
  try {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao excluir evento:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// SALVAR PIX
// Atualiza as configurações de Pix
// ============================================================
export async function salvarPix(pix) {
  try {
    const dados = {
      qrcode: pix.QRCode || '',
      tipo_chave: pix.TipoChave || '',
      chave: pix.Chave || '',
      favorecido: pix.Favorecido || '',
      banco: pix.Banco || '',
      mensagem: pix.Mensagem || '',
      tutorial: pix.Tutorial || '',
    };

    const { error } = await supabase
      .from('pix')
      .upsert(
        {
          id: 1,
          ...dados,
        },
        {
          onConflict: 'id',
        }
      );

    if (error) {
      throw error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao salvar Pix:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// SALVAR CONFIGURAÇÕES
// Atualiza as configurações gerais da paróquia
// ============================================================
export async function salvarConfiguracoes(config) {
  try {
    const dados = {
      nome_paroquia: config.NomeParoquia || '',
      logo_principal: config.LogoPrincipal || '',
      imagem_tela_inicial: config.ImagemTelaInicial || '',
      mensagem_boas_vindas: config.MensagemBoasVindas || '',
      mensagem_retorno: config.MensagemRetorno || '',
      texto_botao_boas_vindas: config.TextoBotaoBoasVindas || '',
      texto_botao_retorno: config.TextoBotaoRetorno || '',
      frase_rodape: config.FraseRodape || '',
      telefone: config.Telefone || '',
      email: config.Email || '',
      whatsapp: config.WhatsApp || '',
      instagram: config.Instagram || '',
      facebook: config.Facebook || '',
      youtube: config.Youtube || '',
      site: config.Site || '',
      drive: config.Drive || '',
      rede_social_nome: config.RedeSocialNome || '',
      rede_social_imagem: config.RedeSocialImagem || '',
      endereco: config.Endereco || '',
      pdf_logo: config.PdfLogo || '',
      pdf_titulo: config.PdfTitulo || '',
      pdf_subtitulo: config.PdfSubtitulo || '',
      pdf_info: config.PdfInfo || '',
    };

    const { error } = await supabase
      .from('configuracoes')
      .upsert(
        {
          id: 1,
          ...dados,
        },
        {
          onConflict: 'id',
        }
      );

    if (error) {
      throw error;
    }

    return {
      ok: true,
    };

  } catch (erro) {
    console.error('Erro ao salvar configurações:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// ENVIAR IMAGEM
// Faz upload da imagem para o Supabase Storage
// ============================================================
export async function enviarImagem(
  uri,
  fileName,
  mimeType,
  base64
) {
  try {
    if (!base64) {
      return {
        ok: false,
        erro: 'A imagem não possui dados para upload.',
      };
    }

    // Gera um nome único para evitar conflito entre arquivos
    const extensao =
      fileName?.includes('.')
        ? fileName.split('.').pop()
        : 'jpg';

    const nomeArquivo =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${extensao}`;

    // Faz o upload para o bucket "imagens"
    const { error } = await supabase.storage
      .from('imagens')
      .upload(nomeArquivo, decode(base64), {
        contentType: mimeType || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Obtém a URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('imagens')
      .getPublicUrl(nomeArquivo);

    return {
      ok: true,
      url: urlData.publicUrl,
      nomeArquivo,
    };

  } catch (erro) {
    console.error('Erro ao enviar imagem:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

export async function excluirImagem(url) {
  try {
    if (!url) {
      return { ok: true };
    }

    const marcador = '/storage/v1/object/public/imagens/';
    const indice = String(url).indexOf(marcador);

    if (indice === -1) {
      return {
        ok: false,
        erro: 'Não foi possível identificar o arquivo da imagem.',
      };
    }

    const caminho = decodeURIComponent(
      String(url)
        .substring(indice + marcador.length)
        .split('?')[0]
    );

    const { data, error } = await supabase.storage
      .from('imagens')
      .remove([caminho]);

    if (error) throw error;

    return { ok: true };
  } catch (erro) {
    console.error('Erro ao excluir imagem:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ==========================================================
// GERENCIAMENTO DE USUÁRIOS ADMINISTRATIVOS
// ==========================================================

export async function gerenciarUsuarios(acao, dados = {}) {
  try {
    const { data, error } = await supabase.functions.invoke(
      'gerenciar-usuarios',
      {
        body: {
          acao,
          ...dados,
        },
      }
    );

    if (error) {
      console.error(
        'Erro ao chamar gerenciar-usuarios:',
        error
      );

      return {
        ok: false,
        erro: error.message || 'Não foi possível executar a operação.',
      };
    }

    if (data?.erro) {
      return {
        ok: false,
        erro: data.erro,
      };
    }

    return {
      ok: true,
      ...data,
    };
  } catch (erro) {
    console.error(
      'Erro inesperado no gerenciamento de usuários:',
      erro
    );

    return {
      ok: false,
      erro: 'Não foi possível se comunicar com o servidor.',
    };
  }
}

// ==========================================================
// ORAÇÕES E TERÇOS
// Busca os conteúdos cadastrados no Supabase
// ==========================================================

export async function buscarOracoesETercos(apenasAtivos = true) {
  try {
    // ========================================================
    // ORAÇÕES
    // ========================================================

    let consultaOracoes = supabase
      .from('oracoes')
      .select('*')
      .order('ordem', { ascending: true });

    if (apenasAtivos) {
      consultaOracoes = consultaOracoes.eq('status', 'Ativo');
    }

    const {
      data: oracoesDB,
      error: erroOracoes,
    } = await consultaOracoes;

    if (erroOracoes) {
      throw erroOracoes;
    }

    const oracoes = (oracoesDB || []).map(item => ({
      id: item.id,
      nome: item.titulo,
      titulo: item.titulo,
      categoria: item.categoria || 'Oração',
      descricao: item.descricao || '',
      texto: item.texto || '',
      imagem: item.imagem || '',
      ordem: item.ordem || 1,
      status: item.status,
      origem: 'supabase',
    }));

    // ========================================================
    // TERÇOS
    // ========================================================

    let consultaTercos = supabase
      .from('tercos')
      .select('*')
      .order('ordem', { ascending: true });

    if (apenasAtivos) {
      consultaTercos = consultaTercos.eq('status', 'Ativo');
    }

    const {
      data: tercosDB,
      error: erroTercos,
    } = await consultaTercos;

    if (erroTercos) {
      throw erroTercos;
    }

    const tercos = (tercosDB || []).map(item => ({
      id: item.id,
      nome: item.titulo,
      titulo: item.titulo,
      descricao: item.descricao || '',
      imagem: item.imagem || '',
      partes: Array.isArray(item.partes)
        ? item.partes
        : [],
      conclusao: item.conclusao || '',
      ordem: item.ordem || 1,
      status: item.status,
      origem: 'supabase',
    }));

    // ========================================================
    // RETORNO
    // ========================================================

    return {
      ok: true,
      oracoes,
      tercos,
    };
  } catch (erro) {
    console.error('Erro ao buscar orações e terços:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
      oracoes: [],
      tercos: [],
    };
  }
}

// ==========================================================
// SALVAR ORAÇÃO
// Cadastra uma nova oração ou atualiza uma existente
// ==========================================================

export async function salvarOracao(oracao) {
  try {
    const dados = {
      titulo: oracao.titulo || oracao.nome || '',
      categoria: oracao.categoria || 'Oração',
      descricao: oracao.descricao || '',
      texto: oracao.texto || '',
      imagem: oracao.imagem || '',
      ordem: Number(oracao.ordem) || 1,
      status: oracao.status || 'Ativo',
      updated_at: new Date().toISOString(),
    };

    let resultado;

    if (oracao.id) {
      resultado = await supabase
        .from('oracoes')
        .update(dados)
        .eq('id', oracao.id);
    } else {
      resultado = await supabase
        .from('oracoes')
        .insert(dados);
    }

    if (resultado.error) {
      throw resultado.error;
    }

    return { ok: true };
  } catch (erro) {
    console.error('Erro ao salvar oração:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ==========================================================
// EXCLUIR ORAÇÃO
// ==========================================================

export async function excluirOracao(id) {
  try {
    const { error } = await supabase
      .from('oracoes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { ok: true };
  } catch (erro) {
    console.error('Erro ao excluir oração:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ==========================================================
// SALVAR TERÇO
// Cadastra um novo terço ou atualiza um existente
// ==========================================================

export async function salvarTerco(terco) {
  try {
    const dados = {
      titulo: terco.titulo || terco.nome || '',
      descricao: terco.descricao || '',
      imagem: terco.imagem || '',
      partes: Array.isArray(terco.partes)
        ? terco.partes
        : [],
      conclusao: terco.conclusao || '',
      ordem: Number(terco.ordem) || 1,
      status: terco.status || 'Ativo',
      updated_at: new Date().toISOString(),
    };

    let resultado;

    if (terco.id) {
      resultado = await supabase
        .from('tercos')
        .update(dados)
        .eq('id', terco.id);
    } else {
      resultado = await supabase
        .from('tercos')
        .insert(dados);
    }

    if (resultado.error) {
      throw resultado.error;
    }

    return { ok: true };
  } catch (erro) {
    console.error('Erro ao salvar terço:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ==========================================================
// EXCLUIR TERÇO
// ==========================================================

export async function excluirTerco(id) {
  try {
    const { error } = await supabase
      .from('tercos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { ok: true };
  } catch (erro) {
    console.error('Erro ao excluir terço:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}

// ============================================================
// PASTORAIS, MOVIMENTOS E GRUPOS
// ============================================================

// ------------------------------------------------------------
// BUSCAR REGISTROS
// Por padrão, retorna somente os publicados.
// Com false, busca também os inativos, conforme as permissões.
// ------------------------------------------------------------

export async function buscarPastoraisMovimentos(apenasAtivos = true) {
  try {
    let consulta = supabase
      .from('pastorais_movimentos')
      .select('*')
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true });

    if (apenasAtivos) {
      consulta = consulta.eq('status', 'Ativo');
    }

    const { data, error } = await consulta;

    if (error) throw error;

    const registros = (data || []).map(item => ({
      id: item.id,
      nome: item.nome || '',
      categoria: item.categoria || 'Outro',
      categoriaPersonalizada: item.categoria_personalizada || '',
      capa: item.capa || '',
      lema: item.lema || '',
      galeria: Array.isArray(item.galeria) ? item.galeria : [],
      sobre: item.sobre || '',
      atividades: item.atividades || '',
      objetivo: item.objetivo || '',
      diasEncontros: item.dias_encontros || '',
      logo: item.logo || '',
      whatsapp: item.whatsapp || '',
      textoBotaoContato: item.texto_botao_contato || '',
      ordem: item.ordem ?? 0,
      status: item.status || 'Inativo',
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return {
      ok: true,
      registros,
    };
  } catch (erro) {
    console.error('Erro ao buscar pastorais e movimentos:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
      registros: [],
    };
  }
}


// ------------------------------------------------------------
// SALVAR REGISTRO
// Cadastra um novo registro ou atualiza um existente.
// As imagens são armazenadas no Supabase Storage.
// ------------------------------------------------------------

export async function salvarPastoralMovimento(registro) {
  try {
    const dados = {
      nome: (registro.Nome ?? registro.nome ?? '').trim(),

      categoria:
        registro.Categoria ??
        registro.categoria ??
        'Outro',

      categoria_personalizada:
        (registro.Categoria ?? registro.categoria) === 'Outro'
          ? (
              registro.CategoriaPersonalizada ??
              registro.categoriaPersonalizada ??
              ''
            ).trim() || null
          : null,

      capa: registro.Capa ?? registro.capa ?? null,

      lema: (
        registro.Lema ??
        registro.lema ??
        ''
      ).trim() || null,

      galeria:
        registro.Galeria ??
        registro.galeria ??
        [],

      sobre: (
        registro.Sobre ??
        registro.sobre ??
        ''
      ).trim() || null,

      atividades: (
        registro.Atividades ??
        registro.atividades ??
        ''
      ).trim() || null,

      objetivo: (
        registro.Objetivo ??
        registro.objetivo ??
        ''
      ).trim() || null,

      dias_encontros: (
        registro.DiasEncontros ??
        registro.diasEncontros ??
        ''
      ).trim() || null,

      logo: registro.Logo ?? registro.logo ?? null,

      whatsapp: (
        registro.WhatsApp ??
        registro.whatsapp ??
        ''
      ).trim() || null,

      texto_botao_contato: (
        registro.TextoBotaoContato ??
        registro.textoBotaoContato ??
        ''
      ).trim() || null,

      ordem: Number(
        registro.Ordem ??
        registro.ordem ??
        0
      ) || 0,

      status:
        registro.Status ??
        registro.status ??
        'Inativo',

      updated_at: new Date().toISOString(),
    };

    if (!dados.nome) {
      return {
        ok: false,
        erro: 'Informe o nome da pastoral, movimento ou grupo.',
      };
    }

    const id = registro.ID ?? registro.id;

    let resultado;

    if (id) {
      resultado = await supabase
        .from('pastorais_movimentos')
        .update(dados)
        .eq('id', id);
    } else {
      resultado = await supabase
        .from('pastorais_movimentos')
        .insert(dados);
    }

    if (resultado.error) {
      throw resultado.error;
    }

    return { ok: true };
  } catch (erro) {
    console.error(
      'Erro ao salvar pastoral ou movimento:',
      erro
    );

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}


// ------------------------------------------------------------
// EXCLUIR REGISTRO E SUAS IMAGENS
// Remove o registro do banco e depois tenta remover as imagens
// próprias desse registro do Storage.
// ------------------------------------------------------------

export async function excluirPastoralMovimento(id) {
  try {
    if (!id) {
      return {
        ok: false,
        erro: 'Registro não informado.',
      };
    }

    // 1. Buscar as imagens antes da exclusão
    const { data: registro, error: erroBusca } = await supabase
      .from('pastorais_movimentos')
      .select('capa, logo, galeria')
      .eq('id', id)
      .maybeSingle();

    if (erroBusca) throw erroBusca;

    if (!registro) {
      return {
        ok: false,
        erro: 'Pastoral, movimento ou grupo não encontrado.',
      };
    }

    // 2. Reunir todas as imagens do registro
    const imagens = [
      registro.capa,
      registro.logo,
      ...(Array.isArray(registro.galeria) ? registro.galeria : []),
    ].filter(Boolean);

    // 3. Excluir o registro do banco de dados
    const { error: erroExclusao } = await supabase
      .from('pastorais_movimentos')
      .delete()
      .eq('id', id);

    if (erroExclusao) throw erroExclusao;

    // 4. Remover as imagens do Storage
    // Evita tentar excluir a mesma imagem mais de uma vez.
    const imagensUnicas = [...new Set(imagens)];

    for (const imagem of imagensUnicas) {
      const resultado = await excluirImagem(imagem);

      if (!resultado.ok) {
        console.warn(
          'Registro excluído, mas uma imagem não pôde ser removida:',
          resultado.erro
        );
      }
    }

    return { ok: true };
  } catch (erro) {
    console.error('Erro ao excluir pastoral ou movimento:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}