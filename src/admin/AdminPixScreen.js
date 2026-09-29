import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useAdmin } from './AdminContext';
import { salvarPix, enviarImagem } from '../api/api';
import AdminHeader from './components/AdminHeader';
import { useSeletorImagem } from './components/RecorteImagem';
import { descricaoFormato } from './components/formatosImagem';

export default function AdminPixScreen() {
  const { dados, senha, recarregar } = useAdmin();
  const pix = dados.pix || {};
  const [form, setForm] = useState({});
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { escolherImagem, modalRecorte } = useSeletorImagem();
  const formAtual = useRef(form); // valores mais recentes (mesmo após esperar o envio da imagem)
  formAtual.current = form;

  useEffect(() => { setForm(pix); }, [dados.pix]);

  function mudar(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  async function escolherQrCode() {
    const foto = await escolherImagem('qrcode');
    if (!foto) return;

    setEnviandoImagem(true);
    try {
      const resposta = await enviarImagem(senha, foto.uri, foto.fileName, foto.mimeType, foto.base64);
      if (resposta.ok) {
        const atualizado = { ...formAtual.current, QRCode: resposta.url };
        setForm(atualizado);
        // Salva na hora — não depende de clicar em "Salvar" separadamente
        await salvarPix(senha, atualizado);
        await recarregar();
        Alert.alert('Pronto', 'QR Code enviado e salvo!');
      } else {
        Alert.alert('Erro', resposta.erro || 'Não foi possível enviar a imagem.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao enviar a imagem. Verifique sua internet.');
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function salvar() {
    setSalvando(true);
    const resultado = await salvarPix(senha, form);
    setSalvando(false);
    if (resultado.ok) {
      await recarregar();
      Alert.alert('Salvo', 'Informações do PIX atualizadas.');
    } else {
      Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
    }
  }

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Oferta (PIX)" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.rotulo}>QR Code</Text>
        <View style={styles.imagemLinha}>
          <View style={styles.previewCaixa}>
            {enviandoImagem ? <ActivityIndicator color="#7A1F2B" /> : form.QRCode ? (
              <Image source={{ uri: form.QRCode }} style={styles.preview} />
            ) : <Text style={{ fontSize: 22 }}>🖼️</Text>}
          </View>
          <TouchableOpacity style={styles.botaoEscolher} onPress={escolherQrCode} disabled={enviandoImagem}>
            <Text style={styles.botaoEscolherTexto}>{form.QRCode ? 'Trocar QR Code' : 'Escolher QR Code'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dicaImagem}>{descricaoFormato('qrcode')}</Text>

        {[
          ['TipoChave', 'Tipo da chave'],
          ['Chave', 'Chave PIX'],
          ['Favorecido', 'Nome do favorecido'],
          ['Banco', 'Banco'],
        ].map(([campo, rotulo]) => (
          <View key={campo} style={styles.grupo}>
            <Text style={styles.rotulo}>{rotulo}</Text>
            <TextInput style={styles.input} value={form[campo] || ''} onChangeText={(v) => mudar(campo, v)} />
          </View>
        ))}

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>Mensagem (aparece abaixo da chave, no app)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.Mensagem || ''}
            onChangeText={(v) => mudar('Mensagem', v)}
            multiline
          />
        </View>
        <View style={styles.grupo}>
          <Text style={styles.rotulo}>Tutorial (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.Tutorial || ''}
            onChangeText={(v) => mudar('Tutorial', v)}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} disabled={salvando}>
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoSalvarTexto}>Salvar</Text>}
        </TouchableOpacity>
      </ScrollView>
      {modalRecorte}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  grupo: { marginBottom: 14 },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10, padding: 11, fontSize: 14, color: '#2b2320', backgroundColor: '#fff' },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  imagemLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  dicaImagem: { fontSize: 11, color: '#8a7d6f', marginBottom: 16 },
  previewCaixa: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e3ddd2' },
  preview: { width: '100%', height: '100%' },
  botaoEscolher: { borderWidth: 1, borderColor: '#7A1F2B', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  botaoEscolherTexto: { color: '#7A1F2B', fontWeight: '700', fontSize: 13 },
  botaoSalvar: { backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
