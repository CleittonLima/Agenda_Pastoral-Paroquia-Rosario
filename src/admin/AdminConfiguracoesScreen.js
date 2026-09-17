import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdmin } from './AdminContext';
import { salvarConfiguracoes, trocarSenha, enviarImagem } from '../api/api';
import AdminHeader from './components/AdminHeader';
import ConfirmModal from './components/ConfirmModal';

export default function AdminConfiguracoesScreen() {
  const { dados, senha, recarregar, sair } = useAdmin();
  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [enviandoInicial, setEnviandoInicial] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [trocando, setTrocando] = useState(false);
  const [confirmandoSair, setConfirmandoSair] = useState(false);

  useEffect(() => { setForm(dados.config || {}); }, [dados.config]);

  function mudar(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  async function escolherImagem(campo, setEnviando) {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (resultado.canceled) return;

    const foto = resultado.assets[0];
    setEnviando(true);
    try {
      const resposta = await enviarImagem(senha, foto.uri, foto.fileName, foto.mimeType);
      if (resposta.ok) {
        const atualizado = { ...form, [campo]: resposta.url };
        setForm(atualizado);
        await salvarConfiguracoes(senha, { ...dados.config, ...atualizado });
        await recarregar();
        Alert.alert('Pronto', 'Imagem enviada e salva!');
      } else {
        Alert.alert('Erro', resposta.erro || 'Não foi possível enviar a imagem.');
      }
    } finally {
      setEnviando(false);
    }
  }

  async function salvar() {
    setSalvando(true);
    const resultado = await salvarConfiguracoes(senha, { ...dados.config, ...form });
    setSalvando(false);
    if (resultado.ok) {
      await recarregar();
      Alert.alert('Salvo', 'Configurações atualizadas.');
    } else {
      Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
    }
  }

  async function alterarSenha() {
    if (senhaNova.length < 4) {
      Alert.alert('Atenção', 'A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    setTrocando(true);
    const resultado = await trocarSenha(senhaAtual, senhaNova);
    setTrocando(false);
    if (resultado.ok) {
      setSenhaAtual('');
      setSenhaNova('');
      Alert.alert('Pronto', 'Senha alterada com sucesso. Use a nova senha no próximo acesso.');
    } else {
      Alert.alert('Erro', resultado.erro || 'Não foi possível trocar a senha.');
    }
  }

  function confirmarSair() {
    setConfirmandoSair(true);
  }

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Configurações Gerais" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grupo}>
          <Text style={styles.rotulo}>Nome da paróquia</Text>
          <TextInput style={styles.input} value={form.NomeParoquia || ''} onChangeText={(v) => mudar('NomeParoquia', v)} />
        </View>

        <ImagemComUpload
          rotulo="Logo principal"
          valor={form.LogoPrincipal}
          enviando={enviandoLogo}
          onEscolher={() => escolherImagem('LogoPrincipal', setEnviandoLogo)}
        />
        <ImagemComUpload
          rotulo="Imagem da tela inicial"
          valor={form.ImagemTelaInicial}
          enviando={enviandoInicial}
          onEscolher={() => escolherImagem('ImagemTelaInicial', setEnviandoInicial)}
        />

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>Frase do rodapé / versículo</Text>
          <TextInput style={styles.input} value={form.FraseRodape || ''} onChangeText={(v) => mudar('FraseRodape', v)} />
        </View>
        <View style={styles.grupo}>
          <Text style={styles.rotulo}>Telefone</Text>
          <TextInput style={styles.input} value={form.Telefone || ''} onChangeText={(v) => mudar('Telefone', v)} />
        </View>
        <View style={styles.grupo}>
          <Text style={styles.rotulo}>E-mail</Text>
          <TextInput style={styles.input} value={form.Email || ''} onChangeText={(v) => mudar('Email', v)} autoCapitalize="none" />
        </View>
        <View style={styles.grupo}>
          <Text style={styles.rotulo}>Endereço</Text>
          <TextInput style={styles.input} value={form.Endereco || ''} onChangeText={(v) => mudar('Endereco', v)} />
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} disabled={salvando}>
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoSalvarTexto}>Salvar</Text>}
        </TouchableOpacity>

        {/* ---- TROCAR SENHA ---- */}
        <View style={styles.secaoSenha}>
          <Text style={styles.secaoTitulo}>Trocar senha do painel</Text>
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>Senha atual</Text>
            <TextInput style={styles.input} value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry />
          </View>
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>Nova senha</Text>
            <TextInput style={styles.input} value={senhaNova} onChangeText={setSenhaNova} secureTextEntry />
          </View>
          <TouchableOpacity style={styles.botaoSecundario} onPress={alterarSenha} disabled={trocando}>
            {trocando ? <ActivityIndicator color="#7A1F2B" /> : <Text style={styles.botaoSecundarioTexto}>Trocar senha</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botaoSair} onPress={confirmarSair}>
          <Text style={styles.botaoSairTexto}>🚪 Sair do painel</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visivel={confirmandoSair}
        titulo="Sair do painel"
        mensagem="Deseja mesmo sair do painel administrativo?"
        textoConfirmar="Sair"
        onConfirmar={() => { setConfirmandoSair(false); sair(); }}
        onCancelar={() => setConfirmandoSair(false)}
      />
    </View>
  );
}

function ImagemComUpload({ rotulo, valor, enviando, onEscolher }) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.imagemLinha}>
        <View style={styles.previewCaixa}>
          {enviando ? <ActivityIndicator color="#7A1F2B" /> : valor ? (
            <Image source={{ uri: valor }} style={styles.preview} />
          ) : <Text style={{ fontSize: 22 }}>🖼️</Text>}
        </View>
        <TouchableOpacity style={styles.botaoEscolher} onPress={onEscolher} disabled={enviando}>
          <Text style={styles.botaoEscolherTexto}>{valor ? 'Trocar imagem' : 'Escolher imagem'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  grupo: { marginBottom: 14 },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10, padding: 11, fontSize: 14, color: '#2b2320', backgroundColor: '#fff' },
  imagemLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewCaixa: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e3ddd2' },
  preview: { width: '100%', height: '100%' },
  botaoEscolher: { borderWidth: 1, borderColor: '#7A1F2B', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  botaoEscolherTexto: { color: '#7A1F2B', fontWeight: '700', fontSize: 13 },
  botaoSalvar: { backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secaoSenha: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 26 },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: '#2b2320', marginBottom: 12 },
  botaoSecundario: { borderWidth: 1, borderColor: '#7A1F2B', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  botaoSecundarioTexto: { color: '#7A1F2B', fontWeight: '700', fontSize: 14 },
  botaoSair: { alignItems: 'center', paddingVertical: 16, marginTop: 20 },
  botaoSairTexto: { color: '#B23A2E', fontWeight: '700', fontSize: 14 },
});
