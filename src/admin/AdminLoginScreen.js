import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAdmin } from './AdminContext';

export default function AdminLoginScreen() {
  const navigation = useNavigation();
  const { entrar } = useAdmin();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function fazerLogin() {
    setErro('');
    setEntrando(true);
    const resultado = await entrar(senha);
    setEntrando(false);
    if (resultado.ok) {
      navigation.replace('AdminMenu');
    } else {
      setErro(resultado.erro || 'Senha incorreta.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <View style={styles.emblema}>
          <Text style={{ fontSize: 26 }}>⛪</Text>
        </View>
        <Text style={styles.titulo}>Painel Administrativo</Text>
        <Text style={styles.subtitulo}>Paróquia Nossa Senhora do Rosário</Text>

        <Text style={styles.rotulo}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
          onSubmitEditing={fazerLogin}
        />
        {!!erro && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity style={styles.botao} onPress={fazerLogin} disabled={entrando}>
          {entrando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={styles.linkVoltar}>← Voltar para o app</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7A1F2B', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380, alignItems: 'center' },
  emblema: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3ECE2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  titulo: { fontSize: 18, fontWeight: '700', color: '#2b2320', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#8a7d6f', marginBottom: 22 },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', alignSelf: 'flex-start', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10, padding: 12,
    fontSize: 15, color: '#2b2320', backgroundColor: '#FAF7F2', width: '100%',
  },
  erro: { color: '#B23A2E', fontSize: 12, alignSelf: 'flex-start', marginTop: 8 },
  botao: { backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', width: '100%', marginTop: 18 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  linkVoltar: { color: '#8a7d6f', fontSize: 13 },
});
