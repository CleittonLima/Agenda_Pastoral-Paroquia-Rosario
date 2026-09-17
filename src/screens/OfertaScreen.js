import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function OfertaScreen() {
  const navigation = useNavigation();
  const { dados } = useApp();
  const pix = dados.pix || {};
  const [copiado, setCopiado] = useState(false);

  async function copiarChave() {
    if (!pix.chave) return;
    await Clipboard.setStringAsync(pix.chave);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cabecalhoTitulo}>Oferta</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtexto}>
          Sua contribuição ajuda a manter a vida e as obras da nossa comunidade.
        </Text>

        <View style={styles.card}>
          {pix.qrcode ? (
            <Image source={{ uri: pix.qrcode }} style={styles.qrcode} resizeMode="contain" />
          ) : (
            <View style={styles.qrcodeVazio}>
              <Text style={styles.qrcodeVazioTexto}>QR Code ainda não cadastrado.</Text>
            </View>
          )}

          <Text style={styles.destinatario}>{pix.destinatario || 'Paróquia Nossa Senhora do Rosário'}</Text>

          <View style={styles.chaveContainer}>
            <Text style={styles.chave} numberOfLines={1}>{pix.chave || 'Chave ainda não cadastrada'}</Text>
            <TouchableOpacity
              style={[styles.botaoCopiar, !pix.chave && styles.botaoDesabilitado]}
              onPress={copiarChave}
              disabled={!pix.chave}
            >
              <Text style={styles.botaoCopiarTexto}>{copiado ? 'Copiado! ✓' : 'Copiar chave PIX'}</Text>
            </TouchableOpacity>
          </View>
          {!!pix.tipo && <Text style={styles.tipoChave}>Tipo de chave PIX: {pix.tipo}</Text>}

          {!!pix.informacoes && <Text style={styles.descricao}>{pix.informacoes}</Text>}
          {!!pix.tutorial && <Text style={styles.descricao}>{pix.tutorial}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.passosTitulo}>Como fazer sua oferta pelo PIX</Text>
          {[
            'Abra o aplicativo do seu banco;',
            'Escolha a opção PIX;',
            'Escaneie o QR Code ou copie a chave;',
            'Confira os dados da paróquia;',
            'Informe o valor e confirme a transferência.',
          ].map((passo, i) => (
            <View key={i} style={styles.passoLinha}>
              <Text style={styles.passoNumero}>{i + 1}</Text>
              <Text style={styles.passoTexto}>{passo}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  cabecalho: {
    backgroundColor: '#7A1F2B', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, paddingTop: 54,
  },
  botaoVoltar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  cabecalhoTitulo: { color: '#fff', fontWeight: '700', fontSize: 17 },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },
  subtexto: { fontSize: 13, color: '#8a7d6f', marginBottom: 2 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  qrcode: { width: 200, height: 200, borderRadius: 10, marginBottom: 14 },
  qrcodeVazio: {
    width: 200, height: 200, borderRadius: 10, marginBottom: 14,
    borderWidth: 2, borderColor: '#e3ddd2', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  qrcodeVazioTexto: { color: '#a89b8c', textAlign: 'center', fontSize: 13 },
  destinatario: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 12, textAlign: 'center' },
  chaveContainer: { width: '100%', gap: 10 },
  chave: {
    backgroundColor: '#F3ECE2', borderRadius: 10, padding: 12,
    fontSize: 14, color: '#2b2320', textAlign: 'center',
  },
  botaoCopiar: { backgroundColor: '#7A1F2B', borderRadius: 10, padding: 13, alignItems: 'center' },
  botaoDesabilitado: { opacity: 0.4 },
  botaoCopiarTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tipoChave: { fontSize: 12, color: '#8a7d6f', marginTop: 8 },
  descricao: { fontSize: 13, color: '#6b6058', marginTop: 12, textAlign: 'center', lineHeight: 19 },
  passosTitulo: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 12, alignSelf: 'flex-start' },
  passoLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10, width: '100%' },
  passoNumero: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#7A1F2B', color: '#fff',
    fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 22,
  },
  passoTexto: { flex: 1, fontSize: 13, color: '#5a5048', lineHeight: 19 },
});
