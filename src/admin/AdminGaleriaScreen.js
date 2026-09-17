import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from './AdminContext';
import { salvarIgreja, enviarImagem } from '../api/api';
import AdminHeader from './components/AdminHeader';
import ConfirmModal from './components/ConfirmModal';

function listaDeUrls(texto) {
  return String(texto || '').split(',').map(s => s.trim()).filter(Boolean);
}

export default function AdminGaleriaScreen() {
  const { dados, senha, recarregar } = useAdmin();
  const [enviandoId, setEnviandoId] = useState(null);
  const [fotoParaRemover, setFotoParaRemover] = useState(null); // { igreja, indice }

  async function adicionarFoto(igreja) {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (resultado.canceled) return;

    const foto = resultado.assets[0];
    setEnviandoId(igreja.ID);
    try {
      const resposta = await enviarImagem(senha, foto.uri, foto.fileName, foto.mimeType);
      if (!resposta.ok) {
        Alert.alert('Erro', resposta.erro || 'Falha ao enviar.');
        return;
      }
      const fotosAtuais = listaDeUrls(igreja.Galeria);
      fotosAtuais.push(resposta.url);
      const salvo = await salvarIgreja(senha, { ...igreja, Galeria: fotosAtuais.join(', ') });
      if (salvo.ok) await recarregar();
      else Alert.alert('Erro', salvo.erro || 'Não foi possível salvar.');
    } finally {
      setEnviandoId(null);
    }
  }

  function removerFoto(igreja, indice) {
    setFotoParaRemover({ igreja, indice });
  }

  async function executarRemocao() {
    if (!fotoParaRemover) return;
    const { igreja, indice } = fotoParaRemover;
    const fotosAtuais = listaDeUrls(igreja.Galeria);
    fotosAtuais.splice(indice, 1);
    const salvo = await salvarIgreja(senha, { ...igreja, Galeria: fotosAtuais.join(', ') });
    setFotoParaRemover(null);
    if (salvo.ok) await recarregar();
    else Alert.alert('Erro', salvo.erro || 'Não foi possível remover.');
  }

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Galeria de Fotos" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {dados.igrejas.map(igreja => {
          const fotos = listaDeUrls(igreja.Galeria);
          return (
            <View key={igreja.ID} style={styles.grupo}>
              <Text style={styles.grupoTitulo}>{igreja.Nome}</Text>
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={() => adicionarFoto(igreja)}
                disabled={enviandoId === igreja.ID}
              >
                {enviandoId === igreja.ID ? (
                  <ActivityIndicator color="#7A1F2B" />
                ) : (
                  <>
                    <Ionicons name="add" size={16} color="#7A1F2B" />
                    <Text style={styles.botaoAdicionarTexto}>Adicionar foto</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={styles.grade}>
                {fotos.map((url, i) => (
                  <View key={i} style={styles.fotoItem}>
                    <Image source={{ uri: url }} style={styles.foto} />
                    <TouchableOpacity style={styles.botaoRemover} onPress={() => removerFoto(igreja, i)}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <ConfirmModal
        visivel={!!fotoParaRemover}
        titulo="Remover foto"
        mensagem="Tem certeza que deseja remover esta foto?"
        textoConfirmar="Remover"
        onConfirmar={executarRemocao}
        onCancelar={() => setFotoParaRemover(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 32 },
  grupo: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  grupoTitulo: { fontSize: 15, fontWeight: '700', color: '#2b2320', marginBottom: 10 },
  botaoAdicionar: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#7A1F2B', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, marginBottom: 10,
  },
  botaoAdicionarTexto: { color: '#7A1F2B', fontWeight: '700', fontSize: 12 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fotoItem: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  foto: { width: '100%', height: '100%' },
  botaoRemover: {
    position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
});
