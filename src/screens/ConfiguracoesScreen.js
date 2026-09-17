import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, Switch, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AVATARES } from '../data/avatares';
import { CATEGORIAS_TEMAS, encontrarTema, temasDaCategoria } from '../data/temas';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();
  const {
    usuario, salvarUsuario, preferencias, salvarPreferencias,
    temaVisual, selecionarTemaVisual, limparDadosLocais, dados, temaCores,
  } = useApp();

  const modoEscuroAtivo = preferencias.tema === 'escuro';
  const temaSelecionado = encontrarTema(temaVisual);

  // Acordeão das categorias de tema — a categoria do tema atualmente
  // selecionado começa aberta; as demais começam fechadas.
  const [categoriaTemaAberta, setCategoriaTemaAberta] = useState(temaSelecionado.categoria);

  function alternarCategoriaTema(categoria) {
    setCategoriaTemaAberta(prev => (prev === categoria ? null : categoria));
  }

  const [nomeCompleto, setNomeCompleto] = useState(usuario?.nomeCompleto || '');
  const [apelido, setApelido] = useState(usuario?.apelido || '');
  const [avatarSelecionado, setAvatarSelecionado] = useState(usuario?.avatar || AVATARES[0].id);

  async function salvarPerfil() {
    await salvarUsuario({ nomeCompleto: nomeCompleto.trim(), apelido: apelido.trim(), avatar: avatarSelecionado });
    Alert.alert('Perfil atualizado', 'Suas informações foram salvas.');
  }

  async function escolherAvatar(id) {
    setAvatarSelecionado(id);
    await salvarUsuario({ nomeCompleto, apelido, avatar: id });
  }

  async function alternarReduzirAnimacoes(valor) {
    await salvarPreferencias({ ...preferencias, reduzirAnimacoes: valor });
  }

  function confirmarLimpezaDados() {
    Alert.alert(
      'Limpar dados locais',
      'Isso vai apagar seu nome, avatar e preferências salvas neste aparelho. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: limparDadosLocais },
      ]
    );
  }

  const config = dados.config || {};

  return (
    <View style={[styles.container, { backgroundColor: temaCores.corBackground }]}>
      <View style={[styles.cabecalho, { backgroundColor: temaCores.corCabecalho }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cabecalhoTitulo}>Configurações</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ---- PERFIL ---- */}
        <View style={[styles.grupo, { backgroundColor: temaCores.corCard }]}>
          <Text style={[styles.grupoTitulo, { color: temaCores.corTexto }]}>Seu perfil</Text>
          <Text style={[styles.rotulo, { color: temaCores.corTextoSecundario }]}>Nome completo</Text>
          <TextInput style={[styles.input, { color: temaCores.corTexto }]} value={nomeCompleto} onChangeText={setNomeCompleto} autoCapitalize="words" />
          <Text style={[styles.rotulo, { color: temaCores.corTextoSecundario }]}>Nome de preferência</Text>
          <TextInput style={[styles.input, { color: temaCores.corTexto }]} value={apelido} onChangeText={setApelido} autoCapitalize="words" />
          <TouchableOpacity style={[styles.botaoPrimario, { backgroundColor: temaCores.corBotoes }]} onPress={salvarPerfil}>
            <Text style={styles.botaoPrimarioTexto}>Salvar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* ---- AVATAR ---- */}
        <View style={[styles.grupo, { backgroundColor: temaCores.corCard }]}>
          <Text style={[styles.grupoTitulo, { color: temaCores.corTexto }]}>Seu avatar</Text>
          <Text style={[styles.subtexto, { color: temaCores.corTextoSecundario }]}>Toque em uma imagem para trocar seu avatar — a troca é salva na hora.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {AVATARES.map(av => (
              <TouchableOpacity
                key={av.id}
                onPress={() => escolherAvatar(av.id)}
                style={[styles.avatarBtn, avatarSelecionado === av.id && { borderColor: temaCores.corBotoes }]}
              >
                <Image source={av.imagem} style={styles.avatarImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ---- TEMA VISUAL ---- */}
        <View style={[styles.grupo, { backgroundColor: temaCores.corCard }]}>
          <Text style={[styles.grupoTitulo, { color: temaCores.corTexto }]}>Tema visual</Text>
          <Text style={[styles.subtexto, { color: temaCores.corTextoSecundario }]}>
            Toque em um tema para selecioná-lo. Toque de novo no mesmo tema para
            alternar entre o modo claro e o modo escuro dele.
          </Text>

          {CATEGORIAS_TEMAS.map(categoria => {
            const temas = temasDaCategoria(categoria.id);
            const aberta = !categoria.colapsavel || categoriaTemaAberta === categoria.id;
            return (
              <View key={categoria.id} style={styles.temaCategoria}>
                <TouchableOpacity
                  style={[styles.temaCategoriaCabecalho, { backgroundColor: temaCores.corFundoSuave }]}
                  activeOpacity={categoria.colapsavel ? 0.6 : 1}
                  onPress={() => categoria.colapsavel && alternarCategoriaTema(categoria.id)}
                >
                  <Text style={[styles.temaCategoriaTitulo, { color: temaCores.corTexto }]}>
                    {categoria.icone}  {categoria.nome}
                  </Text>
                  {categoria.colapsavel && (
                    <Ionicons name={aberta ? 'chevron-up' : 'chevron-down'} size={18} color={temaCores.corTextoSecundario} />
                  )}
                </TouchableOpacity>

                {aberta && (
                  <View style={styles.temaGrade}>
                    {temas.map(tema => {
                      const selecionado = temaVisual === tema.id;
                      const escuroDesteTema = selecionado && modoEscuroAtivo;
                      const cores = escuroDesteTema ? tema.escuro : tema.claro;
                      const paletaBase = tema.claro;
                      return (
                        <TouchableOpacity
                          key={tema.id}
                          style={[
                            styles.temaCard,
                            {
                              backgroundColor: temaCores.corCard,
                              borderColor: selecionado ? cores.corDestaque : '#e3ddd2',
                              borderWidth: selecionado ? 2 : 1,
                            },
                          ]}
                          onPress={() => selecionarTemaVisual(tema.id)}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.temaCardNome, { color: temaCores.corTexto }]} numberOfLines={2}>
                            {tema.icone ? `${tema.icone} ` : ''}{tema.nome}
                          </Text>

                          {selecionado ? (
                            <>
                              {!!tema.frase && (
                                <Text style={[styles.temaCardFrase, { color: temaCores.corTextoSecundario }]}>
                                  “{tema.frase}”
                                </Text>
                              )}
                              <View style={styles.temaCardStatusLinha}>
                                <Ionicons name="checkmark-circle" size={14} color="#2E7D46" />
                                <Text style={styles.temaCardStatusTexto}>Tema ativo</Text>
                              </View>
                              <Text style={[styles.temaCardModo, { color: cores.corCabecalho }]}>
                                {escuroDesteTema ? '🌙 ESCURO' : '☀️ CLARO'}
                              </Text>
                            </>
                          ) : (
                            <View style={styles.temaCardPaleta}>
                              <View style={[styles.temaCardBarra, styles.temaCardBarraGrossa, { backgroundColor: paletaBase.corCabecalho }]} />
                              <View style={[styles.temaCardBarra, { backgroundColor: paletaBase.corFundoSuave }]} />
                              <View style={[styles.temaCardBarra, { backgroundColor: paletaBase.corBackground }]} />
                              <View style={[styles.temaCardBarra, styles.temaCardBarraGrossa, { backgroundColor: paletaBase.corBotoesHover }]} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ---- ACESSIBILIDADE ---- */}
        <View style={[styles.grupo, { backgroundColor: temaCores.corCard }]}>
          <Text style={[styles.grupoTitulo, { color: temaCores.corTexto }]}>Acessibilidade</Text>
          <View style={styles.linhaSwitch}>
            <Text style={[styles.rotuloSwitch, { color: temaCores.corTexto }]}>Reduzir animações</Text>
            <Switch
              value={preferencias.reduzirAnimacoes}
              onValueChange={alternarReduzirAnimacoes}
              trackColor={{ true: temaCores.corBotoes }}
            />
          </View>
        </View>

        {/* ---- DADOS LOCAIS ---- */}
        <View style={[styles.grupo, { backgroundColor: temaCores.corCard }]}>
          <Text style={[styles.grupoTitulo, { color: temaCores.corTexto }]}>Dados salvos neste dispositivo</Text>
          <Text style={[styles.subtexto, { color: temaCores.corTextoSecundario }]}>
            Este app guarda neste aparelho apenas o seu nome, avatar e preferências. Horários, avisos e
            eventos vêm sempre da planilha da paróquia.
          </Text>
          <TouchableOpacity style={styles.botaoPerigo} onPress={confirmarLimpezaDados}>
            <Text style={styles.botaoPerigoTexto}>Limpar dados locais</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: 16, marginTop: 10 }}
          onPress={() => navigation.navigate('AdminLogin')}
        >
          <Text style={{ color: temaCores.corTextoSecundario, fontSize: 13, fontWeight: '600' }}>
            Acesso do Coordenador
          </Text>
        </TouchableOpacity>

        {/* ---- SOBRE ---- */}
        <View style={[styles.grupo, { backgroundColor: temaCores.corCard, alignItems: 'center' }]}>
          <Text style={[styles.grupoTitulo, { color: temaCores.corTexto }]}>Sobre</Text>
          <Text style={[styles.sobreTexto, { color: temaCores.corTexto }]}>{config.nomeParoquia || 'Paróquia Nossa Senhora do Rosário'}</Text>
          {!!config.endereco && <Text style={[styles.sobreMeta, { color: temaCores.corTextoSecundario }]}>{config.endereco}</Text>}
          {!!config.telefone && <Text style={[styles.sobreMeta, { color: temaCores.corTextoSecundario }]}>{config.telefone}</Text>}
          {!!config.email && <Text style={[styles.sobreMeta, { color: temaCores.corTextoSecundario }]}>{config.email}</Text>}
          <Text style={[styles.sobreVersao, { color: temaCores.corTextoSecundario }]}>Versão 1.0.0 (React Native)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  cabecalho: {
    backgroundColor: '#7A1F2B', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, paddingTop: 54,
  },
  botaoVoltar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  cabecalhoTitulo: { color: '#fff', fontWeight: '700', fontSize: 17 },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },
  grupo: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 1,
  },
  grupoTitulo: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 10 },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', marginBottom: 5, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10,
    padding: 11, fontSize: 14, color: '#2b2320', backgroundColor: '#FAF7F2',
  },
  subtexto: { fontSize: 12, color: '#8a7d6f', lineHeight: 18 },
  botaoPrimario: { backgroundColor: '#7A1F2B', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 14 },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  avatarBtn: { width: 58, height: 58, borderRadius: 29, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 29 },
  temaCategoria: { marginTop: 14 },
  temaCategoriaCabecalho: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10,
  },
  temaCategoriaTitulo: { fontSize: 14, fontWeight: '700' },
  temaGrade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  temaCard: { width: '47%', borderRadius: 14, padding: 12, minHeight: 92 },
  temaCardNome: { fontSize: 13, fontWeight: '700', marginBottom: 8, lineHeight: 17 },
  temaCardFrase: { fontSize: 11, fontStyle: 'italic', lineHeight: 15, marginBottom: 8 },
  temaCardStatusLinha: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  temaCardStatusTexto: { fontSize: 11, fontWeight: '700', color: '#2E7D46' },
  temaCardModo: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  temaCardPaleta: { gap: 4, marginTop: 4 },
  temaCardBarra: { height: 5, borderRadius: 3, width: '100%' },
  temaCardBarraGrossa: { height: 7 },
  linhaSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rotuloSwitch: { fontSize: 14, color: '#2b2320', fontWeight: '600' },
  botaoPerigo: {
    borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: '#B23A2E',
  },
  botaoPerigoTexto: { color: '#B23A2E', fontWeight: '700', fontSize: 14 },
  sobreTexto: { fontSize: 14, fontWeight: '700', color: '#2b2320', marginTop: 4 },
  sobreMeta: { fontSize: 12, color: '#8a7d6f', marginTop: 3 },
  sobreVersao: { fontSize: 11, color: '#a89b8c', marginTop: 10 },
});
