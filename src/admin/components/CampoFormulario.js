import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { enviarImagem } from '../../api/api';
import { useAdmin } from '../AdminContext';
import SeletorOpcoes from './SeletorOpcoes';

export default function CampoFormulario({ campo, valor, onMudar, igrejas }) {
  const { senha } = useAdmin();
  const [enviando, setEnviando] = useState(false);

  if (campo.tipo === 'select') {
    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{campo.rotulo}</Text>
        <SeletorOpcoes
          rotulo={campo.rotulo}
          valor={valor}
          rotuloValor={valor || campo.padrao}
          opcoes={campo.opcoes}
          onSelecionar={(v) => onMudar(v)}
        />
      </View>
    );
  }

  if (campo.tipo === 'select-igreja') {
    const opcoes = (igrejas || []).map(i => ({ valor: i.ID, rotulo: i.Nome }));
    const igrejaAtual = opcoes.find(o => o.valor === valor);
    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{campo.rotulo}</Text>
        <SeletorOpcoes
          rotulo={campo.rotulo}
          valor={valor}
          rotuloValor={igrejaAtual?.rotulo}
          opcoes={opcoes}
          onSelecionar={(v) => onMudar(v)}
        />
      </View>
    );
  }

  if (campo.tipo === 'textarea') {
    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{campo.rotulo}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={valor || ''}
          onChangeText={onMudar}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    );
  }

  if (campo.tipo === 'imagem') {
    async function escolherImagem() {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para enviar uma imagem.');
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (resultado.canceled) return;

      const foto = resultado.assets[0];
      setEnviando(true);
      try {
        const resposta = await enviarImagem(senha, foto.uri, foto.fileName, foto.mimeType);
        if (resposta.ok) {
          onMudar(resposta.url);
        } else {
          Alert.alert('Erro', resposta.erro || 'Não foi possível enviar a imagem.');
        }
      } catch (e) {
        Alert.alert('Erro', 'Falha ao enviar a imagem. Verifique sua internet.');
      } finally {
        setEnviando(false);
      }
    }

    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{campo.rotulo}</Text>
        <View style={styles.imagemLinha}>
          <View style={styles.previewCaixa}>
            {enviando ? (
              <ActivityIndicator color="#7A1F2B" />
            ) : valor ? (
              <Image source={{ uri: valor }} style={styles.preview} />
            ) : (
              <Text style={{ fontSize: 22 }}>🖼️</Text>
            )}
          </View>
          <TouchableOpacity style={styles.botaoEscolher} onPress={escolherImagem} disabled={enviando}>
            <Text style={styles.botaoEscolherTexto}>{valor ? 'Trocar imagem' : 'Escolher imagem'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (campo.tipo === 'color') {
    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{campo.rotulo}</Text>
        <View style={styles.corLinha}>
          <View style={[styles.corPreview, { backgroundColor: valor || '#7A1F2B' }]} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={valor || ''}
            onChangeText={onMudar}
            placeholder="#7A1F2B"
            autoCapitalize="none"
          />
        </View>
      </View>
    );
  }

  // text, url, date, time, number (campo simples de texto)
  const placeholders = { date: 'AAAA-MM-DD', time: 'HH:MM' };
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{campo.rotulo}</Text>
      <TextInput
        style={styles.input}
        value={valor || ''}
        onChangeText={onMudar}
        placeholder={placeholders[campo.tipo] || ''}
        keyboardType={campo.tipo === 'number' ? 'numeric' : 'default'}
        autoCapitalize={campo.tipo === 'url' ? 'none' : 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { marginBottom: 14 },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10,
    padding: 11, fontSize: 14, color: '#2b2320', backgroundColor: '#FAF7F2',
  },
  textarea: { minHeight: 90 },
  imagemLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewCaixa: {
    width: 60, height: 60, borderRadius: 10, backgroundColor: '#F3ECE2',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: '#e3ddd2',
  },
  preview: { width: '100%', height: '100%' },
  botaoEscolher: { borderWidth: 1, borderColor: '#7A1F2B', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  botaoEscolherTexto: { color: '#7A1F2B', fontWeight: '700', fontSize: 13 },
  corLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  corPreview: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#e3ddd2' },
});
