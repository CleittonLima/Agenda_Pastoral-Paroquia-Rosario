import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, TouchableOpacity,
  Modal, ScrollView, Linking, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import CabecalhoApp from '../components/CabecalhoApp';
import { urlImagemOtimizada, urlsUnicas } from '../utils/imagens';

function linkWhatsApp(numero) {
  return `https://wa.me/${String(numero).replace(/\D/g, '')}`;
}

function valorValido(v) {
  const t = String(v || '').trim();
  return t.length > 0 && !t.startsWith('#');
}

// Todas as fotos da igreja: a foto principal primeiro e, em seguida, as
// fotos cadastradas na Galeria do painel (sem repetir).
function fotosDaIgreja(igreja) {
  if (!igreja) return [];
  return urlsUnicas([igreja.imagem, ...(igreja.fotos || [])]);
}

// Uma foto do carrossel — mostra um indicador enquanto carrega e um
// ícone no lugar se a imagem não puder ser carregada.
function FotoSlide({ url, largura }) {
  const [estado, setEstado] = useState('carregando'); // carregando | ok | erro
  return (
    <View style={[styles.slide, { width: largura }]}>
      {estado !== 'erro' && (
        <Image
          source={{ uri: urlImagemOtimizada(url, 1400) }}
          style={styles.slideImagem}
          resizeMode="contain"
          onLoad={() => setEstado('ok')}
          onError={() => setEstado('erro')}
        />
      )}
      {estado === 'carregando' && (
        <View style={[styles.slideAviso, styles.semToque]}>
          <ActivityIndicator color="#7A1F2B" />
        </View>
      )}
      {estado === 'erro' && (
        <View style={styles.slideAviso}>
          <Text style={{ fontSize: 40 }}>⛪</Text>
          <Text style={styles.slideErroTexto}>Não foi possível carregar esta foto.</Text>
        </View>
      )}
    </View>
  );
}

