import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/config';
import AdminHeader from './components/AdminHeader';

const AREAS = [
  { valor: 'TODOS', rotulo: 'Todas' },
  { valor: 'IGREJA', rotulo: 'Igrejas' },
  { valor: 'HORARIO', rotulo: 'Horários' },
  { valor: 'AVISO', rotulo: 'Avisos' },
  { valor: 'EVENTO', rotulo: 'Eventos' },
  { valor: 'PIX', rotulo: 'PIX' },
  { valor: 'IMAGEM', rotulo: 'Galeria' },
];

const ACOES = [
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'CRIAR', rotulo: 'Cadastros' },
  { valor: 'EDITAR', rotulo: 'Edições' },
  { valor: 'EXCLUIR', rotulo: 'Exclusões' },
];

const ICONES = {
  IGREJA: 'business-outline',
  HORARIO: 'time-outline',
  AVISO: 'megaphone-outline',
  EVENTO: 'calendar-outline',
  PIX: 'cash-outline',
  IMAGEM: 'images-outline',
};

const NOMES_AREAS = {
  IGREJA: 'Igrejas e Capelas',
  HORARIO: 'Horários',
  AVISO: 'Avisos',
  EVENTO: 'Eventos',
  PIX: 'Oferta (PIX)',
  IMAGEM: 'Galeria de Fotos',
};

const NOMES_ACOES = {
  CRIAR: 'Cadastro',
  EDITAR: 'Edição',
  EXCLUIR: 'Exclusão',
};

