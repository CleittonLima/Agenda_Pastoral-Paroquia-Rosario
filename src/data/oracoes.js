


/* ============================================================
   TERÇOS
   ============================================================
   COMO ADICIONAR UM NOVO TERÇO
   1. Copie o bloco inteiro de um terço existente (de { até }).
   2. Cole abaixo do último, separado por vírgula.
   3. Altere: id, nome, descricao, status e conclusao.
   4. Defina as partes dentro do array "partes".
   
   STATUS:
     "ativo"   → aparece no app para os fiéis
     "inativo" → não aparece (use enquanto estiver montando o terço)

   TIPOS DE PARTE:
     { tipo:"oracao", titulo:"Sinal da Cruz", texto:"Em nome do Pai..." }
     { tipo:"misterios" }   ← só no Terço do Rosário; insere as dezenas do dia automaticamente
   ============================================================ */
export const TERCOS = [

  /* ---- SANTO TERÇO ---- */
  {
    id: "rosario",
    nome: "Santo Terço",
    descricao: "Reze o Santo Terço meditando os mistérios do dia.",
    status: "ativo",
    imagem: "assets/Terço/Terço Mariano.webp",  // ex.: "assets/imagem-terco-rosario.webp" — deixe "" para não exibir
    conclusao: "Que Nossa Senhora do Rosário interceda por você, pela sua família e por toda a Igreja. Nunca se ouviu dizer que alguém que recorreu à vossa proteção fosse por vós abandonado. Amém. 🌹",
    /* As partes do terço ficam aqui em ordem.
       O tipo "misterios" insere automaticamente as cinco dezenas
       do dia (Pai-Nosso + 10 Ave-Marias + Glória ao Pai) com os
       mistérios correspondentes — não precisa escrever isso à mão. */
    partes: [
      {
        tipo: "oracao",
        titulo: "Vamos começar o Santo Terço",
        texto: "Prepare o seu coração e coloque-se na presença de Deus. Neste momento de oração, vamos contemplar, junto com Maria, os mistérios da vida de Jesus."
      },
      {
        tipo: "oracao",
        titulo: "Sinal da Cruz",
        texto: "Em nome do Pai, do Filho e do Espírito Santo. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Credo",
        texto: "Creio em Deus Pai todo-poderoso,\ncriador do céu e da terra.\n\nE em Jesus Cristo, seu único Filho, nosso Senhor,\nque foi concebido pelo poder do Espírito Santo,\nnasceu da Virgem Maria,\npadeceu sob Pôncio Pilatos,\nfoi crucificado, morto e sepultado,\ndesceu à mansão dos mortos,\nressuscitou ao terceiro dia,\nsubiu aos céus,\nestá sentado à direita de Deus Pai todo-poderoso,\ndonde há de vir a julgar os vivos e os mortos.\n\nCreio no Espírito Santo,\nna santa Igreja Católica,\nna comunhão dos santos,\nna remissão dos pecados,\nna ressurreição da carne,\nna vida eterna. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Pai-Nosso",
        texto: "Pai nosso que estais nos céus,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Três Ave-Marias",
        subtitulo: "(pelo aumento da fé, esperança e caridade)",
        texto: "Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres\ne bendito é o fruto do vosso ventre, Jesus.\n\nSanta Maria, Mãe de Deus,\nrogai por nós, pecadores,\nagora e na hora de nossa morte. Amém.\n\n(Reze três vezes)"
      },
      {
        tipo: "oracao",
        titulo: "Glória ao Pai",
        texto: "Glória ao Pai,\nao Filho\ne ao Espírito Santo.\n\nComo era no princípio,\nagora e sempre,\npor todos os séculos dos séculos. Amém."
      },
      /* Este bloco especial gera automaticamente as 5 dezenas do dia */
      { tipo: "misterios" },
      {
        tipo: "oracao",
        titulo: "Salve Rainha",
        texto: "Salve Rainha, mãe de misericórdia,\nvida, doçura, esperança nossa, salve!\n\nA vós bradamos, os degredados filhos de Eva;\na vós suspiramos, gemendo e chorando\nneste vale de lágrimas.\n\nEia, pois, advogada nossa,\nesses vossos olhos misericordiosos a nós volvei;\ne depois deste desterro,\nmostrai-nos Jesus, bendito fruto do vosso ventre.\n\nÓ clemente, ó piedosa,\nó doce sempre Virgem Maria. Amém."
      }
    ]
  },

  /* ---- TERÇO DA DIVINA MISERICÓRDIA ---- */
  {
    id: "misericordia",
    nome: "Terço da Divina Misericórdia",
    descricao: "Reze o Terço da Divina Misericórdia, revelada a Santa Faustina.",
    status: "ativo",
    imagem: "assets/Terço/Terço da misericórdia.webp",  // ex.: "assets/imagem-terco.webp"
    conclusao: "Confie na Divina Misericórdia:\npela oração deste Terço, o Senhor derrama graças, conduz à conversão e oferece Seu auxílio, especialmente na hora da morte. 🤲🏻",
    partes: [
      {
        tipo: "oracao",
        titulo: "Vamos começar o Terço da Divina Misericórdia",
        texto: "Com confiança, coloquemo-nos diante da infinita misericórdia de Jesus. Entreguemos a Ele nossas intenções, nossa família e todos aqueles que mais precisam de Sua misericórdia."
      },
      {
        tipo: "oracao",
        titulo: "Sinal da Cruz",
        texto: "Em nome do Pai, do Filho e do Espírito Santo. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Oração de inicial",
        subtitulo: "Oração a Jesus Misericordioso",
        texto: "Tu expiraste, Jesus, mas a fonte da vida\njorrou para as almas, e o oceano de\nmisericórdia abriu-se para o mundo inteiro.\nÓ Fonte da VIda, insondável Misericórdia\nDivina, envolve o mundo inteiro e derrama-te\nsobre nós."
      },
      {
        tipo: "oracao",
        titulo: "Oração inicial - parte 2",
        subtitulo: "Repita três vezes",
        texto: "Ó Sangue e Água, que jorraste do Coração\nde Jesus como fonte de misericórdia para\nnós, eu confio em vós"
      },
      {
        tipo: "oracao",
        titulo: "No inicio da primeira dezena — Pai-Nosso",
        subtitulo: "(Reze um Pai-Nosso, Ave-Maria e Creio em Deus)",
        texto: "Pai nosso que estais nos céus,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Ave-Maria",
        texto: "Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres\ne bendito é o fruto do vosso ventre, Jesus.\n\nSanta Maria, Mãe de Deus,\nrogai por nós, pecadores,\nagora e na hora de nossa morte. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Credo",
        texto: "Creio em Deus Pai todo-poderoso,\ncriador do céu e da terra.\n\nE em Jesus Cristo, seu único Filho, nosso Senhor,\nque foi concebido pelo poder do Espírito Santo,\nnasceu da Virgem Maria,\npadeceu sob Pôncio Pilatos,\nfoi crucificado, morto e sepultado,\ndesceu à mansão dos mortos,\nressuscitou ao terceiro dia,\nsubiu aos céus,\nestá sentado à direita de Deus Pai todo-poderoso,\ndonde há de vir a julgar os vivos e os mortos.\n\nCreio no Espírito Santo,\nna santa Igreja Católica,\nna comunhão dos santos,\nna remissão dos pecados,\nna ressurreição da carne,\nna vida eterna. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Na 1ª conta grande — 1ª dezena",
        subtitulo: "(Repita esta oração no inicio de cada dezena — são 5 dezenas)",
        texto: "Eterno Pai, eu Vos ofereçp o Corpo e o Sangue,\na Alma e a Divindade de Vosso Diletíssimo Filho,\nNosso Senhor Jesus Cristo,\nem expiação dos nossos pecados e dos do mundo inteiro."
      },
      {
        tipo: "oracao",
        titulo: "Nas contas pequenas — 1ª dezena",
        subtitulo: "(Repita esta oração 10 vezes em cada dezena — são 5 dezenas)",
        texto: "Pela sua dolorosa Paixão,\ntende misericórdia de nós e do mundo inteiro.\n\n(Repita esta oração 10 vezes, depois siga para a próxima dezena)"
      },
      {
        tipo: "oracao",
        titulo: "2ª dezena",
        texto: "Eterno Pai, eu Vos ofereçp o Corpo e o Sangue,\na Alma e a Divindade de Vosso Diletíssimo Filho,\nNosso Senhor Jesus Cristo,\nem expiação dos nossos pecados e dos do mundo inteiro.\n\nRepita 10 veze em cada conta pequena.\n\nPela sua dolorosa Paixão,\ntende misericórdia de nós e do mundo inteiro."
      },
      {
        tipo: "oracao",
        titulo: "3ª dezena",
        texto: "Eterno Pai, eu Vos ofereçp o Corpo e o Sangue,\na Alma e a Divindade de Vosso Diletíssimo Filho,\nNosso Senhor Jesus Cristo,\nem expiação dos nossos pecados e dos do mundo inteiro.\n\nRepita 10 veze em cada conta pequena.\n\nPela sua dolorosa Paixão,\ntende misericórdia de nós e do mundo inteiro."
      },
      {
        tipo: "oracao",
        titulo: "4ª dezena",
        texto: "Eterno Pai, eu Vos ofereçp o Corpo e o Sangue,\na Alma e a Divindade de Vosso Diletíssimo Filho,\nNosso Senhor Jesus Cristo,\nem expiação dos nossos pecados e dos do mundo inteiro.\n\nRepita 10 veze em cada conta pequena.\n\nPela sua dolorosa Paixão,\ntende misericórdia de nós e do mundo inteiro."
      },
      {
        tipo: "oracao",
        titulo: "5ª dezena",
        texto: "Eterno Pai, eu Vos ofereçp o Corpo e o Sangue,\na Alma e a Divindade de Vosso Diletíssimo Filho,\nNosso Senhor Jesus Cristo,\nem expiação dos nossos pecados e dos do mundo inteiro.\n\nRepita 10 veze em cada conta pequena.\n\nPela sua dolorosa Paixão,\ntende misericórdia de nós e do mundo inteiro."
      },
      {
        tipo: "oracao",
        titulo: "Oração final",
        subtitulo: "(Repita três vezes)",
        texto: "Deus Santo, Deus Forte, Deus Imortal,\ntende misericórdia de nós e do mundo inteiro.\n\n(Repita três vezes)"
      },
      {
        tipo: "oracao",
        titulo: "Oração de Encerramento (Opcional)",
        subtitulo: "Oração ao Deus Eterno",
        texto: "Deus eterno, em quem a misericórdia é\n infinita e o tesouro da compaixão é\ninesgotável, olhai para nós com bondade e\naumentai em nós a Vossa Misericórdia,\npara que nos momentos difíceis não nos\ndesesperemos nem desanimemos, mas nos\nsubmetamps com grande confiaça à\nVossa santa vontade, que é o Amor e a\nprópria Misericórdia."
      },
    ]
  },

  /* ---- TERÇO DE SÃO JOSÉ ---- */

  {
    id: "sao-jose",
    nome: "Terço de São José",
    descricao: "Reze o Terço de São José, pedindo sua poderosa intercessão e proteção.",
    status: "ativo",
    imagem: "",  // ex.: "assets/imagem-terco.webp"
    conclusao: "São José, valei-me e protegei-me:\nconduzi-me sempre a Jesus e Maria,\nensinando-me a viver com fé, humildade e confiança em Deus. 🙏🏻",
    partes: [
      {
        tipo: "oracao",
        titulo: "Vamos começar o Terço de São José",
        texto: "Prepare o seu coração e coloque-se na presença de Deus. Peçamos a intercessão de São José, esposo de Maria e pai adotivo de Jesus, para que ele proteja nossas famílias e nos ajude a caminhar sempre mais perto de Cristo."
      },
      {
        tipo: "oracao",
        titulo: "Sinal da Cruz",
        texto: "Em nome do Pai, do Filho e do Espírito Santo. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Creio",
        texto: "Creio em Deus Pai todo-poderoso,\ncriador do céu e da terra.\n\nE em Jesus Cristo, seu único Filho, nosso Senhor,\nque foi concebido pelo poder do Espírito Santo,\nnasceu da Virgem Maria,\npadeceu sob Pôncio Pilatos,\nfoi crucificado, morto e sepultado,\ndesceu à mansão dos mortos,\nressuscitou ao terceiro dia,\nsubiu aos céus,\nestá sentado à direita de Deus Pai todo-poderoso,\ndonde há de vir a julgar os vivos e os mortos.\n\nCreio no Espírito Santo,\nna santa Igreja Católica,\nna comunhão dos santos,\nna remissão dos pecados,\nna ressurreição da carne,\nna vida eterna. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Pai-Nosso",
        texto: "Pai nosso que estais nos céus,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Ave-Maria",
        subtitulo: "Reze três vezes",
        texto: "Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres\ne bendito é o fruto do vosso ventre, Jesus.\n\nSanta Maria, Mãe de Deus,\nrogai por nós, pecadores,\nagora e na hora de nossa morte. Amém.\n\n(Repita três vezes)"
      },
      {
        tipo: "oracao",
        titulo: "Glória ao Pai",
        texto: "Glória ao Pai, ao Filho e ao Espírito Santo.\n\nComo era no princípio, agora e sempre.\nAmém."
      },
      {
        tipo: "oracao",
        titulo: "1ª dezena",
        subtitulo: "Na conta grande",
        texto: "Meu glorioso São José,\nnas vossas maiores aflições e tribulações,\nnão vos valeu o anjo do Senhor?\n\nValei-me, São José!"
      },
      {
        tipo: "oracao",
        titulo: "1ª dezena",
        subtitulo: "Nas contas pequenas — repita 10 vezes",
        texto: "São José, valei-me!\n\n(Repita esta oração 10 vezes.)"
      },
      {
        tipo: "oracao",
        titulo: "Final da 1ª dezena",
        texto: "Jesus, Maria e José!\n\n(Em seguida, passe para a próxima dezena.)"
      },
      {
        tipo: "oracao",
        titulo: "2ª dezena",
        subtitulo: "Na conta grande",
        texto: "Meu glorioso São José,\nnas vossas maiores aflições e tribulações,\nnão vos valeu o anjo do Senhor?\n\nValei-me, São José!"
      },
      {
        tipo: "oracao",
        titulo: "2ª dezena",
        subtitulo: "Nas contas pequenas — repita 10 vezes",
        texto: "São José, valei-me!\n\n(Repita esta oração 10 vezes.)"
      },
      {
        tipo: "oracao",
        titulo: "Final da 2ª dezena",
        texto: "Jesus, Maria e José!\n\n(Em seguida, passe para a próxima dezena.)"
      },
      {
        tipo: "oracao",
        titulo: "3ª dezena",
        subtitulo: "Na conta grande",
        texto: "Meu glorioso São José,\nnas vossas maiores aflições e tribulações,\nnão vos valeu o anjo do Senhor?\n\nValei-me, São José!"
      },
      {
        tipo: "oracao",
        titulo: "3ª dezena",
        subtitulo: "Nas contas pequenas — repita 10 vezes",
        texto: "São José, valei-me!\n\n(Repita esta oração 10 vezes.)"
      },
      {
        tipo: "oracao",
        titulo: "Final da 3ª dezena",
        texto: "Jesus, Maria e José!\n\n(Em seguida, passe para a próxima dezena.)"
      },
      {
        tipo: "oracao",
        titulo: "4ª dezena",
        subtitulo: "Na conta grande",
        texto: "Meu glorioso São José,\nnas vossas maiores aflições e tribulações,\nnão vos valeu o anjo do Senhor?\n\nValei-me, São José!"
      },
      {
        tipo: "oracao",
        titulo: "4ª dezena",
        subtitulo: "Nas contas pequenas — repita 10 vezes",
        texto: "São José, valei-me!\n\n(Repita esta oração 10 vezes.)"
      },
      {
        tipo: "oracao",
        titulo: "Final da 4ª dezena",
        texto: "Jesus, Maria e José!\n\n(Em seguida, passe para a próxima dezena.)"
      },
      {
        tipo: "oracao",
        titulo: "5ª dezena",
        subtitulo: "Na conta grande",
        texto: "Meu glorioso São José,\nnas vossas maiores aflições e tribulações,\nnão vos valeu o anjo do Senhor?\n\nValei-me, São José!"
      },
      {
        tipo: "oracao",
        titulo: "5ª dezena",
        subtitulo: "Nas contas pequenas — repita 10 vezes",
        texto: "São José, valei-me!\n\n(Repita esta oração 10 vezes.)"
      },
      {
        tipo: "oracao",
        titulo: "Final da 5ª dezena",
        texto: "Jesus, Maria e José!"
      },
      {
        tipo: "oracao",
        titulo: "Oração final",
        subtitulo: "Oferecimento a São José",
        texto: "A vós, glorioso São José,\nofereço este terço em louvor e glória\nde Jesus e de Maria,\npara que seja minha luz e guia,\nminha proteção e defesa,\nminha fortaleza e alegria\nem todos os meus trabalhos e tribulações,\nprincipalmente na hora da agonia.\n\nPelo nome de Jesus e pela glória de Maria,\nimploro o vosso poderoso patrocínio,\npara que me alcanceis a graça que tanto desejo.\n\nFalai em meu favor,\nadvogai a minha causa no céu\ne na terra alegrai a minha alma,\npara honra e glória vossa,\nde Jesus e de Maria.\n\nAssim seja."
      },
      {
        tipo: "oracao",
        titulo: "Oração de Encerramento",
        subtitulo: "Lembrai-vos de São José",
        texto: "Lembrai-vos, ó puríssimo esposo da Virgem Maria,\nque jamais se ouviu dizer que alguém tivesse invocado\nvossa proteção, implorado vosso socorro\ne não fosse por vós atendido.\n\nCom esta confiança, venho à vossa presença;\na vós com fervor me recomendo.\nNão desprezeis as minhas súplicas,\npai adotivo do Redentor,\nmas dignai-vos de acolhê-las piedosamente.\n\nAmém."
      }
    ]
  }
  /* Modelo para adicionar um novo terço — copie e cole abaixo:
  ,{
    id: "sao-jose",
    nome: "Terço de São José",
    descricao: "Breve descrição do terço.",
    status: "inativo",
    imagem: "",  // ex.: "assets/imagem-terco.webp"
    conclusao: "Mensagem de conclusão bonita e inspiradora.",
    partes: [
      {
        tipo: "oracao",
        titulo: "Sinal da Cruz",
        texto: "Em nome do Pai, do Filho e do Espírito Santo. Amém."
      },
      {
        tipo: "oracao",
        titulo: "Título da parte",
        texto: "Texto da oração aqui.\nUse \\n para nova linha dentro do mesmo parágrafo.\n\nDuplo \\n para novo parágrafo com espaço."
      }
    ]
  }
  */

];