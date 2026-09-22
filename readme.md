# Paróquia Nossa Senhora do Rosário — App Mobile (React Native)

Aplicativo mobile da Paróquia Nossa Senhora do Rosário (Serra Talhada - PE),
desenvolvido em **React Native + Expo**. Conversão do site web original
(HTML/CSS/JS) para a disciplina de Mobile da faculdade.

O app permite aos fiéis consultar horários de missas e confissões, avisos da
paróquia, eventos, informações das igrejas/capelas, fazer ofertas via PIX e
acompanhar orações e o Santo Terço — tudo sincronizado com uma planilha do
Google Sheets. Também possui um **Painel Administrativo completo**, acessado
de dentro do próprio app, onde o coordenador da paróquia cadastra, edita e
remove tudo isso sem precisar mexer em código.

---

## 👥 Colaboradores

- **Cleiton Lima** — desenvolvimento
- **João Vitor Lima** — colaborador — [github.com/jvitor-lima](https://github.com/jvitor-lima)

---

## 📱 Sobre o projeto

### Área pública (fiéis)

- **Início** — imagem e nome da paróquia, e um resumo com a próxima
  celebração, próxima confissão e próximo evento, calculados
  automaticamente a partir dos horários cadastrados.
- **Horários** — missas, confissões e demais celebrações, com filtro por
  igreja. A data é sempre calculada a partir do dia da semana cadastrado,
  então nunca fica desatualizada.
- **Avisos** — comunicados da paróquia, com destaque para os
  urgentes/importantes. Avisos vencidos somem sozinhos.
- **Eventos** — programação especial (festas, retiros, novenas etc.).
- **Igrejas** — cada igreja/capela, com foto de capa, endereço, WhatsApp,
  Google Maps e um card de "Rede social oficial da paróquia" (Instagram,
  WhatsApp, Facebook, YouTube, Site, Drive).
- **Oferta (PIX)** — QR Code e chave PIX, com botão de copiar.
- **Orações** — orações do dia a dia (Pai-Nosso, Ave-Maria, orações de
  santos etc.) e a seção "Como rezar o Santo Terço", com um terço
  interativo passo a passo (barra de progresso, Anterior/Próximo,
  mistério do dia calculado automaticamente).
- **Configurações** — nome/apelido, avatar, temas visuais (Marianos,
  Santos, Litúrgicos...), acessibilidade, e o acesso ao Painel
  Administrativo.
- Funciona **offline**: os últimos dados recebidos ficam salvos no
  aparelho e aparecem automaticamente se não houver internet.

### Painel Administrativo (coordenador)

Acessado por senha, dentro do app (Configurações → Acesso do Coordenador).
Permite:

- **Área Pastoral** — cadastrar/editar/excluir igrejas
- **Horários, Avisos, Eventos** — CRUD completo, agrupado por igreja
- **Oferta (PIX)** — QR Code (upload direto da galeria do celular), chave,
  banco etc.
- **Galeria** — adicionar/remover fotos de cada igreja
- **Redes Sociais** — Instagram, WhatsApp, Facebook, YouTube, Site, Drive,
  e a imagem/nome do card de "Rede social oficial"
- **Configurações Gerais** — dados da paróquia, logo, imagem inicial, e
  troca da própria senha do painel
- Upload de imagens envia direto para o Google Drive (via Apps Script) e
  salva a URL na planilha

### Tecnologias usadas

| Camada | Tecnologia |
|---|---|
| Aplicativo | React Native + Expo |
| Navegação | React Navigation (bottom tabs + native stack) |
| Dados locais/offline | AsyncStorage |
| Seleção de imagens | expo-image-picker |
| Cópia para área de transferência | expo-clipboard |
| Leitura de arquivo para upload | expo-file-system |
| Backend/API | Google Apps Script |
| Banco de dados | Google Sheets |

---

## ✅ Pré-requisitos

Antes de rodar o projeto, instale na sua máquina:

1. **Node.js** (versão LTS) — [nodejs.org](https://nodejs.org)
   ```bash
   node --version
   npm --version
   ```
2. **Git** — [git-scm.com](https://git-scm.com)
3. **VSCode** (ou outro editor) — [code.visualstudio.com](https://code.visualstudio.com)
4. **App Expo Go** no celular, para testar no aparelho físico:
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iPhone: [App Store](https://apps.apple.com/app/expo-go/id982107779)

Não é necessário instalar Android Studio ou Xcode só para rodar via Expo Go
ou no modo Web.

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

Se o `npm install` não resolver tudo direito (algumas libs do Expo
precisam de versões específicas), rode também:

```bash
npx expo install
```

### Se for a primeira vez que alguém (ex.: o professor) roda o projeto

Além do `npm install`, confirme que estas dependências específicas do
Expo estão instaladas — normalmente já vêm do `package.json`, mas se
faltar alguma, instale com o comando abaixo:

```bash
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage @expo/vector-icons expo-file-system expo-clipboard expo-image-picker
```

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

Depois, no terminal, aperte **`w`** para abrir a versão Web no navegador.
É a forma mais rápida de conferir as telas sem precisar de celular.

### Rodar no celular pelo Expo Go

```bash
npx expo start
```

Isso abre um **QR Code**. Abra o app **Expo Go** no celular e escaneie.

**Importante:** o computador e o celular precisam estar na **mesma rede
Wi-Fi**.

### Se o QR Code não conectar (tela azul de erro / não carrega)

Costuma ser o celular e o PC não conseguindo "se enxergar" na rede (comum
em Wi-Fi de faculdade ou firewall bloqueando). Tente, nesta ordem:

```bash
npx expo start --lan
```
Se ainda não funcionar, libere o Node.js no Firewall do Windows (ao rodar
`npx expo start` a primeira vez, o Windows deve perguntar se permite
acesso — clique em **Permitir**). Se nada disso resolver, use o modo túnel
(mais lento, mas funciona em redes restritas):
```bash
npx expo start --tunnel
```

---

## 🔐 Acessando o Painel Administrativo

1. Abra o app normalmente (Web, Expo Go ou APK instalado)
2. Vá em **Configurações → Acesso do Coordenador**
3. Digite a senha do painel (a mesma cadastrada na aba **Administracao**
   da planilha do Google Sheets)
4. Dentro do painel, é possível **trocar a senha** em Configurações
   Gerais, a qualquer momento

---

## 🔌 Configurando a API (Google Apps Script)

O app se conecta à mesma planilha/API usada pelo backend em Google Apps
Script. A URL fica em:

```
src/api/api.js
```

na constante `URL_API`, no topo do arquivo. Se a URL do Apps Script mudar
no futuro (nova publicação, por exemplo), basta atualizar essa linha.

---

## 📦 Gerando o APK (para instalar direto no celular)

O projeto usa **EAS Build** (serviço da própria Expo) para compilar o
`.apk`. Passo a passo resumido:

```bash
# 1. Instalar a CLI (uma vez só, globalmente)
npm install -g eas-cli

# 2. Login (crie uma conta gratuita em expo.dev antes, se não tiver)
eas login

# 3. Conectar o projeto (o ID já está salvo em app.json > extra > eas > projectId)
eas build:configure
```

Depois, confirme que o arquivo **`eas.json`** (na raiz do projeto) tem o
perfil `preview` configurado para gerar `.apk` (e não `.aab`, que é só
para lojas de aplicativo):

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": { "autoIncrement": true }
  }
}
```

Depois é só rodar:

```bash
eas build --platform android --profile preview
```

O build roda na nuvem da Expo (10–20 minutos). Ao terminar, o terminal
mostra um link de download do `.apk` — também disponível em
**expo.dev → seu projeto → Builds**. Basta transferir esse arquivo para o
celular e instalar (autorizando "instalar de fontes desconhecidas", se
pedido).

---

## 📂 Estrutura do projeto

```
├── App.js                     → Ponto de entrada, navegação principal
├── eas.json                   → Configuração de build (EAS)
├── src/
│   ├── api/
│   │   └── api.js             → Comunicação com a API (Google Apps Script)
│   ├── context/
│   │   └── AppContext.js      → Estado global do app público (dados, usuário, tema, cache offline)
│   ├── admin/                 → Painel Administrativo completo
│   │   ├── AdminContext.js    → Sessão (senha) e dados administrativos
│   │   ├── AdminLoginScreen.js
│   │   ├── AdminMenuScreen.js
│   │   ├── Admin*.js          → Uma tela por seção (Igrejas, Horários, Avisos, Eventos, PIX, Galeria, Redes Sociais, Configurações)
│   │   └── components/        → CampoFormulario, SeletorOpcoes, AdminCrudScreen (genérico), ConfirmModal, AdminHeader
│   ├── data/
│   │   ├── avatares.js        → Lista de avatares disponíveis
│   │   └── oracoes.js         → Orações, terços e mistérios
│   ├── screens/                → Telas públicas (Início, Horários, Avisos, Eventos, Igrejas, Oferta, Orações, Configurações)
│   ├── components/             → Componentes reutilizáveis (cabeçalho, filtro por igreja, tela de carregamento)
│   └── utils/
│       └── datas.js           → Funções de data (cálculo de dia da semana, formatação etc.)
├── assets/                     → Imagens fixas do app (avatares, logos, ícone do app)
└── package.json
```

---

## 🐛 Problemas comuns

| Sintoma | Provável causa | Solução |
|---|---|---|
| Tela azul de erro ao abrir no Expo Go | Celular e PC em redes diferentes | Usar `--lan` ou `--tunnel` (veja acima) |
| `Unable to resolve module .../assets/...` | Arquivo de imagem não existe no caminho esperado | Conferir se o arquivo está na pasta certa com o nome exato |
| `Unable to resolve "nome-do-pacote"` | Dependência não instalada | `npx expo install nome-do-pacote` |
| Confirmação (Excluir/Sair) não funciona no modo Web | `Alert.alert` com múltiplos botões não é bem suportado no navegador | Já corrigido no projeto com modais de confirmação próprios |
| Upload de imagem falha só no modo Web | `expo-file-system` não lê URIs `blob:` do navegador | Já corrigido no projeto (usa `fetch`+`FileReader` no Web) |
| Ícone do Expo aparece em vez do ícone da paróquia no APK | `icon`/`adaptiveIcon` não configurados em `app.json` | Configurar os caminhos das imagens e gerar um novo build |
| App abre e fecha sozinho no APK (mas funciona no Expo Go) | Geralmente falta algum plugin/permissão em `app.json`, ou versão de lib incompatível | Ver o erro exato com `adb logcat *:E` (celular conectado via USB, com Depuração USB ativada) enquanto o app crasha |
| `Invalid UUID appId` ao rodar `eas init` | ID do projeto copiado incompleto | Copiar o ID completo em expo.dev → projeto → Project settings |

---

## 📄 Licença / Uso

Projeto acadêmico desenvolvido para fins de avaliação na disciplina de
Mobile. Os dados reais da Paróquia Nossa Senhora do Rosário são utilizados
com autorização, para fins de demonstração prática do sistema já usado
pela paróquia.