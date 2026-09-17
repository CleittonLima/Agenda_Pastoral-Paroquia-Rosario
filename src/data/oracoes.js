// ============================================================
// PARÓQUIA NOSSA SENHORA DO ROSÁRIO — src/data/oracoes.js
// Dados da seção de Orações (lista do dia a dia e terços).
// Nenhuma lógica de interface fica aqui — isso está em
// OracoesScreen.js. Aqui só os dados, fáceis de editar.
// ============================================================

// ============================================================
// ORAÇÕES DO DIA A DIA
// Para adicionar uma nova oração, copie um bloco { ... } e cole
// abaixo, alterando id, nome, categoria, cor e texto.
// Separe parágrafos com \n\n (uma linha em branco = novo parágrafo).
// ============================================================
export const ORACOES = [
  {
    id: 'pai-nosso',
    nome: 'Pai-Nosso',
    categoria: 'Dia a dia',
    cor: '#7A1F2B',
    imagem: '',
    texto: 'Pai nosso que estais nos céus,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal. Amém.',
  },
  {
    id: 'ave-maria',
    nome: 'Ave-Maria',
    categoria: 'Dia a dia',
    cor: '#7A1F2B',
    imagem: '',
    texto: 'Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres\ne bendito é o fruto do vosso ventre, Jesus.\n\nSanta Maria, Mãe de Deus,\nrogai por nós, pecadores,\nagora e na hora de nossa morte. Amém.',
  },
  {
    id: 'gloria',
    nome: 'Glória ao Pai',
    categoria: 'Dia a dia',
    cor: '#7A1F2B',
    imagem: '',
    texto: 'Glória ao Pai,\nao Filho\ne ao Espírito Santo.\n\nComo era no princípio,\nagora e sempre,\npor todos os séculos dos séculos. Amém.',
  },
  {
    id: 'credo',
    nome: 'Credo (Símbolo dos Apóstolos)',
    categoria: 'Dia a dia',
    cor: '#7A1F2B',
    imagem: '',
    texto: 'Creio em Deus Pai todo-poderoso,\ncriador do céu e da terra.\n\nE em Jesus Cristo, seu único Filho, nosso Senhor,\nque foi concebido pelo poder do Espírito Santo,\nnasceu da Virgem Maria,\npadeceu sob Pôncio Pilatos,\nfoi crucificado, morto e sepultado,\ndesceu à mansão dos mortos,\nressuscitou ao terceiro dia,\nsubiu aos céus,\nestá sentado à direita de Deus Pai todo-poderoso,\ndonde há de vir a julgar os vivos e os mortos.\n\nCreio no Espírito Santo,\nna santa Igreja Católica,\nna comunhão dos santos,\nna remissão dos pecados,\nna ressurreição da carne,\nna vida eterna. Amém.',
  },
  {
    id: 'sao-francisco',
    nome: 'Oração de São Francisco de Assis',
    categoria: 'Santos',
    cor: '#5C6B2E',
    imagem: '',
    texto: 'Senhor, fazei de mim um instrumento de vossa paz.\n\nOnde houver ódio, que eu leve o amor;\nonde houver ofensa, que eu leve o perdão;\nonde houver discórdia, que eu leve a união;\nonde houver dúvida, que eu leve a fé;\nonde houver erro, que eu leve a verdade;\nonde houver desespero, que eu leve a esperança;\nonde houver tristeza, que eu leve a alegria;\nonde houver trevas, que eu leve a luz.\n\nÓ Mestre, fazei que eu procure mais\nconsolar, que ser consolado;\ncompreender, que ser compreendido;\namar, que ser amado.\n\nPois é dando que se recebe;\né perdoando que se é perdoado;\ne é morrendo que se vive para a vida eterna. Amém.',
  },
  {
    id: 'sao-bento',
    nome: 'Oração de São Bento',
    categoria: 'Santos',
    cor: '#5C6B2E',
    imagem: '',
    texto: 'A cruz sagrada seja minha luz;\nnão seja o dragão meu guia.\n\nRetira-te, satanás!\nNunca me aconselhes coisas vãs.\nÉ mau o que tu me ofereces;\nbebe tu mesmo os teus venenos.\n\nÓ Deus, que fizestes do glorioso São Bento\num mestre insigne na escola do vosso serviço,\nconcedei-nos que, preferindo sempre o vosso amor a tudo,\ncorramos com o coração dilatado pelo caminho de vossos mandamentos. Amém.',
  },
  {
    id: 'nossa-senhora-rosario',
    nome: 'Oração de Nossa Senhora do Rosário',
    categoria: 'Marianas',
    cor: '#1F4E8B',
    imagem: '',
    texto: 'Nossa Senhora do Rosário,\nMãe de Jesus e nossa Mãe,\nensinai-nos a contemplar os mistérios de vosso Filho\ne conduzi-nos sempre a Ele.\n\nPor vossa intercessão maternal,\nalcançai-nos as graças de que necessitamos\npara viver como verdadeiros filhos de Deus. Amém.',
  },
  {
    id: 'nossa-senhora-conceicao',
    nome: 'Oração de Nossa Senhora da Conceição',
    categoria: 'Marianas',
    cor: '#1F4E8B',
    imagem: '',
    texto: 'Ó Maria concebida sem pecado,\nrogai por nós que recorremos a vós.\n\nNossa Senhora da Conceição,\nprotegei-nos e conduzi-nos a Jesus.\n\nQue a vossa pureza imaculada\nnos inspire a buscar sempre a santidade\ne a graça de Deus em nossas vidas. Amém.',
  },

  /* Modelo para adicionar novas orações — copie e cole abaixo:
  {
    id: 'novo-id',
    nome: 'Nome da oração',
    categoria: 'Santos',
    cor: '#5C6B2E',
    imagem: '',
    texto: 'Primeira linha.\nSegunda linha.\n\nNovo parágrafo.',
  }
  */
];

