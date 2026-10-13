import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { enviarImagem } from '../../api/api';
import { useSeletorImagem } from './RecorteImagem';

export default function CampoGaleria({ valor, onMudar }) {
  const [enviando, setEnviando] = useState(false);
  const { escolherImagem } = useSeletorImagem();

  const imagens = Array.isArray(valor) ? valor : [];

  async function adicionarImagem() {
    if (enviando) return;

    const foto = await escolherImagem('livre');

    if (!foto) return;

    setEnviando(true);

    try {
      const resposta = await enviarImagem(
        foto.uri,
        foto.fileName,
        foto.mimeType,
        foto.base64
      );

      if (!resposta.ok) {
        Alert.alert(
          'Erro',
          resposta.erro || 'Não foi possível enviar a imagem.'
        );
        return;
      }

      onMudar([...imagens, resposta.url]);
    } catch (erro) {
      console.error('Erro ao adicionar imagem à galeria:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível enviar a imagem. Verifique sua conexão.'
      );
    } finally {
      setEnviando(false);
    }
  }

  async function removerImagem(url) {
    Alert.alert(
      'Remover imagem',
      'Deseja remover esta foto da galeria?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            onMudar(imagens.filter(imagem => imagem !== url));
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>Galeria de fotos</Text>

      <Text style={styles.descricao}>
        Adicione fotos para mostrar as atividades e os momentos
        da pastoral, movimento ou grupo.
      </Text>

      <TouchableOpacity
        style={[
          styles.botaoAdicionar,
          enviando && styles.botaoDesabilitado,
        ]}
        onPress={adicionarImagem}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBotao}>
            + Adicionar foto
          </Text>
        )}
      </TouchableOpacity>

      {imagens.length > 0 ? (
        <>
          <Text style={styles.contador}>
            {imagens.length}{' '}
            {imagens.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lista}
          >
            {imagens.map((url, indice) => (
              <View key={`${url}-${indice}`} style={styles.item}>
                <Image
                  source={{ uri: url }}
                  style={styles.imagem}
                  resizeMode="cover"
                />

                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => removerImagem(url)}
                >
                  <Text style={styles.textoRemover}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.vazio}>
          <Text style={styles.textoVazio}>
            Nenhuma foto adicionada.
          </Text>
        </View>
      )}

      {/*
        O seletor de imagens já utilizado pelo aplicativo
        continua responsável pela escolha da foto.
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  rotulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a5048',
    marginBottom: 6,
  },

  descricao: {
    fontSize: 12,
    color: '#8a7d6f',
    lineHeight: 18,
    marginBottom: 12,
  },

  botaoAdicionar: {
    alignSelf: 'flex-start',
    backgroundColor: '#7A1F2B',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    minWidth: 140,
    alignItems: 'center',
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  contador: {
    fontSize: 12,
    color: '#5a5048',
    marginTop: 14,
    marginBottom: 8,
  },

  lista: {
    paddingVertical: 4,
    paddingRight: 8,
  },

  item: {
    width: 110,
    height: 110,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3ECE2',
  },

  imagem: {
    width: '100%',
    height: '100%',
  },

  botaoRemover: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#7A1F2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoRemover: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 24,
  },

  vazio: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },

  textoVazio: {
    color: '#8a7d6f',
    fontSize: 12,
  },
});