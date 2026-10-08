import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, Image, StyleSheet, PanResponder,
  ActivityIndicator, Alert, Platform, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FORMATOS_IMAGEM, PROPORCOES } from './formatosImagem';
import { useApp } from '../../context/AppContext';

// ============================================================
// FERRAMENTA DE RECORTE DE IMAGENS (Painel ADM)
// Antes de enviar uma imagem, o coordenador ajusta o recorte no formato
// em que ela aparece no app (ou em recorte livre). Arraste o quadro para
// mover e os cantos para aumentar/diminuir.
//
// Uso nas telas:
//   const { escolherImagem, modalRecorte } = useSeletorImagem();
//   const imagem = await escolherImagem('fotoIgreja'); // null se cancelar
// ...enviarImagem(imagem.uri, imagem.fileName, imagem.mimeType, imagem.base64)
//   ...e renderize {modalRecorte} em algum lugar da tela.
// ============================================================

const TAMANHO_MINIMO = 48;     // menor tamanho do quadro na tela (pontos)
const RAIO_CANTO = 34;         // distância para "pegar" um canto
const LADO_MAXIMO_TRABALHO = 2400; // imagens enormes são reduzidas antes do recorte

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

// Libera a memória nativa usada pelo expo-image-manipulator
function liberar(...objetos) {
  objetos.forEach(o => {
    try {
      if (o && typeof o.release === 'function') o.release();
    } catch (_) {}
  });
}

// Maior retângulo possível na proporção pedida, centralizado na imagem
function recorteInicial(img, proporcao) {
  if (!proporcao) {
    return {
      x: img.x,
      y: img.y,
      w: img.w,
      h: img.h,
    };
  }

  let w = img.w;
  let h = w / proporcao;

  if (h > img.h) {
    h = img.h;
    w = h * proporcao;
  }

  return {
    x: img.x + (img.w - w) / 2,
    y: img.y + (img.h - h) / 2,
    w,
    h,
  };
}

// Redimensiona o quadro arrastando um dos cantos; o canto oposto fica parado
function redimensionar(inicio, canto, dx, dy, img, proporcao) {
  const dirX = canto === 'sd' || canto === 'id' ? 1 : -1;
  const dirY = canto === 'ie' || canto === 'id' ? 1 : -1;
  const fixoX = dirX === 1 ? inicio.x : inicio.x + inicio.w;
  const fixoY = dirY === 1 ? inicio.y : inicio.y + inicio.h;
  const pontoX = (dirX === 1 ? inicio.x + inicio.w : inicio.x) + dx;
  const pontoY = (dirY === 1 ? inicio.y + inicio.h : inicio.y) + dy;

  const maxW = dirX === 1 ? img.x + img.w - fixoX : fixoX - img.x;
  const maxH = dirY === 1 ? img.y + img.h - fixoY : fixoY - img.y;
  let w = Math.max(0, (pontoX - fixoX) * dirX);
  let h = Math.max(0, (pontoY - fixoY) * dirY);

  if (proporcao) {
    const limiteW = Math.min(maxW, maxH * proporcao);
    const minimoW = Math.min(
      Math.max(TAMANHO_MINIMO, TAMANHO_MINIMO * proporcao),
      limiteW
    );

    w = limitar(
      Math.max(w, h * proporcao),
      minimoW,
      limiteW
    );

    h = w / proporcao;
  } else {
    w = limitar(
      w,
      Math.min(TAMANHO_MINIMO, maxW),
      maxW
    );

    h = limitar(
      h,
      Math.min(TAMANHO_MINIMO, maxH),
      maxH
    );
  }

  return {
    x: dirX === 1 ? fixoX : fixoX - w,
    y: dirY === 1 ? fixoY : fixoY - h,
    w,
    h,
  };
}

