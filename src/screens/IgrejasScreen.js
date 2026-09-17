import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, TouchableOpacity,
  Modal, ScrollView, Linking, RefreshControl,
} from 'react-native';
import { useApp } from '../context/AppContext';
import CabecalhoApp from '../components/CabecalhoApp';

function linkWhatsApp(numero) {
  return `https://wa.me/${String(numero).replace(/\D/g, '')}`;
}

function valorValido(v) {
  const t = String(v || '').trim();
  return t.length > 0 && !t.startsWith('#');
}

export default function IgrejasScreen() {
  const { dados, recarregar } = useApp();
  const [igrejaSelecionada, setIgrejaSelecionada] = useState(null);
  const [redeSocialAberta, setRedeSocialAberta] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const config = dados.config || {};

  async function aoAtualizar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  const botoesRedeSocial = [
    valorValido(config.instagram) && { rotulo: '📷 Instagram', url: config.instagram, cor: null },
    valorValido(config.whatsapp) && { rotulo: '💬 Falar pelo WhatsApp', url: linkWhatsApp(config.whatsapp), cor: '#25D366' },
    valorValido(config.facebook) && { rotulo: '📘 Facebook', url: config.facebook, cor: null },
    valorValido(config.youtube) && { rotulo: '▶️ YouTube', url: config.youtube, cor: null },
    valorValido(config.site) && { rotulo: '🌐 Site', url: config.site, cor: null },
    valorValido(config.drive) && { rotulo: '📁 Fotos no Google Drive', url: config.drive, cor: null },
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <CabecalhoApp titulo="Igrejas" />
      <Text style={styles.tituloView}>Igrejas e Comunidades</Text>
      <Text style={styles.subtitulo}>Toque em uma igreja para ver mais informações.</Text>

      <FlatList
        data={dados.igrejas}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={['#7A1F2B']} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma igreja cadastrada.</Text>}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: '#B98B2E' }]}
            onPress={() => setRedeSocialAberta(true)}
            activeOpacity={0.85}
          >
            {config.redeSocialImagem ? (
              <View style={styles.imagemTopoContainer}>
                <Image source={{ uri: config.redeSocialImagem }} style={styles.imagemTopo} resizeMode="cover" />
              </View>
            ) : (
              <View style={[styles.imagemTopoContainer, styles.imagemFallback, { backgroundColor: '#B98B2E22' }]}>
                <Text style={{ fontSize: 30 }}>📱</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.nome}>{config.redeSocialNome || 'Rede social oficial da paróquia'}</Text>
              <Text style={styles.meta}>Toque para ver todas as formas de contato</Text>
            </View>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.cor }]}
            onPress={() => setIgrejaSelecionada(item)}
            activeOpacity={0.85}
          >
            <View style={styles.imagemTopoContainer}>
              {item.imagem ? (
                <Image
                  source={{ uri: item.imagem }}
                  style={styles.imagemTopo}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagemTopo, styles.imagemFallback, { backgroundColor: item.cor + '22' }]}>
                  <Text style={{ fontSize: 30 }}>⛪</Text>
                </View>
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.nome}>{item.nome}</Text>
              {!!item.endereco && <Text style={styles.meta}>📍 {item.endereco}</Text>}
              {!!item.contato && <Text style={styles.meta}>📞 {item.contato}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!igrejaSelecionada} animationType="slide" transparent onRequestClose={() => setIgrejaSelecionada(null)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <TouchableOpacity style={styles.modalFechar} onPress={() => setIgrejaSelecionada(null)}>
              <Text style={styles.modalFecharTexto}>✕</Text>
            </TouchableOpacity>
            {igrejaSelecionada && (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                {igrejaSelecionada.imagem ? (
                  <Image
                    source={{ uri: igrejaSelecionada.imagem }}
                    style={styles.modalImagem}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.modalImagem, styles.imagemFallback, { height: 180 }]}>
                    <Text style={{ fontSize: 44 }}>⛪</Text>
                  </View>
                )}
                <View style={[styles.modalFaixa, { backgroundColor: igrejaSelecionada.cor }]} />
                <Text style={styles.modalNome}>{igrejaSelecionada.nome}</Text>
                {!!igrejaSelecionada.endereco && <Text style={styles.modalMeta}>📍 {igrejaSelecionada.endereco}</Text>}
                {!!igrejaSelecionada.contato && <Text style={styles.modalMeta}>📞 {igrejaSelecionada.contato}</Text>}

                <View style={{ gap: 10, marginTop: 16 }}>
                  {!!igrejaSelecionada.whatsapp && (
                    <TouchableOpacity
                      style={[styles.botao, { backgroundColor: '#25D366' }]}
                      onPress={() => Linking.openURL(linkWhatsApp(igrejaSelecionada.whatsapp))}
                    >
                      <Text style={styles.botaoTexto}>💬 Falar pelo WhatsApp</Text>
                    </TouchableOpacity>
                  )}
                  {!!igrejaSelecionada.googleMaps && (
                    <TouchableOpacity
                      style={styles.botaoSecundario}
                      onPress={() => Linking.openURL(igrejaSelecionada.googleMaps)}
                    >
                      <Text style={styles.botaoSecundarioTexto}>📍 Ver localização no Google Maps</Text>
                    </TouchableOpacity>
                  )}
                  {!!igrejaSelecionada.instagram && (
                    <TouchableOpacity
                      style={styles.botaoSecundario}
                      onPress={() => Linking.openURL(igrejaSelecionada.instagram)}
                    >
                      <Text style={styles.botaoSecundarioTexto}>📷 Instagram</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={redeSocialAberta} animationType="slide" transparent onRequestClose={() => setRedeSocialAberta(false)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <TouchableOpacity style={styles.modalFechar} onPress={() => setRedeSocialAberta(false)}>
              <Text style={styles.modalFecharTexto}>✕</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {config.redeSocialImagem ? (
                <Image source={{ uri: config.redeSocialImagem }} style={[styles.modalImagem, { height: 140 }]} resizeMode="cover" />
              ) : (
                <View style={[styles.modalImagem, styles.imagemFallback, { height: 140 }]}>
                  <Text style={{ fontSize: 44 }}>📱</Text>
                </View>
              )}
              <View style={[styles.modalFaixa, { backgroundColor: '#B98B2E' }]} />
              <Text style={styles.modalNome}>{config.redeSocialNome || 'Rede social oficial da paróquia'}</Text>
              {botoesRedeSocial.length ? (
                <View style={{ gap: 10, marginTop: 10 }}>
                  {botoesRedeSocial.map((b, i) => (
                    <TouchableOpacity
                      key={i}
                      style={b.cor ? [styles.botao, { backgroundColor: b.cor }] : styles.botaoSecundario}
                      onPress={() => Linking.openURL(b.url)}
                    >
                      <Text style={b.cor ? styles.botaoTexto : styles.botaoSecundarioTexto}>{b.rotulo}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.modalMeta}>Nenhum contato cadastrado ainda.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  tituloView: { fontSize: 22, fontWeight: '700', color: '#2b2320', paddingHorizontal: 16, paddingTop: 12 },
  subtitulo: { fontSize: 13, color: '#8a7d6f', paddingHorizontal: 16, marginBottom: 12, marginTop: 2 },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' },
  vazio: { textAlign: 'center', color: '#a89b8c', marginTop: 40, fontStyle: 'italic' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  imagemTopoContainer: { width: '100%', aspectRatio: 4 / 3, overflow: 'hidden', backgroundColor: '#eee' },
  imagemTopo: { width: '100%', height: '100%' },
  imagemFallback: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 14 },
  nome: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 4 },
  meta: { fontSize: 13, color: '#8a7d6f', marginBottom: 2 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modalCaixa: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '85%', width: '100%', maxWidth: 560 },
  modalFechar: {
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalFecharTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalScroll: { padding: 22, paddingBottom: 36 },
  modalImagem: { width: '100%', height: undefined, aspectRatio: 4 / 3, borderRadius: 14, marginBottom: 12, backgroundColor: '#f2ece2' },
  modalFaixa: { height: 5, borderRadius: 3, marginBottom: 12 },
  modalNome: { fontSize: 19, fontWeight: '700', color: '#2b2320', marginBottom: 8 },
  modalMeta: { fontSize: 14, color: '#5a5048', marginBottom: 4 },
  botao: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  botaoSecundario: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  botaoSecundarioTexto: { color: '#2b2320', fontWeight: '700', fontSize: 14 },
});
