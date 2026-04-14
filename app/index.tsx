import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlanoSVG   from '../components/PlanoSVG';
import ModalLote  from '../components/ModalLote';
import { useLotes } from '../hooks/useLotes';
import { COLORS, ESTADOS } from '../constants';

const LOTIZACION_ID = 1; // Cambiá si tenés varios proyectos

export default function PlanoPantalla() {
  const { lotes, cargando, error, cargar, actualizar, poner_disponible } = useLotes(LOTIZACION_ID);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [modalVisible,     setModalVisible]     = useState(false);

  const handleTapLote = (id: string | number) => {
    const lote = lotes[id as keyof typeof lotes];
    if (!lote) return;
    setLoteSeleccionado(lote);
    setModalVisible(true);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setLoteSeleccionado(null);
  };

  // ── Conteo de estados para la leyenda ──
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
      <SafeAreaView style={styles.contenedor}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Refugio Verde</Text>
          <TouchableOpacity onPress={cargar} style={styles.btnActualizar}>
            <Text style={styles.btnActualizarTxt}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* ── Leyenda de estados ── */}
        <View style={styles.leyenda}>
          {Object.entries(ESTADOS).map(([key, val]) => (
            <View key={key} style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: val.color }]} />
              <Text style={styles.leyendaTxt}>
                {val.label} ({conteo[key] ?? 0})
              </Text>
            </View>
          ))}
        </View>

        {/* ── Plano SVG interactivo ── */}
        <View style={styles.planoWrap}>
          <PlanoSVG
            lotes={lotes}
            onTapLote={handleTapLote}
            // svgWidth={600}
            // svgHeight={520}
          />
        </View>

        {/* ── Modal al tocar un lote ── */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primario,
  },
  titulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leyendaDot:  { width: 12, height: 12, borderRadius: 6 },
  leyendaTxt:  { fontSize: 12, color: COLORS.texto },
  planoWrap: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e8e8e0',
    elevation: 2,
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
