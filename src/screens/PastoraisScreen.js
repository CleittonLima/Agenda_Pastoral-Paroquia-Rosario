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
  const { dados, carregando, temaCores, tamanhoFonte } = useApp();

  const pastorais = dados.pastoraisMovimentos || [];

  function abrirDetalhes(item) {
    navigation.navigate('PastoralDetalhes', { pastoral: item });
  }

  function renderizarPastoral({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => abrirDetalhes(item)}
      >
        {item.capa ? (
          <Image
            source={{ uri: item.capa }}
            style={styles.capa}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.capa, styles.capaVazia]}>
            <Ionicons name="people-outline" size={42} color="#999" />
          </View>
        )}

        <View style={styles.conteudoCard}>
          <View style={styles.categoriaContainer}>
            <Text style={styles.categoria}>
              {item.categoria === 'Outro'
                ? item.categoriaPersonalizada || 'Outro'
                : item.categoria}
            </Text>
          </View>

          <Text
            style={[styles.nome, { fontSize: tamanhoFonte(18) }]}
            numberOfLines={2}
          >
            {item.nome}
          </Text>

          {!!item.lema && (
            <Text
              style={[styles.lema, { fontSize: tamanhoFonte(13) }]}
              numberOfLines={2}
            >
              {item.lema}
            </Text>
          )}

          <View style={styles.rodapeCard}>
            <Text style={styles.textoSaibaMais}>Conheça mais</Text>
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
      <View style={styles.centralizado}>
        <ActivityIndicator
          size="large"
          color={temaCores.corCabecalho}
        />
        <Text style={styles.textoCarregando}>
          Carregando pastorais...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.cabecalho,
          { backgroundColor: temaCores.corCabecalho },
        ]}
      >
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.cabecalhoTexto}>
          <Text
            style={[styles.titulo, { fontSize: tamanhoFonte(23) }]}
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
              color="#aaa"
            />

            <Text style={styles.vazioTitulo}>
              Nenhuma pastoral cadastrada
            </Text>

            <Text style={styles.vazioTexto}>
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
    backgroundColor: '#F7F7F7',
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
    color: '#fff',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#EAEAEA',
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
    backgroundColor: '#F4E8EA',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 10,
  },

  categoria: {
    color: '#7A1F2B',
    fontSize: 12,
    fontWeight: '600',
  },

  nome: {
    color: '#292929',
    fontWeight: 'bold',
  },

  lema: {
    color: '#666',
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
    borderTopColor: '#EEEEEE',
  },

  textoSaibaMais: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },

  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },

  textoCarregando: {
    marginTop: 12,
    color: '#666',
  },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  vazioTitulo: {
    color: '#444',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 18,
    textAlign: 'center',
  },

  vazioTexto: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
});