export function RecorteImagemModal({ pedido, onConcluir, onCancelar }) {
  const formato = pedido?.formato || FORMATOS_IMAGEM.livre;

  const { preferencias } = useApp();

  const [imagem, setImagem] = useState(null);
  const [preparando, setPreparando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [proporcaoId, setProporcaoId] = useState(formato.proporcao);
  const [recorte, setRecorte] = useState(null);

  // Retângulo onde a imagem é desenhada dentro da área (modo "contain")
  const img = useMemo(() => {
    if (!imagem || !area.w || !area.h) return null;

    const escala = Math.min(
      area.w / imagem.width,
      area.h / imagem.height
    );

    const w = imagem.width * escala;
    const h = imagem.height * escala;

    return {
      x: (area.w - w) / 2,
      y: (area.h - h) / 2,
      w,
      h,
      escala,
    };
  }, [imagem, area]);

  const proporcao = PROPORCOES[proporcaoId]?.valor ?? null;

  // O PanResponder é criado uma vez só; ele lê os valores atuais por refs
  const refs = useRef({
    recorte: null,
    img: null,
    proporcao: null,
  });

  refs.current.recorte = recorte;
  refs.current.img = img;
  refs.current.proporcao = proporcao;

  const gesto = useRef({ modo: null });

  // Prepara uma cópia de trabalho da imagem escolhida
  useEffect(() => {
    if (!pedido) {
      setImagem(null);
      setRecorte(null);
      return undefined;
    }

    setProporcaoId(pedido.formato.proporcao);

    let cancelado = false;

    (async () => {
      setPreparando(true);

      const { asset } = pedido;
      let contexto = null;
      let renderizada = null;

      try {
        contexto = ImageManipulator.manipulate(asset.uri);

        const maior = Math.max(
          asset.width || 0,
          asset.height || 0
        );

        if (maior > LADO_MAXIMO_TRABALHO) {
          contexto = (asset.width || 0) >= (asset.height || 0)
            ? contexto.resize({ width: LADO_MAXIMO_TRABALHO })
            : contexto.resize({ height: LADO_MAXIMO_TRABALHO });
        }

        renderizada = await contexto.renderAsync();

        const salva = await renderizada.saveAsync({
          format:
            pedido.formato.formato === 'png'
              ? SaveFormat.PNG
              : SaveFormat.JPEG,
          compress: 0.95,
        });

        if (!cancelado) {
          setImagem({
            uri: salva.uri,
            width: salva.width,
            height: salva.height,
          });
        }
      } catch (e) {
        if (!cancelado && asset.width && asset.height) {
          setImagem({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          });
        } else if (!cancelado) {
          Alert.alert(
            'Erro',
            'Não foi possível abrir esta imagem. Tente outra.'
          );

          onCancelar();
        }
      } finally {
        liberar(contexto, renderizada);

        if (!cancelado) {
          setPreparando(false);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [pedido]);

  // Nova imagem ou nova proporção → recomeça o quadro.
  // Se só o tamanho da área mudou → mantém o recorte, apenas reescalado.
  const reiniciarQuadro = useRef(true);
  const imgAnterior = useRef(null);

  useEffect(() => {
    reiniciarQuadro.current = true;
  }, [imagem, proporcaoId]);

  useEffect(() => {
    if (!img) return;

    const anterior = imgAnterior.current;
    imgAnterior.current = img;

    if (reiniciarQuadro.current || !anterior) {
      reiniciarQuadro.current = false;
      setRecorte(recorteInicial(img, proporcao));
      return;
    }

    const fator = img.escala / anterior.escala;

    setRecorte(r => (
      r
        ? {
            x: img.x + (r.x - anterior.x) * fator,
            y: img.y + (r.y - anterior.y) * fator,
            w: r.w * fator,
            h: r.h * fator,
          }
        : recorteInicial(img, proporcao)
    ));
  }, [img, proporcaoId]);

  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (e) => {
        const r = refs.current.recorte;

        if (!r) {
          gesto.current = { modo: null };
          return;
        }

        const px = e.nativeEvent.locationX;
        const py = e.nativeEvent.locationY;

        const cantos = {
          se: [r.x, r.y],
          sd: [r.x + r.w, r.y],
          ie: [r.x, r.y + r.h],
          id: [r.x + r.w, r.y + r.h],
        };

        let canto = null;
        let menorDistancia = RAIO_CANTO;

        Object.keys(cantos).forEach(k => {
          const d = Math.hypot(
            px - cantos[k][0],
            py - cantos[k][1]
          );

          if (d < menorDistancia) {
            menorDistancia = d;
            canto = k;
          }
        });

        if (canto) {
          gesto.current = {
            modo: 'redimensionar',
            canto,
            inicio: { ...r },
          };
        } else if (
          px >= r.x &&
          px <= r.x + r.w &&
          py >= r.y &&
          py <= r.y + r.h
        ) {
          gesto.current = {
            modo: 'mover',
            inicio: { ...r },
          };
        } else {
          gesto.current = { modo: null };
        }
      },

      onPanResponderMove: (_, g) => {
        const { modo, inicio, canto } = gesto.current;
        const limites = refs.current.img;

        if (!modo || !limites) return;

        if (modo === 'mover') {
          setRecorte({
            ...inicio,
            x: limitar(
              inicio.x + g.dx,
              limites.x,
              limites.x + limites.w - inicio.w
            ),
            y: limitar(
              inicio.y + g.dy,
              limites.y,
              limites.y + limites.h - inicio.h
            ),
          });
        } else {
          setRecorte(
            redimensionar(
              inicio,
              canto,
              g.dx,
              g.dy,
              limites,
              refs.current.proporcao
            )
          );
        }
      },

      onPanResponderRelease: () => {
        gesto.current = { modo: null };
      },

      onPanResponderTerminate: () => {
        gesto.current = { modo: null };
      },
    })
  );

  // Recorte em pixels da imagem de trabalho
  const recortePx = useMemo(() => {
    if (!img || !recorte || !imagem) return null;

    const originX = limitar(
      Math.round((recorte.x - img.x) / img.escala),
      0,
      imagem.width - 1
    );

    const originY = limitar(
      Math.round((recorte.y - img.y) / img.escala),
      0,
      imagem.height - 1
    );

    const width = limitar(
      Math.round(recorte.w / img.escala),
      1,
      imagem.width - originX
    );

    const height = limitar(
      Math.round(recorte.h / img.escala),
      1,
      imagem.height - originY
    );

    return {
      originX,
      originY,
      width,
      height,
    };
  }, [img, recorte, imagem]);

  // Tamanho da imagem que será salva
  const tamanhoFinal = useMemo(() => {
    if (!recortePx) return null;

    const maior = Math.max(
      recortePx.width,
      recortePx.height
    );

    const fator =
      maior > formato.ladoMaximo
        ? formato.ladoMaximo / maior
        : 1;

    return {
      w: Math.round(recortePx.width * fator),
      h: Math.round(recortePx.height * fator),
    };
  }, [recortePx, formato]);

  async function confirmar() {
    if (!recortePx || !imagem) return;

    setProcessando(true);

    let contexto = null;
    let renderizada = null;

    try {
      contexto = ImageManipulator
        .manipulate(imagem.uri)
        .crop(recortePx);

      if (
        Math.max(
          recortePx.width,
          recortePx.height
        ) > formato.ladoMaximo
      ) {
        contexto =
          recortePx.width >= recortePx.height
            ? contexto.resize({ width: formato.ladoMaximo })
            : contexto.resize({ height: formato.ladoMaximo });
      }

      const png = formato.formato === 'png';

      renderizada = await contexto.renderAsync();

      const resultado = await renderizada.saveAsync({
        format: png
          ? SaveFormat.PNG
          : SaveFormat.JPEG,
        compress: png ? 1 : 0.85,
        base64: true,
      });

      onConcluir({
        uri: resultado.uri,
        base64: resultado.base64,
        width: resultado.width,
        height: resultado.height,
        mimeType: png ? 'image/png' : 'image/jpeg',
        fileName: `${formato.prefixo || 'imagem'}-${Date.now()}.${png ? 'png' : 'jpg'}`,
      });
    } catch (e) {
      Alert.alert(
        'Erro',
        'Não foi possível recortar a imagem. Tente novamente.'
      );
    } finally {
      liberar(contexto, renderizada);
      setProcessando(false);
    }
  }

  const opcoes = formato.opcoes
    .map(id => PROPORCOES[id])
    .filter(Boolean);

  const recomendadaId = formato.proporcao;

  const abaixoDoRecomendado =
    tamanhoFinal &&
    formato.proporcao !== 'livre' &&
    Math.max(tamanhoFinal.w, tamanhoFinal.h) <
      formato.ladoMaximo * 0.5;

  return (
    <Modal
      visible={!!pedido}
      animationType={
        preferencias.reduzirAnimacoes
          ? 'none'
          : 'slide'
      }
      onRequestClose={onCancelar}
    >
      <SafeAreaProvider>
        <SafeAreaView
          edges={['top']}
          style={styles.areaSeguraTopo}
        >
          <SafeAreaView
            edges={['left', 'right', 'bottom']}
            style={styles.container}
          >
            <View style={styles.cabecalho}>
              <TouchableOpacity
                onPress={onCancelar}
                style={styles.botaoTopo}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
                disabled={processando}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={styles.cabecalhoTitulo}>
                  Ajustar imagem
                </Text>

                <Text
                  style={styles.cabecalhoSub}
                  numberOfLines={1}
                >
                  {formato.titulo}
                </Text>
              </View>

              <View style={styles.botaoTopo} />
            </View>

            <View style={styles.info}>
              <Text style={styles.infoLinha}>
                <Text style={styles.infoDestaque}>
                  Recomendado:{' '}
                </Text>
                {formato.recomendado}
                {formato.proporcao !== 'livre'
                  ? ` · proporção ${formato.proporcao}`
                  : ''}
              </Text>

              {!!formato.onde && (
                <Text style={styles.infoOnde}>
                  {formato.onde}
                </Text>
              )}

              {proporcaoId === 'livre' &&
                formato.proporcao !== 'livre' && (
                  <Text style={styles.infoAviso}>
                    No recorte livre, se a imagem não ficar em{' '}
                    {formato.proporcao}, o app corta as bordas ao exibir.
                  </Text>
                )}
            </View>

            <View style={styles.opcoesWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.opcoes}
              >
                {opcoes.map(op => {
                  const ativa = op.id === proporcaoId;

                  const rotulo =
                    op.id === recomendadaId &&
                    op.id !== 'livre'
                      ? `${op.rotulo} · recomendado`
                      : op.rotulo;

                  return (
                    <TouchableOpacity
                      key={op.id}
                      style={[
                        styles.chip,
                        ativa && styles.chipAtivo,
                      ]}
                      onPress={() => setProporcaoId(op.id)}
                      disabled={processando}
                    >
                      <Ionicons
                        name={
                          op.id === 'livre'
                            ? 'crop-outline'
                            : 'tablet-landscape-outline'
                        }
                        size={14}
                        color={
                          ativa
                            ? '#fff'
                            : '#e8dfd3'
                        }
                      />

                      <Text
                        style={[
                          styles.chipTexto,
                          ativa && styles.chipTextoAtivo,
                        ]}
                      >
                        {rotulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Área de trabalho */}
            <View
              style={styles.area}
              onLayout={e => {
                const {
                  width,
                  height,
                } = e.nativeEvent.layout;

                setArea(a =>
                  Math.abs(a.w - width) < 0.5 &&
                  Math.abs(a.h - height) < 0.5
                    ? a
                    : {
                        w: width,
                        h: height,
                      }
                );
              }}
              {...pan.panHandlers}
            >
              {(preparando || !img) && (
                <View
                  style={[
                    styles.carregando,
                    styles.semToque,
                  ]}
                >
                  <ActivityIndicator
                    color="#fff"
                    size="large"
                  />

                  <Text style={styles.carregandoTexto}>
                    Preparando imagem...
                  </Text>
                </View>
              )}

              {!!img && !preparando && (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    styles.semToque,
                  ]}
                >
                  <Image
                    source={{ uri: imagem.uri }}
                    style={{
                      position: 'absolute',
                      left: img.x,
                      top: img.y,
                      width: img.w,
                      height: img.h,
                    }}
                    resizeMode="stretch"
                  />

                  {!!recorte && (
                    <>
                      <View
                        style={[
                          styles.sombra,
                          {
                            left: 0,
                            top: 0,
                            width: area.w,
                            height: recorte.y,
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.sombra,
                          {
                            left: 0,
                            top: recorte.y + recorte.h,
                            width: area.w,
                            height: Math.max(
                              0,
                              area.h -
                                recorte.y -
                                recorte.h
                            ),
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.sombra,
                          {
                            left: 0,
                            top: recorte.y,
                            width: recorte.x,
                            height: recorte.h,
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.sombra,
                          {
                            left:
                              recorte.x +
                              recorte.w,
                            top: recorte.y,
                            width: Math.max(
                              0,
                              area.w -
                                recorte.x -
                                recorte.w
                            ),
                            height: recorte.h,
                          },
                        ]}
                      />

                      <View
                        testID="quadro-recorte"
                        style={[
                          styles.quadro,
                          {
                            left: recorte.x,
                            top: recorte.y,
                            width: recorte.w,
                            height: recorte.h,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.guiaV,
                            { left: '33.33%' },
                          ]}
                        />

                        <View
                          style={[
                            styles.guiaV,
                            { left: '66.66%' },
                          ]}
                        />

                        <View
                          style={[
                            styles.guiaH,
                            { top: '33.33%' },
                          ]}
                        />

                        <View
                          style={[
                            styles.guiaH,
                            { top: '66.66%' },
                          ]}
                        />

                        <View
                          style={[
                            styles.canto,
                            styles.cantoSE,
                          ]}
                        />

                        <View
                          style={[
                            styles.canto,
                            styles.cantoSD,
                          ]}
                        />

                        <View
                          style={[
                            styles.canto,
                            styles.cantoIE,
                          ]}
                        />

                        <View
                          style={[
                            styles.canto,
                            styles.cantoID,
                          ]}
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>

            <View style={styles.rodape}>
              <Text style={styles.dica}>
                Arraste o quadro para mover · arraste os cantos para redimensionar
              </Text>

              <Text
                style={[
                  styles.tamanho,
                  abaixoDoRecomendado &&
                    styles.tamanhoAlerta,
                ]}
                numberOfLines={2}
              >
                {tamanhoFinal
                  ? `Imagem final: ${tamanhoFinal.w} × ${tamanhoFinal.h} px`
                  : ' '}

                {abaixoDoRecomendado
                  ? ' — menor que o recomendado, pode perder qualidade'
                  : ''}
              </Text>

              <View style={styles.botoes}>
                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={onCancelar}
                  disabled={processando}
                >
                  <Text style={styles.botaoCancelarTexto}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoConfirmar,
                    (!recortePx ||
                      processando ||
                      preparando) && {
                      opacity: 0.6,
                    },
                  ]}
                  onPress={confirmar}
                  disabled={
                    !recortePx ||
                    processando ||
                    preparando
                  }
                >
                  {processando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color="#fff"
                      />

                      <Text style={styles.botaoConfirmarTexto}>
                        Usar imagem
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

// Hook: abre a galeria do aparelho e, em seguida, a ferramenta de recorte.
export function useSeletorImagem() {
  const [pedido, setPedido] = useState(null);
  const resolver = useRef(null);
  const ocupado = useRef(false);

  const escolherImagem = useCallback(async (idFormato = 'livre') => {
    if (ocupado.current) return null;

    ocupado.current = true;

    const formato =
      FORMATOS_IMAGEM[idFormato] ||
      FORMATOS_IMAGEM.livre;

    let asset;

    try {
      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso às fotos para escolher uma imagem.'
        );

        ocupado.current = false;
        return null;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 1,
        });

      if (
        resultado.canceled ||
        !resultado.assets?.length
      ) {
        ocupado.current = false;
        return null;
      }

      asset = resultado.assets[0];
    } catch (e) {
      ocupado.current = false;

      Alert.alert(
        'Erro',
        'Não foi possível abrir a galeria de fotos.'
      );

      return null;
    }

    return new Promise(resolve => {
      resolver.current = resolve;

      // No iOS, espera a galeria terminar de fechar antes de abrir o recorte
      setTimeout(
        () => setPedido({ asset, formato }),
        Platform.OS === 'ios' ? 450 : 0
      );
    });
  }, []);

  const finalizar = useCallback((resultado) => {
    const resolve = resolver.current;

    resolver.current = null;
    ocupado.current = false;

    setPedido(null);

    if (resolve) {
      resolve(resultado);
    }
  }, []);

  const modalRecorte = (
    <RecorteImagemModal
      pedido={pedido}
      onConcluir={finalizar}
      onCancelar={() => finalizar(null)}
    />
  );

  return {
    escolherImagem,
    modalRecorte,
  };
}

const TAM_CANTO = 26;
const ESPESSURA_CANTO = 4;

const styles = StyleSheet.create({
  areaSeguraTopo: {
    flex: 1,
    backgroundColor: '#7A1F2B',
  },

  container: {
    flex: 1,
    backgroundColor: '#15110f',
  },

  semToque: {
    pointerEvents: 'none',
  },

  cabecalho: {
    backgroundColor: '#7A1F2B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 10,
  },

  botaoTopo: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cabecalhoTitulo: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
  },

  cabecalhoSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 1,
  },

  info: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },

  infoLinha: {
    color: '#f3ece2',
    fontSize: 13,
  },

  infoDestaque: {
    fontWeight: '700',
    color: '#E0B660',
  },

  infoOnde: {
    color: '#b9ada0',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  infoAviso: {
    color: '#F2B28C',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  opcoesWrapper: {
    height: 52,
  },

  opcoes: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  chipAtivo: {
    backgroundColor: '#7A1F2B',
    borderColor: '#E0B660',
  },

  chipTexto: {
    color: '#e8dfd3',
    fontSize: 12,
    fontWeight: '600',
  },

  chipTextoAtivo: {
    color: '#fff',
  },

  area: {
    flex: 1,
    marginHorizontal: 12,
    marginVertical: 6,
    overflow: 'hidden',
  },

  carregando: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  carregandoTexto: {
    color: '#e8dfd3',
    fontSize: 13,
  },

  sombra: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },

  quadro: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  guiaV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  guiaH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  canto: {
    position: 'absolute',
    width: TAM_CANTO,
    height: TAM_CANTO,
    borderColor: '#E0B660',
  },

  cantoSE: {
    left: -ESPESSURA_CANTO,
    top: -ESPESSURA_CANTO,
    borderLeftWidth: ESPESSURA_CANTO,
    borderTopWidth: ESPESSURA_CANTO,
  },

  cantoSD: {
    right: -ESPESSURA_CANTO,
    top: -ESPESSURA_CANTO,
    borderRightWidth: ESPESSURA_CANTO,
    borderTopWidth: ESPESSURA_CANTO,
  },

  cantoIE: {
    left: -ESPESSURA_CANTO,
    bottom: -ESPESSURA_CANTO,
    borderLeftWidth: ESPESSURA_CANTO,
    borderBottomWidth: ESPESSURA_CANTO,
  },

  cantoID: {
    right: -ESPESSURA_CANTO,
    bottom: -ESPESSURA_CANTO,
    borderRightWidth: ESPESSURA_CANTO,
    borderBottomWidth: ESPESSURA_CANTO,
  },

  rodape: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },

  dica: {
    color: '#b9ada0',
    fontSize: 12,
    textAlign: 'center',
  },

  tamanho: {
    color: '#f3ece2',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
    minHeight: 34,
  },

  tamanhoAlerta: {
    color: '#F2B28C',
  },

  botoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  botaoCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  botaoCancelarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  botaoConfirmar: {
    flex: 1.4,
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  botaoConfirmarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});