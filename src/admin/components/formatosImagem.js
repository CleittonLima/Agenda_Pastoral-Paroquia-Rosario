// ============================================================
// FORMATOS DE IMAGEM DE CADA LOCAL DO APP
// Usados pela ferramenta de recorte (RecorteImagem.js) antes de enviar
// uma imagem pelo Painel ADM. Cada formato diz:
//   proporcao   → proporção em que a imagem aparece no app ([largura, altura])
//                 ou null quando o local aceita qualquer formato
//   recomendado → tamanho ideal, mostrado para o coordenador
//   opcoes      → proporções que aparecem como botões no recorte
//                 ('livre' = recorte livre)
//   ladoMaximo  → maior lado (px) da imagem final — imagens maiores são
//                 reduzidas para carregar rápido no celular
//   formato     → 'jpeg' (fotos) ou 'png' (logos/QR Code, mantém transparência e nitidez)
// Se um local do app mudar de formato, basta ajustar aqui.
// ============================================================

export const PROPORCOES = {
  livre: { id: 'livre', rotulo: 'Livre', valor: null },
  '1:1': { id: '1:1', rotulo: '1:1 Quadrado', valor: 1 },
  '4:3': { id: '4:3', rotulo: '4:3', valor: 4 / 3 },
  '3:4': { id: '3:4', rotulo: '3:4 Retrato', valor: 3 / 4 },
  '16:9': { id: '16:9', rotulo: '16:9 Paisagem', valor: 16 / 9 },
  '3:2': { id: '3:2', rotulo: '3:2', valor: 3 / 2 },
};

export const FORMATOS_IMAGEM = {
  fotoIgreja: {
    titulo: 'Foto principal da igreja',
    onde: 'Aparece no card da lista de Igrejas e no topo dos detalhes da igreja.',
    proporcao: '4:3',
    recomendado: '1600 × 1200 px',
    opcoes: ['4:3', 'livre'],
    ladoMaximo: 1600,
    formato: 'jpeg',
    prefixo: 'igreja',
  },
  galeria: {
    titulo: 'Foto da galeria',
    onde: 'As fotos da galeria aparecem inteiras no carrossel da igreja, por isso podem ter formatos diferentes.',
    proporcao: 'livre',
    recomendado: 'até 1600 px no maior lado',
    opcoes: ['livre', '4:3', '3:4', '1:1', '16:9'],
    ladoMaximo: 1600,
    formato: 'jpeg',
    prefixo: 'galeria',
  },
  logo: {
    titulo: 'Logo principal da paróquia',
    onde: 'Aparece em Configurações → Sobre e, se não houver logo própria, no PDF.',
    proporcao: '1:1',
    recomendado: '1000 × 1000 px (PNG com fundo transparente)',
    opcoes: ['1:1', 'livre'],
    ladoMaximo: 1000,
    formato: 'png',
    prefixo: 'logo',
  },
  imagemInicial: {
    titulo: 'Imagem da tela inicial',
    onde: 'Aparece em um círculo no topo da tela Início.',
    proporcao: '1:1',
    recomendado: '800 × 800 px',
    opcoes: ['1:1', 'livre'],
    ladoMaximo: 800,
    formato: 'jpeg',
    prefixo: 'inicio',
  },
  cardRedeSocial: {
    titulo: 'Imagem do card "Rede social oficial"',
    onde: 'Aparece no final da lista de Igrejas, no mesmo formato das fotos das igrejas.',
    proporcao: '4:3',
    recomendado: '1200 × 900 px',
    opcoes: ['4:3', 'livre'],
    ladoMaximo: 1200,
    formato: 'jpeg',
    prefixo: 'rede-social',
  },
  qrcode: {
    titulo: 'QR Code do PIX',
    onde: 'Aparece em um quadrado na tela de Oferta. Recorte só o QR Code, com uma pequena margem.',
    proporcao: '1:1',
    recomendado: '800 × 800 px',
    opcoes: ['1:1', 'livre'],
    ladoMaximo: 1000,
    formato: 'png',
    prefixo: 'qrcode',
  },
  logoPdf: {
    titulo: 'Logo do PDF',
    onde: 'Aparece centralizada no topo de cada folha do PDF baixado pelos fiéis.',
    proporcao: '1:1',
    recomendado: '800 × 800 px (PNG com fundo transparente)',
    opcoes: ['1:1', 'livre'],
    ladoMaximo: 1000,
    formato: 'png',
    prefixo: 'logo-pdf',
  },
  livre: {
    titulo: 'Imagem',
    onde: '',
    proporcao: 'livre',
    recomendado: 'até 1600 px no maior lado',
    opcoes: ['livre', '1:1', '4:3', '3:4', '16:9'],
    ladoMaximo: 1600,
    formato: 'jpeg',
    prefixo: 'imagem',
  },
};

// Texto curto para mostrar abaixo do campo de imagem nos formulários
export function descricaoFormato(idFormato) {
  const f = FORMATOS_IMAGEM[idFormato];
  if (!f) return '';
  const proporcao = f.proporcao === 'livre' ? 'formato livre' : `proporção ${f.proporcao}`;
  return `Recomendado: ${f.recomendado} · ${proporcao}`;
}
