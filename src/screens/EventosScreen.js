import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { linhaDataCompleta } from '../utils/datas';
import CabecalhoApp from '../components/CabecalhoApp';
import FiltrosIgreja from '../components/FiltrosIgreja';
import RodapeApp from '../components/RodapeApp';

export default function EventosScreen() {
  const {
    dados,
    listarEventos,
    nomeIgreja,
    corIgreja,
    recarregar,
    temaCores,
    tamanhoFonte,
  } = useApp();

  const [filtro, setFiltro] = useState('todas');
  const [atualizando, setAtualizando] = useState(false);

  const itens = listarEventos(filtro === 'todas' ? null : filtro);

  async function aoAtualizar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: temaCores.corBackground },
      ]}
    >
      <CabecalhoApp titulo="Eventos" />

      <Text
        style={[
          styles.tituloView,
          {
            color: temaCores.corTexto,
            fontSize: tamanhoFonte(22),
          },
        ]}
      >
        Eventos
      </Text>

      <FiltrosIgreja
        igrejas={dados.igrejas}
        filtroAtual={filtro}
        onFiltrar={setFiltro}
      />

      <FlatList
        ListFooterComponent={<RodapeApp />}
        data={itens}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoAtualizar}
            colors={[temaCores.corBotoes]}
          />
        }
        ListEmptyComponent={
          <Text
            style={[
              styles.vazio,
              {
                color: temaCores.corTextoSecundario,
                fontSize: tamanhoFonte(13),
              },
            ]}
          >
            Nenhum evento cadastrado.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: temaCores.corCard,
                borderLeftColor: corIgreja(item.igrejaId),
              },
            ]}
          >
            <Text
              style={[
                styles.etiquetaIgreja,
                {
                  fontSize: tamanhoFonte(11),
                },
              ]}
            >
              {nomeIgreja(item.igrejaId)}
            </Text>

            <Text
              style={[
                styles.nome,
                {
                  color: temaCores.corTexto,
                  fontSize: tamanhoFonte(16),
                },
              ]}
            >
              {item.nome}
            </Text>

            <Text
              style={[
                styles.metaData,
                {
                  color: temaCores.corTexto,
                  fontSize: tamanhoFonte(13),
                },
              ]}
            >
              {linhaDataCompleta(item.data, item.horario)}
            </Text>

            {!!item.local && (
              <Text
                style={[
                  styles.meta,
                  {
                    color: temaCores.corTextoSecundario,
                    fontSize: tamanhoFonte(13),
                  },
                ]}
              >
                📍 {item.local}
              </Text>
            )}

            {!!item.descricao && (
              <Text
                style={[
                  styles.descricao,
                  {
                    color: temaCores.corTextoSecundario,
                    fontSize: tamanhoFonte(13),
                    lineHeight: tamanhoFonte(19),
                  },
                ]}
              >
                {item.descricao}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  tituloView: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2b2320',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 10,
  },

  lista: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },

  vazio: {
    textAlign: 'center',
    color: '#a89b8c',
    marginTop: 40,
    fontStyle: 'italic',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  etiquetaIgreja: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3ECE2',
    color: '#6b5a48',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 6,
  },

  nome: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b2320',
    marginBottom: 4,
  },

  metaData: {
    fontSize: 13,
    color: '#5a5048',
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: '#8a7d6f',
    marginBottom: 4,
  },

  descricao: {
    fontSize: 13,
    color: '#6b6058',
  },
});