// Carrossel com todas as fotos da igreja (deslize para o lado ou use as
// setas). Funciona igual no celular e no navegador.
function GaleriaIgreja({ fotos }) {
  const [largura, setLargura] = useState(0);
  const [indice, setIndice] = useState(0);
  const scrollRef = useRef(null);

  if (!fotos.length) {
    return (
      <View style={[styles.galeria, styles.imagemFallback]}>
        <Text style={{ fontSize: 44 }}>⛪</Text>
      </View>
    );
  }

  function aoRolar(e) {
    if (!largura) return;
    const novo = Math.round(e.nativeEvent.contentOffset.x / largura);
    if (novo !== indice && novo >= 0 && novo < fotos.length) setIndice(novo);
  }

  function irPara(i) {
    const alvo = Math.max(0, Math.min(fotos.length - 1, i));
    scrollRef.current?.scrollTo({ x: alvo * largura, animated: true });
    setIndice(alvo);
  }

  return (
    <View style={styles.galeria} onLayout={e => setLargura(e.nativeEvent.layout.width)}>
      {largura > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={aoRolar}
          onMomentumScrollEnd={aoRolar}
          scrollEventThrottle={16}
        >
          {fotos.map((url, i) => (
            <FotoSlide key={`${i}-${url}`} url={url} largura={largura} />
          ))}
        </ScrollView>
      )}

      {fotos.length > 1 && (
        <>
          {indice > 0 && (
            <TouchableOpacity style={[styles.seta, { left: 8 }]} onPress={() => irPara(indice - 1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          {indice < fotos.length - 1 && (
            <TouchableOpacity style={[styles.seta, { right: 8 }]} onPress={() => irPara(indice + 1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={[styles.contador, styles.semToque]}>
            <Text style={styles.contadorTexto}>{indice + 1} / {fotos.length}</Text>
          </View>
          <View style={[styles.pontos, styles.semToque]}>
            {fotos.map((_, i) => (
              <View key={i} style={[styles.ponto, i === indice && styles.pontoAtivo]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export default function IgrejasScreen() {
  const { dados, recarregar, temaCores } = useApp();
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
    <View style={[styles.container, { backgroundColor: temaCores.corBackground }]}>
      <CabecalhoApp titulo="Igrejas" />
      <Text style={[styles.tituloView, { color: temaCores.corTexto }]}>Igrejas e Comunidades</Text>
      <Text style={[styles.subtitulo, { color: temaCores.corTextoSecundario }]}>Toque em uma igreja para ver mais informações.</Text>

      <FlatList
        data={dados.igrejas}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={[temaCores.corBotoes]} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma igreja cadastrada.</Text>}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.card, { backgroundColor: temaCores.corCard, borderLeftColor: '#B98B2E' }]}
            onPress={() => setRedeSocialAberta(true)}
            activeOpacity={0.85}
          >
            {config.redeSocialImagem ? (
              <View style={styles.imagemTopoContainer}>
                <Image source={{ uri: urlImagemOtimizada(config.redeSocialImagem, 900) }} style={styles.imagemTopo} resizeMode="cover" />
              </View>
            ) : (
              <View style={[styles.imagemTopoContainer, styles.imagemFallback, { backgroundColor: '#B98B2E22' }]}>
                <Text style={{ fontSize: 30 }}>📱</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={[styles.nome, { color: temaCores.corTexto }]}>{config.redeSocialNome || 'Rede social oficial da paróquia'}</Text>
              <Text style={[styles.meta, { color: temaCores.corTextoSecundario }]}>Toque para ver todas as formas de contato</Text>
            </View>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: temaCores.corCard, borderLeftColor: item.cor }]}
            onPress={() => setIgrejaSelecionada(item)}
            activeOpacity={0.85}
          >
            <View style={styles.imagemTopoContainer}>
              {item.imagem ? (
                <Image
                  source={{ uri: urlImagemOtimizada(item.imagem, 900) }}
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
              <Text style={[styles.nome, { color: temaCores.corTexto }]}>{item.nome}</Text>
              {!!item.endereco && <Text style={[styles.meta, { color: temaCores.corTextoSecundario }]}>📍 {item.endereco}</Text>}
              {!!item.contato && <Text style={[styles.meta, { color: temaCores.corTextoSecundario }]}>📞 {item.contato}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!igrejaSelecionada} animationType="slide" transparent onRequestClose={() => setIgrejaSelecionada(null)}>
        <View style={styles.modalFundo}>
          <View style={[styles.modalCaixa, { backgroundColor: temaCores.corCard }]}>
            <TouchableOpacity style={styles.modalFechar} onPress={() => setIgrejaSelecionada(null)}>
              <Text style={styles.modalFecharTexto}>✕</Text>
            </TouchableOpacity>
            {igrejaSelecionada && (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <GaleriaIgreja key={igrejaSelecionada.id} fotos={fotosDaIgreja(igrejaSelecionada)} />
                <View style={[styles.modalFaixa, { backgroundColor: igrejaSelecionada.cor }]} />
                <Text style={[styles.modalNome, { color: temaCores.corTexto }]}>{igrejaSelecionada.nome}</Text>
                {!!igrejaSelecionada.endereco && <Text style={[styles.modalMeta, { color: temaCores.corTextoSecundario }]}>📍 {igrejaSelecionada.endereco}</Text>}
                {!!igrejaSelecionada.contato && <Text style={[styles.modalMeta, { color: temaCores.corTextoSecundario }]}>📞 {igrejaSelecionada.contato}</Text>}

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
                      style={[styles.botaoSecundario, { borderColor: temaCores.corDestaque }]}
                      onPress={() => Linking.openURL(igrejaSelecionada.googleMaps)}
                    >
                      <Text style={[styles.botaoSecundarioTexto, { color: temaCores.corTexto }]}>📍 Ver localização no Google Maps</Text>
                    </TouchableOpacity>
                  )}
                  {!!igrejaSelecionada.instagram && (
                    <TouchableOpacity
                      style={[styles.botaoSecundario, { borderColor: temaCores.corDestaque }]}
                      onPress={() => Linking.openURL(igrejaSelecionada.instagram)}
                    >
                      <Text style={[styles.botaoSecundarioTexto, { color: temaCores.corTexto }]}>📷 Instagram</Text>
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
          <View style={[styles.modalCaixa, { backgroundColor: temaCores.corCard }]}>
            <TouchableOpacity style={styles.modalFechar} onPress={() => setRedeSocialAberta(false)}>
              <Text style={styles.modalFecharTexto}>✕</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {config.redeSocialImagem ? (
                <Image source={{ uri: urlImagemOtimizada(config.redeSocialImagem, 1200) }} style={[styles.modalImagem, { height: 140 }]} resizeMode="cover" />
              ) : (
                <View style={[styles.modalImagem, styles.imagemFallback, { height: 140 }]}>
                  <Text style={{ fontSize: 44 }}>📱</Text>
                </View>
              )}
              <View style={[styles.modalFaixa, { backgroundColor: '#B98B2E' }]} />
              <Text style={[styles.modalNome, { color: temaCores.corTexto }]}>{config.redeSocialNome || 'Rede social oficial da paróquia'}</Text>
              {botoesRedeSocial.length ? (
                <View style={{ gap: 10, marginTop: 10 }}>
                  {botoesRedeSocial.map((b, i) => (
                    <TouchableOpacity
                      key={i}
                      style={b.cor ? [styles.botao, { backgroundColor: b.cor }] : [styles.botaoSecundario, { borderColor: temaCores.corDestaque }]}
                      onPress={() => Linking.openURL(b.url)}
                    >
                      <Text style={b.cor ? styles.botaoTexto : [styles.botaoSecundarioTexto, { color: temaCores.corTexto }]}>{b.rotulo}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={[styles.modalMeta, { color: temaCores.corTextoSecundario }]}>Nenhum contato cadastrado ainda.</Text>
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
  semToque: { pointerEvents: 'none' },
  galeria: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, marginBottom: 12, backgroundColor: '#f2ece2', overflow: 'hidden' },
  slide: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  slideImagem: { width: '100%', height: '100%' },
  slideAviso: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 16 },
  slideErroTexto: { fontSize: 12, color: '#8a7d6f', marginTop: 6, textAlign: 'center' },
  seta: {
    position: 'absolute', top: '50%', marginTop: -17, width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  contador: {
    position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3,
  },
  contadorTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
  pontos: { position: 'absolute', bottom: 8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  ponto: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  pontoAtivo: { backgroundColor: '#fff', width: 16 },
  modalFaixa: { height: 5, borderRadius: 3, marginBottom: 12 },
  modalNome: { fontSize: 19, fontWeight: '700', color: '#2b2320', marginBottom: 8 },
  modalMeta: { fontSize: 14, color: '#5a5048', marginBottom: 4 },
  botao: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  botaoSecundario: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  botaoSecundarioTexto: { color: '#2b2320', fontWeight: '700', fontSize: 14 },
});
