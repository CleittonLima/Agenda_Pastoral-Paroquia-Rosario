import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function PastoralDetalhesScreen({ route, navigation }) {
  const { temaCores, tamanhoFonte } = useApp();
  const { width: larguraTela } = useWindowDimensions();

  const pastoral = route.params?.pastoral;

  // Identifica telas maiores, como computadores e notebooks.
  const isDesktop = larguraTela >= 768;

  if (!pastoral) {
    return (
      <View style={styles.erro}>
        <Text style={styles.erroTexto}>
          Não foi possível carregar as informações.
        </Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltarTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoria =
    pastoral.categoria === 'Outro'
      ? pastoral.categoriaPersonalizada || 'Outro'
      : pastoral.categoria;

  const galeria = Array.isArray(pastoral.galeria)
    ? pastoral.galeria.filter(Boolean)
    : [];

  function formatarWhatsApp(numero) {
    return String(numero || '').replace(/\D/g, '');
  }

  async function abrirWhatsApp() {
    const numero = formatarWhatsApp(pastoral.whatsapp);

    if (!numero) {
      Alert.alert(
        'Contato indisponível',
        'Esta pastoral ainda não cadastrou um número de WhatsApp.'
      );

      return;
    }

    // Adiciona o código do Brasil quando o número contém apenas DDD e telefone.
    const numeroCompleto =
      numero.length === 10 || numero.length === 11
        ? `55${numero}`
        : numero;

    const url = `https://wa.me/${numeroCompleto}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Não foi possível abrir',
        'Verifique se você possui um aplicativo ou navegador para acessar o WhatsApp.'
      );
    }
  }

  function secaoTexto(titulo, texto, icone) {
    if (!texto || !String(texto).trim()) {
      return null;
    }

    return (
      <View style={styles.secao}>
        <View style={styles.tituloSecao}>
          <Ionicons
            name={icone}
            size={22}
            color={temaCores.corCabecalho}
          />

          <Text
            style={[
              styles.titulo,
              { fontSize: tamanhoFonte(18) },
            ]}
          >
            {titulo}
          </Text>
        </View>

        <Text
          style={[
            styles.texto,
            { fontSize: tamanhoFonte(15) },
          ]}
        >
          {texto}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Botão de voltar fixo na tela */}
      <TouchableOpacity
        style={styles.botaoVoltarFixo}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Ionicons
          name="arrow-back"
          size={25}
          color="#fff"
        />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollConteudo}
      >
        {/* Conteúdo centralizado no desktop */}
        <View
          style={[
            styles.conteudo,
            isDesktop && styles.conteudoDesktop,
          ]}
        >
          {/* Capa */}
          <View
            style={[
              styles.areaCapa,
              isDesktop && styles.areaCapaDesktop,
            ]}
          >
            {pastoral.capa ? (
              <Image
                source={{ uri: pastoral.capa }}
                style={[
                  styles.capa,
                  isDesktop && styles.capaDesktop,
                ]}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.capa,
                  styles.capaVazia,
                  isDesktop && styles.capaDesktop,
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={60}
                  color="#999"
                />
              </View>
            )}
          </View>

          {/* Identificação */}
          <View style={styles.identificacao}>
            <View
              style={[
                styles.categoriaContainer,
                {
                  backgroundColor: `${temaCores.corCabecalho}15`,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoria,
                  { color: temaCores.corCabecalho },
                ]}
              >
                {categoria}
              </Text>
            </View>

            <Text
              style={[
                styles.nome,
                { fontSize: tamanhoFonte(isDesktop ? 30 : 27) },
              ]}
            >
              {pastoral.nome}
            </Text>

            {!!pastoral.lema && (
              <Text
                style={[
                  styles.lema,
                  { fontSize: tamanhoFonte(15) },
                ]}
              >
                {pastoral.lema}
              </Text>
            )}
          </View>

          {/* Sobre */}
          {secaoTexto(
            'Sobre nós',
            pastoral.sobre,
            'information-circle-outline'
          )}

          {/* Atividades */}
          {secaoTexto(
            'O que fazemos?',
            pastoral.atividades,
            'hand-left-outline'
          )}

          {/* Objetivo */}
          {secaoTexto(
            'Nosso objetivo',
            pastoral.objetivo,
            'flag-outline'
          )}

          {/* Dias e horários dos encontros */}
          {secaoTexto(
            'Dias e horários dos encontros',
            pastoral.diasEncontros,
            'calendar-outline'
          )}

          {/* Galeria de fotos */}
          {galeria.length > 0 && (
            <View style={styles.secao}>
              <View style={styles.tituloSecao}>
                <Ionicons
                  name="images-outline"
                  size={22}
                  color={temaCores.corCabecalho}
                />

                <Text
                  style={[
                    styles.titulo,
                    { fontSize: tamanhoFonte(18) },
                  ]}
                >
                  Nossa comunidade
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galeria}
              >
                {galeria.map((foto, index) => (
                  <View
                    key={`${foto}-${index}`}
                    style={[
                      styles.molduraGaleria,
                      isDesktop && styles.molduraGaleriaDesktop,
                    ]}
                  >
                    <Image
                      source={{ uri: foto }}
                      style={styles.fotoGaleria}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Logo */}
          {!!pastoral.logo && (
            <View style={styles.areaLogo}>
              <Image
                source={{ uri: pastoral.logo }}
                style={[
                  styles.logo,
                  isDesktop && styles.logoDesktop,
                ]}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Contato */}
          {!!pastoral.whatsapp && (
            <TouchableOpacity
              style={[
                styles.botaoContato,
                { backgroundColor: temaCores.corCabecalho },
                isDesktop && styles.botaoContatoDesktop,
              ]}
              activeOpacity={0.85}
              onPress={abrirWhatsApp}
            >
              <Ionicons
                name="logo-whatsapp"
                size={22}
                color="#fff"
              />

              <Text style={styles.textoBotaoContato}>
                {pastoral.textoBotaoContato?.trim() ||
                  'Entre em contato conosco'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.espacamentoFinal} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollConteudo: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },

  // Conteúdo padrão para celular
  conteudo: {
    width: '100%',
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },

  // Limita a largura do conteúdo em computadores.
  conteudoDesktop: {
    maxWidth: 1080,
    alignSelf: 'center',
    width: '100%',
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  // Capa
  areaCapa: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },

  areaCapaDesktop: {
    aspectRatio: 4 / 3,
    maxHeight: 360,
    alignSelf: 'center',
  },

  capa: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEEEEE',
  },

  capaDesktop: {
    maxHeight: 360,
  },

  capaVazia: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Botão fixo: permanece visível durante toda a rolagem.
  botaoVoltarFixo: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  // Identificação
  identificacao: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
  },

  categoriaContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  categoria: {
    fontSize: 12,
    fontWeight: '700',
  },

  nome: {
    color: '#262626',
    fontWeight: 'bold',
    lineHeight: 36,
  },

  lema: {
    color: '#777777',
    marginTop: 10,
    lineHeight: 23,
    fontStyle: 'italic',
  },

  // Seções de informações
  secao: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  tituloSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  titulo: {
    color: '#303030',
    fontWeight: 'bold',
    marginLeft: 9,
    flex: 1,
  },

  texto: {
    color: '#555555',
    lineHeight: 24,
  },

  // Galeria horizontal
  galeria: {
    paddingTop: 2,
    paddingBottom: 4,
    paddingRight: 20,
  },

  molduraGaleria: {
    width: 180,
    aspectRatio: 3 / 4,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  molduraGaleriaDesktop: {
    width: 200,
  },

  fotoGaleria: {
    width: '100%',
    height: '100%',
  },

  // Logo
  areaLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'transparent',
  },

  logo: {
    width: 180,
    height: 150,
    backgroundColor: 'transparent',
  },

  logoDesktop: {
    width: 160,
    height: 130,
  },

  // Contato
  botaoContato: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
  },

  botaoContatoDesktop: {
    alignSelf: 'center',
    minWidth: 280,
    maxWidth: 500,
  },

  textoBotaoContato: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
    flexShrink: 1,
  },

  espacamentoFinal: {
    height: 20,
  },

  // Mensagem de erro
  erro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },

  erroTexto: {
    color: '#555555',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  voltarTexto: {
    color: '#7A1F2B',
    fontSize: 16,
    fontWeight: 'bold',
  },
});