import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, SafeAreaView, Switch,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlanoSVG   from '../components/PlanoSVG';
import ModalLote  from '../components/ModalLote';
import { useLotes } from '../hooks/useLotes';
import { COLORS, ESTADOS } from '../constants';

const LOTIZACION_ID = 1;

export default function PlanoPantalla() {
  const { lotes, cargando, error, cargar, actualizar, poner_disponible } = useLotes(LOTIZACION_ID);
  const [loteSeleccionado, setLoteSeleccionado] = useState<any>(null);
  const [modalVisible,     setModalVisible]     = useState(false);
  const [dark,             setDark]             = useState(false);

  const handleTapLote = (id: string) => {
    const lote = (lotes as any)[id];
    if (!lote) return;
    setLoteSeleccionado(lote);
    setModalVisible(true);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setLoteSeleccionado(null);
  };

  const conteo = Object.values(lotes).reduce((acc: Record<string, number>, l: any) => {
    acc[l.estado] = (acc[l.estado] ?? 0) + 1;
    return acc;
  }, {});

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={COLORS.primario} />
        <Text style={styles.cargandoTxt}>Cargando plano...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.errorTxt}>{error}</Text>
        <TouchableOpacity style={styles.btnReintentar} onPress={cargar}>
          <Text style={styles.btnReintentarTxt}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.contenedor, dark && styles.contenedorDark]}>

        {/* ── Header ── */}
        <View style={[styles.header, dark && styles.headerDark]}>
          <Text style={styles.titulo}>Refugio Verde</Text>
          <View style={styles.headerRight}>
            {/* Dark mode switch */}
            <Switch
              value={dark}
              onValueChange={setDark}
              trackColor={{ false: '#555', true: '#4E9E4D' }}
              thumbColor={dark ? '#A8E0A7' : '#ccc'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
            <TouchableOpacity onPress={cargar} style={styles.btnActualizar}>
              <Text style={styles.btnActualizarTxt}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Leyenda de estados ── */}
        <View style={[styles.leyenda, dark && styles.leyendaDark]}>
          {Object.entries(ESTADOS).map(([key, val]) => (
            <View key={key} style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: (val as any).color }]} />
              <Text style={[styles.leyendaTxt, dark && styles.leyendaTxtDark]}>
                {(val as any).label} ({conteo[key] ?? 0})
              </Text>
            </View>
          ))}
        </View>

        {/* ── Plano / Cuadrícula ── */}
        <View style={[styles.planoWrap, dark && styles.planoWrapDark]}>
          <PlanoSVG
            lotes={lotes}
            onTapLote={handleTapLote}
            dark={dark}
          />
        </View>

        {/* ── Modal ── */}
        <ModalLote
          visible={modalVisible}
          lote={loteSeleccionado}
          onCerrar={handleCerrarModal}
          onGuardar={actualizar}
          onDisponible={poner_disponible}
        />

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORS.fondo,
  },
  contenedorDark: {
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primario,
  },
  headerDark: {
    backgroundColor: '#16162a',
  },
  titulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btnActualizar:    { padding: 8 },
  btnActualizarTxt: { color: '#fff', fontSize: 22 },
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borde,
  },
  leyendaDark: {
    backgroundColor: '#16162a',
    borderBottomColor: '#2a2a3a',
  },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leyendaDot:  { width: 12, height: 12, borderRadius: 6 },
  leyendaTxt:  { fontSize: 12, color: COLORS.texto },
  leyendaTxtDark: { color: '#aaa' },
  planoWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  planoWrapDark: {
    backgroundColor: '#0f0f1a',
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cargandoTxt:      { color: COLORS.textoSuave, fontSize: 14 },
  errorTxt:         { color: COLORS.peligro, fontSize: 15, textAlign: 'center', paddingHorizontal: 30 },
  btnReintentar:    { backgroundColor: COLORS.primario, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  btnReintentarTxt: { color: '#fff', fontWeight: 'bold' },
});