function formatarData(data) {
  if (!data) return 'Data não disponível';

  const dataObjeto = new Date(data);

  if (Number.isNaN(dataObjeto.getTime())) {
    return 'Data não disponível';
  }

  return dataObjeto.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminHistoricoScreen() {
  const [registros, setRegistros] = useState([]);
  const [areaSelecionada, setAreaSelecionada] = useState('TODOS');
  const [acaoSelecionada, setAcaoSelecionada] = useState('TODAS');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarHistorico = useCallback(async (manual = false) => {
    if (manual) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    setErro('');

    try {
      let consulta = supabase
        .from('historico_alteracoes')
        .select(
          'id, usuario_nome, usuario_cargo, acao, entidade, descricao, detalhes, created_at'
        )
        .in('entidade', [
          'IGREJA',
          'HORARIO',
          'AVISO',
          'EVENTO',
          'PIX',
          'IMAGEM',
        ])
        .in('acao', ['CRIAR', 'EDITAR', 'EXCLUIR'])
        .order('created_at', { ascending: false })
        .limit(200);

      if (areaSelecionada !== 'TODOS') {
        consulta = consulta.eq('entidade', areaSelecionada);
      }

      if (acaoSelecionada !== 'TODAS') {
        consulta = consulta.eq('acao', acaoSelecionada);
      }

      const { data, error: erroConsulta } = await consulta;

      if (erroConsulta) {
        throw erroConsulta;
      }

      setRegistros(data || []);
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
      setErro(
        'Não foi possível carregar o histórico. Verifique sua conexão e suas permissões.'
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [areaSelecionada, acaoSelecionada]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Histórico de Alterações" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregarHistorico(true)}
            colors={['#7A1F2B']}
          />
        }
      >
        <View style={styles.introducao}>
          <View style={styles.iconeIntroducao}>
            <Ionicons
              name="time-outline"
              size={25}
              color="#7A1F2B"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.tituloIntroducao}>
              Histórico da paróquia
            </Text>

            <Text style={styles.textoIntroducao}>
              Consulte os cadastros, as alterações e as exclusões
              realizadas no conteúdo da paróquia.
            </Text>
          </View>
        </View>

        <Text style={styles.tituloFiltro}>Filtrar por área</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          {AREAS.map(area => {
            const selecionada = areaSelecionada === area.valor;

            return (
              <TouchableOpacity
                key={area.valor}
                style={[
                  styles.filtro,
                  selecionada && styles.filtroSelecionado,
                ]}
                onPress={() => setAreaSelecionada(area.valor)}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    selecionada && styles.textoFiltroSelecionado,
                  ]}
                >
                  {area.rotulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.tituloFiltro}>Filtrar por operação</Text>

        <View style={styles.filtros}>
          {ACOES.map(acao => {
            const selecionada = acaoSelecionada === acao.valor;

            return (
              <TouchableOpacity
                key={acao.valor}
                style={[
                  styles.filtro,
                  selecionada && styles.filtroSelecionado,
                ]}
                onPress={() => setAcaoSelecionada(acao.valor)}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    selecionada && styles.textoFiltroSelecionado,
                  ]}
                >
                  {acao.rotulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.cabecalhoLista}>
          <Text style={styles.tituloLista}>
            Alterações recentes
          </Text>

          <TouchableOpacity
            style={styles.botaoAtualizar}
            onPress={() => carregarHistorico(true)}
            disabled={atualizando}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color="#7A1F2B"
            />

            <Text style={styles.textoAtualizar}>
              Atualizar
            </Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <ActivityIndicator
            color="#7A1F2B"
            size="large"
            style={{ marginTop: 30 }}
          />
        ) : erro ? (
          <View style={styles.estadoVazio}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color="#B23A2E"
            />

            <Text style={styles.textoVazio}>{erro}</Text>

            <TouchableOpacity
              style={styles.botaoTentarNovamente}
              onPress={() => carregarHistorico()}
            >
              <Text style={styles.textoTentarNovamente}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : registros.length === 0 ? (
          <View style={styles.estadoVazio}>
            <Ionicons
              name="document-text-outline"
              size={36}
              color="#a89b8c"
            />

            <Text style={styles.textoVazio}>
              Nenhuma alteração encontrada para os filtros selecionados.
            </Text>
          </View>
        ) : (
          registros.map(registro => (
            <View key={registro.id} style={styles.card}>
              <View style={styles.cardTopo}>
                <View style={styles.iconeArea}>
                  <Ionicons
                    name={ICONES[registro.entidade] || 'document-outline'}
                    size={21}
                    color="#7A1F2B"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitulo}>
                    {NOMES_AREAS[registro.entidade] || registro.entidade}
                  </Text>

                  <Text style={styles.data}>
                    {formatarData(registro.created_at)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.etiquetaAcao,
                    registro.acao === 'EXCLUIR' && styles.etiquetaExclusao,
                    registro.acao === 'EDITAR' && styles.etiquetaEdicao,
                  ]}
                >
                  <Text style={styles.textoEtiqueta}>
                    {NOMES_ACOES[registro.acao] || registro.acao}
                  </Text>
                </View>
              </View>

              <Text style={styles.descricao}>
                {registro.descricao}
              </Text>

              <View style={styles.divisor} />

              <View style={styles.usuarioLinha}>
                <Ionicons
                  name="person-circle-outline"
                  size={21}
                  color="#8a7d6f"
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.nomeUsuario}>
                    {registro.usuario_nome || 'Administrador'}
                  </Text>

                  <Text style={styles.cargoUsuario}>
                    {registro.usuario_cargo || 'Cargo não informado'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {!carregando && !erro && registros.length > 0 && (
          <Text style={styles.rodape}>
            Exibindo até 200 registros mais recentes.
          </Text>
        )}
      </ScrollView>
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
    paddingBottom: 36,
  },

  introducao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 15,
    marginBottom: 22,
  },

  iconeIntroducao: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloIntroducao: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2b2320',
  },

  textoIntroducao: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8a7d6f',
    marginTop: 4,
  },

  tituloFiltro: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b2320',
    marginBottom: 9,
  },

  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  filtro: {
    borderWidth: 1,
    borderColor: '#e3ddd2',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },

  filtroSelecionado: {
    backgroundColor: '#7A1F2B',
    borderColor: '#7A1F2B',
  },

  textoFiltro: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a5048',
  },

  textoFiltroSelecionado: {
    color: '#fff',
  },

  cabecalhoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
    marginBottom: 12,
  },

  tituloLista: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b2320',
  },

  botaoAtualizar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 7,
  },

  textoAtualizar: {
    fontSize: 12,
    color: '#7A1F2B',
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 15,
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

  iconeArea: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3ECE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b2320',
  },

  data: {
    fontSize: 11,
    color: '#8a7d6f',
    marginTop: 3,
  },

  etiquetaAcao: {
    backgroundColor: '#E6F4EA',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  etiquetaEdicao: {
    backgroundColor: '#FFF0D6',
  },

  etiquetaExclusao: {
    backgroundColor: '#FBE7E5',
  },

  textoEtiqueta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5a5048',
  },

  descricao: {
    fontSize: 13,
    lineHeight: 19,
    color: '#2b2320',
    marginTop: 13,
  },

  divisor: {
    height: 1,
    backgroundColor: '#F0EBE4',
    marginVertical: 12,
  },

  usuarioLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  nomeUsuario: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a5048',
  },

  cargoUsuario: {
    fontSize: 11,
    color: '#8a7d6f',
    marginTop: 2,
  },

  estadoVazio: {
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 14,
    gap: 10,
  },

  textoVazio: {
    fontSize: 13,
    color: '#8a7d6f',
    textAlign: 'center',
    lineHeight: 19,
  },

  botaoTentarNovamente: {
    backgroundColor: '#7A1F2B',
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginTop: 4,
  },

  textoTentarNovamente: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  rodape: {
    textAlign: 'center',
    fontSize: 11,
    color: '#a89b8c',
    marginTop: 6,
  },
});