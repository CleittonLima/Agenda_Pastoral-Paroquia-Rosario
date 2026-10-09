import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  buscarOracoesETercos,
  salvarOracao,
  excluirOracao,
  salvarTerco,
  excluirTerco,
} from '../api/api';

const VINHO = '#7A1F2B';

const FORM_ORACAO = {
  id: null,
  titulo: '',
  categoria: 'Oração',
  descricao: '',
  texto: '',
  ordem: '1',
  status: 'Ativo',
};

const FORM_TERCO = {
  id: null,
  titulo: '',
  descricao: '',
  conclusao: '',
  ordem: '1',
  status: 'Ativo',
  partes: [],
};

const NOVA_PARTE = {
  titulo: '',
  subtitulo: '',
  texto: '',
};

export default function AdminOracoesScreen() {
  const navigation = useNavigation();

  const [indiceRepeticao, setIndiceRepeticao] = useState(null);
  const [aba, setAba] = useState('oracoes');
  const [oracoes, setOracoes] = useState([]);
  const [tercos, setTercos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [formularioVisivel, setFormularioVisivel] = useState(false);

  const [formularioOracao, setFormularioOracao] = useState({
    ...FORM_ORACAO,
  });

  const [formularioTerco, setFormularioTerco] = useState({
    ...FORM_TERCO,
  });

  const carregar = useCallback(async () => {
    setCarregando(true);

    try {
      const resultado = await buscarOracoesETercos(false);

      if (!resultado.ok) {
        throw new Error(
          resultado.erro || 'Não foi possível carregar os conteúdos.'
        );
      }

      setOracoes(resultado.oracoes || []);
      setTercos(resultado.tercos || []);
    } catch (erro) {
      Alert.alert(
        'Erro',
        erro.message || 'Não foi possível carregar os conteúdos.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const campoOracao = (campo, valor) => {
    setFormularioOracao(atual => ({
      ...atual,
      [campo]: valor,
    }));
  };

  const campoTerco = (campo, valor) => {
    setFormularioTerco(atual => ({
      ...atual,
      [campo]: valor,
    }));
  };

  function novaOracao() {
    setFormularioOracao({ ...FORM_ORACAO });
    setFormularioVisivel(true);
  }

  function editarOracao(item) {
    setFormularioOracao({
      id: item.id,
      titulo: item.nome || item.titulo || '',
      categoria: item.categoria || 'Oração',
      descricao: item.descricao || '',
      texto: item.texto || '',
      ordem: String(item.ordem || 1),
      status: item.status || 'Ativo',
    });

    setFormularioVisivel(true);
  }

  function novoTerco() {
    setFormularioTerco({
      ...FORM_TERCO,
      partes: [],
    });

    setFormularioVisivel(true);
  }

  function editarTerco(item) {
    setFormularioTerco({
      id: item.id,
      titulo: item.nome || item.titulo || '',
      descricao: item.descricao || '',
      conclusao: item.conclusao || '',
      ordem: String(item.ordem || 1),
      status:
        String(item.status || 'Ativo').toLowerCase() === 'ativo'
          ? 'Ativo'
          : 'Inativo',
      partes: Array.isArray(item.partes)
        ? item.partes.map(parte => ({
            titulo: parte.titulo || '',
            subtitulo: parte.subtitulo || '',
            texto: parte.texto || '',
          }))
        : [],
    });

    setFormularioVisivel(true);
  }

  // =========================================================
  // SALVAR ORAÇÕES E TERÇOS
  // =========================================================

  async function salvarAtual() {
    if (salvando) return;

    const ehOracao = aba === 'oracoes';
    const formulario = ehOracao
      ? formularioOracao
      : formularioTerco;

    if (!formulario.titulo.trim()) {
      Alert.alert(
        'Atenção',
        `Informe o título ${ehOracao ? 'da oração' : 'do terço'}.`
      );
      return;
    }

    if (ehOracao && !formulario.texto.trim()) {
      Alert.alert('Atenção', 'Informe o texto da oração.');
      return;
    }

    if (!ehOracao && formulario.partes.length === 0) {
      Alert.alert(
        'Atenção',
        'Adicione pelo menos uma etapa ao terço.'
      );
      return;
    }

    if (
      !ehOracao &&
      formulario.partes.some(parte => !parte.titulo.trim())
    ) {
      Alert.alert(
        'Atenção',
        'Todas as etapas precisam ter um título.'
      );
      return;
    }

    setSalvando(true);

    try {
      const dados = ehOracao
        ? {
            ...formulario,
            titulo: formulario.titulo.trim(),
            categoria: formulario.categoria.trim() || 'Oração',
            descricao: formulario.descricao.trim(),
            texto: formulario.texto.trim(),
            ordem: Number(formulario.ordem) || 1,
          }
        : {
            ...formulario,
            titulo: formulario.titulo.trim(),
            descricao: formulario.descricao.trim(),
            conclusao: formulario.conclusao.trim(),
            ordem: Number(formulario.ordem) || 1,
            partes: formulario.partes.map(parte => ({
              titulo: parte.titulo.trim(),
              subtitulo: parte.subtitulo.trim(),
              texto: parte.texto.trim(),
            })),
          };

      const resultado = ehOracao
        ? await salvarOracao(dados)
        : await salvarTerco(dados);

      if (!resultado.ok) {
        throw new Error(
          resultado.erro || 'Não foi possível salvar.'
        );
      }

      setFormularioVisivel(false);

      await carregar();

      Alert.alert(
        'Sucesso',
        ehOracao
          ? 'Oração salva com sucesso.'
          : 'Terço salvo com sucesso.'
      );
    } catch (erro) {
      Alert.alert(
        'Erro ao salvar',
        erro.message || 'Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // =========================================================
  // EXCLUIR ORAÇÕES E TERÇOS
  // =========================================================

  function confirmarExcluir(item, ehOracao) {
    Alert.alert(
      `Excluir ${ehOracao ? 'oração' : 'terço'}`,
      `Deseja realmente excluir "${item.nome}"? Essa ação não poderá ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const resultado = ehOracao
                ? await excluirOracao(item.id)
                : await excluirTerco(item.id);

              if (!resultado.ok) {
                Alert.alert(
                  'Erro',
                  resultado.erro || 'Não foi possível excluir.'
                );
                return;
              }

              await carregar();
            } catch (erro) {
              Alert.alert(
                'Erro',
                erro.message || 'Não foi possível excluir.'
              );
            }
          },
        },
      ]
    );
  }

  // =========================================================
  // ATIVAR E DESATIVAR
  // =========================================================

  async function alternarStatus(item, ehOracao) {
    const novoStatus =
      String(item.status).toLowerCase() === 'ativo'
        ? 'Inativo'
        : 'Ativo';

    try {
      const dados = ehOracao
        ? {
            id: item.id,
            titulo: item.nome,
            categoria: item.categoria,
            descricao: item.descricao,
            texto: item.texto,
            imagem: item.imagem,
            ordem: item.ordem,
            status: novoStatus,
          }
        : {
            id: item.id,
            titulo: item.nome,
            descricao: item.descricao,
            imagem: item.imagem,
            partes: item.partes,
            conclusao: item.conclusao,
            ordem: item.ordem,
            status: novoStatus,
          };

      const resultado = ehOracao
        ? await salvarOracao(dados)
        : await salvarTerco(dados);

      if (!resultado.ok) {
        Alert.alert(
          'Erro',
          resultado.erro || 'Não foi possível alterar o status.'
        );
        return;
      }

      await carregar();
    } catch (erro) {
      Alert.alert(
        'Erro',
        erro.message || 'Não foi possível alterar o status.'
      );
    }
  }

  // =========================================================
  // ETAPAS DOS TERÇOS
  // =========================================================

  function atualizarParte(indice, campo, valor) {
    setFormularioTerco(atual => ({
      ...atual,
      partes: atual.partes.map((parte, i) =>
        i === indice
          ? { ...parte, [campo]: valor }
          : parte
      ),
    }));
  }

  // Duplica a etapa e tenta incrementar uma numeração existente.
  function duplicarParte(indice) {
    const original = formularioTerco.partes[indice];

    if (!original) return;

    const nova = { ...original };

    // Exemplo: subtítulo "1/10" passa para "2/10".
    const matchSubtitulo = String(
      original.subtitulo || ''
    ).match(/^(.*?)(\d+)\s*\/\s*(\d+)(.*)$/);

    if (matchSubtitulo) {
      const numeroAtual = Number(matchSubtitulo[2]);
      const total = Number(matchSubtitulo[3]);

      nova.subtitulo =
        `${matchSubtitulo[1]}${numeroAtual + 1}/${total}${matchSubtitulo[4]}`;
    } else {
      // Alternativa: tenta encontrar um número no final do título.
      const matchTitulo = String(
        original.titulo || ''
      ).match(/^(.*?)(\d+)\s*$/);

      if (matchTitulo) {
        nova.titulo =
          `${matchTitulo[1]}${Number(matchTitulo[2]) + 1}`;
      }
    }

    const partes = [...formularioTerco.partes];

    partes.splice(indice + 1, 0, nova);

    campoTerco('partes', partes);
  }

  // Repete a etapa e gera uma numeração de 1 até o total.
  function repetirParte(indice, quantidade) {
    const original = formularioTerco.partes[indice];

    if (!original) return;

    const total = Math.max(
      1,
      Math.min(50, Number(quantidade) || 1)
    );

    const matchSubtitulo = String(
      original.subtitulo || ''
    ).match(/^(.*?)(\d+)\s*\/\s*(\d+)(.*)$/);

    const tituloBase = String(
      original.titulo || ''
    ).replace(/\s+\d+\s*$/, '');

    const geradas = Array.from(
      { length: total },
      (_, i) => {
        let subtitulo;

        if (matchSubtitulo) {
          subtitulo =
            `${matchSubtitulo[1]}${i + 1}/${total}${matchSubtitulo[4]}`;
        } else {
          subtitulo = `${i + 1}/${total}`;
        }

        return {
          ...original,
          titulo: tituloBase || original.titulo,
          subtitulo,
        };
      }
    );

    const partes = [...formularioTerco.partes];

    // Substitui a etapa selecionada pelas etapas geradas.
    partes.splice(indice, 1, ...geradas);

    campoTerco('partes', partes);
  }

  function escolherRepeticao(indice) {
  setIndiceRepeticao(indice);
}

function removerParte(indice) {
  const executarRemocao = () => {
    setFormularioTerco(atual => ({
      ...atual,
      partes: atual.partes.filter((_, i) => i !== indice),
    }));
  };

  // Confirmação própria para a versão web.
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm('Deseja remover esta etapa do terço?')) {
      executarRemocao();
    }
    return;
  }

  // Confirmação para Android e iOS.
  Alert.alert(
    'Remover etapa',
    'Deseja remover esta etapa do terço?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: executarRemocao,
      },
    ]
  );
}

  function moverParte(indice, direcao) {
  setFormularioTerco(atual => {
    const destino = indice + direcao;

    // Impede mover para uma posição inexistente.
    if (destino < 0 || destino >= atual.partes.length) {
      return atual;
    }

    const partes = [...atual.partes];

    // Troca somente as posições das duas etapas.
    [partes[indice], partes[destino]] = [
      partes[destino],
      partes[indice],
    ];

    return {
      ...atual,
      partes,
    };
  });
}

  const editando = formularioVisivel;
  const ehOracao = aba === 'oracoes';

  const formulario = ehOracao
    ? formularioOracao
    : formularioTerco;

  // =========================================================
  // TELA
  // =========================================================

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <TouchableOpacity
          onPress={() =>
            editando
              ? setFormularioVisivel(false)
              : navigation.goBack()
          }
          style={styles.botaoVoltar}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.tituloCabecalho}>
            Orações e Terços
          </Text>

          <Text style={styles.subtituloCabecalho}>
            {editando
              ? `Cadastro de ${ehOracao ? 'oração' : 'terço'}`
              : 'Gerenciamento de conteúdos'}
          </Text>
        </View>

        <View style={{ width: 32 }} />
      </View>

      {!editando && (
        <View style={styles.abas}>
          <TouchableOpacity
            style={[
              styles.aba,
              ehOracao && styles.abaAtiva,
            ]}
            onPress={() => setAba('oracoes')}
          >
            <Ionicons
              name="book-outline"
              size={17}
              color={ehOracao ? '#fff' : VINHO}
            />

            <Text
              style={[
                styles.textoAba,
                ehOracao && styles.textoAbaAtiva,
              ]}
            >
              Orações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.aba,
              !ehOracao && styles.abaAtiva,
            ]}
            onPress={() => setAba('tercos')}
          >
            <Ionicons
              name="flower-outline"
              size={17}
              color={!ehOracao ? '#fff' : VINHO}
            />

            <Text
              style={[
                styles.textoAba,
                !ehOracao && styles.textoAbaAtiva,
              ]}
            >
              Terços
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios' && editando
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          {editando ? (
            <>
              <Text style={styles.tituloSecao}>
                {formulario.id
                  ? `Editar ${ehOracao ? 'oração' : 'terço'}`
                  : `Novo ${ehOracao ? 'oração' : 'terço'}`}
              </Text>

              <Campo
                rotulo="Título *"
                valor={formulario.titulo}
                onChangeText={valor =>
                  ehOracao
                    ? campoOracao('titulo', valor)
                    : campoTerco('titulo', valor)
                }
                placeholder={
                  ehOracao
                    ? 'Ex.: Oração da manhã'
                    : 'Ex.: Terço de São José'
                }
              />

              {ehOracao && (
                <Campo
                  rotulo="Categoria"
                  valor={formulario.categoria}
                  onChangeText={valor =>
                    campoOracao('categoria', valor)
                  }
                  placeholder="Ex.: Orações diárias"
                />
              )}

              <Campo
                rotulo="Descrição"
                valor={formulario.descricao}
                onChangeText={valor =>
                  ehOracao
                    ? campoOracao('descricao', valor)
                    : campoTerco('descricao', valor)
                }
                placeholder="Breve descrição (opcional)"
                multiline
              />

              {ehOracao ? (
                <Campo
                  rotulo="Texto da oração *"
                  valor={formulario.texto}
                  onChangeText={valor =>
                    campoOracao('texto', valor)
                  }
                  placeholder="Digite o texto completo da oração"
                  multiline
                  alto
                />
              ) : (
                <>
                  <View style={styles.blocoEtapasTopo}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tituloSecao}>
                        Etapas do terço *
                      </Text>

                      <Text style={styles.descricaoSecao}>
                        Cada etapa será exibida individualmente
                        durante a oração.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.botaoAdicionarEtapa}
                      onPress={() =>
                        campoTerco('partes', [
                          ...formularioTerco.partes,
                          { ...NOVA_PARTE },
                        ])
                      }
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color="#fff"
                      />

                      <Text style={styles.botaoAdicionarTexto}>
                        Etapa
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {formularioTerco.partes.map(
                    (parte, indice) => (
                      <View
                        key={`${indice}-${parte.titulo}-${parte.subtitulo}`}
                        style={styles.cardEtapa}
                      >
                        <View style={styles.linhaEtapa}>
                          <Text style={styles.tituloEtapa}>
                            Etapa {indice + 1}
                          </Text>

                          <View style={styles.acoesEtapa}>
                            <TouchableOpacity
                              onPress={() =>
                                moverParte(indice, -1)
                              }
                              disabled={indice === 0}
                              style={styles.iconeAcao}
                            >
                              <Ionicons
                                name="arrow-up"
                                size={18}
                                color={
                                  indice === 0
                                    ? '#c8c0b7'
                                    : VINHO
                                }
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() =>
                                moverParte(indice, 1)
                              }
                              disabled={
                                indice ===
                                formularioTerco.partes.length - 1
                              }
                              style={styles.iconeAcao}
                            >
                              <Ionicons
                                name="arrow-down"
                                size={18}
                                color={
                                  indice ===
                                  formularioTerco.partes.length - 1
                                    ? '#c8c0b7'
                                    : VINHO
                                }
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() =>
                                duplicarParte(indice)
                              }
                              style={styles.iconeAcao}
                            >
                              <Ionicons
                                name="copy-outline"
                                size={18}
                                color={VINHO}
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() =>
                                escolherRepeticao(indice)
                              }
                              style={styles.iconeAcao}
                            >
                              <Ionicons
                                name="repeat-outline"
                                size={18}
                                color={VINHO}
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() =>
                                removerParte(indice)
                              }
                              style={styles.iconeAcao}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#b42318"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Campo
                          rotulo="Título da etapa *"
                          valor={parte.titulo}
                          onChangeText={valor =>
                            atualizarParte(
                              indice,
                              'titulo',
                              valor
                            )
                          }
                          placeholder="Ex.: Ave-Maria"
                          compacto
                        />

                        <Campo
                          rotulo="Subtítulo (opcional)"
                          valor={parte.subtitulo}
                          onChangeText={valor =>
                            atualizarParte(
                              indice,
                              'subtitulo',
                              valor
                            )
                          }
                          placeholder="Ex.: 1/10"
                          compacto
                        />

                        <Campo
                          rotulo="Texto"
                          valor={parte.texto}
                          onChangeText={valor =>
                            atualizarParte(
                              indice,
                              'texto',
                              valor
                            )
                          }
                          placeholder="Texto desta etapa"
                          multiline
                          compacto
                        />
                      </View>
                    )
                  )}

                  <Campo
                    rotulo="Oração de conclusão"
                    valor={formularioTerco.conclusao}
                    onChangeText={valor =>
                      campoTerco('conclusao', valor)
                    }
                    placeholder="Digite a oração exibida ao concluir o terço"
                    multiline
                  />
                </>
              )}

              <Campo
                rotulo="Ordem de exibição"
                valor={formulario.ordem}
                onChangeText={valor =>
                  ehOracao
                    ? campoOracao('ordem', valor)
                    : campoTerco('ordem', valor)
                }
                placeholder="1"
                teclado="numeric"
              />

              <Text style={styles.rotuloCampo}>
                Disponibilidade
              </Text>

              <View style={styles.opcoesStatus}>
                {['Ativo', 'Inativo'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.opcaoStatus,
                      formulario.status === status &&
                        styles.opcaoStatusSelecionada,
                    ]}
                    onPress={() =>
                      ehOracao
                        ? campoOracao('status', status)
                        : campoTerco('status', status)
                    }
                  >
                    <Text
                      style={[
                        styles.opcaoStatusTexto,
                        formulario.status === status &&
                          styles.opcaoStatusTextoSelecionada,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.botaoSalvar,
                  salvando && { opacity: 0.65 },
                ]}
                onPress={salvarAtual}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#fff"
                    />

                    <Text style={styles.botaoSalvarTexto}>
                      Salvar {ehOracao ? 'oração' : 'terço'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setFormularioVisivel(false)}
                disabled={salvando}
              >
                <Text style={styles.botaoCancelarTexto}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.botaoAdicionar}
                onPress={ehOracao ? novaOracao : novoTerco}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color="#fff"
                />

                <Text style={styles.botaoAdicionarTexto}>
                  Novo {ehOracao ? 'oração' : 'terço'}
                </Text>
              </TouchableOpacity>

              <View style={styles.bloco}>
                <Text style={styles.tituloSecao}>
                  {ehOracao
                    ? 'Orações cadastradas'
                    : 'Terços cadastrados'}
                </Text>

                <Text style={styles.descricaoSecao}>
                  {ehOracao
                    ? 'Gerencie as orações adicionais disponíveis para os fiéis.'
                    : 'Gerencie os terços adicionais. Os terços fixos do aplicativo permanecem no código.'}
                </Text>
              </View>

              {carregando ? (
                <ActivityIndicator
                  size="large"
                  color={VINHO}
                  style={{ marginTop: 24 }}
                />
              ) : (ehOracao ? oracoes : tercos).length === 0 ? (
                <View style={styles.vazio}>
                  <Ionicons
                    name={
                      ehOracao
                        ? 'book-outline'
                        : 'flower-outline'
                    }
                    size={38}
                    color="#a89b8c"
                  />

                  <Text style={styles.vazioTitulo}>
                    Nenhum {ehOracao ? 'oração' : 'terço'} cadastrado
                  </Text>

                  <Text style={styles.vazioTexto}>
                    {ehOracao
                      ? 'As orações fixas do aplicativo continuam disponíveis. Você pode cadastrar novas orações por aqui.'
                      : 'Cadastre um terço adicional para que ele possa aparecer na área pública quando estiver ativo.'}
                  </Text>
                </View>
              ) : (
                (ehOracao ? oracoes : tercos).map(item => {
                  const ativo =
                    String(item.status).toLowerCase() === 'ativo';

                  return (
                    <View key={item.id} style={styles.card}>
                      <View style={styles.cardTopo}>
                        <View style={styles.icone}>
                          <Ionicons
                            name={
                              ehOracao
                                ? 'book-outline'
                                : 'flower-outline'
                            }
                            size={21}
                            color={VINHO}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.nome}>
                            {item.nome}
                          </Text>

                          <Text style={styles.categoria}>
                            {ehOracao
                              ? item.categoria || 'Oração'
                              : `${(item.partes || []).length} etapa(s)`}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.etiquetaStatus,
                            ativo
                              ? styles.statusAtivo
                              : styles.statusInativo,
                          ]}
                        >
                          <Text
                            style={[
                              styles.etiquetaStatusTexto,
                              ativo
                                ? styles.statusAtivoTexto
                                : styles.statusInativoTexto,
                            ]}
                          >
                            {ativo ? 'Ativo' : 'Inativo'}
                          </Text>
                        </View>
                      </View>

                      {!!item.descricao && (
                        <Text style={styles.descricaoCard}>
                          {item.descricao}
                        </Text>
                      )}

                      <View style={styles.acoesCard}>
                        <Acao
                          icone="create-outline"
                          texto="Editar"
                          onPress={() =>
                            ehOracao
                              ? editarOracao(item)
                              : editarTerco(item)
                          }
                        />

                        <Acao
                          icone={
                            ativo
                              ? 'eye-off-outline'
                              : 'eye-outline'
                          }
                          texto={ativo ? 'Desativar' : 'Ativar'}
                          onPress={() =>
                            alternarStatus(item, ehOracao)
                          }
                        />

                        <Acao
                          icone="trash-outline"
                          texto="Excluir"
                          destrutiva
                          onPress={() =>
                            confirmarExcluir(item, ehOracao)
                          }
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
            </KeyboardAvoidingView>

      <Modal
        visible={indiceRepeticao !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIndiceRepeticao(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <Text style={styles.modalTitulo}>
              Repetir etapa
            </Text>

            <Text style={styles.modalDescricao}>
              Quantas vezes deseja repetir esta etapa?
            </Text>

            {[5, 10, 12].map(quantidade => (
              <TouchableOpacity
                key={quantidade}
                style={styles.modalOpcao}
                onPress={() => {
                    repetirParte(indiceRepeticao, quantidade);
                    setIndiceRepeticao(null);
                    }}
              >
                <Text style={styles.modalOpcaoTexto}>
                  {quantidade} vezes
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelar}
              onPress={() => setIndiceRepeticao(null)}
            >
              <Text style={styles.modalCancelarTexto}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =========================================================
// COMPONENTES AUXILIARES
// =========================================================

function Acao({
  icone,
  texto,
  onPress,
  destrutiva = false,
}) {
  return (
    <TouchableOpacity
      style={styles.botaoAcao}
      onPress={onPress}
    >
      <Ionicons
        name={icone}
        size={18}
        color={destrutiva ? '#b42318' : VINHO}
      />

      <Text
        style={[
          styles.textoAcao,
          destrutiva && { color: '#b42318' },
        ]}
      >
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

function Campo({
  rotulo,
  valor,
  onChangeText,
  placeholder,
  multiline = false,
  alto = false,
  teclado = 'default',
  compacto = false,
}) {
  return (
    <View
      style={[
        styles.campo,
        compacto && { marginBottom: 10 },
      ]}
    >
      <Text style={styles.rotuloCampo}>{rotulo}</Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          alto && styles.inputAlto,
        ]}
        value={valor}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a89b8c"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={teclado}
      />
    </View>
  );
}

// =========================================================
// ESTILOS
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  cabecalho: {
    backgroundColor: VINHO,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 54,
    gap: 12,
  },

  botaoVoltar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloCabecalho: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },

  subtituloCabecalho: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },

  abas: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },

  aba: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3ddd2',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  abaAtiva: {
    backgroundColor: VINHO,
    borderColor: VINHO,
  },

  textoAba: {
    color: VINHO,
    fontSize: 13,
    fontWeight: '700',
  },

  textoAbaAtiva: {
    color: '#fff',
  },

  conteudo: {
    padding: 16,
    paddingBottom: 36,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },

  botaoAdicionar: {
    backgroundColor: VINHO,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  botaoAdicionarTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  bloco: {
    marginBottom: 14,
  },

  tituloSecao: {
    color: '#2b2320',
    fontSize: 18,
    fontWeight: '700',
  },

  descricaoSecao: {
    color: '#8a7d6f',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 14,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  icone: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nome: {
    color: '#2b2320',
    fontSize: 14,
    fontWeight: '700',
  },

  categoria: {
    color: '#8a7d6f',
    fontSize: 12,
    marginTop: 3,
  },

  etiquetaStatus: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusAtivo: {
    backgroundColor: '#e6f4ea',
  },

  statusInativo: {
    backgroundColor: '#fce8e6',
  },

  etiquetaStatusTexto: {
    fontSize: 10,
    fontWeight: '700',
  },

  statusAtivoTexto: {
    color: '#137333',
  },

  statusInativoTexto: {
    color: '#b42318',
  },

  descricaoCard: {
    color: '#6b625b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },

  acoesCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee8df',
  },

  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },

  textoAcao: {
    color: VINHO,
    fontSize: 12,
    fontWeight: '600',
  },

  vazio: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 26,
    alignItems: 'center',
    marginTop: 8,
  },

  vazioTitulo: {
    color: '#2b2320',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },

  vazioTexto: {
    color: '#8a7d6f',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },

  campo: {
    marginBottom: 15,
  },

  rotuloCampo: {
    color: '#2b2320',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2b2320',
  },

  inputMultiline: {
    minHeight: 85,
  },

  inputAlto: {
    minHeight: 220,
  },

  opcoesStatus: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  opcaoStatus: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  opcaoStatusSelecionada: {
    backgroundColor: '#F3ECE2',
    borderColor: VINHO,
  },

  opcaoStatusTexto: {
    color: '#6b625b',
    fontWeight: '600',
  },

  opcaoStatusTextoSelecionada: {
    color: VINHO,
    fontWeight: '700',
  },

  botaoSalvar: {
    backgroundColor: VINHO,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  botaoSalvarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  botaoCancelar: {
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },

  botaoCancelarTexto: {
    color: '#6b625b',
    fontSize: 14,
    fontWeight: '600',
  },

  blocoEtapasTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
  },

  botaoAdicionarEtapa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: VINHO,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 9,
  },

  cardEtapa: {
    backgroundColor: '#f4eee7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3ddd2',
  },

  linhaEtapa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tituloEtapa: {
    color: VINHO,
    fontSize: 14,
    fontWeight: '700',
  },

  acoesEtapa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  iconeAcao: {
    padding: 3,
  },
    modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCartao: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },

  modalTitulo: {
    color: '#2b2320',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  modalDescricao: {
    color: '#6b625b',
    fontSize: 14,
    marginBottom: 14,
  },

  modalOpcao: {
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  modalOpcaoTexto: {
    color: VINHO,
    fontSize: 14,
    fontWeight: '700',
  },

  modalCancelar: {
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
  },

  modalCancelarTexto: {
    color: '#6b625b',
    fontWeight: '600',
  },
});