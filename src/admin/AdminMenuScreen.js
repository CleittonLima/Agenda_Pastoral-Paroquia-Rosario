import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from './AdminContext';
import ConfirmModal from './components/ConfirmModal';

const SECOES = [
  {
    id: 'AdminIgrejas',
    icone: 'business-outline',
    titulo: 'Área Pastoral',
    desc: 'Igrejas e capelas',
  },
  {
    id: 'AdminHorarios',
    icone: 'time-outline',
    titulo: 'Horários',
    desc: 'Missas, confissões e mais',
  },
  {
    id: 'AdminAvisos',
    icone: 'megaphone-outline',
    titulo: 'Avisos',
    desc: 'Comunicados da paróquia',
  },
  {
    id: 'AdminEventos',
    icone: 'calendar-outline',
    titulo: 'Eventos',
    desc: 'Festas, retiros, novenas',
  },
  {
    id: 'AdminPix',
    icone: 'cash-outline',
    titulo: 'Oferta (PIX)',
    desc: 'QR Code e chave PIX',
    cargosPermitidos: ['PROGRAMADOR', 'PADRE'],
  },
  {
    id: 'AdminGaleria',
    icone: 'images-outline',
    titulo: 'Galeria',
    desc: 'Fotos de cada igreja',
  },
  {
    id: 'AdminRedesSociais',
    icone: 'share-social-outline',
    titulo: 'Redes Sociais',
    desc: 'Instagram, WhatsApp e mais',
  },
  {
    id: 'AdminPdf',
    icone: 'document-text-outline',
    titulo: 'PDF para os fiéis',
    desc: 'Logo e cabeçalho do PDF',
    cargosPermitidos: ['PROGRAMADOR', 'PADRE'],
  },
  {
    id: 'AdminConfiguracoes',
    icone: 'settings-outline',
    titulo: 'Configurações Gerais',
    desc: 'Dados da paróquia e senha',
    cargosPermitidos: ['PROGRAMADOR', 'PADRE'],
  },
  {
    id: 'AdminMinhaConta',
    icone: 'person-circle-outline',
    titulo: 'Minha Conta',
    desc: 'Seus dados pessoais e senha',
  },
];

export default function AdminMenuScreen() {
  const navigation = useNavigation();

  const {
    dados,
    carregando,
    recarregar,
    sair,
    cargo,
  } = useAdmin();

  const [confirmandoSair, setConfirmandoSair] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    recarregar();
  }, []);

  // Filtra as seções de acordo com o cargo do usuário.
  const secoesVisiveis = SECOES.filter(secao => {
    if (!secao.cargosPermitidos) {
      return true;
    }

    return secao.cargosPermitidos.includes(cargo);
  });

  // O gerenciamento de usuários é exclusivo do PROGRAMADOR.
  if (cargo === 'PROGRAMADOR') {
    secoesVisiveis.push({
      id: 'AdminUsuarios',
      icone: 'people-outline',
      titulo: 'Gerenciamento de Usuários',
      desc: 'Contas e permissões administrativas',
    });
  }

  async function executarSaida() {
    if (saindo) return;

    setSaindo(true);
    setConfirmandoSair(false);

    try {
      await sair();
      navigation.replace('Principal');
    } catch (erro) {
      console.error('Erro ao sair do painel:', erro);
      setSaindo(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <View style={styles.titulosCabecalho}>
          <Text style={styles.cabecalhoTitulo}>
            Painel Administrativo
          </Text>

          <Text style={styles.cabecalhoSubtitulo}>
            Paróquia N. Sra. do Rosário
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setConfirmandoSair(true)}
          style={styles.botaoSair}
          disabled={saindo}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sair do painel administrativo"
        >
          {saindo ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={19}
                color="#fff"
              />

              <Text style={styles.botaoSairTexto}>
                SAIR
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ESTATÍSTICAS */}
        {carregando ? (
          <ActivityIndicator
            color="#7A1F2B"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={styles.estatisticas}>
            <Card
              numero={dados.igrejas.length}
              rotulo="Igrejas"
            />

            <Card
              numero={dados.horarios.length}
              rotulo="Horários"
            />

            <Card
              numero={dados.avisos.length}
              rotulo="Avisos"
            />

            <Card
              numero={dados.eventos.length}
              rotulo="Eventos"
            />
          </View>
        )}

        {/* LISTA DE SEÇÕES */}
        <View style={styles.lista}>
          {secoesVisiveis.map(secao => (
            <TouchableOpacity
              key={secao.id}
              style={styles.item}
              onPress={() => navigation.navigate(secao.id)}
              activeOpacity={0.75}
            >
              <View style={styles.itemIcone}>
                <Ionicons
                  name={secao.icone}
                  size={20}
                  color="#7A1F2B"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitulo}>
                  {secao.titulo}
                </Text>

                <Text style={styles.itemDesc}>
                  {secao.desc}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#a89b8c"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CONFIRMAÇÃO DE SAÍDA */}
      <ConfirmModal
        visivel={confirmandoSair}
        titulo="Sair do painel administrativo?"
        mensagem="Você será desconectado da sua conta e precisará fazer login novamente para acessar o painel."
        textoConfirmar="SAIR"
        destrutivo
        onConfirmar={executarSaida}
        onCancelar={() => setConfirmandoSair(false)}
      />
    </View>
  );
}

function Card({ numero, rotulo }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardNumero}>
        {numero}
      </Text>

      <Text style={styles.cardRotulo}>
        {rotulo}
      </Text>
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
    paddingBottom: 18,
    paddingTop: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  titulosCabecalho: {
    flex: 1,
  },

  cabecalhoTitulo: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 19,
  },

  cabecalhoSubtitulo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },

  botaoSair: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  botaoSairTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  scroll: {
    padding: 16,
    paddingBottom: 32,
  },

  estatisticas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },

  card: {
    flexBasis: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7A1F2B',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  cardNumero: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2b2320',
  },

  cardRotulo: {
    fontSize: 12,
    color: '#8a7d6f',
    marginTop: 2,
  },

  lista: {
    gap: 10,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  itemIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b2320',
  },

  itemDesc: {
    fontSize: 12,
    color: '#8a7d6f',
    marginTop: 1,
  },
});