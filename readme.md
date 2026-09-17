
# Paróquia Nossa Senhora do Rosário — App Mobile (React Native)

Aplicativo mobile da Paróquia Nossa Senhora do Rosário (Serra Talhada - PE),
desenvolvido em **React Native + Expo**, como conversão do site web original
(HTML/CSS/JS) para a disciplina de Mobile da faculdade.

O app permite aos fiéis consultar horários de missas e confissões, avisos da
paróquia, eventos, informações das igrejas/capelas, fazer ofertas via PIX e
acompanhar orações e o Santo Terço — tudo isso sincronizado com uma planilha
do Google Sheets administrada pela coordenação da paróquia.

---

## 👥 Colaboradores

- **Erisvaldo Cleiton de Almeida Lima** — desenvolvimento
- **José Vitor da Silva Lima** — colaborador — [github.com/jvitor-lima](https://github.com/jvitor-lima)

---

## 📱 Sobre o projeto

Este projeto é a conversão de um sistema web já em produção
(site + painel administrativo + backend em Google Apps Script) para um
aplicativo mobile nativo. A ideia central é que:

- Os **fiéis** usem o aplicativo para consultar informações da paróquia.
- A **coordenação da paróquia** continue administrando tudo por um painel
  web separado (já existente, fora deste repositório), sem precisar mexer
  no aplicativo.
- Os dados (horários, avisos, eventos, igrejas, PIX) ficam guardados numa
  planilha do Google Sheets e chegam ao aplicativo através de uma API feita
  em Google Apps Script.

### Principais funcionalidades

- **Início** — resumo com a próxima celebração, próxima confissão e
  próximo evento, calculados automaticamente a partir dos horários
  cadastrados.
- **Horários** — lista de missas, confissões e demais celebrações, com
  filtro por igreja. A data é sempre calculada a partir do dia da semana
  cadastrado, então nunca fica desatualizada.
- **Avisos** — comunicados da paróquia, com destaque para os urgentes/
  importantes. Avisos com data vencida somem sozinhos.
- **Eventos** — programação especial (festas, retiros, novenas etc.).
- **Igrejas** — cada igreja/capela da paróquia, com fotos, endereço,
  WhatsApp, Google Maps e redes sociais.
- **Oferta (PIX)** — QR Code e chave PIX para contribuições.
- **Orações** — orações do dia a dia (Pai-Nosso, Ave-Maria, orações de
  santos etc.) e a seção "Como rezar o Santo Terço", com um terço
  interativo passo a passo.
- **Configurações** — escolha de nome/avatar, temas de cor, acessibilidade
  (alto contraste, daltonismo, redução de animações).
- Funciona **offline**: os últimos dados recebidos ficam salvos no
  aparelho e são exibidos automaticamente caso não haja internet no
  momento de abrir o app.

### Tecnologias usadas

| Camada               | Tecnologia                                    |
| -------------------- | --------------------------------------------- |
| Aplicativo           | React Native + Expo                           |
| Navegação          | React Navigation (bottom tabs + native stack) |
| Dados locais/offline | AsyncStorage                                  |
| Backend/API          | Google Apps Script                            |
| Banco de dados       | Google Sheets                                 |

---

## ✅ Pré-requisitos

Antes de rodar o projeto, instale na sua máquina:

1. **Node.js** (versão LTS) — [nodejs.org](https://nodejs.org)
   Para conferir se instalou certo, no terminal:
   ```bash
   node --version
   npm --version
   ```
2. **Git** — [git-scm.com](https://git-scm.com)
3. **VSCode** (ou outro editor de sua preferência) — [code.visualstudio.com](https://code.visualstudio.com)
4. **App Expo Go** instalado no celular (para testar no aparelho físico):
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iPhone: [App Store](https://apps.apple.com/app/expo-go/id982107779)

Não é necessário instalar o Android Studio ou Xcode para rodar via Expo Go.

---

## ⬇️ Como baixar e instalar o projeto

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git

# 2. Entre na pasta do projeto
cd NOME-DO-REPOSITORIO

# 3. Instale as dependências
npm install
```

Se o `npm install` não instalar tudo corretamente (algumas libs do Expo
precisam de versões específicas), rode também:

```bash
npx expo install
```

Esse comando confere e corrige a versão de cada dependência para a que é
compatível com a versão do Expo usada no projeto.

---

## ▶️ Como rodar o projeto

### Rodar no navegador (mais rápido para conferir telas)

```bash
npm start
```

ou

```bash
npx expo start
```

Depois, no terminal, aperte a tecla **`w`** para abrir a versão Web no
navegador. Essa é a forma mais rápida de ver o andamento das telas sem
precisar de celular.

### Rodar no celular pelo Expo Go

```bash
npx expo start
```

Isso abre um **QR Code** no terminal/navegador. Abra o app **Expo Go** no
celular e escaneie o QR Code.

**Importante:** o computador e o celular precisam estar conectados na
**mesma rede Wi-Fi** para esse modo funcionar.

### Se o QR Code não conectar (erro de tela azul / não carrega)

Isso normalmente acontece quando o celular e o computador não conseguem
"se enxergar" na rede (comum em Wi-Fi de faculdade, redes com "isolamento
de cliente", ou firewall do Windows bloqueando a porta). Tente, nesta
ordem:

**1. Modo LAN explícito** (o mais comum de resolver):

```bash
npx expo start --lan
```

**2. Liberar a porta no Firewall do Windows** (se estiver no Windows):

- Ao rodar `npx expo start` pela primeira vez, o Windows deve perguntar se
  permite o acesso do Node.js à rede — clique em **Permitir acesso**
  (redes privadas). Se isso não apareceu, procure "Firewall do Windows"
  nas configurações e libere o Node.js/Expo manualmente.

**3. Modo túnel** (funciona mesmo em redes restritas, mas é mais lento):

```bash
npx expo start --tunnel
```

Esse modo depende de um serviço externo (ngrok) para criar o túnel. Se
aparecer o erro `failed to start tunnel / remote gone away`, geralmente é
uma instabilidade temporária do serviço — tente novamente em alguns
minutos, ou rode:

```bash
npm install -g @expo/ngrok
```

e tente `npx expo start --tunnel` de novo.

**4. Mesma rede confirmada:** confirme que o celular está no mesmo Wi-Fi
do computador (não em dados móveis, e não em uma rede "convidado" separada
da rede principal).

---

## 🖥️ Ver o app sem precisar de celular (alternativa ao Expo Go)

Diferente de projetos web (onde um simples `live server` já mostra tudo no
navegador), um projeto React Native **precisa de um "motor" para rodar**,
porque no fim das contas ele gera uma tela mobile de verdade, não uma
página HTML comum. Ainda assim, existem alternativas ao celular físico:

### Opção 1 — Modo Web do próprio Expo (mais simples, já funciona aqui)

```bash
npx expo start
```

e apertar **`w`**. Isso roda o app dentro do navegador, usando
`react-native-web`. É a forma mais parecida com "abrir um HTML" que existe
para este tipo de projeto, e não depende de celular nem de emulador.
**Limitação:** funcionalidades 100% nativas (notificações push, vibração,
sensores) não funcionam no navegador — só em Android/iOS de verdade.

### Opção 2 — Emulador Android no computador

Instalando o **Android Studio**, é possível rodar um "celular virtual" na
tela do computador. Depois de instalado e com um emulador criado, basta
rodar:

```bash
npx expo start
```

e apertar **`a`** no terminal — o app abre automaticamente no emulador.
É mais fiel ao celular real que o modo Web, porém exige instalar o Android
Studio (pesado, alguns GB).

### Extensão do VSCode

Não existe uma extensão de "live preview" para React Native como existe
para HTML (o motivo é que o app não é uma página, é compilado para rodar
num motor mobile). O mais próximo disso, dentro do próprio VSCode, é abrir
um terminal integrado e usar o modo Web (Opção 1) — a tela aparece no
navegador, mas o código continua sendo editado ali no VSCode normalmente,
com recarregamento automático a cada salvamento.

---

## 📂 Estrutura do projeto

```
├── App.js                     → Ponto de entrada, navegação principal
├── src/
│   ├── api/
│   │   └── api.js             → Comunicação com a API (Google Apps Script)
│   ├── context/
│   │   └── AppContext.js      → Estado global (dados, usuário, tema, cache offline)
│   ├── data/
│   │   ├── avatares.js        → Lista de avatares disponíveis
│   │   └── oracoes.js         → Orações, terços e mistérios
│   ├── screens/                → Uma tela por arquivo (Início, Horários, Avisos...)
│   ├── components/             → Componentes reutilizáveis (ex.: tela de carregamento)
│   └── utils/
│       └── datas.js           → Funções de data (cálculo de dia da semana etc.)
├── assets/                     → Imagens fixas do app (avatares, logos, orações, terços)
└── package.json
```

---

## 🔌 Configurando a API (Google Apps Script)

O aplicativo se conecta à mesma planilha/API que já é usada pelo site e
pelo painel administrativo da paróquia. A URL da API fica em:

```
src/api/api.js
```

na constante `URL_API`, no topo do arquivo. Se um dia a URL do Apps Script
mudar (por exemplo, ao publicar uma nova versão do backend), basta
atualizar essa única linha.

---

## 🐛 Problemas comuns

| Sintoma                                       | Provável causa                                   | Solução                                                   |
| --------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Tela azul de erro ao abrir no Expo Go         | Celular e PC em redes diferentes                  | Usar`--lan` ou `--tunnel` (veja acima)                  |
| `Unable to resolve module .../assets/...`   | Arquivo de imagem não existe no caminho esperado | Conferir se o arquivo está na pasta certa com o nome exato |
| `failed to start tunnel / remote gone away` | Instabilidade do serviço de túnel (ngrok)       | Tentar novamente após alguns minutos                       |
| App abre mas fica em branco                   | Erro de JavaScript não tratado                   | Ver o log no terminal onde rodou`npx expo start`          |

---

## 📄 Licença / Uso

Projeto acadêmico desenvolvido para fins de avaliação na disciplina de
Mobile. Os dados reais da Paróquia Nossa Senhora do Rosário são utilizados
com autorização, para fins de demonstração prática do sistema já usado
pela paróquia.
