import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

// ============================================================
// CAMPOS DE DATA E HORA DO PAINEL ADM
// - Continua dando para digitar (AAAA-MM-DD, DD/MM/AAAA, HH:MM, 1930...)
// - O botão ao lado abre um calendário (datas) ou um seletor de horas e
//   minutos em "roleta", como nos celulares (horários).
// O valor salvo continua no mesmo formato de antes: "AAAA-MM-DD" e "HH:MM".
// ============================================================

const COR = '#7A1F2B';
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const DIAS_CURTOS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const dois = n => String(n).padStart(2, '0');

// ------------------------------------------------------------
// Datas
// ------------------------------------------------------------
function paraISO(ano, mes, dia) {
  return `${ano}-${dois(mes + 1)}-${dois(dia)}`;
}

function lerISO(texto) {
  const m = String(texto || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!m) return null;

  const ano = Number(m[1]);
  const mes = Number(m[2]) - 1;
  const dia = Number(m[3]);

  const d = new Date(ano, mes, dia);

  if (
    d.getFullYear() !== ano ||
    d.getMonth() !== mes ||
    d.getDate() !== dia
  ) {
    return null;
  }

  return {
    ano,
    mes,
    dia,
    data: d,
  };
}

// Aceita o que a pessoa digitar e devolve "AAAA-MM-DD" (ou o texto original)
export function normalizarData(texto) {
  const t = String(texto || '').trim();

  if (!t) return '';

  if (lerISO(t)) return t;

  const br = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);

  if (br) {
    const ano =
      br[3].length === 2
        ? 2000 + Number(br[3])
        : Number(br[3]);

    const iso = paraISO(
      ano,
      Number(br[2]) - 1,
      Number(br[1])
    );

    if (lerISO(iso)) return iso;
  }

  const soNumeros = t.replace(/\D/g, '');

  if (soNumeros.length === 8) {
    const iso = /^(19|20)/.test(soNumeros)
      ? `${soNumeros.slice(0, 4)}-${soNumeros.slice(4, 6)}-${soNumeros.slice(6, 8)}`
      : `${soNumeros.slice(4, 8)}-${soNumeros.slice(2, 4)}-${soNumeros.slice(0, 2)}`;

    if (lerISO(iso)) return iso;
  }

  return t;
}

function descreverData(iso) {
  const d = lerISO(iso);

  if (!d) return '';

  return `${DIAS_SEMANA[d.data.getDay()]}, ${d.dia} de ${MESES[d.mes].toLowerCase()} de ${d.ano}`;
}

// ------------------------------------------------------------
// Horas
// ------------------------------------------------------------
function lerHora(texto) {
  const m = String(texto || '').trim().match(/^(\d{2}):(\d{2})$/);

  if (!m) return null;

  const h = Number(m[1]);
  const min = Number(m[2]);

  if (h > 23 || min > 59) return null;

  return {
    h,
    min,
  };
}

// Aceita "9", "9:5", "0930", "19h30", "19.30"... e devolve "HH:MM"
export function normalizarHora(texto) {
  const t = String(texto || '').trim().toLowerCase();

  if (!t) return '';

  let h;
  let min;

  const separado = t.match(
    /^(\d{1,2})\s*[:h.,]\s*(\d{0,2})\s*(min)?$/
  );

  if (separado) {
    h = Number(separado[1]);
    min = separado[2]
      ? Number(separado[2].padEnd(2, '0'))
      : 0;
  } else if (/^\d{1,4}$/.test(t)) {
    if (t.length <= 2) {
      h = Number(t);
      min = 0;
    } else {
      h = Number(t.slice(0, t.length - 2));
      min = Number(t.slice(-2));
    }
  } else {
    return String(texto).trim();
  }

  if (h > 23 || min > 59) {
    return String(texto).trim();
  }

  return `${dois(h)}:${dois(min)}`;
}

