# Paróquia Nossa Senhora do Rosário --- Aplicativo Mobile

Aplicativo da **Paróquia Nossa Senhora do Rosário**, em Serra
Talhada--PE, desenvolvido com **React Native + Expo**. O projeto evolui
o site web original para uma experiência mobile.

O aplicativo permite consultar horários de missas e confissões, avisos,
eventos, igrejas e capelas, ofertas via PIX, orações e o Santo Terço.
Também inclui um **Painel Administrativo** para usuários autorizados
gerenciarem os dados sem editar o código-fonte.

> **Status:** o projeto possui configuração de build Android pelo EAS
> Build. A publicação para iOS/App Store ainda exige preparação
> específica, conta Apple Developer e aprovação da Apple.

------------------------------------------------------------------------

## 👥 Colaboradores

-   **Cleiton Lima** --- desenvolvimento
-   **João Vitor Lima** --- colaborador ---
    [github.com/jvitor-lima](https://github.com/jvitor-lima)

------------------------------------------------------------------------

## 📱 Funcionalidades

### Área pública

-   **Início:** resumo das próximas celebrações, confissões e eventos,
    com base nos dados cadastrados.
-   **Horários:** consulta de missas, confissões e outras celebrações,
    com filtro por igreja.
-   **Avisos:** comunicados paroquiais, incluindo destaque para avisos
    importantes.
-   **Eventos:** programação especial, como festas, retiros e novenas.
-   **Igrejas e capelas:** fotos, endereços, contatos e links de
    localização e redes sociais, quando cadastrados.
-   **Oferta via PIX:** exibição do QR Code e da chave PIX, com opção de
    copiar.
-   **Orações:** orações católicas e Santo Terço passo a passo, com
    progresso, navegação entre etapas e mistérios do dia.
-   **Configurações:** nome/apelido, avatar, temas visuais e opções de
    acessibilidade, além do acesso ao painel administrativo.
-   **Cache/offline:** dados previamente recebidos podem permanecer
    disponíveis localmente, conforme os recursos implementados em cada
    tela.
-   **Atualização das listas públicas:** o gesto de puxar para atualizar
    foi removido das telas Horários, Avisos, Eventos e Igrejas. As telas
    administrativas mantêm seus próprios recursos de atualização.

### Painel Administrativo

O painel é acessado dentro do aplicativo por usuários autorizados. As
permissões disponíveis dependem do cargo atribuído à conta.

-   **Área Pastoral:** cadastrar, editar e excluir igrejas e capelas.
-   **Horários, Avisos e Eventos:** gerenciamento dos registros.
-   **Oferta (PIX):** manutenção das informações e do QR Code.
-   **Galeria:** gerenciamento de fotos relacionadas às igrejas.
-   **Redes Sociais:** manutenção dos links e informações apresentados
    ao público.
-   **Configurações gerais:** gerenciamento de informações e imagens
    institucionais.
-   **Histórico de alterações:** consulta às alterações administrativas,
    conforme as permissões disponíveis.
-   **Navegação de retorno:** o botão **INÍCIO** volta à área pública
    sem acionar a opção **SAIR**. O botão **SAIR** continua destinado ao
    encerramento da sessão.

### Cadastro e edição de igrejas

-   Seletor visual para a **cor de identificação**.
-   Pré-visualização da cor escolhida.
-   Campo hexadecimal para informar uma cor manualmente, por exemplo
    `#7A1F2B`.
-   O seletor é integrado ao formulário genérico e usado no cadastro e
    na edição de igrejas.

### Interface

-   Ícone do aplicativo configurado com o brasão da paróquia,
    centralizado em fundo branco.
-   Nome exibido do aplicativo: **N. Sra. do Rosário**.
-   Modal do Santo Terço com opções para continuar de onde parou ou
    começar novamente.
-   Interface responsiva para os ambientes suportados pelo projeto.

------------------------------------------------------------------------

## 🧰 Tecnologias

  Camada/recurso                  Tecnologia
  ------------------------------- -----------------------------------------------
  Aplicativo                      React Native + Expo
  Navegação                       React Navigation (bottom tabs e native stack)
  Dados locais                    AsyncStorage
  Ícones                          `@expo/vector-icons`
  Seleção e exibição de imagens   `expo-image-picker`, `expo-image`
  Compartilhamento                `expo-sharing`
  Área de transferência           `expo-clipboard`
  Arquivos e impressão            `expo-file-system`, `expo-print`
  Seletor visual de cores         `react-native-wheel-color-picker`
  Build para lojas                EAS Build / EAS Submit

Consulte `package.json` e os arquivos em `src/api/` para conferir as
dependências e integrações de dados efetivamente utilizadas.

------------------------------------------------------------------------

## ✅ Pré-requisitos

1.  **Node.js** --- preferencialmente uma versão compatível com o
    projeto. Verifique com `node --version` e `npm --version`. Site:
    [nodejs.org](https://nodejs.org).
2.  **Git** --- [git-scm.com](https://git-scm.com).
3.  **VS Code** ou outro editor ---
    [code.visualstudio.com](https://code.visualstudio.com).
4.  Uma conta Expo para utilizar o EAS Build ---
    [expo.dev](https://expo.dev).

Não é necessário instalar Android Studio ou Xcode para executar a versão
Web. O EAS Build também permite compilar aplicativos nativos na nuvem.

------------------------------------------------------------------------

## ⬇️ Instalar o projeto

``` bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git

# 2. Entre na pasta
cd NOME-DO-REPOSITORIO

# 3. Instale as dependências
npm install
```

Substitua `SEU-USUARIO/NOME-DO-REPOSITORIO` pelo endereço real do
repositório. Depois, confira as dependências do Expo:

``` bash
npx expo install --check
```

------------------------------------------------------------------------

## ▶️ Executar o projeto

### Versão Web

``` bash
npx expo start
```

Quando o servidor iniciar, pressione **`w`** no terminal para abrir a
versão Web.

### Testar no celular com Expo Go

``` bash
npx expo start
```

Escaneie o QR Code pelo Expo Go. Normalmente, computador e celular
precisam estar na mesma rede Wi-Fi. A compatibilidade depende da versão
do Expo Go e das dependências utilizadas.

Se a conexão pela rede local falhar, tente:

``` bash
npx expo start --tunnel
```

Se o Expo Go não for compatível com alguma dependência nativa ou com a
versão do projeto, utilize um build de desenvolvimento ou um APK gerado
pelo EAS Build.

------------------------------------------------------------------------

## 🔐 Acessar o Painel Administrativo

1.  Abra o aplicativo.
2.  Entre em **Configurações → Acesso do Coordenador**.
3.  Faça login com uma conta administrativa autorizada.
4.  Utilize as seções disponíveis conforme as permissões atribuídas.

O botão **INÍCIO** no cabeçalho retorna à área pública sem executar a
ação de saída. Para encerrar a sessão, utilize **SAIR** e confirme a
operação.

------------------------------------------------------------------------

## 🎨 Seletor de cores das igrejas

O campo **Cor de identificação** permite selecionar uma cor visualmente
ou informar o código hexadecimal. Exemplo: `#7A1F2B`.

O seletor está integrado a `src/admin/components/CampoFormulario.js` e é
usado pelos formulários que declaram `tipo: 'color'`. A biblioteca
utilizada é `react-native-wheel-color-picker`.

Arquivos relacionados: - `src/admin/components/CampoFormulario.js` -
`src/admin/AdminIgrejasScreen.js` - `package.json`

------------------------------------------------------------------------

## 📦 Gerar o APK Android

O projeto utiliza **EAS Build**, serviço de compilação na nuvem da Expo.

### 1. Instalar e acessar o EAS CLI

``` bash
npm install -g eas-cli
eas login
```

Entre com a conta Expo vinculada ao projeto.

### 2. Conferir o perfil de build

O arquivo `eas.json`, na raiz do projeto, deve conter um perfil
`preview` com distribuição interna e `android.buildType` definido como
`apk`. Preserve as configurações existentes ao editar o arquivo.

Exemplo do perfil:

``` json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 3. Validar antes da compilação

``` bash
npx expo install --check
npx expo-doctor
npx expo export --platform android
```

Esses comandos verificam dependências, configuração e exportação
JavaScript; não geram o APK.

### 4. Compilar

``` bash
eas build --platform android --profile preview
```

Ao finalizar, o EAS disponibilizará um link para baixar o APK. Abra o
link no dispositivo Android e siga as instruções do sistema para
instalar o aplicativo.

O tempo de compilação varia conforme a fila e o serviço.

------------------------------------------------------------------------

## 🍎 Preparação para iOS e App Store

O projeto utiliza React Native + Expo e pode ser preparado para uma
compilação iOS com EAS Build. **A publicação para iOS ainda depende de
configuração, testes e aprovação da Apple.**

Antes de compilar, será necessário:

1.  Definir um identificador iOS exclusivo na configuração Expo, por
    meio de `ios.bundleIdentifier`.
2.  Conferir ícone, nome, permissões e compatibilidade das dependências
    com iOS.
3.  Configurar as credenciais e a assinatura exigidas pela Apple.
4.  Para distribuição pública pela App Store, ter uma conta ativa no
    **Apple Developer Program**.
5.  Configurar o app no App Store Connect e preparar descrição, capturas
    de tela, informações de privacidade e classificação etária.
6.  Gerar o build iOS com EAS Build, enviar ao App Store Connect e
    submetê-lo à revisão da Apple.

A compilação pode ser realizada na nuvem, sem instalar o Xcode no
computador Windows. A publicação depende das exigências e da aprovação
da Apple.

Documentação oficial: - [EAS
Build](https://docs.expo.dev/build/introduction/) - [EAS
Submit](https://docs.expo.dev/submit/introduction/) - [Apple Developer
Program](https://developer.apple.com/programs/)

------------------------------------------------------------------------

## 📂 Estrutura do projeto

``` text
├── App.js
├── app.json
├── eas.json
├── package.json
├── assets/
│   ├── avatares/
│   └── logos/
└── src/
    ├── api/
    ├── context/
    ├── admin/
    │   ├── AdminContext.js
    │   ├── AdminLoginScreen.js
    │   ├── AdminMenuScreen.js
    │   └── components/
    │       ├── CampoFormulario.js
    │       ├── AdminCrudScreen.js
    │       ├── ConfirmModal.js
    │       └── ...
    ├── data/
    ├── screens/
    ├── components/
    └── utils/
```

A estrutura acima é resumida. Consulte os arquivos do repositório para
ver todos os módulos.

------------------------------------------------------------------------

## 🐛 Problemas comuns

  ------------------------------------------------------------------------
  Sintoma                             O que verificar
  ----------------------------------- ------------------------------------
  QR Code não conecta                 Confirme que os dispositivos estão
                                      na mesma rede e tente
                                      `npx expo start --tunnel`.

  `Unable to resolve module`          Verifique o nome da dependência, os
                                      imports e execute `npm install` se
                                      necessário.

  Imagem não aparece                  Confira o caminho, o nome do arquivo
                                      e a extensão.

  Build falha                         Leia o log completo do EAS Build e
                                      confira as versões e configurações
                                      indicadas no erro.

  Seletor de cores não aparece ou não Confira a instalação de
  responde                            `react-native-wheel-color-picker`, o
                                      bloco `campo.tipo === 'color'` e os
                                      logs da plataforma.

  Ícone padrão do Expo aparece        Confira `icon` e
                                      `android.adaptiveIcon` em `app.json`
                                      e gere um novo build.

  Aplicativo fecha ao abrir           Consulte os logs do dispositivo e
                                      confira dependências nativas e
                                      configuração Expo.

  Build iOS não inicia                Confira `ios.bundleIdentifier`, a
                                      conta Expo, as credenciais Apple e
                                      as configurações de assinatura.
  ------------------------------------------------------------------------

Antes de atualizar dependências em massa, faça uma cópia ou commit das
alterações e leia os avisos do npm. Evite atualizações forçadas sem
verificar possíveis incompatibilidades.

------------------------------------------------------------------------

## 📄 Licença e uso

Projeto acadêmico desenvolvido para fins de avaliação na disciplina de
Mobile. Os dados reais da Paróquia Nossa Senhora do Rosário são
utilizados com autorização para demonstração prática do sistema
utilizado pela paróquia.
