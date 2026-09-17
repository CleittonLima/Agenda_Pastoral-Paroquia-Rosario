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
    temaVisual, selecionarTemaVisual, limparDadosLocais, dados,
  } = useApp();

  const modoEscuroAtivo = preferencias.tema === 'escuro';
  const temaSelecionado = encontrarTema(temaVisual);
  const coresTemaAtivo = modoEscuroAtivo ? temaSelecionado.escuro : temaSelecionado.claro;

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
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cabecalhoTitulo}>Configurações</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ---- PERFIL ---- */}
        <View style={styles.grupo}>
          <Text style={styles.grupoTitulo}>Seu perfil</Text>
          <Text style={styles.rotulo}>Nome completo</Text>
          <TextInput style={styles.input} value={nomeCompleto} onChangeText={setNomeCompleto} autoCapitalize="words" />
          <Text style={styles.rotulo}>Nome de preferência</Text>
          <TextInput style={styles.input} value={apelido} onChangeText={setApelido} autoCapitalize="words" />
          <TouchableOpacity style={styles.botaoPrimario} onPress={salvarPerfil}>
            <Text style={styles.botaoPrimarioTexto}>Salvar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* ---- AVATAR ---- */}
        <View style={styles.grupo}>
          <Text style={styles.grupoTitulo}>Seu avatar</Text>
          <Text style={styles.subtexto}>Toque em uma imagem para trocar seu avatar — a troca é salva na hora.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {AVATARES.map(av => (
              <TouchableOpacity
                key={av.id}
                onPress={() => escolherAvatar(av.id)}
                style={[styles.avatarBtn, avatarSelecionado === av.id && styles.avatarBtnAtivo]}
              >
                <Image source={av.imagem} style={styles.avatarImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ---- TEMA VISUAL ---- */}
        <View style={styles.grupo}>
          <Text style={styles.grupoTitulo}>Tema visual</Text>
          <Text style={styles.subtexto}>
            Toque em um tema para selecioná-lo. Toque de novo no mesmo tema para
            alternar entre o modo claro e o modo escuro dele.
          </Text>

          {CATEGORIAS_TEMAS.map(categoria => {
            const temas = temasDaCategoria(categoria.id);
            const aberta = !categoria.colapsavel || categoriaTemaAberta === categoria.id;
            return (
              <View key={categoria.id} style={styles.temaCategoria}>
                <TouchableOpacity
                  style={styles.temaCategoriaCabecalho}
                  activeOpacity={categoria.colapsavel ? 0.6 : 1}
                  onPress={() => categoria.colapsavel && alternarCategoriaTema(categoria.id)}
                >
                  <Text style={styles.temaCategoriaTitulo}>
                    {categoria.icone} {categoria.nome}
                  </Text>
                  {categoria.colapsavel && (
                    <Ionicons name={aberta ? 'chevron-up' : 'chevron-down'} size={16} color="#8a7d6f" />
                  )}
                </TouchableOpacity>

                {aberta && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {temas.map(tema => {
                      const selecionado = temaVisual === tema.id;
                      const escuroDesteTema = selecionado && modoEscuroAtivo;
                      const cores = escuroDesteTema ? tema.escuro : tema.claro;
                      return (
                        <TouchableOpacity
                          key={tema.id}
                          style={styles.temaItem}
                          onPress={() => selecionarTemaVisual(tema.id)}
                        >
                          <View
                            style={[
                              styles.temaSwatch,
                              {
                                backgroundColor: cores.corCabecalho,
                                borderColor: selecionado ? cores.corDestaque : 'transparent',
                              },
                            ]}
                          >
                            {selecionado && <Ionicons name="checkmark" size={18} color="#fff" />}
                          </View>
                          <Text style={styles.temaNome} numberOfLines={2}>{tema.nome}</Text>
                          {selecionado && (
                            <Text style={[styles.temaModo, { color: cores.corCabecalho }]}>
                              {escuroDesteTema ? 'ESCURO' : 'CLARO'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            );
          })}

          {!!temaSelecionado?.frase && (
            <View style={[styles.fraseBox, { borderLeftColor: coresTemaAtivo.corDestaque }]}>
              <Text style={styles.fraseTexto}>“{temaSelecionado.frase}”</Text>
            </View>
          )}
        </View>

        {/* ---- ACESSIBILIDADE ---- */}
        <View style={styles.grupo}>
          <Text style={styles.grupoTitulo}>Acessibilidade</Text>
          <View style={styles.linhaSwitch}>
            <Text style={styles.rotuloSwitch}>Reduzir animações</Text>
            <Switch
              value={preferencias.reduzirAnimacoes}
              onValueChange={alternarReduzirAnimacoes}
              trackColor={{ true: '#7A1F2B' }}
            />
          </View>
        </View>

        {/* ---- DADOS LOCAIS ---- */}
        <View style={styles.grupo}>
          <Text style={styles.grupoTitulo}>Dados salvos neste dispositivo</Text>
          <Text style={styles.subtexto}>
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
  <Text style={{ color: '#8a7d6f', fontSize: 13, fontWeight: '600' }}>
    Acesso do Coordenador
  </Text>
</TouchableOpacity>

        {/* ---- SOBRE ---- */}
        <View style={[styles.grupo, { alignItems: 'center' }]}>
          <Text style={styles.grupoTitulo}>Sobre</Text>
          <Text style={styles.sobreTexto}>{config.nomeParoquia || 'Paróquia Nossa Senhora do Rosário'}</Text>
          {!!config.endereco && <Text style={styles.sobreMeta}>{config.endereco}</Text>}
          {!!config.telefone && <Text style={styles.sobreMeta}>{config.telefone}</Text>}
          {!!config.email && <Text style={styles.sobreMeta}>{config.email}</Text>}
          <Text style={styles.sobreVersao}>Versão 1.0.0 (React Native)</Text>
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
  avatarBtnAtivo: { borderColor: '#7A1F2B' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 29 },
  temaCategoria: { marginTop: 14 },
  temaCategoriaCabecalho: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  temaCategoriaTitulo: { fontSize: 13, fontWeight: '700', color: '#5a5048' },
  temaItem: { width: 76, alignItems: 'center', marginRight: 12 },
  temaSwatch: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  temaNome: { fontSize: 11, color: '#5a5048', textAlign: 'center', marginTop: 6, lineHeight: 14 },
  temaModo: { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  fraseBox: {
    marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#FAF7F2',
    borderLeftWidth: 3,
  },
  fraseTexto: { fontSize: 13, fontStyle: 'italic', color: '#2b2320', lineHeight: 19 },
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
