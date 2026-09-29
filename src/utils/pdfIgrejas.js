// ============================================================
// PDF DAS IGREJAS (Configurações → Baixar PDF)
// Monta um HTML formal (uma folha por igreja, com o timbre da paróquia
// no topo) e converte em PDF com o expo-print.
//   - Celular: gera o arquivo .pdf, que pode ser salvo no aparelho ou
//     compartilhado (WhatsApp, Drive, e-mail...).
//   - Navegador: abre a janela de impressão, onde dá para escolher
//     "Salvar como PDF".
// O logo e o cabeçalho são configurados no Painel ADM → PDF para os fiéis.
// ============================================================
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Directory, Paths } from 'expo-file-system';
import { formatarDataBR, calcularDiaSemana, formatarDataLocalISO } from './datas';
import { urlImagemOtimizada } from './imagens';

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Mesma ordem dos tipos cadastrados no Painel ADM → Horários.
// As Missas vêm sempre primeiro.
const ORDEM_TIPOS = ['Missa', 'Confissão', 'Adoração', 'Batismo', 'Crisma', 'Novena', 'Terço', 'Celebração', 'Reunião', 'Outro'];
const TITULO_TIPO = {
  Missa: 'Santas Missas',
  'Confissão': 'Confissões',
  'Adoração': 'Adoração ao Santíssimo',
  Batismo: 'Batismos',
  Crisma: 'Crismas',
  Novena: 'Novenas',
  'Terço': 'Terços',
  'Celebração': 'Celebrações',
  'Reunião': 'Reuniões',
  Outro: 'Outras atividades',
};

// Tamanho A4 em pontos (72 por polegada)
const A4 = { largura: 595, altura: 842 };

// ------------------------------------------------------------
// Auxiliares de texto
// ------------------------------------------------------------
function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function comQuebras(texto) {
  return esc(texto).replace(/\r?\n/g, '<br>');
}

function dataPorExtenso(data = new Date()) {
  return `${data.getDate()} de ${MESES[data.getMonth()]} de ${data.getFullYear()}`;
}

function corValida(cor, padrao = '#7A1F2B') {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(cor || '').trim()) ? String(cor).trim() : padrao;
}

function semAcentos(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function nomeArquivoPdf(igrejas) {
  const data = formatarDataLocalISO(new Date());
  if (igrejas.length === 1) {
    const nome = semAcentos(igrejas[0].nome).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    return `Programacao-${nome || 'Igreja'}-${data}.pdf`;
  }
  return `Programacao-Paroquia-Rosario-${data}.pdf`;
}

// ------------------------------------------------------------
// Logo em Base64 (o PDF precisa da imagem embutida — no iOS, imagens
// externas nem sempre aparecem no arquivo gerado)
// ------------------------------------------------------------
async function carregarImagemBase64(url) {
  const endereco = urlImagemOtimizada(url, 400);
  if (!endereco) return null;
  const controle = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const limite = setTimeout(() => controle && controle.abort(), 12000);
  try {
    const resposta = await fetch(endereco, controle ? { signal: controle.signal } : undefined);
    if (!resposta.ok) return null;
    const blob = await resposta.blob();
    const dataUri = await new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onloadend = () => resolver(leitor.result);
      leitor.onerror = rejeitar;
      leitor.readAsDataURL(blob);
    });
    if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) return null;
    // Alguns servidores não informam o tipo — garante um tipo de imagem
    return dataUri.startsWith('data:image/') ? dataUri : dataUri.replace(/^data:[^;,]*/, 'data:image/png');
  } catch (_) {
    return null; // sem internet: o PDF sai sem o logo, mas sai
  } finally {
    clearTimeout(limite);
  }
}

// ------------------------------------------------------------
// Organização dos dados de cada igreja
// ------------------------------------------------------------
function indiceDia(nomeDia) {
  const i = DIAS_SEMANA.indexOf(nomeDia);
  return i === -1 ? 7 : i;
}

function indiceTipo(tipo) {
  const i = ORDEM_TIPOS.indexOf(tipo);
  return i === -1 ? ORDEM_TIPOS.length : i;
}

function agruparHorariosPorTipo(horarios) {
  const grupos = {};
  horarios.forEach(h => {
    const tipo = String(h.tipo || '').trim() || 'Outro';
    (grupos[tipo] = grupos[tipo] || []).push(h);
  });
  return Object.keys(grupos)
    .sort((a, b) => indiceTipo(a) - indiceTipo(b) || a.localeCompare(b, 'pt-BR'))
    .map(tipo => ({
      tipo,
      titulo: TITULO_TIPO[tipo] || tipo,
      itens: grupos[tipo].sort((a, b) => (
        indiceDia(a.diaSemana) - indiceDia(b.diaSemana)
        || String(a.horario).localeCompare(String(b.horario))
      )),
    }));
}

