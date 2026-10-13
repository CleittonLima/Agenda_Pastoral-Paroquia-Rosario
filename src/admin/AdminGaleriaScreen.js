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
  salvarPastoralMovimento,
  enviarImagem,
  excluirImagem,
} from '../api/api';
import AdminHeader from './components/AdminHeader';
import ConfirmModal from './components/ConfirmModal';
import { useSeletorImagem } from './components/RecorteImagem';
import { urlImagemOtimizada } from '../utils/imagens';
import { useApp } from '../context/AppContext';
import { registrarHistorico } from '../api/historico';

function listaDeUrls(texto) {
  return String(texto || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function listaDeFotosPastoral(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean);

  if (typeof valor === 'string') {
    try {
      const convertido = JSON.parse(valor);
      return Array.isArray(convertido) ? convertido.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [];
}

export default function AdminGaleriaScreen() {
  const { dados, recarregar } = useAdmin();
  const { mostrarToast } = useApp();

  const [abaAtiva, setAbaAtiva] = useState('igrejas');
  const [enviandoId, setEnviandoId] = useState(null);
  const [fotoParaRemover, setFotoParaRemover] = useState(null);
  const [fotoPastoralParaRemover, setFotoPastoralParaRemover] = useState(null);

  const { escolherImagem, modalRecorte } = useSeletorImagem();

  // ============================================================
  // GALERIA DAS IGREJAS
  // ============================================================

  async function adicionarFoto(igreja) {
    const foto = await escolherImagem('galeria');
    if (!foto) return;

    setEnviandoId(`igreja-${igreja.ID}`);
    let urlEnviada = null;

    try {
      const resposta = await enviarImagem(
        foto.uri,
        foto.fileName,
        foto.mimeType,
        foto.base64
      );

      if (!resposta.ok) {
        mostrarToast(resposta.erro || 'Falha ao enviar a foto.', 'erro');
        return;
      }

      urlEnviada = resposta.url;

      const fotosAtuais = listaDeUrls(igreja.Galeria);
      fotosAtuais.push(resposta.url);

      const salvo = await salvarIgreja({
        ...igreja,
        Galeria: fotosAtuais.join(', '),
      });

      if (!salvo.ok) {
        await excluirImagem(urlEnviada);
        mostrarToast(
          salvo.erro || 'Não foi possível salvar a galeria.',
          'erro'
        );
        return;
      }

      await recarregar();

      await registrarHistorico({
        acao: 'CRIAR',
        entidade: 'IMAGEM',
        descricao: `Adicionou uma foto à galeria de ${igreja.Nome}`,
        detalhes: {
          igreja_id: igreja.ID,
          igreja_nome: igreja.Nome,
          operacao: 'ADICIONAR_FOTO',
        },
      });

      mostrarToast('Foto adicionada com sucesso!');
    } catch (e) {
      console.error('Erro ao adicionar foto da igreja:', e);

      if (urlEnviada) {
        await excluirImagem(urlEnviada);
      }

      mostrarToast(
        'Falha ao enviar a foto. Verifique sua internet.',
        'erro'
      );
    } finally {
      setEnviandoId(null);
    }
  }

  function removerFoto(igreja, indice) {
    setFotoParaRemover({ igreja, indice });
  }

  async function executarRemocao() {
    if (!fotoParaRemover) return;

    const { igreja, indice } = fotoParaRemover;
    const fotosAtuais = listaDeUrls(igreja.Galeria);
    const fotoRemovida = fotosAtuais[indice];

    if (!fotoRemovida) {
      setFotoParaRemover(null);
      mostrarToast('A foto não foi encontrada.', 'aviso');
      return;
    }

    fotosAtuais.splice(indice, 1);

    const salvo = await salvarIgreja({
      ...igreja,
      Galeria: fotosAtuais.join(', '),
    });

    if (!salvo.ok) {
      mostrarToast(
        salvo.erro || 'Não foi possível remover a foto.',
        'erro'
      );
      return;
    }

    setFotoParaRemover(null);

    const excluida = await excluirImagem(fotoRemovida);

    await recarregar();

    if (!excluida.ok) {
      await registrarHistorico({
        acao: 'EDITAR',
        entidade: 'IMAGEM',
        descricao: `Removeu uma foto da galeria de ${igreja.Nome}, mas houve falha ao excluir o arquivo do armazenamento`,
        detalhes: {
          igreja_id: igreja.ID,
          igreja_nome: igreja.Nome,
          operacao: 'REMOVER_FOTO',
          arquivo_excluido: false,
        },
      });

      mostrarToast(
        'A foto saiu da galeria, mas não foi possível excluir o arquivo do armazenamento.',
        'aviso',
        4000
      );

      return;
    }

    await registrarHistorico({
      acao: 'EXCLUIR',
      entidade: 'IMAGEM',
      descricao: `Removeu uma foto da galeria de ${igreja.Nome}`,
      detalhes: {
        igreja_id: igreja.ID,
        igreja_nome: igreja.Nome,
        operacao: 'REMOVER_FOTO',
        arquivo_excluido: true,
      },
    });

    mostrarToast('Foto removida com sucesso!');
  }

  // ============================================================
  // GALERIA DAS PASTORAIS, MOVIMENTOS E GRUPOS
  // ============================================================

  async function adicionarFotoPastoral(pastoral) {
    const foto = await escolherImagem('galeria');
    if (!foto) return;

    setEnviandoId(`pastoral-${pastoral.ID}`);
    let urlEnviada = null;

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

      urlEnviada = resposta.url;

      const fotosAtuais = listaDeFotosPastoral(pastoral.Galeria);

      const salvo = await salvarPastoralMovimento({
        ...pastoral,
        Galeria: [...fotosAtuais, resposta.url],
      });

      if (!salvo.ok) {
        await excluirImagem(urlEnviada);

        mostrarToast(
          salvo.erro || 'Não foi possível salvar a galeria.',
          'erro'
        );

        return;
      }

      await recarregar();

      await registrarHistorico({
        acao: 'CRIAR',
        entidade: 'IMAGEM',
        descricao: `Adicionou uma foto à galeria de ${pastoral.Nome}`,
        detalhes: {
          pastoral_id: pastoral.ID,
          pastoral_nome: pastoral.Nome,
          operacao: 'ADICIONAR_FOTO_PASTORAL',
        },
      });

      mostrarToast('Foto adicionada com sucesso!');
    } catch (e) {
      console.error('Erro ao adicionar foto da pastoral:', e);

      if (urlEnviada) {
        await excluirImagem(urlEnviada);
      }

      mostrarToast(
        'Falha ao enviar a foto. Verifique sua internet.',
        'erro'
      );
    } finally {
      setEnviandoId(null);
    }
  }

  function removerFotoPastoral(pastoral, indice) {
    setFotoPastoralParaRemover({ pastoral, indice });
  }

  async function executarRemocaoPastoral() {
    if (!fotoPastoralParaRemover) return;

    const { pastoral, indice } = fotoPastoralParaRemover;
    const fotosAtuais = listaDeFotosPastoral(pastoral.Galeria);
    const fotoRemovida = fotosAtuais[indice];

    if (!fotoRemovida) {
      setFotoPastoralParaRemover(null);
      mostrarToast('A foto não foi encontrada.', 'aviso');
      return;
    }

    const novasFotos = fotosAtuais.filter((_, i) => i !== indice);

    const salvo = await salvarPastoralMovimento({
      ...pastoral,
      Galeria: novasFotos,
    });

    if (!salvo.ok) {
      mostrarToast(
        salvo.erro || 'Não foi possível remover a foto.',
        'erro'
      );
      return;
    }

    setFotoPastoralParaRemover(null);

    const excluida = await excluirImagem(fotoRemovida);

    await recarregar();

    if (!excluida.ok) {
      await registrarHistorico({
        acao: 'EDITAR',
        entidade: 'IMAGEM',
        descricao: `Removeu uma foto da galeria de ${pastoral.Nome}, mas houve falha ao excluir o arquivo do armazenamento`,
        detalhes: {
          pastoral_id: pastoral.ID,
          pastoral_nome: pastoral.Nome,
          operacao: 'REMOVER_FOTO_PASTORAL',
          arquivo_excluido: false,
        },
      });

      mostrarToast(
        'A foto saiu da galeria, mas não foi possível excluir o arquivo do armazenamento.',
        'aviso',
        4000
      );

      return;
    }

    await registrarHistorico({
      acao: 'EXCLUIR',
      entidade: 'IMAGEM',
      descricao: `Removeu uma foto da galeria de ${pastoral.Nome}`,
      detalhes: {
        pastoral_id: pastoral.ID,
        pastoral_nome: pastoral.Nome,
        operacao: 'REMOVER_FOTO_PASTORAL',
        arquivo_excluido: true,
      },
    });

    mostrarToast('Foto removida com sucesso!');
  }

  // ============================================================
  // INTERFACE
  // ============================================================

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Galeria de Fotos" />

      {/* Abas */}
      <View style={styles.abas}>
        <TouchableOpacity
          style={[
            styles.aba,
            abaAtiva === 'igrejas' && styles.abaAtiva,
          ]}
          onPress={() => setAbaAtiva('igrejas')}
        >
          <Ionicons
            name="business-outline"
            size={17}
            color={abaAtiva === 'igrejas' ? '#fff' : '#7A1F2B'}
          />

          <Text
            style={[
              styles.textoAba,
              abaAtiva === 'igrejas' && styles.textoAbaAtiva,
            ]}
          >
            Fotos das Igrejas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.aba,
            abaAtiva === 'pastorais' && styles.abaAtiva,
          ]}
          onPress={() => setAbaAtiva('pastorais')}
        >
          <Ionicons
            name="people-outline"
            size={17}
            color={abaAtiva === 'pastorais' ? '#fff' : '#7A1F2B'}
          />

          <Text
            style={[
              styles.textoAba,
              abaAtiva === 'pastorais' && styles.textoAbaAtiva,
            ]}
          >
            Fotos das Pastorais
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ABA DAS IGREJAS */}
        {abaAtiva === 'igrejas' ? (
          <>
            <Text style={styles.dica}>
              As fotos aparecem no carrossel da igreja (Igrejas → toque na igreja).
              Ao adicionar, você pode recortar livremente ou usar uma proporção pronta.
            </Text>

            {(dados.igrejas || []).map(igreja => {
              const fotos = listaDeUrls(igreja.Galeria);
              const idEnvio = `igreja-${igreja.ID}`;

              return (
                <View key={igreja.ID} style={styles.grupo}>
                  <Text style={styles.grupoTitulo}>
                    {igreja.Nome}
                  </Text>

                  <TouchableOpacity
                    style={styles.botaoAdicionar}
                    onPress={() => adicionarFoto(igreja)}
                    disabled={enviandoId === idEnvio}
                  >
                    {enviandoId === idEnvio ? (
                      <ActivityIndicator color="#7A1F2B" />
                    ) : (
                      <>
                        <Ionicons
                          name="add"
                          size={16}
                          color="#7A1F2B"
                        />
                        <Text style={styles.botaoAdicionarTexto}>
                          Adicionar foto
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.grade}>
                    {fotos.map((url, i) => (
                      <View
                        key={`${url}-${i}`}
                        style={styles.fotoItem}
                      >
                        <Image
                          source={{
                            uri: urlImagemOtimizada(url, 300),
                          }}
                          style={styles.foto}
                        />

                        <TouchableOpacity
                          style={styles.botaoRemover}
                          onPress={() => removerFoto(igreja, i)}
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

                  {fotos.length === 0 && (
                    <Text style={styles.semFotos}>
                      Nenhuma foto adicionada.
                    </Text>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          /* ABA DAS PASTORAIS */
          <>
            <Text style={styles.dica}>
              Adicione fotos para cada pastoral, movimento ou grupo.
              As imagens ficam vinculadas somente ao registro selecionado
              e poderão aparecer na página pública.
            </Text>

            {(dados.pastoraisMovimentos || []).map(pastoral => {
              const fotos = listaDeFotosPastoral(pastoral.Galeria);
              const idEnvio = `pastoral-${pastoral.ID}`;

              return (
                <View key={pastoral.ID} style={styles.grupo}>
                  <Text style={styles.grupoTitulo}>
                    {pastoral.Nome}
                  </Text>

                  <Text style={styles.subtitulo}>
                    {pastoral.CategoriaPersonalizada ||
                      pastoral.Categoria ||
                      'Outro'}
                    {pastoral.Status === 'Inativo' ? ' • Inativo' : ''}
                  </Text>

                  <TouchableOpacity
                    style={styles.botaoAdicionar}
                    onPress={() => adicionarFotoPastoral(pastoral)}
                    disabled={enviandoId === idEnvio}
                  >
                    {enviandoId === idEnvio ? (
                      <ActivityIndicator color="#7A1F2B" />
                    ) : (
                      <>
                        <Ionicons
                          name="add"
                          size={16}
                          color="#7A1F2B"
                        />
                        <Text style={styles.botaoAdicionarTexto}>
                          Adicionar foto
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={styles.grade}>
                    {fotos.map((url, i) => (
                      <View
                        key={`${url}-${i}`}
                        style={styles.fotoItem}
                      >
                        <Image
                          source={{
                            uri: urlImagemOtimizada(url, 300),
                          }}
                          style={styles.foto}
                        />

                        <TouchableOpacity
                          style={styles.botaoRemover}
                          onPress={() =>
                            removerFotoPastoral(pastoral, i)
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

                  {fotos.length === 0 && (
                    <Text style={styles.semFotos}>
                      Nenhuma foto adicionada.
                    </Text>
                  )}
                </View>
              );
            })}

            {!(dados.pastoraisMovimentos || []).length && (
              <View style={styles.vazio}>
                <Ionicons
                  name="images-outline"
                  size={30}
                  color="#a89b8c"
                />

                <Text style={styles.semFotos}>
                  Nenhuma pastoral, movimento ou grupo cadastrado ainda.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Confirmação de remoção das igrejas */}
      <ConfirmModal
        visivel={!!fotoParaRemover}
        titulo="Remover foto"
        mensagem="Tem certeza que deseja remover esta foto da galeria da igreja?"
        textoConfirmar="Remover"
        onConfirmar={executarRemocao}
        onCancelar={() => setFotoParaRemover(null)}
      />

      {/* Confirmação de remoção das pastorais */}
      <ConfirmModal
        visivel={!!fotoPastoralParaRemover}
        titulo="Remover foto"
        mensagem="Tem certeza que deseja remover esta foto da galeria desta pastoral, movimento ou grupo?"
        textoConfirmar="Remover"
        onConfirmar={executarRemocaoPastoral}
        onCancelar={() => setFotoPastoralParaRemover(null)}
      />

      {modalRecorte}
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  abas: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },

  aba: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#7A1F2B',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },

  abaAtiva: {
    backgroundColor: '#7A1F2B',
  },

  textoAba: {
    color: '#7A1F2B',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },

  textoAbaAtiva: {
    color: '#fff',
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
    marginBottom: 4,
  },

  subtitulo: {
    fontSize: 12,
    color: '#8a7d6f',
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
    marginTop: 8,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  semFotos: {
    fontSize: 12,
    color: '#a89b8c',
    fontStyle: 'italic',
    marginTop: 8,
  },

  vazio: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    gap: 8,
  },
});