// ============================================================
// OS MISTÉRIOS DO SANTO TERÇO
// Usados automaticamente pelo terço do Rosário conforme o dia.
// Cada grupo tem exatamente 5 mistérios — não altere a estrutura.
// "reflexao" é opcional: se vazio, o app mostra uma frase padrão.
// ============================================================
export const MISTERIOS = {
  gozosos: {
    nome: "Mistérios Gozosos",
    icone: "🌸",
    dias: ["Segunda-feira", "Sábado"],
    lista: [
      
      { nome: "A Anunciação do Anjo a Maria", reflexao: "Contemplamos o momento em que o Anjo Gabriel anuncia a Maria que ela será a Mãe do Salvador. Com seu “sim” humilde e confiante, Maria acolhe a vontade de Deus." },
      { nome: "A Visitação de Maria a Isabel", reflexao: "Contemplamos Maria visitando sua prima Isabel e levando consigo a presença de Jesus. Cheia de alegria, Maria proclama as maravilhas que Deus realizou." },
      { nome: "O Nascimento de Jesus", reflexao: "Contemplamos o nascimento de Jesus em Belém, na humildade de uma manjedoura. O Filho de Deus vem ao mundo para trazer-nos a salvação." },
      { nome: "A Apresentação de Jesus no Templo", reflexao: "Contemplamos Maria e José apresentando Jesus no Templo e oferecendo-O ao Senhor. Simeão reconhece naquele Menino a salvação prometida." },
      { nome: "A Perda e o Encontro de Jesus mo Templo", reflexao: "Contemplamos Maria e José encontrando Jesus no Templo, depois de procurá-Lo com angústia. Jesus estava na casa de Seu Pai, cumprindo Sua missão." }
    
    ]
  },
  dolorosos: {
    nome: "Mistérios Dolorosos",
    icone: "✝️",
    dias: ["Terça-feira", "Sexta-feira"],
    lista: [
      
      { nome: "A Agonia de Jesus no Horto das Oliveiras", reflexao: "Contemplamos Jesus no Jardim das Oliveiras, diante do sofrimento que se aproximava. Em profunda angústia, Ele entrega-Se à vontade do Pai." },
      { nome: "A Flagelação de Jesus", reflexao: "Contemplamos Jesus sendo cruelmente flagelado por nossa salvação. O Senhor suporta as dores e humilhações por amor à humanidade." },
      { nome: "A Coroação de Jesus com Espinhos", reflexao: "Contemplamos Jesus sendo coroado com espinhos e humilhado como falso rei. Aquele que é verdadeiramente Rei aceita a humilhação por amor a nós." },
      { nome: "Jesus carrega a Cruz até o Calvário", reflexao: "Contemplamos Jesus carregando Sua pesada Cruz até o lugar de Sua crucificação. Mesmo enfraquecido, Ele segue o caminho por amor a nós." },
      { nome: "A Crucificação e Morte de Jesus na cruz", reflexao: "Contemplamos Jesus pregado na Cruz, entregando Sua vida pela salvação da humanidade. No Calvário, Cristo revela o amor infinito de Deus." }
    
    ]
  },
  gloriosos: {
    nome: "Mistérios Gloriosos",
    icone: "✨",
    dias: ["Quarta-feira", "Domingo"],
    lista: [
      
      { nome: "A Ressurreição de Jesus ao terceiro dia", reflexao: "Contemplamos Jesus ressuscitado, vencendo a morte e abrindo para nós o caminho da vida eterna. A tristeza dos discípulos transforma-se em alegria." },
      { nome: "A Ascensão de Jesus ao Céu", reflexao: "Contemplamos Jesus subindo ao Céu e retornando à glória do Pai. Antes de partir, confia aos discípulos a missão de anunciar o Evangelho." },
      { nome: "A Vinda do Espírito Santo", reflexao: "Contemplamos o Espírito Santo descendo sobre Maria e os Apóstolos reunidos no Cenáculo. Cheios do Espírito, eles recebem força para anunciar o Evangelho." },
      { nome: "A Assunção de Maria ao Céu", reflexao: "Contemplamos Maria sendo elevada ao Céu de corpo e alma, participando da glória de seu Filho. Ela é sinal da esperança que aguarda todos aqueles que permanecem fiéis a Deus." },
      { nome: "A Coroação de Maria como Rainha do Céu e da Terra", reflexao: "Contemplamos Maria coroada como Rainha do Céu e da Terra, exaltada por Deus por sua humildade, fé e fidelidade." }
    
    ]
  },
  luminosos: {
    nome: "Mistérios Luminosos",
    icone: "💡",
    dias: ["Quinta-feira"],
    lista: [
      
      { nome: "O Batismo de Jesus no Rio Jordão", reflexao: "Contemplamos Jesus sendo batizado por João Batista no rio Jordão. O Espírito Santo desce sobre Ele e a voz do Pai proclama: “Este é o meu Filho amado”." },
      { nome: "A Autorrevelação de Jesus nas Bodas de Caná", reflexao: "Contemplamos Jesus realizando Seu primeiro milagre, transformando água em vinho, a pedido de Sua Mãe. Maria nos ensina a confiar e fazer tudo aquilo que Jesus nos disser." },
      { nome: "O Anúncio do Reino de Deus", reflexao: "Contemplamos Jesus anunciando o Reino de Deus, chamando todos à conversão e oferecendo a misericórdia do Pai." },
      { nome: "A Transfiguração de Jesus", reflexao: "Contemplamos Jesus transfigurado no alto do monte, revelando Sua glória aos discípulos. Seu rosto resplandece e Sua divindade se manifesta." },
      { nome: "A Instituição da Eucaristia", reflexao: "Contemplamos Jesus entregando-Se por nós na Eucaristia, deixando-nos Seu Corpo e Seu Sangue como alimento e presença permanente." }
    ],
  },
};