// ------------------------------------------------------------
// HTML
// ------------------------------------------------------------
function htmlTimbre(cabecalho) {
  return `
    <header class="timbre">
      ${cabecalho.logo
        ? `<img class="timbre-logo" src="${cabecalho.logo}" alt="">`
        : '<div class="timbre-cruz">✝</div>'}
      <div class="timbre-titulo">${esc(cabecalho.titulo)}</div>
      ${cabecalho.subtitulo ? `<div class="timbre-subtitulo">${esc(cabecalho.subtitulo)}</div>` : ''}
      ${cabecalho.info ? `<div class="timbre-info">${comQuebras(cabecalho.info)}</div>` : ''}
      <div class="filete"><span></span></div>
    </header>`;
}

function htmlHorarios(horarios) {
  if (!horarios.length) {
    return '<p class="vazio">Nenhum horário cadastrado para esta igreja.</p>';
  }
  return agruparHorariosPorTipo(horarios).map(grupo => `
    <div class="grupo">
      <h3>${esc(grupo.titulo)}</h3>
      <table>
        <thead>
          <tr>
            <th class="c-dia">Dia</th>
            <th class="c-hora">Horário</th>
            <th>Celebração</th>
            <th class="c-freq">Frequência</th>
          </tr>
        </thead>
        <tbody>
          ${grupo.itens.map(h => `
            <tr>
              <td class="c-dia">${esc(h.diaSemana || '—')}</td>
              <td class="c-hora">${esc(h.horario || '—')}</td>
              <td>
                <strong>${esc(h.nome || h.tipo)}</strong>
                ${h.descricao ? `<div class="obs">${comQuebras(h.descricao)}</div>` : ''}
              </td>
              <td class="c-freq">${esc(h.recorrencia || '—')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`).join('');
}

function htmlAvisos(avisos) {
  if (!avisos.length) return '<p class="vazio">Nenhum aviso no momento.</p>';
  return avisos.map(a => {
    const prioridade = String(a.prioridade || 'Normal');
    const classe = prioridade === 'Urgente' ? 'urgente' : prioridade === 'Importante' ? 'importante' : '';
    return `
      <div class="aviso ${classe}">
        <div class="aviso-topo">
          <span class="aviso-titulo">${esc(a.titulo)}</span>
          ${classe ? `<span class="selo ${classe}">${esc(prioridade)}</span>` : ''}
        </div>
        ${a.data ? `<div class="aviso-data">${esc(formatarDataBR(a.data))}</div>` : ''}
        ${a.texto ? `<div class="aviso-texto">${comQuebras(a.texto)}</div>` : ''}
      </div>`;
  }).join('');
}

function htmlEventos(eventos) {
  if (!eventos.length) return '<p class="vazio">Nenhum evento programado.</p>';
  return eventos.map(e => {
    const [ano, mes, dia] = String(e.data || '').split('-');
    const temData = ano && mes && dia;
    const detalhes = [
      temData ? `${calcularDiaSemana(e.data)}, ${formatarDataBR(e.data)}` : '',
      e.horario ? esc(e.horario) : '',
      e.local ? esc(e.local) : '',
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');
    return `
      <div class="evento">
        <div class="evento-data">
          ${temData
            ? `<div class="evento-dia">${esc(dia)}</div><div class="evento-mes">${esc(MESES[Number(mes) - 1]?.slice(0, 3) || '')}</div>`
            : '<div class="evento-dia">—</div>'}
        </div>
        <div class="evento-corpo">
          <div class="evento-nome">${esc(e.nome)}</div>
          ${detalhes ? `<div class="evento-detalhes">${detalhes}</div>` : ''}
          ${e.descricao ? `<div class="evento-descricao">${comQuebras(e.descricao)}</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function htmlIgreja(igreja, dados, cabecalho, rodape) {
  const horarios = (dados.horarios || []).filter(h => h.igrejaId === igreja.id);
  const avisos = (dados.avisos || []).filter(a => a.igrejaId === igreja.id);
  const eventos = (dados.eventos || []).filter(e => e.igrejaId === igreja.id);
  const contato = [
    igreja.endereco ? esc(igreja.endereco) : '',
    igreja.whatsapp ? `WhatsApp: ${esc(igreja.whatsapp)}` : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  return `
    <section class="folha" style="--cor-igreja: ${corValida(igreja.cor)}">
      ${htmlTimbre(cabecalho)}
      <div class="igreja">
        <div class="igreja-rotulo">Programação</div>
        <h1 class="igreja-nome">${esc(igreja.nome)}</h1>
        ${contato ? `<div class="igreja-contato">${contato}</div>` : ''}
      </div>

      <h2><span>Horários de Missas e Celebrações</span></h2>
      ${htmlHorarios(horarios)}

      <h2><span>Avisos</span></h2>
      ${htmlAvisos(avisos)}

      <h2><span>Eventos</span></h2>
      ${htmlEventos(eventos)}

      <footer class="rodape">
        ${rodape.frase ? `<div class="rodape-frase">${esc(rodape.frase)}</div>` : ''}
        <div>Documento emitido em ${esc(rodape.emitidoEm)} pelo aplicativo da paróquia.
        Horários e avisos sujeitos a alteração.</div>
      </footer>
    </section>`;
}

const CSS = `
  @page { size: A4; margin: 16mm 15mm 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Helvetica, Arial, sans-serif; color: #2b2320; font-size: 11pt; line-height: 1.4;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .folha + .folha { break-before: page; page-break-before: always; }

  .timbre { text-align: center; margin-bottom: 14px; }
  .timbre-logo { width: 74px; height: 74px; object-fit: contain; display: block; margin: 0 auto 8px; }
  .timbre-cruz { font-size: 34px; color: #7A1F2B; margin-bottom: 4px; }
  .timbre-titulo {
    font-family: Georgia, 'Times New Roman', serif; font-size: 19pt; font-weight: bold;
    color: #7A1F2B; letter-spacing: 0.3px;
  }
  .timbre-subtitulo { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 11.5pt; color: #5a5048; margin-top: 2px; }
  .timbre-info { font-size: 9pt; color: #6b6058; margin-top: 5px; }
  .filete { margin: 12px auto 0; border-top: 2px solid #B98B2E; border-bottom: 1px solid #B98B2E; height: 4px; }

  .igreja { margin: 18px 0 6px; padding: 10px 14px; border-left: 5px solid var(--cor-igreja); background: #FAF7F2; border-radius: 4px; }
  .igreja-rotulo { font-size: 8.5pt; text-transform: uppercase; letter-spacing: 1.5px; color: #8a7d6f; font-weight: bold; }
  .igreja-nome { font-family: Georgia, 'Times New Roman', serif; font-size: 16pt; margin: 2px 0 0; color: #2b2320; }
  .igreja-contato { font-size: 9.5pt; color: #5a5048; margin-top: 3px; }

  h2 {
    font-family: Georgia, 'Times New Roman', serif; font-size: 13pt; color: #7A1F2B;
    margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e3ddd2;
    break-after: avoid; page-break-after: avoid;
  }
  h3 {
    font-size: 9.5pt; text-transform: uppercase; letter-spacing: 1px; color: #B98B2E;
    margin: 12px 0 5px; break-after: avoid; page-break-after: avoid;
  }
  .grupo { break-inside: avoid-page; }

  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  thead { display: table-header-group; }
  th {
    text-align: left; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.6px;
    color: #fff; background: #7A1F2B; padding: 6px 8px;
  }
  td { padding: 6px 8px; border-bottom: 1px solid #ece6dc; vertical-align: top; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  tbody tr:nth-child(even) td { background: #FBF8F3; }
  .c-dia { width: 22%; white-space: nowrap; }
  .c-hora { width: 18%; white-space: nowrap; }
  .c-freq { width: 24%; }
  td.c-hora { font-weight: bold; color: #7A1F2B; }
  td.c-freq { color: #5a5048; }
  .obs { font-size: 9pt; color: #6b6058; margin-top: 2px; }

  .aviso {
    border: 1px solid #e3ddd2; border-left: 4px solid #8a7d6f; border-radius: 4px;
    padding: 8px 12px; margin-bottom: 8px; break-inside: avoid; page-break-inside: avoid;
  }
  .aviso.importante { border-left-color: #B98B2E; }
  .aviso.urgente { border-left-color: #B23A2E; }
  .aviso-topo { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .aviso-titulo { font-weight: bold; font-size: 11pt; }
  .aviso-data { font-size: 9pt; color: #8a7d6f; margin-top: 1px; }
  .aviso-texto { font-size: 10pt; color: #3d3430; margin-top: 4px; }
  .selo { font-size: 7.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; padding: 2px 7px; border-radius: 10px; color: #fff; white-space: nowrap; }
  .selo.importante { background: #B98B2E; }
  .selo.urgente { background: #B23A2E; }

  .evento { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #ece6dc; break-inside: avoid; page-break-inside: avoid; }
  .evento-data {
    flex: 0 0 54px; text-align: center; border: 1px solid #B98B2E; border-radius: 4px;
    padding: 4px 0; align-self: flex-start;
  }
  .evento-dia { font-family: Georgia, 'Times New Roman', serif; font-size: 17pt; font-weight: bold; color: #7A1F2B; line-height: 1.1; }
  .evento-mes { font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: #8a7d6f; }
  .evento-corpo { flex: 1; }
  .evento-nome { font-weight: bold; font-size: 11pt; }
  .evento-detalhes { font-size: 9.5pt; color: #5a5048; margin-top: 1px; }
  .evento-descricao { font-size: 10pt; color: #3d3430; margin-top: 3px; }

  .vazio { font-style: italic; color: #8a7d6f; font-size: 10pt; margin: 4px 0; }

  .rodape {
    margin-top: 24px; padding-top: 8px; border-top: 1px solid #e3ddd2;
    text-align: center; font-size: 8.5pt; color: #8a7d6f;
  }
  .rodape-frase { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 10pt; color: #5a5048; margin-bottom: 3px; }
`;

// Monta o HTML completo do PDF (exportado também para testes/visualização).
export async function montarHtmlPdf(igrejas, dados) {
  const config = dados.config || {};
  const logo = await carregarImagemBase64(config.pdfLogo || config.logoPrincipal);
  const infoPadrao = [config.endereco, config.telefone, config.email].filter(Boolean).join('  ·  ');
  const cabecalho = {
    logo,
    titulo: config.pdfTitulo || config.nomeParoquia || 'Paróquia Nossa Senhora do Rosário',
    subtitulo: config.pdfSubtitulo || '',
    info: config.pdfInfo || infoPadrao,
  };
  const rodape = { frase: config.fraseRodape || '', emitidoEm: dataPorExtenso(new Date()) };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(nomeArquivoPdf(igrejas).replace(/\.pdf$/, ''))}</title>
  <style>${CSS}</style>
</head>
<body>
  ${igrejas.map(igreja => htmlIgreja(igreja, dados, cabecalho, rodape)).join('')}
</body>
</html>`;
}

// ------------------------------------------------------------
// Navegador: imprime o HTML num iframe invisível (a janela de
// impressão do navegador tem a opção "Salvar como PDF").
// ------------------------------------------------------------
function imprimirNoNavegador(html, nomeArquivo) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  const tituloOriginal = document.title;
  setTimeout(() => {
    document.title = nomeArquivo.replace(/\.pdf$/, ''); // nome sugerido do arquivo
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.title = tituloOriginal;
      iframe.remove();
    }, 1000);
  }, 400);
}

// ------------------------------------------------------------
// Ponto de entrada: gera o PDF das igrejas selecionadas.
// Retorna { uri, nome } no celular, ou { web: true } no navegador.
// ------------------------------------------------------------
export async function gerarPdfIgrejas(igrejas, dados) {
  const html = await montarHtmlPdf(igrejas, dados);
  const nome = nomeArquivoPdf(igrejas);

  if (Platform.OS === 'web') {
    imprimirNoNavegador(html, nome);
    return { web: true, nome };
  }

  const { uri } = await Print.printToFileAsync({
    html,
    width: A4.largura,
    height: A4.altura,
    margins: { top: 40, bottom: 40, left: 36, right: 36 }, // só iOS (no Android vale o @page do CSS)
  });

  // O expo-print cria o arquivo com um nome aleatório — copiamos para um
  // nome amigável, que é o que aparece ao salvar/compartilhar.
  try {
    const destino = new File(Paths.cache, nome);
    if (destino.exists) destino.delete();
    await new File(uri).copy(destino);
    return { uri: destino.uri, nome };
  } catch (_) {
    return { uri, nome };
  }
}

// Abre o menu do sistema para salvar ou enviar o PDF (Arquivos, Drive,
// WhatsApp, e-mail...).
export async function compartilharPdf(uri) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento não está disponível neste aparelho.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Salvar ou compartilhar o PDF',
  });
}

// Android: o usuário escolhe uma pasta e o PDF é gravado lá. (O Android
// não deixa escolher a raiz nem a própria pasta "Download" — é preciso
// escolher ou criar uma subpasta.) Retorna false se o usuário cancelar.
export async function salvarPdfNoAparelho(uri, nome) {
  let pasta;
  try {
    pasta = await Directory.pickDirectoryAsync();
  } catch (_) {
    return false;
  }
  if (!pasta) return false;
  const arquivo = pasta.createFile(nome, 'application/pdf');
  const conteudo = await new File(uri).bytes();
  arquivo.write(conteudo);
  return true;
}
