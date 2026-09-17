import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdmin } from './AdminContext';
import { salvarConfiguracoes, enviarImagem } from '../api/api';
import AdminHeader from './components/AdminHeader';

const CAMPOS = [
  ['Instagram', 'Instagram'],
  ['WhatsApp', 'WhatsApp (DDI + DDD, só números)'],
  ['Facebook', 'Facebook (opcional)'],
  ['Youtube', 'Youtube (opcional)'],
  ['Site', 'Site (opcional)'],
  ['Drive', 'Google Drive (opcional — link da pasta de fotos)'],
];

export default function AdminRedesSociaisScreen() {
  const { dados, senha, recarregar } = useAdmin();
  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  useEffect(() => { setForm(dados.config || {}); }, [dados.config]);

  async function salvar() {
    setSalvando(true);
    const resultado = await salvarConfiguracoes(senha, { ...dados.config, ...form });
    setSalvando(false);
    if (resultado.ok) {
      await recarregar();
      Alert.alert('Salvo', 'Redes sociais atualizadas.');
    } else {
      Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
    }
  }

  async function escolherImagemCard() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (resultado.canceled) return;

    const foto = resultado.assets[0];
    setEnviandoImagem(true);
    try {
      const resposta = await enviarImagem(senha, foto.uri, foto.fileName, foto.mimeType);
      if (resposta.ok) {
        const atualizado = { ...form, RedeSocialImagem: resposta.url };
        setForm(atualizado);
        await salvarConfiguracoes(senha, { ...dados.config, ...atualizado });
        await recarregar();
        Alert.alert('Pronto', 'Imagem do card enviada e salva!');
      } else {
        Alert.alert('Erro', resposta.erro || 'Não foi possível enviar a imagem.');
      }
    } finally {
      setEnviandoImagem(false);
    }
  }

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Redes Sociais" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dica}>Facebook, Youtube, Site e Drive só aparecem no app se estiverem preenchidos aqui.</Text>

        {/* ---- Card "Rede social oficial" que aparece no final da lista de Igrejas ---- */}
        <View style={styles.blocoCard}>
          <Text style={styles.blocoCardTitulo}>Card "Rede social oficial" (aparece nas Igrejas)</Text>

          <Text style={styles.rotulo}>Imagem do card</Text>
          <View style={styles.imagemLinha}>
            <View style={styles.previewCaixa}>
              {enviandoImagem ? <ActivityIndicator color="#7A1F2B" /> : form.RedeSocialImagem ? (
                <Image source={{ uri: form.RedeSocialImagem }} style={styles.preview} />
              ) : <Text style={{ fontSize: 22 }}>📱</Text>}
            </View>
            <TouchableOpacity style={styles.botaoEscolher} onPress={escolherImagemCard} disabled={enviandoImagem}>
              <Text style={styles.botaoEscolherTexto}>{form.RedeSocialImagem ? 'Trocar imagem' : 'Escolher imagem'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grupo}>
            <Text style={styles.rotulo}>Nome do card</Text>
            <TextInput
              style={styles.input}
              value={form.RedeSocialNome || ''}
              onChangeText={(v) => setForm(f => ({ ...f, RedeSocialNome: v }))}
              placeholder="Rede social oficial da paróquia"
            />
          </View>
        </View>

        {CAMPOS.map(([campo, rotulo]) => (
          <View key={campo} style={styles.grupo}>
            <Text style={styles.rotulo}>{rotulo}</Text>
            <TextInput
              style={styles.input}
              value={form[campo] || ''}
              onChangeText={(v) => setForm(f => ({ ...f, [campo]: v }))}
              autoCapitalize="none"
            />
          </View>
        ))}
        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} disabled={salvando}>
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoSalvarTexto}>Salvar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  dica: { fontSize: 12, color: '#8a7d6f', marginBottom: 14 },
  blocoCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 18 },
  blocoCardTitulo: { fontSize: 14, fontWeight: '700', color: '#2b2320', marginBottom: 12 },
  grupo: { marginBottom: 14 },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10, padding: 11, fontSize: 14, color: '#2b2320', backgroundColor: '#fff' },
  imagemLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  previewCaixa: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#FAF7F2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e3ddd2' },
  preview: { width: '100%', height: '100%' },
  botaoEscolher: { borderWidth: 1, borderColor: '#7A1F2B', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  botaoEscolherTexto: { color: '#7A1F2B', fontWeight: '700', fontSize: 13 },
  botaoSalvar: { backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
