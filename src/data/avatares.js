// Mapeamento dos avatares — cada imagem é carregada via require()
// para funcionar offline no React Native.
// Para adicionar um novo avatar, coloque o arquivo em assets/avatares/
// e adicione uma nova entrada aqui.

export const AVATARES = [
  {
    id: 'nossa-senhora-rosario',
    nome: 'Nossa Senhora do Rosário',
    imagem: require('../../assets/avatares/Nossa Senhora do Rosário.webp'),
  },
  {
    id: 'nossa-senhora-conceicao',
    nome: 'Nossa Senhora da Conceição',
    imagem: require('../../assets/avatares/Nossa Senhora da Conceição.webp'),
  },
  {
    id: 'nossa-senhora-das-gracas',
    nome: 'Nossa Senhora das Graças',
    imagem: require('../../assets/avatares/Nossa Senhora das Graças.webp'),
  },
  {
    id: 'nossa-senhora-carmo',
    nome: 'Nossa Senhora do Carmo',
    imagem: require('../../assets/avatares/Nossa Senhora do Carmo.webp'),
  },
  {
    id: 'nossa-senhora-fatima',
    nome: 'Nossa Senhora de Fátima',
    imagem: require('../../assets/avatares/Nossa Senhora de Fátima.webp'),
  },
  {
    id: 'jesus',
    nome: 'Jesus Cristo',
    imagem: require('../../assets/avatares/Jesus.webp'),
  },
  {
    id: 'sao-cristovao',
    nome: 'São Cristóvão',
    imagem: require('../../assets/avatares/São Cristóvão.webp'),
  },
  {
    id: 'sao-jose',
    nome: 'São José',
    imagem: require('../../assets/avatares/São José.webp'),
  },
  {
    id: 'santo-antonio',
    nome: 'Santo Antônio',
    imagem: require('../../assets/avatares/Santo Antônio.webp'),
  },
  {
    id: 'são-carlo-acutis',
    nome: 'São Carlo Acutis',
    imagem: require('../../assets/avatares/São Carlo Acutis.webp'),
  },
  {
    id: 'santa-terezinha',
    nome: 'Santa Terezinha',
    imagem: require('../../assets/avatares/Santa Terezinha.webp'),
  },
  {
    id: 'santa-luzia',
    nome: 'Santa Luzia',
    imagem: require('../../assets/avatares/Santa Luzia.webp'),
  },
  {
    id: 'santa-joana-darc',
    nome: 'Santa Joana DArc',
    imagem: require('../../assets/avatares/Santa Joana DArc.webp'),
  },
];

// Retorna o objeto avatar pelo id, ou o primeiro como fallback
export function obterAvatar(id) {
  return AVATARES.find(a => a.id === id) || AVATARES[0];
}
