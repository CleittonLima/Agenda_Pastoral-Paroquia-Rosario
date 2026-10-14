import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function PastoraisScreen({ navigation }) {
  const {
    dados,
    carregando,
    temaCores,
    tamanhoFonte,
    preferencias,
} = useApp();

  const pastorais = dados.pastoraisMovimentos || [];

  // Identifica se o tema escuro está ativo.
  const temaEscuro = preferencias?.tema === 'escuro';

  // Cores da interface conforme o tema selecionado.
  const cores = {
    fundo: temaEscuro ? '#121212' : '#F7F7F7',
    card: temaEscuro ? '#1E1E1E' : '#FFFFFF',
    texto: temaEscuro ? '#F5F5F5' : '#292929',
    textoSecundario: temaEscuro ? '#BDBDBD' : '#666666',
    textoVazio: temaEscuro ? '#CCCCCC' : '#777777',
    fundoCategoria: temaEscuro ? '#38272B' : '#F4E8EA',
    textoCategoria: temaCores.corCabecalho || '#7A1F2B',
    borda: temaEscuro ? '#383838' : '#EEEEEE',
    fundoCapa: temaEscuro ? '#292929' : '#EAEAEA',
  };

  function abrirDetalhes(item) {
    navigation.navigate('PastoralDetalhes', {
      pastoral: item,
    });
  }

  function renderizarPastoral({ item }) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: cores.card,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => abrirDetalhes(item)}
      >
        {item.capa ? (
          <Image
            source={{ uri: item.capa }}
            style={[
              styles.capa,
              { backgroundColor: cores.fundoCapa },
            ]}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.capa,
              styles.capaVazia,
              { backgroundColor: cores.fundoCapa },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={42}
              color={cores.textoSecundario}
            />
          </View>
        )}

        <View style={styles.conteudoCard}>
          <View
            style={[
              styles.categoriaContainer,
              { backgroundColor: cores.fundoCategoria },
            ]}
          >
            <Text
              style={[
                styles.categoria,
                { color: cores.textoCategoria },
              ]}
            >
              {item.categoria === 'Outro'
                ? item.categoriaPersonalizada || 'Outro'
                : item.categoria}
            </Text>
          </View>

          <Text
            style={[
              styles.nome,
              {
                fontSize: tamanhoFonte(18),
                color: cores.texto,
              },
            ]}
            numberOfLines={2}
          >
            {item.nome}
          </Text>

          {!!item.lema && (
            <Text
              style={[
                styles.lema,
                {
                  fontSize: tamanhoFonte(13),
                  color: cores.textoSecundario,
                },
              ]}
              numberOfLines={2}
            >
              {item.lema}
            </Text>
          )}

          <View
            style={[
              styles.rodapeCard,
              { borderTopColor: cores.borda },
            ]}
          >
            <Text
              style={[
                styles.textoSaibaMais,
                { color: cores.textoSecundario },
              ]}
            >
              Conheça mais
            </Text>

            <Ionicons
              name="arrow-forward-circle"
              size={24}
              color={temaCores.corCabecalho}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (carregando) {
    return (
      <View
        style={[
          styles.centralizado,
          { backgroundColor: cores.fundo },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={temaCores.corCabecalho}
        />

        <Text
          style={[
            styles.textoCarregando,
            { color: cores.textoSecundario },
          ]}
        >
          Carregando pastorais...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
    >
      <View
        style={[
          styles.cabecalho,
          { backgroundColor: temaCores.corCabecalho },
        ]}
      >
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.cabecalhoTexto}>
          <Text
            style={[
              styles.titulo,
              { fontSize: tamanhoFonte(23) },
            ]}
          >
            Pastorais e Movimentos
          </Text>

          <Text
            style={[
              styles.subtitulo,
              { fontSize: tamanhoFonte(13) },
            ]}
          >
            Conheça os grupos da nossa comunidade
          </Text>
        </View>
      </View>

      <FlatList
        data={pastorais}
        keyExtractor={(item, index) =>
          String(item.id ?? index)
        }
        renderItem={renderizarPastoral}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons
              name="people-outline"
              size={60}
              color={cores.textoSecundario}
            />

            <Text
              style={[
                styles.vazioTitulo,
                { color: cores.texto },
              ]}
            >
              Nenhuma pastoral cadastrada
            </Text>

            <Text
              style={[
                styles.vazioTexto,
                { color: cores.textoVazio },
              ]}
            >
              Quando houver pastorais, movimentos ou grupos
              disponíveis, eles aparecerão aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  cabecalho: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  botaoVoltar: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  cabecalhoTexto: {
    flex: 1,
  },

  titulo: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#F3E7E9',
    marginTop: 5,
  },

  lista: {
    padding: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },

  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
  },

  capa: {
    width: '100%',
    aspectRatio: 4 / 3,
  },

  capaVazia: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  conteudoCard: {
    padding: 16,
  },

  categoriaContainer: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 10,
  },

  categoria: {
    fontSize: 12,
    fontWeight: '600',
  },

  nome: {
    fontWeight: 'bold',
  },

  lema: {
    marginTop: 7,
    lineHeight: 19,
  },

  rodapeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  textoSaibaMais: {
    fontSize: 13,
    fontWeight: '600',
  },

  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCarregando: {
    marginTop: 12,
  },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  vazioTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 18,
    textAlign: 'center',
  },

  vazioTexto: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
});