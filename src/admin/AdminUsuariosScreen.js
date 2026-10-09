import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAdmin } from './AdminContext';
import { gerenciarUsuarios } from '../api/api';

const CARGOS = [
  { label: 'Padre', value: 'PADRE' },
  { label: 'PASCOM', value: 'PASCOM' },
  { label: 'Coordenador', value: 'COORDENADOR' },
  { label: 'Programador', value: 'PROGRAMADOR' },
];

export default function AdminUsuariosScreen() {
  const navigation = useNavigation();
  const { perfil } = useAdmin();

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [modo, setModo] = useState('criar');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('PASCOM');

  const [modalSenhaVisivel, setModalSenhaVisivel] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [usuarioSenha, setUsuarioSenha] = useState(null);

  const ehProgramador = perfil?.cargo === 'PROGRAMADOR';

  const mostrarMensagem = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(`${titulo}\n\n${mensagem}`);
      }
      return;
    }

    Alert.alert(titulo, mensagem);
  };

  const confirmar = (titulo, mensagem, acao) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${titulo}\n\n${mensagem}`)) {
        acao();
      }
      return;
    }

    Alert.alert(titulo, mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: acao,
      },
    ]);
  };

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);

    try {
      const resultado = await gerenciarUsuarios('listar');

      if (!resultado.ok) {
        mostrarMensagem(
          'Não foi possível carregar',
          resultado.erro || 'Tente novamente.'
        );
        return;
      }

      setUsuarios(resultado.usuarios || []);
    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);

      mostrarMensagem(
        'Erro',
        'Não foi possível carregar os usuários.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!ehProgramador) {
      setCarregando(false);
      return;
    }

    carregarUsuarios();
  }, [ehProgramador, carregarUsuarios]);

  function abrirCadastro() {
    setModo('criar');
    setUsuarioSelecionado(null);

    setNome('');
    setEmail('');
    setSenha('');
    setCargo('PASCOM');

    setModalVisivel(true);
  }

  function abrirEdicao(usuario) {
    setModo('editar');
    setUsuarioSelecionado(usuario);

    setNome(usuario.nome || '');
    setEmail(usuario.email || '');
    setSenha('');
    setCargo(usuario.cargo || 'PASCOM');

    setModalVisivel(true);
  }

  async function salvarUsuario() {
    if (!nome.trim()) {
      mostrarMensagem('Atenção', 'Informe o nome do usuário.');
      return;
    }

    if (modo === 'criar' && !email.trim()) {
      mostrarMensagem('Atenção', 'Informe o e-mail.');
      return;
    }

    if (modo === 'criar' && senha.length < 8) {
      mostrarMensagem(
        'Atenção',
        'A senha inicial precisa ter pelo menos 8 caracteres.'
      );
      return;
    }

    setProcessando(true);

    try {
      let resultado;

      if (modo === 'criar') {
        resultado = await gerenciarUsuarios('criar', {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          cargo,
        });
      } else {
        resultado = await gerenciarUsuarios('atualizar', {
          id: usuarioSelecionado.id,
          nome: nome.trim(),
          cargo,
        });
      }

      if (!resultado.ok) {
        mostrarMensagem(
          'Não foi possível salvar',
          resultado.erro || 'Tente novamente.'
        );
        return;
      }

      setModalVisivel(false);

      mostrarMensagem(
        'Sucesso',
        resultado.mensagem || 'Usuário salvo com sucesso.'
      );

      await carregarUsuarios();
    } catch (erro) {
      console.error('Erro ao salvar usuário:', erro);

      mostrarMensagem(
        'Erro',
        'Não foi possível salvar o usuário.'
      );
    } finally {
      setProcessando(false);
    }
  }

  function alterarStatus(usuario) {
    const novoStatus = !usuario.ativo;

    confirmar(
      novoStatus ? 'Ativar usuário' : 'Desativar usuário',
      `Deseja realmente ${novoStatus ? 'ativar' : 'desativar'} o acesso de ${usuario.nome}?`,
      async () => {
        setProcessando(true);

        try {
          const resultado = await gerenciarUsuarios('alterar_status', {
            id: usuario.id,
            ativo: novoStatus,
          });

          if (!resultado.ok) {
            mostrarMensagem(
              'Não foi possível alterar',
              resultado.erro || 'Tente novamente.'
            );
            return;
          }

          mostrarMensagem(
            'Sucesso',
            resultado.mensagem || 'Status atualizado.'
          );

          await carregarUsuarios();
        } catch (erro) {
          console.error('Erro ao alterar status:', erro);

          mostrarMensagem(
            'Erro',
            'Não foi possível alterar o status.'
          );
        } finally {
          setProcessando(false);
        }
      }
    );
  }

  function abrirRedefinicaoSenha(usuario) {
    setUsuarioSenha(usuario);
    setNovaSenha('');
    setModalSenhaVisivel(true);
  }

  async function redefinirSenha() {
    if (novaSenha.length < 8) {
      mostrarMensagem(
        'Atenção',
        'A nova senha precisa ter pelo menos 8 caracteres.'
      );
      return;
    }

    setProcessando(true);

    try {
      const resultado = await gerenciarUsuarios('redefinir_senha', {
        id: usuarioSenha.id,
        senha: novaSenha,
      });

      if (!resultado.ok) {
        mostrarMensagem(
          'Não foi possível redefinir',
          resultado.erro || 'Tente novamente.'
        );
        return;
      }

      setModalSenhaVisivel(false);
      setNovaSenha('');

      mostrarMensagem(
        'Sucesso',
        resultado.mensagem || 'Senha redefinida com sucesso.'
      );
    } catch (erro) {
      console.error('Erro ao redefinir senha:', erro);

      mostrarMensagem(
        'Erro',
        'Não foi possível redefinir a senha.'
      );
    } finally {
      setProcessando(false);
    }
  }

  if (!ehProgramador) {
    return (
      <View style={styles.bloqueio}>
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color="#7A1F2B"
        />

        <Text style={styles.bloqueioTitulo}>
          Acesso restrito
        </Text>

        <Text style={styles.bloqueioTexto}>
          Somente o PROGRAMADOR pode gerenciar usuários.
        </Text>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoPrincipalTexto}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltarIcone}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.cabecalhoTitulo}>
            Gerenciamento de Usuários
          </Text>

          <Text style={styles.cabecalhoSubtitulo}>
            Contas administrativas da paróquia
          </Text>
        </View>

        <TouchableOpacity
          onPress={carregarUsuarios}
          disabled={carregando || processando}
          style={styles.botaoAtualizar}
        >
          <Ionicons
            name="refresh-outline"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.resumo}>
          <View style={styles.resumoIcone}>
            <Ionicons
              name="people-outline"
              size={28}
              color="#7A1F2B"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.resumoNumero}>
              {usuarios.length}
            </Text>

            <Text style={styles.resumoDescricao}>
              Usuários cadastrados
            </Text>
          </View>

          <View style={styles.resumoStatus}>
            <Text style={styles.resumoAtivos}>
              {usuarios.filter(u => u.ativo).length}
            </Text>

            <Text style={styles.resumoDescricao}>
              Ativos
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botaoNovo}
          onPress={abrirCadastro}
          disabled={processando}
        >
          <Ionicons
            name="person-add-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.botaoNovoTexto}>
            Cadastrar usuário
          </Text>
        </TouchableOpacity>

        <View style={styles.tituloListaContainer}>
          <Text style={styles.tituloLista}>
            Usuários cadastrados
          </Text>

          <Text style={styles.quantidade}>
            {usuarios.length}
          </Text>
        </View>

        {carregando ? (
          <ActivityIndicator
            size="large"
            color="#7A1F2B"
            style={{ marginTop: 35 }}
          />
        ) : usuarios.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons
              name="people-outline"
              size={42}
              color="#b7aa9c"
            />

            <Text style={styles.vazioTitulo}>
              Nenhum usuário encontrado
            </Text>

            <Text style={styles.vazioTexto}>
              Cadastre um usuário para começar.
            </Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {usuarios.map(usuario => (
              <View
                key={usuario.id}
                style={styles.usuarioCard}
              >
                <View style={styles.usuarioCabecalho}>
                  <View style={styles.avatar}>
                    <Ionicons
                      name="person-outline"
                      size={24}
                      color="#7A1F2B"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.usuarioNome}>
                      {usuario.nome}
                    </Text>

                    <Text style={styles.usuarioEmail}>
                      {usuario.email || 'E-mail não informado'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      usuario.ativo
                        ? styles.statusAtivo
                        : styles.statusInativo,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTexto,
                        usuario.ativo
                          ? styles.statusTextoAtivo
                          : styles.statusTextoInativo,
                      ]}
                    >
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                </View>

                <View style={styles.usuarioDetalhes}>
                  <View style={styles.cargoBadge}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={14}
                      color="#7A1F2B"
                    />

                    <Text style={styles.cargoTexto}>
                      {CARGOS.find(c => c.value === usuario.cargo)?.label || usuario.cargo}
                    </Text>
                  </View>

                  <Text style={styles.usuarioData}>
                    Cadastro:{' '}
                    {usuario.criado_em
                      ? new Date(usuario.criado_em).toLocaleDateString('pt-BR')
                      : '—'}
                  </Text>
                </View>

                <View style={styles.divisor} />

                <View style={styles.acoes}>
                  <TouchableOpacity
                    style={styles.acaoBotao}
                    onPress={() => abrirEdicao(usuario)}
                    disabled={processando}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color="#7A1F2B"
                    />

                    <Text style={styles.acaoTexto}>
                      Editar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acaoBotao}
                    onPress={() => abrirRedefinicaoSenha(usuario)}
                    disabled={processando || usuario.id === perfil?.id}
                  >
                    <Ionicons
                      name="key-outline"
                      size={18}
                      color={usuario.id === perfil?.id ? '#b7aa9c' : '#7A1F2B'}
                    />

                    <Text
                      style={[
                        styles.acaoTexto,
                        usuario.id === perfil?.id && { color: '#b7aa9c' },
                      ]}
                    >
                      Senha
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acaoBotao}
                    onPress={() => alterarStatus(usuario)}
                    disabled={processando || usuario.id === perfil?.id}
                  >
                    <Ionicons
                      name={usuario.ativo ? 'person-remove-outline' : 'person-add-outline'}
                      size={18}
                      color={usuario.id === perfil?.id ? '#b7aa9c' : usuario.ativo ? '#b45309' : '#15803d'}
                    />

                    <Text
                      style={[
                        styles.acaoTexto,
                        {
                          color:
                            usuario.id === perfil?.id
                              ? '#b7aa9c'
                              : usuario.ativo
                                ? '#b45309'
                                : '#15803d',
                        },
                      ]}
                    >
                      {usuario.ativo ? 'Desativar' : 'Ativar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL DE CADASTRO E EDIÇÃO */}
      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisivel(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalFundo}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalCabecalho}>
              <Text style={styles.modalTitulo}>
                {modo === 'criar' ? 'Novo usuário' : 'Editar usuário'}
              </Text>

              <TouchableOpacity
                onPress={() => setModalVisivel(false)}
                disabled={processando}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#5a5048"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.rotulo}>
                Nome completo
              </Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome"
                placeholderTextColor="#a49a90"
                editable={!processando}
              />

              {modo === 'criar' && (
                <>
                  <Text style={styles.rotulo}>
                    E-mail
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="usuario@exemplo.com"
                    placeholderTextColor="#a49a90"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!processando}
                  />

                  <Text style={styles.rotulo}>
                    Senha inicial
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Mínimo de 8 caracteres"
                    placeholderTextColor="#a49a90"
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!processando}
                  />
                </>
              )}

              <Text style={styles.rotulo}>
                Cargo
              </Text>

              <View style={styles.cargos}>
                {CARGOS.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.cargoOpcao,
                      cargo === item.value && styles.cargoOpcaoSelecionado,
                    ]}
                    onPress={() => setCargo(item.value)}
                    disabled={processando}
                  >
                    <Text
                      style={[
                        styles.cargoOpcaoTexto,
                        cargo === item.value && styles.cargoOpcaoTextoSelecionado,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {cargo === item.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={17}
                        color="#7A1F2B"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.avisoModal}>
                {modo === 'criar'
                  ? 'O usuário poderá utilizar o e-mail e a senha inicial para entrar no painel.'
                  : 'A alteração do cargo modifica as permissões administrativas do usuário.'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.botaoSalvar,
                  processando && { opacity: 0.7 },
                ]}
                onPress={salvarUsuario}
                disabled={processando}
              >
                {processando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoPrincipalTexto}>
                    {modo === 'criar' ? 'Cadastrar usuário' : 'Salvar alterações'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setModalVisivel(false)}
                disabled={processando}
              >
                <Text style={styles.botaoCancelarTexto}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL DE REDEFINIÇÃO DE SENHA */}
      <Modal
        visible={modalSenhaVisivel}
        animationType="fade"
        transparent
        onRequestClose={() => setModalSenhaVisivel(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalFundo}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalCabecalho}>
              <Text style={styles.modalTitulo}>
                Redefinir senha
              </Text>

              <TouchableOpacity
                onPress={() => setModalSenhaVisivel(false)}
                disabled={processando}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#5a5048"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.textoAjuda}>
              Defina uma nova senha para{' '}
              <Text style={{ fontWeight: '700' }}>
                {usuarioSenha?.nome || 'este usuário'}.
              </Text>
            </Text>

            <Text style={styles.rotulo}>
              Nova senha
            </Text>

            <TextInput
              style={styles.input}
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder="Mínimo de 8 caracteres"
              placeholderTextColor="#a49a90"
              secureTextEntry
              autoCapitalize="none"
              editable={!processando}
            />

            <TouchableOpacity
              style={styles.botaoSalvar}
              onPress={redefinirSenha}
              disabled={processando}
            >
              {processando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoPrincipalTexto}>
                  Redefinir senha
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => setModalSenhaVisivel(false)}
              disabled={processando}
            >
              <Text style={styles.botaoCancelarTexto}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  botaoVoltarIcone: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cabecalhoTitulo: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  cabecalhoSubtitulo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 3,
  },

  botaoAtualizar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  conteudo: {
    padding: 16,
    paddingBottom: 40,
  },

  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  resumoIcone: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F3ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resumoNumero: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2b2320',
  },

  resumoDescricao: {
    fontSize: 12,
    color: '#8a7d6f',
    marginTop: 2,
  },

  resumoStatus: {
    alignItems: 'center',
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: '#eee5dc',
  },

  resumoAtivos: {
    fontSize: 23,
    fontWeight: '700',
    color: '#15803d',
  },

  botaoNovo: {
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 24,
  },

  botaoNovoTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  tituloListaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tituloLista: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b2320',
  },

  quantidade: {
    fontSize: 12,
    color: '#7A1F2B',
    backgroundColor: '#F3ECE2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontWeight: '700',
  },

  lista: {
    gap: 12,
  },

  usuarioCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  usuarioCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  usuarioNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b2320',
  },

  usuarioEmail: {
    fontSize: 12,
    color: '#8a7d6f',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusAtivo: {
    backgroundColor: '#dcfce7',
  },

  statusInativo: {
    backgroundColor: '#fee2e2',
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: '700',
  },

  statusTextoAtivo: {
    color: '#15803d',
  },

  statusTextoInativo: {
    color: '#b91c1c',
  },

  usuarioDetalhes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
  },

  cargoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3ECE2',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  cargoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A1F2B',
  },

  usuarioData: {
    fontSize: 11,
    color: '#8a7d6f',
  },

  divisor: {
    height: 1,
    backgroundColor: '#f0eae3',
    marginVertical: 13,
  },

  acoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },

  acaoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },

  acaoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A1F2B',
  },

  vazio: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
  },

  vazioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2b2320',
    marginTop: 12,
  },

  vazioTexto: {
    fontSize: 12,
    color: '#8a7d6f',
    textAlign: 'center',
    marginTop: 6,
  },

  bloqueio: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },

  bloqueioTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b2320',
    marginTop: 18,
  },

  bloqueioTexto: {
    fontSize: 14,
    color: '#8a7d6f',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },

  botaoVoltar: {
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },

  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  modalCard: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 22,
  },

  modalCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  modalTitulo: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2b2320',
  },

  rotulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a5048',
    marginBottom: 7,
    marginTop: 13,
  },

  input: {
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: '#2b2320',
    backgroundColor: '#FAF7F2',
    width: '100%',
  },

  cargos: {
    gap: 8,
  },

  cargoOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },

  cargoOpcaoSelecionado: {
    borderColor: '#7A1F2B',
    backgroundColor: '#FDF7F5',
  },

  cargoOpcaoTexto: {
    fontSize: 13,
    color: '#5a5048',
  },

  cargoOpcaoTextoSelecionado: {
    color: '#7A1F2B',
    fontWeight: '700',
  },

  avisoModal: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8a7d6f',
    marginTop: 15,
    marginBottom: 8,
  },

  botaoSalvar: {
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },

  botaoPrincipalTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  botaoCancelar: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },

  botaoCancelarTexto: {
    color: '#8a7d6f',
    fontSize: 14,
    fontWeight: '600',
  },

  textoAjuda: {
    color: '#8a7d6f',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
});