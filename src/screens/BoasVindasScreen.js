import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { AVATARES } from '../data/avatares';

export default function BoasVindasScreen({ onConcluir }) {
  const { salvarUsuario } = useApp();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [apelido, setApelido] = useState('');
  const [avatarSelecionado, setAvatarSelecionado] = useState(AVATARES[0].id);

  async function concluir() {
    if (!nomeCompleto.trim() || !apelido.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha seu nome e como quer ser chamado.');
      return;
    }
    await salvarUsuario({ nomeCompleto: nomeCompleto.trim(), apelido: apelido.trim(), avatar: avatarSelecionado });
    onConcluir();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Image
          source={require('../../assets/logos/brasao.webp')}
          style={styles.brasao}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>Paróquia N. Sra. do Rosário</Text>
        <Text style={styles.subtitulo}>Que bom ter você aqui! Para começarmos, como podemos te chamar?</Text>

        <View style={styles.card}>
          <Text style={styles.rotulo}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Cleiton Lima"
            value={nomeCompleto}
            onChangeText={setNomeCompleto}
            autoCapitalize="words"
          />

          <Text style={styles.rotulo}>Como quer ser chamado?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Cleiton"
            value={apelido}
            onChangeText={setApelido}
            autoCapitalize="words"
          />

          <Text style={styles.rotulo}>Escolha seu avatar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
            {AVATARES.map(av => (
              <TouchableOpacity
                key={av.id}
                onPress={() => setAvatarSelecionado(av.id)}
                style={[styles.avatarBtn, avatarSelecionado === av.id && styles.avatarBtnAtivo]}
              >
                <Image source={av.imagem} style={styles.avatarImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.botao} onPress={concluir} activeOpacity={0.8}>
            <Text style={styles.botaoTexto}>Entrar 🙏</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7A1F2B' },
  scroll: { alignItems: 'center', padding: 24, paddingTop: 60 },
  brasao: { width: 110, height: 110, borderRadius: 55, marginBottom: 16 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitulo: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', gap: 8 },
  rotulo: { fontSize: 13, fontWeight: '700', color: '#333', marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#222', backgroundColor: '#fafafa',
  },
  avatarScroll: { marginVertical: 8 },
  avatarBtn: {
    width: 60, height: 60, borderRadius: 30, marginRight: 10,
    borderWidth: 2, borderColor: 'transparent', overflow: 'hidden',
  },
  avatarBtnAtivo: { borderColor: '#7A1F2B' },
  avatarImg: { width: 60, height: 60, borderRadius: 30 },
  botao: {
    backgroundColor: '#7A1F2B', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 16,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
