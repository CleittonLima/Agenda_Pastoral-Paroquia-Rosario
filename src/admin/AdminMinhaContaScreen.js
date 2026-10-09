import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAdmin } from './AdminContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase/config';

export default function AdminMinhaContaScreen() {
    const navigation = useNavigation();
  const {
    usuario,
    nomeUsuario,
    cargo,
  } = useAdmin();

  const { mostrarToast } = useApp();

  const [nome, setNome] = useState(nomeUsuario || '');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [salvandoNome, setSalvandoNome] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  // ==========================================================
  // ALTERAR NOME
  // ==========================================================

  async function salvarNome() {
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      mostrarToast('Informe seu nome.', 'aviso');
      return;
    }

    if (!usuario?.id) {
      mostrarToast(
        'Não foi possível identificar sua conta.',
        'erro'
      );
      return;
    }

    setSalvandoNome(true);

    try {
      const { error } = await supabase
        .from('perfis_admin')
        .update({
          nome: nomeLimpo,
        })
        .eq('id', usuario.id);

      if (error) {
        throw error;
      }

      mostrarToast('Nome atualizado com sucesso!');
    } catch (erro) {
      console.error('Erro ao atualizar nome:', erro);

      mostrarToast(
        erro.message || 'Não foi possível atualizar seu nome.',
        'erro'
      );
    } finally {
      setSalvandoNome(false);
    }
  }

  // ==========================================================
  // ALTERAR A PRÓPRIA SENHA
  // ==========================================================

  async function alterarSenha() {
    if (!senhaAtual) {
      mostrarToast('Informe sua senha atual.', 'aviso');
      return;
    }

    if (senhaNova.length < 6) {
      mostrarToast(
        'A nova senha deve ter pelo menos 6 caracteres.',
        'aviso'
      );
      return;
    }

    if (senhaNova !== confirmarSenha) {
      mostrarToast(
        'A confirmação da nova senha não corresponde.',
        'aviso'
      );
      return;
    }

    if (!usuario?.email) {
      mostrarToast(
        'Não foi possível identificar seu e-mail.',
        'erro'
      );
      return;
    }

    setAlterandoSenha(true);

    try {
      // Confirma a senha atual do próprio usuário.
      const { error: erroAutenticacao } =
        await supabase.auth.signInWithPassword({
          email: usuario.email,
          password: senhaAtual,
        });

      if (erroAutenticacao) {
        mostrarToast(
          'A senha atual está incorreta.',
          'aviso'
        );
        return;
      }

      // Atualiza a senha da conta autenticada.
      const { error } = await supabase.auth.updateUser({
        password: senhaNova,
      });

      if (error) {
        throw error;
      }

      setSenhaAtual('');
      setSenhaNova('');
      setConfirmarSenha('');

      mostrarToast('Senha alterada com sucesso!');
    } catch (erro) {
      console.error('Erro ao alterar senha:', erro);

      mostrarToast(
        erro.message || 'Não foi possível alterar sua senha.',
        'erro'
      );
    } finally {
      setAlterandoSenha(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
<View style={styles.cabecalho}>
  <TouchableOpacity
    style={styles.botaoVoltar}
    onPress={() => navigation.goBack()}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel="Voltar ao painel administrativo"
  >
    <Ionicons
      name="arrow-back"
      size={24}
      color="#fff"
    />
  </TouchableOpacity>

  <View style={styles.iconeCabecalho}>
    <Ionicons
      name="person-circle-outline"
      size={30}
      color="#fff"
    />
  </View>

  <View style={styles.textosCabecalho}>
    <Text style={styles.tituloCabecalho}>
      Minha Conta
    </Text>

    <Text style={styles.subtituloCabecalho}>
      Gerencie seus dados de acesso
    </Text>
  </View>
</View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* DADOS DA CONTA */}
        <View style={styles.cartao}>
          <View style={styles.secaoCabecalho}>
            <Ionicons
              name="person-outline"
              size={21}
              color="#7A1F2B"
            />

            <Text style={styles.tituloSecao}>
              Dados da conta
            </Text>
          </View>

          <Text style={styles.rotulo}>
            Nome
          </Text>

          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            maxLength={100}
            autoCapitalize="words"
            editable={!salvandoNome}
          />

          <Text style={styles.rotulo}>
            E-mail
          </Text>

          <View style={styles.campoSomenteLeitura}>
            <Text style={styles.textoSomenteLeitura}>
              {usuario?.email || 'E-mail não disponível'}
            </Text>

            <Ionicons
              name="lock-closed-outline"
              size={17}
              color="#9a8d80"
            />
          </View>

          <Text style={styles.rotulo}>
            Cargo
          </Text>

          <View style={styles.campoSomenteLeitura}>
            <Text style={styles.textoSomenteLeitura}>
              {cargo || 'Não informado'}
            </Text>

            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#9a8d80"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.botaoPrincipal,
              salvandoNome && styles.botaoDesabilitado,
            ]}
            onPress={salvarNome}
            disabled={salvandoNome}
            activeOpacity={0.8}
          >
            {salvandoNome ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotaoPrincipal}>
                Salvar nome
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ALTERAR SENHA */}
        <View style={styles.cartao}>
          <View style={styles.secaoCabecalho}>
            <Ionicons
              name="lock-closed-outline"
              size={21}
              color="#7A1F2B"
            />

            <Text style={styles.tituloSecao}>
              Alterar senha
            </Text>
          </View>

          <Text style={styles.descricao}>
            Para sua segurança, informe a senha atual antes
            de cadastrar uma nova.
          </Text>

          <Text style={styles.rotulo}>
            Senha atual
          </Text>

          <TextInput
            style={styles.input}
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholder="Digite sua senha atual"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!alterandoSenha}
          />

          <Text style={styles.rotulo}>
            Nova senha
          </Text>

          <TextInput
            style={styles.input}
            value={senhaNova}
            onChangeText={setSenhaNova}
            placeholder="Mínimo de 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!alterandoSenha}
          />

          <Text style={styles.rotulo}>
            Confirmar nova senha
          </Text>

          <TextInput
            style={styles.input}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Digite a nova senha novamente"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!alterandoSenha}
          />

          <TouchableOpacity
            style={[
              styles.botaoPrincipal,
              alterandoSenha && styles.botaoDesabilitado,
            ]}
            onPress={alterarSenha}
            disabled={alterandoSenha}
            activeOpacity={0.8}
          >
            {alterandoSenha ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotaoPrincipal}>
                Alterar minha senha
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AVISO DE SEGURANÇA */}
        <View style={styles.aviso}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#7A1F2B"
          />

          <Text style={styles.textoAviso}>
            Esta área permite alterar somente os dados da sua
            própria conta. As permissões administrativas
            continuam sendo controladas pelo sistema.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  cabecalho: {
    backgroundColor: '#7A1F2B',
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

    botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    },

  iconeCabecalho: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textosCabecalho: {
    flex: 1,
  },

  tituloCabecalho: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  subtituloCabecalho: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 3,
  },

  scroll: {
    padding: 16,
    paddingBottom: 36,
  },

  cartao: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee6dc',
  },

  secaoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 18,
  },

  tituloSecao: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b2320',
  },

  descricao: {
    fontSize: 13,
    lineHeight: 19,
    color: '#8a7d6f',
    marginBottom: 16,
  },

  rotulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a5048',
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2b2320',
    backgroundColor: '#fff',
  },

  campoSomenteLeitura: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#eee6dc',
    borderRadius: 10,
    backgroundColor: '#F8F5F0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  textoSomenteLeitura: {
    flex: 1,
    fontSize: 14,
    color: '#766b60',
  },

  botaoPrincipal: {
    backgroundColor: '#7A1F2B',
    borderRadius: 10,
    minHeight: 46,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  textoBotaoPrincipal: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    backgroundColor: '#F3ECE2',
    borderRadius: 12,
  },

  textoAviso: {
    flex: 1,
    color: '#5a5048',
    fontSize: 12,
    lineHeight: 18,
  },
});