// Qual mistério rezar em cada dia da semana
// índice 0 = Domingo … 6 = Sábado (igual ao Date.getDay() do JavaScript)
export const MISTERIO_POR_DIA = [
  'gloriosos',  // Domingo
  'gozosos',    // Segunda-feira
  'dolorosos',  // Terça-feira
  'gloriosos',  // Quarta-feira
  'luminosos',  // Quinta-feira
  'dolorosos',  // Sexta-feira
  'gozosos',    // Sábado
];

// ============================================================
// TERÇOS
// ============================================================
// COMO ADICIONAR UM NOVO TERÇO
// 1. Copie o bloco inteiro de um terço existente (de { até }).
// 2. Cole dentro do array TERCOS, separado por vírgula.
// 3. Altere: id, nome, descricao, status, imagem e conclusao.
// 4. Defina as partes dentro do array "partes".
//
// STATUS:
//   "ativo"   → aparece no app para os fiéis
//   "inativo" → não aparece (use enquanto estiver montando o terço)
//
// TIPOS DE PARTE:
//   { tipo:"oracao", titulo:"Sinal da Cruz", texto:"Em nome do Pai..." }
//   { tipo:"misterios" }   ← só no Santo Terço; expande automaticamente
//                            as 5 dezenas com os mistérios do dia
// ============================================================
export const TERCOS = [

  /* ---- SANTO TERÇO ---- */
  {
    id: 'rosario',
    nome: 'Santo Terço',
    descricao: 'Reze o Santo Terço meditando os mistérios do dia.',
    status: 'ativo',
    imagem: '',
    conclusao: 'Que Nossa Senhora do Rosário interceda por você, pela sua família e por toda a Igreja. Nunca se ouviu dizer que alguém que recorreu à vossa proteção fosse por vós abandonado. Amém. 🌹',
    partes: [
      {
        tipo: 'oracao',
        titulo: 'Sinal da Cruz',
        texto: 'Em nome do Pai, do Filho e do Espírito Santo. Amém.',
      },
      {
        tipo: 'oracao',
        titulo: 'Credo',
        texto: 'Creio em Deus Pai todo-poderoso,\ncriador do céu e da terra.\n\nE em Jesus Cristo, seu único Filho, nosso Senhor,\nque foi concebido pelo poder do Espírito Santo,\nnasceu da Virgem Maria,\npadeceu sob Pôncio Pilatos,\nfoi crucificado, morto e sepultado,\ndesceu à mansão dos mortos,\nressuscitou ao terceiro dia,\nsubiu aos céus,\nestá sentado à direita de Deus Pai todo-poderoso,\ndonde há de vir a julgar os vivos e os mortos.\n\nCreio no Espírito Santo,\nna santa Igreja Católica,\nna comunhão dos santos,\nna remissão dos pecados,\nna ressurreição da carne,\nna vida eterna. Amém.',
      },
      {
        tipo: 'oracao',
        titulo: 'Pai-Nosso',
        texto: 'Pai nosso que estais nos céus,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal. Amém.',
      },
      {
        tipo: 'oracao',
        titulo: 'Três Ave-Marias',
        subtitulo: '(pelo aumento da fé, esperança e caridade)',
        texto: 'Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres\ne bendito é o fruto do vosso ventre, Jesus.\n\nSanta Maria, Mãe de Deus,\nrogai por nós, pecadores,\nagora e na hora de nossa morte. Amém.\n\n(Reze três vezes)',
      },
      {
        tipo: 'oracao',
        titulo: 'Glória ao Pai',
        texto: 'Glória ao Pai,\nao Filho\ne ao Espírito Santo.\n\nComo era no princípio,\nagora e sempre,\npor todos os séculos dos séculos. Amém.',
      },
      // Este bloco especial gera automaticamente as 5 dezenas do dia
      { tipo: 'misterios' },
      {
        tipo: 'oracao',
        titulo: 'Salve Rainha',
        texto: 'Salve Rainha, mãe de misericórdia,\nvida, doçura, esperança nossa, salve!\n\nA vós bradamos, os degredados filhos de Eva;\na vós suspiramos, gemendo e chorando\nneste vale de lágrimas.\n\nEia, pois, advogada nossa,\nesses vossos olhos misericordiosos a nós volvei;\ne depois deste desterro,\nmostrai-nos Jesus, bendito fruto do vosso ventre.\n\nÓ clemente, ó piedosa,\nó doce sempre Virgem Maria. Amém.',
      },
    ],
  },

  /* ---- COROA DA DIVINA MISERICÓRDIA ---- */
  {
    id: 'misericordia',
    nome: 'Coroa da Divina Misericórdia',
    descricao: 'Reze a Coroa da Divina Misericórdia, revelada a Santa Faustina.',
    status: 'inativo',
    imagem: '',
    conclusao: 'Ó Sangue e Água que jorrastes do Coração de Jesus como uma Fonte de Misericórdia para nós, eu confio em Vós! 🕊️',
    partes: [
      { tipo: 'oracao', titulo: 'Sinal da Cruz', texto: 'Em nome do Pai, do Filho e do Espírito Santo. Amém.' },
      {
        tipo: 'oracao',
        titulo: 'Oração inicial',
        texto: 'Ó Deus Eterno, em quem a misericórdia é infinita e o tesouro de compaixão inesgotável, olhai para nós benevolentemente e aumentai em nós a vossa misericórdia para que, nos momentos difíceis, não caiamos em desespero, mas com grande confiança nos submetamos à vossa santa vontade, que é o amor e a misericórdia. Amém.',
      },
      {
        tipo: 'oracao',
        titulo: 'Nas contas grandes — Pai-Nosso',
        subtitulo: '(Reze um Pai-Nosso, Ave-Maria e Creio em Deus)',
        texto: 'Pai nosso que estais nos céus,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal. Amém.',
      },
      {
        tipo: 'oracao',
        titulo: 'Nas contas pequenas (repita 10 vezes em cada dezena)',
        subtitulo: '5 dezenas ao todo',
        texto: 'Eterno Pai,\noferecemos-te o Corpo e o Sangue, a Alma e a Divindade\nde teu amado Filho, Nosso Senhor Jesus Cristo,\nem expiação dos nossos pecados e dos do mundo inteiro.\n\nPela sua dolorosa Paixão,\ntende misericórdia de nós e do mundo inteiro.',
      },
      {
        tipo: 'oracao',
        titulo: 'Oração final',
        subtitulo: '(Repita três vezes)',
        texto: 'Santo Deus, Santo Forte, Santo Imortal,\ntende misericórdia de nós e do mundo inteiro.',
      },
    ],
  },

  /* Modelo para adicionar um novo terço — copie e cole dentro do array acima:
  {
    id: 'sao-jose',
    nome: 'Terço de São José',
    descricao: 'Breve descrição do terço.',
    status: 'inativo',
    imagem: '',
    conclusao: 'Mensagem de conclusão bonita e inspiradora.',
    partes: [
      { tipo: 'oracao', titulo: 'Sinal da Cruz', texto: 'Em nome do Pai, do Filho e do Espírito Santo. Amém.' },
      { tipo: 'oracao', titulo: 'Título da parte', texto: 'Texto da oração aqui.\nUse \\n para nova linha.\n\nDuplo \\n para novo parágrafo.' },
    ],
  }
  */
];