// ============================================================
// CALENDÁRIO
// ============================================================
// (é montado a cada abertura, então já começa no mês da data do campo)
function ModalCalendario({ valor, onSelecionar, onFechar }) {
  const { preferencias } = useApp();

  const hoje = new Date();

  const [mesVisivel, setMesVisivel] = useState(() => {
    const atual = lerISO(valor);

    return atual
      ? {
          ano: atual.ano,
          mes: atual.mes,
        }
      : {
          ano: hoje.getFullYear(),
          mes: hoje.getMonth(),
        };
  });

  const { ano, mes } = mesVisivel;

  const primeiroDiaSemana = new Date(
    ano,
    mes,
    1
  ).getDay();

  const diasNoMes = new Date(
    ano,
    mes + 1,
    0
  ).getDate();

  const celulas = [];

  for (let i = 0; i < primeiroDiaSemana; i++) {
    celulas.push(null);
  }

  for (let d = 1; d <= diasNoMes; d++) {
    celulas.push(d);
  }

  while (celulas.length % 7 !== 0) {
    celulas.push(null);
  }

  const isoHoje = paraISO(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );

  function mudarMes(delta) {
    const d = new Date(
      ano,
      mes + delta,
      1
    );

    setMesVisivel({
      ano: d.getFullYear(),
      mes: d.getMonth(),
    });
  }

  return (
    <Modal
      visible
      animationType={
        preferencias.reduzirAnimacoes
          ? 'none'
          : 'fade'
      }
      transparent
      onRequestClose={onFechar}
    >
      <TouchableOpacity
        style={styles.fundo}
        activeOpacity={1}
        onPress={onFechar}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.caixa}
          onPress={() => {}}
        >
          <Text style={styles.caixaTitulo}>
            Selecionar data
          </Text>

          <View style={styles.calTopo}>
            <TouchableOpacity
              onPress={() => mudarMes(-12)}
              style={styles.calSeta}
              accessibilityLabel="Ano anterior"
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons
                name="play-back-outline"
                size={16}
                color={COR}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => mudarMes(-1)}
              style={styles.calSeta}
              accessibilityLabel="Mês anterior"
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={COR}
              />
            </TouchableOpacity>

            <Text style={styles.calMes}>
              {MESES[mes]} de {ano}
            </Text>

            <TouchableOpacity
              onPress={() => mudarMes(1)}
              style={styles.calSeta}
              accessibilityLabel="Próximo mês"
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COR}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => mudarMes(12)}
              style={styles.calSeta}
              accessibilityLabel="Próximo ano"
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons
                name="play-forward-outline"
                size={16}
                color={COR}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.calSemana}>
            {DIAS_CURTOS.map((d, i) => (
              <Text
                key={i}
                style={[
                  styles.calSemanaTexto,
                  i === 0 && { color: COR },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.calGrade}>
            {celulas.map((dia, i) => {
              if (!dia) {
                return (
                  <View
                    key={i}
                    style={styles.calCelula}
                  />
                );
              }

              const iso = paraISO(
                ano,
                mes,
                dia
              );

              const selecionado = iso === valor;
              const ehHoje = iso === isoHoje;

              return (
                <TouchableOpacity
                  key={i}
                  style={styles.calCelula}
                  onPress={() => onSelecionar(iso)}
                  accessibilityLabel={descreverData(iso)}
                >
                  <View
                    style={[
                      styles.calDia,
                      ehHoje && styles.calDiaHoje,
                      selecionado &&
                        styles.calDiaSelecionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calDiaTexto,
                        selecionado &&
                          styles.calDiaTextoSelecionado,
                      ]}
                    >
                      {dia}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.rodapeBotoes}>
            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => onSelecionar(isoHoje)}
            >
              <Text style={styles.botaoSecundarioTexto}>
                Hoje
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={onFechar}
            >
              <Text style={styles.botaoSecundarioTexto}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ============================================================
// SELETOR DE HORÁRIO (roleta de horas e minutos)
// ============================================================
const ALTURA_ITEM = 44;
const ITENS_VISIVEIS = 5;
const HORAS = Array.from(
  { length: 24 },
  (_, i) => dois(i)
);
const MINUTOS = Array.from(
  { length: 60 },
  (_, i) => dois(i)
);

function Roleta({ itens, indice, onMudar }) {
  const { preferencias } = useApp();

  const ref = useRef(null);
  const temporizador = useRef(null);
  const posicao = useRef(
    indice * ALTURA_ITEM
  );

  const [indiceVisivel, setIndiceVisivel] =
    useState(indice);

  // Posiciona no valor atual assim que a roleta aparece
  useEffect(() => {
    const t = setTimeout(
      () =>
        ref.current?.scrollTo({
          y: indice * ALTURA_ITEM,
          animated: false,
        }),
      30
    );

    return () => {
      clearTimeout(t);
      clearTimeout(temporizador.current);
    };
  }, []);

  function encaixar(y) {
    const i = Math.max(
      0,
      Math.min(
        itens.length - 1,
        Math.round(y / ALTURA_ITEM)
      )
    );

    if (
      Math.abs(y - i * ALTURA_ITEM) > 1
    ) {
      ref.current?.scrollTo({
        y: i * ALTURA_ITEM,
        animated: !preferencias.reduzirAnimacoes,
      });
    }

    setIndiceVisivel(i);
    onMudar(i);
  }

  // Ao parar de rolar, encaixa no item mais próximo
  function aoRolar(e) {
    const y =
      e.nativeEvent.contentOffset.y;

    posicao.current = y;

    const i = Math.max(
      0,
      Math.min(
        itens.length - 1,
        Math.round(y / ALTURA_ITEM)
      )
    );

    if (i !== indiceVisivel) {
      setIndiceVisivel(i);
    }

    clearTimeout(temporizador.current);

    temporizador.current = setTimeout(
      () => encaixar(posicao.current),
      140
    );
  }

  return (
    <View style={styles.roleta}>
      <View
        style={[
          styles.roletaFaixa,
          {
            top:
              ALTURA_ITEM *
              Math.floor(
                ITENS_VISIVEIS / 2
              ),
          },
        ]}
      />

      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={
          Platform.OS === 'web'
            ? undefined
            : ALTURA_ITEM
        }
        decelerationRate="fast"
        onScroll={aoRolar}
        onMomentumScrollEnd={e => {
          clearTimeout(
            temporizador.current
          );

          encaixar(
            e.nativeEvent.contentOffset.y
          );
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical:
            ALTURA_ITEM *
            Math.floor(
              ITENS_VISIVEIS / 2
            ),
        }}
        nestedScrollEnabled
      >
        {itens.map((texto, i) => (
          <TouchableOpacity
            key={texto}
            style={styles.roletaItem}
            activeOpacity={0.6}
            onPress={() => {
              ref.current?.scrollTo({
                y: i * ALTURA_ITEM,
                animated:
                  !preferencias.reduzirAnimacoes,
              });

              setIndiceVisivel(i);
              onMudar(i);
            }}
          >
            <Text
              style={[
                styles.roletaTexto,
                Math.abs(
                  i - indiceVisivel
                ) === 1 &&
                  styles.roletaTextoPerto,
                i === indiceVisivel &&
                  styles.roletaTextoAtivo,
              ]}
            >
              {texto}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// (é montado a cada abertura, então já começa no horário do campo)
function ModalHorario({
  valor,
  onSelecionar,
  onFechar,
}) {
  const { preferencias } = useApp();

  const [hora, setHora] = useState(
    () =>
      lerHora(valor)?.h ??
      new Date().getHours()
  );

  const [minuto, setMinuto] = useState(
    () => lerHora(valor)?.min ?? 0
  );

  return (
    <Modal
      visible
      animationType={
        preferencias.reduzirAnimacoes
          ? 'none'
          : 'fade'
      }
      transparent
      onRequestClose={onFechar}
    >
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.caixaTitulo}>
            Selecionar horário
          </Text>

          <Text style={styles.horaGrande}>
            {dois(hora)}:{dois(minuto)}
          </Text>

          <View style={styles.roletas}>
            <View style={styles.roletaColuna}>
              <Text style={styles.roletaRotulo}>
                Hora
              </Text>

              <Roleta
                itens={HORAS}
                indice={hora}
                onMudar={setHora}
              />
            </View>

            <Text style={styles.doisPontos}>
              :
            </Text>

            <View style={styles.roletaColuna}>
              <Text style={styles.roletaRotulo}>
                Minuto
              </Text>

              <Roleta
                itens={MINUTOS}
                indice={minuto}
                onMudar={setMinuto}
              />
            </View>
          </View>

          <View style={styles.rodapeBotoes}>
            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={onFechar}
            >
              <Text style={styles.botaoSecundarioTexto}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoPrimario}
              onPress={() =>
                onSelecionar(
                  `${dois(hora)}:${dois(minuto)}`
                )
              }
            >
              <Text style={styles.botaoPrimarioTexto}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// CAMPO (texto + botão que abre o seletor)
// ============================================================
export default function CampoDataHora({
  tipo,
  rotulo,
  valor,
  onMudar,
}) {
  const [aberto, setAberto] = useState(false);
  const ehData = tipo === 'date';
  const texto = valor || '';

  const valido = !texto ||
    (ehData
      ? !!lerISO(texto)
      : !!lerHora(texto));

  const ajuda = ehData
    ? (
        texto && valido
          ? descreverData(texto)
          : 'Digite no formato AAAA-MM-DD ou DD/MM/AAAA, ou toque no calendário.'
      )
    : 'Digite no formato HH:MM ou toque no relógio para escolher.';

  function aoSairDoCampo() {
    const normalizado = ehData
      ? normalizarData(texto)
      : normalizarHora(texto);

    if (normalizado !== texto) {
      onMudar(normalizado);
    }
  }

  function selecionar(v) {
    setAberto(false);
    onMudar(v);
  }

  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>
        {rotulo}
      </Text>

      <View style={styles.linha}>
        <TextInput
          style={[
            styles.input,
            !valido && styles.inputInvalido,
          ]}
          value={texto}
          onChangeText={onMudar}
          onBlur={aoSairDoCampo}
          onSubmitEditing={aoSairDoCampo}
          placeholder={
            ehData
              ? 'AAAA-MM-DD'
              : 'HH:MM'
          }
          placeholderTextColor="#a89b8c"
          keyboardType={
            Platform.OS === 'web'
              ? 'default'
              : 'numbers-and-punctuation'
          }
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={ehData ? 10 : 5}
        />

        <TouchableOpacity
          style={styles.botaoAbrir}
          onPress={() => setAberto(true)}
          accessibilityLabel={
            ehData
              ? 'Abrir calendário'
              : 'Abrir seletor de horário'
          }
        >
          <Ionicons
            name={
              ehData
                ? 'calendar-outline'
                : 'time-outline'
            }
            size={20}
            color={COR}
          />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.ajuda,
          !valido && styles.ajudaErro,
        ]}
      >
        {valido
          ? ajuda
          : (
              ehData
                ? 'Data inválida — use AAAA-MM-DD (ex.: 2026-09-23).'
                : 'Horário inválido — use HH:MM (ex.: 19:30).'
            )}
      </Text>

      {aberto &&
        (
          ehData ? (
            <ModalCalendario
              valor={texto}
              onSelecionar={selecionar}
              onFechar={() =>
                setAberto(false)
              }
            />
          ) : (
            <ModalHorario
              valor={texto}
              onSelecionar={selecionar}
              onFechar={() =>
                setAberto(false)
              }
            />
          )
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Campo (mesmo visual dos outros campos do formulário)
  grupo: {
    marginBottom: 14,
  },

  rotulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a5048',
    marginBottom: 6,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 11,
    fontSize: 14,
    color: '#2b2320',
    backgroundColor: '#FAF7F2',
  },

  inputInvalido: {
    borderColor: '#B23A2E',
  },

  botaoAbrir: {
    width: 46,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COR,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  ajuda: {
    fontSize: 11,
    color: '#8a7d6f',
    marginTop: 4,
  },

  ajudaErro: {
    color: '#B23A2E',
    fontWeight: '600',
  },

  // Modais
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  caixa: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    maxWidth: 360,
  },

  caixaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2b2320',
    marginBottom: 10,
    textAlign: 'center',
  },

  rodapeBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  botaoSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  botaoSecundarioTexto: {
    color: '#2b2320',
    fontWeight: '700',
    fontSize: 14,
  },

  botaoPrimario: {
    flex: 1,
    backgroundColor: COR,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  botaoPrimarioTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Calendário
  calTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  calSeta: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3ECE2',
  },

  calMes: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#2b2320',
  },

  calSemana: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  calSemanaTexto: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#8a7d6f',
  },

  calGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calCelula: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calDia: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calDiaHoje: {
    borderWidth: 1.5,
    borderColor: '#B98B2E',
  },

  calDiaSelecionado: {
    backgroundColor: COR,
    borderColor: COR,
  },

  calDiaTexto: {
    fontSize: 14,
    color: '#2b2320',
  },

  calDiaTextoSelecionado: {
    color: '#fff',
    fontWeight: '700',
  },

  // Horário
  horaGrande: {
    fontSize: 34,
    fontWeight: '700',
    color: COR,
    textAlign: 'center',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },

  roletas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  roletaColuna: {
    alignItems: 'center',
  },

  roletaRotulo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a7d6f',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  roleta: {
    height: ALTURA_ITEM * ITENS_VISIVEIS,
    width: 84,
    overflow: 'hidden',
  },

  roletaFaixa: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ALTURA_ITEM,
    borderRadius: 10,
    backgroundColor: '#F3ECE2',
    borderWidth: 1,
    borderColor: '#e3ddd2',
  },

  roletaItem: {
    height: ALTURA_ITEM,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roletaTexto: {
    fontSize: 18,
    color: '#c9bfb3',
    fontVariant: ['tabular-nums'],
  },

  roletaTextoPerto: {
    fontSize: 20,
    color: '#8a7d6f',
  },

  roletaTextoAtivo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b2320',
  },

  doisPontos: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2b2320',
    marginTop: 20,
  },
});