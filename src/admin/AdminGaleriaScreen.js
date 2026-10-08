import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from './AdminContext';
import {
  salvarIgreja,
  enviarImagem,
  excluirImagem,
} from '../api/api';
import AdminHeader from './components/AdminHeader';
import ConfirmModal from './components/ConfirmModal';
import { useSeletorImagem } from './components/RecorteImagem';
import { urlImagemOtimizada } from '../utils/imagens';
import { useApp } from '../context/AppContext';

function listaDeUrls(texto) {
  return String(texto || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export default function AdminGaleriaScreen() {
  const { dados, recarregar } = useAdmin();
  const { mostrarToast } = useApp();

  const [enviandoId, setEnviandoId] = useState(null);
  const [fotoParaRemover, setFotoParaRemover] = useState(null);

  const {
    escolherImagem,
    modalRecorte,
  } = useSeletorImagem();

  async function adicionarFoto(igreja) {
    // Galeria: recorte livre ou proporções prontas
    // (4:3, 3:4, 1:1, 16:9)
    const foto = await escolherImagem('galeria');

    if (!foto) return;

    setEnviandoId(igreja.ID);

    try {
      const resposta = await enviarImagem(
        foto.uri,
        foto.fileName,
        foto.mimeType,
        foto.base64
      );

      if (!resposta.ok) {
        mostrarToast(
          resposta.erro || 'Falha ao enviar a foto.',
          'erro'
        );

        return;
      }

      const fotosAtuais = listaDeUrls(
        igreja.Galeria
      );

      fotosAtuais.push(resposta.url);

      const salvo = await salvarIgreja({
        ...igreja,
        Galeria: fotosAtuais.join(', '),
      });

      if (!salvo.ok) {
        mostrarToast(
          salvo.erro ||
            'Não foi possível salvar a galeria.',
          'erro'
        );

        return;
      }

      await recarregar();

      mostrarToast('Foto adicionada com sucesso!');
    } catch (e) {
      console.error(
        'Erro ao adicionar foto:',
        e
      );

      mostrarToast(
        'Falha ao enviar a foto. Verifique sua internet.',
        'erro'
      );
    } finally {
      setEnviandoId(null);
    }
  }

  function removerFoto(igreja, indice) {
    setFotoParaRemover({
      igreja,
      indice,
    });
  }

  async function executarRemocao() {
    if (!fotoParaRemover) return;

    const {
      igreja,
      indice,
    } = fotoParaRemover;

    const fotosAtuais = listaDeUrls(
      igreja.Galeria
    );

    const fotoRemovida = fotosAtuais[indice];

    if (!fotoRemovida) {
      setFotoParaRemover(null);

      mostrarToast(
        'A foto não foi encontrada.',
        'aviso'
      );

      return;
    }

    fotosAtuais.splice(indice, 1);

    const salvo = await salvarIgreja({
      ...igreja,
      Galeria: fotosAtuais.join(', '),
    });

    if (!salvo.ok) {
      mostrarToast(
        salvo.erro ||
          'Não foi possível remover a foto.',
        'erro'
      );

      return;
    }

    setFotoParaRemover(null);

    const excluida = await excluirImagem(
      fotoRemovida
    );

    await recarregar();

    if (!excluida.ok) {
      mostrarToast(
        'A foto foi removida da galeria, mas não foi possível excluir o arquivo do armazenamento.',
        'aviso',
        4000
      );

      return;
    }

    mostrarToast('Foto removida com sucesso!');
  }

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Galeria de Fotos" />

      <ScrollView
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.dica}>
          As fotos aparecem no carrossel da igreja
          (Igrejas → toque na igreja). Ao adicionar,
          você pode recortar livremente ou usar uma
          proporção pronta.
        </Text>

        {dados.igrejas.map(igreja => {
          const fotos = listaDeUrls(
            igreja.Galeria
          );

          return (
            <View
              key={igreja.ID}
              style={styles.grupo}
            >
              <Text
                style={styles.grupoTitulo}
              >
                {igreja.Nome}
              </Text>

              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={() =>
                  adicionarFoto(igreja)
                }
                disabled={
                  enviandoId === igreja.ID
                }
              >
                {enviandoId === igreja.ID ? (
                  <ActivityIndicator
                    color="#7A1F2B"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="add"
                      size={16}
                      color="#7A1F2B"
                    />

                    <Text
                      style={
                        styles.botaoAdicionarTexto
                      }
                    >
                      Adicionar foto
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.grade}>
                {fotos.map((url, i) => (
                  <View
                    key={i}
                    style={styles.fotoItem}
                  >
                    <Image
                      source={{
                        uri: urlImagemOtimizada(
                          url,
                          300
                        ),
                      }}
                      style={styles.foto}
                    />

                    <TouchableOpacity
                      style={styles.botaoRemover}
                      onPress={() =>
                        removerFoto(
                          igreja,
                          i
                        )
                      }
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <ConfirmModal
        visivel={!!fotoParaRemover}
        titulo="Remover foto"
        mensagem="Tem certeza que deseja remover esta foto?"
        textoConfirmar="Remover"
        onConfirmar={executarRemocao}
        onCancelar={() =>
          setFotoParaRemover(null)
        }
      />

      {modalRecorte}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  scroll: {
    padding: 16,
    paddingBottom: 32,
  },

  dica: {
    fontSize: 12,
    color: '#8a7d6f',
    marginBottom: 14,
    lineHeight: 17,
  },

  grupo: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  grupoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2b2320',
    marginBottom: 10,
  },

  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#7A1F2B',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  botaoAdicionarTexto: {
    color: '#7A1F2B',
    fontWeight: '700',
    fontSize: 12,
  },

  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  fotoItem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },

  foto: {
    width: '100%',
    height: '100%',
  },

  botaoRemover: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor:
      'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});