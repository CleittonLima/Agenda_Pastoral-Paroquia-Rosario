import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useAdmin } from './AdminContext';
import { useApp } from '../context/AppContext';

export default function AdminLoginScreen() {
  const navigation = useNavigation();

  const {
    entrar,
    logado,
    verificandoSessao,
  } = useAdmin();

  const { mostrarToast } = useApp();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  React.useEffect(() => {
    if (!verificandoSessao && logado) {
      navigation.replace('AdminMenu');
    }
  }, [verificandoSessao, logado, navigation]);

  if (verificandoSessao) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  async function fazerLogin() {
    if (!email.trim()) {
      mostrarToast('Informe o e-mail.', 'aviso');
      return;
    }

    if (!senha) {
      mostrarToast('Informe a senha.', 'aviso');
      return;
    }

    setEntrando(true);

    try {
      const resultado = await entrar(email.trim(), senha);

      if (resultado.ok) {
        navigation.replace('AdminMenu');
      } else {
        mostrarToast(
          resultado.erro || 'E-mail ou senha incorretos.',
          'erro'
        );
      }
    } catch (erro) {
      console.error('Erro ao realizar login:', erro);

      mostrarToast(
        'Não foi possível realizar o login.',
        'erro'
      );
    } finally {
      setEntrando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.emblema}>
          <Text style={{ fontSize: 26 }}>⛪</Text>
        </View>

        <Text style={styles.titulo}>
          Painel Administrativo
        </Text>

        <Text style={styles.subtitulo}>
          Paróquia Nossa Senhora do Rosário
        </Text>

        {/* E-MAIL */}
        <Text style={styles.rotulo}>
          E-mail
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#a49a90"
          onSubmitEditing={fazerLogin}
          editable={!entrando}
        />

        {/* SENHA */}
        <Text style={[styles.rotulo, { marginTop: 14 }]}>
          Senha
        </Text>

        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Digite sua senha"
          placeholderTextColor="#a49a90"
          onSubmitEditing={fazerLogin}
          editable={!entrando}
        />

        <TouchableOpacity
          style={[
            styles.botao,
            entrando && styles.botaoDesabilitado,
          ]}
          onPress={fazerLogin}
          disabled={entrando}
        >
          {entrando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>
              Entrar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 14 }}
          disabled={entrando}
        >
          <Text style={styles.linkVoltar}>
            ← Voltar para o app
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7A1F2B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },

  emblema: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3ECE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b2320',
    marginBottom: 4,
  },

  subtitulo: {
    fontSize: 13,
    color: '#8a7d6f',
    marginBottom: 22,
  },

  rotulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a5048',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#2b2320',
    backgroundColor: '#FAF7F2',
    width: '100%',
  },

  botao: {
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  linkVoltar: {
    color: '#8a7d6f',
    fontSize: 13,
  },
});