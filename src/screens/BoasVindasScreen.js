import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { useApp } from '../context/AppContext';
import { AVATARES } from '../data/avatares';

export default function BoasVindasScreen({
  primeiroAcesso,
  onConcluir,
}) {
  const {
    usuario,
    salvarUsuario,
    dados,
    temaCores,
  } = useApp();

  const [nomeCompleto, setNomeCompleto] = useState(
    usuario?.nomeCompleto || ''
  );

  const [apelido, setApelido] = useState(
    usuario?.apelido || ''
  );

  const [avatarSelecionado, setAvatarSelecionado] = useState(
    usuario?.avatar || AVATARES[0].id
  );

  // Configurações personalizadas pelo painel administrativo
  const config = dados?.config || {};

  const nomeParoquia =
    config.nomeParoquia ||
    'Paróquia Nossa Senhora do Rosário';

  const mensagemBoasVindas =
    config.mensagemBoasVindas ||
    'Que bom ter você aqui! Para começarmos, como podemos te chamar?';

  const mensagemRetorno =
    config.mensagemRetorno ||
    'Vivendo a fé, unidos em comunidade.';

  const textoBotaoBoasVindas =
    config.textoBotaoBoasVindas ||
    'Entrar 🙏';

  const textoBotaoRetorno =
    config.textoBotaoRetorno ||
    'Acessar aplicativo';

  async function concluir() {
    if (!nomeCompleto.trim() || !apelido.trim()) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha seu nome e como quer ser chamado.'
      );
      return;
    }

    await salvarUsuario({
      nomeCompleto: nomeCompleto.trim(),
      apelido: apelido.trim(),
      avatar: avatarSelecionado,
    });

    onConcluir();
  }

  // ----------------------------------------------------------
  // USUÁRIO JÁ CADASTRADO
  // ----------------------------------------------------------

  if (!primeiroAcesso && usuario) {
    const avatar = AVATARES.find(
      av => av.id === usuario.avatar
    );

    const logo =
      config.logoPrincipal ||
      require('../../assets/logos/brasao.webp');

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              temaCores.corFundo || temaCores.corCabecalho,
          },
        ]}
      >
        <View
          style={[
            styles.cardRetorno,
            {
              backgroundColor: temaCores.corCard || '#FFFFFF',
            },
          ]}
        >
          <Image
            source={
              typeof logo === 'string'
                ? { uri: logo }
                : logo
            }
            style={styles.logo}
            resizeMode="contain"
          />

          <Text
            style={[
              styles.titulo,
              {
                color: temaCores.corTexto || '#222222',
              },
            ]}
          >
            {nomeParoquia}
          </Text>

          {avatar && (
            <Image
              source={avatar.imagem}
              style={styles.avatarGrande}
            />
          )}

          <Text
            style={[
              styles.ola,
              {
                color: temaCores.corTexto || '#222222',
              },
            ]}
          >
            Olá, {usuario.apelido}! 🙏
          </Text>

          <Text
            style={[
              styles.subtituloRetorno,
              {
                color:
                  temaCores.corTextoSecundario || '#666666',
              },
            ]}
          >
            {mensagemRetorno}
          </Text>

          <TouchableOpacity
            style={[
              styles.botao,
              {
                backgroundColor: temaCores.corCabecalho,
              },
            ]}
            onPress={onConcluir}
            activeOpacity={0.8}
          >
            <Text style={styles.botaoTexto}>
              {textoBotaoRetorno}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ----------------------------------------------------------
  // PRIMEIRO ACESSO
  // ----------------------------------------------------------

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: temaCores.corCabecalho,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/logos/brasao.webp')}
          style={styles.brasao}
          resizeMode="contain"
        />

        <Text style={styles.tituloPrimeiro}>
          {nomeParoquia}
        </Text>

        <Text style={styles.subtituloPrimeiro}>
          {mensagemBoasVindas}
        </Text>

        <View style={styles.card}>
          <Text style={styles.rotulo}>
            Nome completo
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Cleiton Lima"
            value={nomeCompleto}
            onChangeText={setNomeCompleto}
            autoCapitalize="words"
          />

          <Text style={styles.rotulo}>
            Como quer ser chamado?
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Cleiton"
            value={apelido}
            onChangeText={setApelido}
            autoCapitalize="words"
          />

          <Text style={styles.rotulo}>
            Escolha seu avatar
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.avatarScroll}
          >
            {AVATARES.map(av => (
              <TouchableOpacity
                key={av.id}
                onPress={() => setAvatarSelecionado(av.id)}
                style={[
                  styles.avatarBtn,
                  avatarSelecionado === av.id &&
                    styles.avatarBtnAtivo,
                  avatarSelecionado === av.id && {
                    borderColor: temaCores.corCabecalho,
                  },
                ]}
              >
                <Image
                  source={av.imagem}
                  style={styles.avatarImg}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.botao,
              {
                backgroundColor: temaCores.corCabecalho,
              },
            ]}
            onPress={concluir}
            activeOpacity={0.8}
          >
            <Text style={styles.botaoTexto}>
              {textoBotaoBoasVindas}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },

  cardRetorno: {
    width: '90%',
    maxWidth: 520,
    minHeight: 500,
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  logo: {
    width: 145,
    height: 145,
    marginBottom: 18,
  },

  brasao: {
    width: 145,
    height: 145,
    marginBottom: 18,
  },

  titulo: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },

  tituloPrimeiro: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },

  ola: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtituloRetorno: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },

  subtituloPrimeiro: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },

  avatarGrande: {
    width: 74,
    height: 74,
    borderRadius: 37,
    marginBottom: 14,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 8,
  },

  rotulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
    marginTop: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#222222',
    backgroundColor: '#FAFAFA',
  },

  avatarScroll: {
    marginVertical: 8,
  },

  avatarBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },

  avatarBtnAtivo: {
    borderColor: '#7A1F2B',
  },

  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  botao: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },

  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});