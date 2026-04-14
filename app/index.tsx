import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, SafeAreaView, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlanoSVG   from '../components/PlanoSVG';
import ModalLote  from '../components/ModalLote';
import { useLotes } from '../hooks/useLotes';
import { COLORS, ESTADOS } from '../constants';

const LOTIZACION_ID  = 1;
const DARK_MODE_KEY  = 'dark_mode';

export default function PlanoPantalla() {
  const { lotes, cargando, error, cargar, actualizar, poner_disponible } = useLotes(LOTIZACION_ID);
  const [loteSeleccionado, setLoteSeleccionado] = useState<any>(null);
  const [modalVisible,     setModalVisible]     = useState(false);
  const [dark,             setDark]             = useState(false);
  const [darkCargado,      setDarkCargado]      = useState(false);

  // Cargar preferencia de dark mode al iniciar
  useEffect(() => {
    AsyncStorage.getItem(DARK_MODE_KEY).then(val => {
      if (val !== null) setDark(val === 'true');
      setDarkCargado(true);
    }).catch(() => setDarkCargado(true));
  }, []);

  // Guardar preferencia cuando cambia
  const toggleDark = (val: boolean) => {
    setDark(val);
    AsyncStorage.setItem(DARK_MODE_KEY, String(val)).catch(() => {});
  };

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

  // Esperar a cargar la preferencia para evitar flash de modo incorrecto
  if (!darkCargado) {
    return <View style={styles.centro}><ActivityIndicator size="large" color={COLORS.primario}/></View>;
  }

  if (cargando) {
    return (
      <View style={[styles.centro, dark && styles.centroDark]}>
        <ActivityIndicator size="large" color={COLORS.primario} />
        <Text style={[styles.cargandoTxt, dark && { color: '#aaa' }]}>Cargando plano...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centro, dark && styles.centroDark]}>
        <Text style={styles.errorTxt}>{error}</Text>
        <TouchableOpacity style={styles.btnReintentar} onPress={cargar}>
          <Text style={styles.btnReintentarTxt}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bgBar = dark ? '#16162a' : COLORS.primario;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.contenedor, dark && styles.contenedorDark]}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: bgBar }]}>
          <Text style={styles.titulo}>Refugio Verde</Text>
          <View style={styles.headerRight}>
            {/* Leyenda compacta */}
            {Object.entries(ESTADOS).map(([key, val]: any) => (
              <View key={key} style={styles.leyendaItem}>
                <View style={[styles.leyendaDot, { backgroundColor: val.color }]} />
                <Text style={styles.leyendaNum}>{conteo[key] ?? 0}</Text>
              </View>
            ))}
            {/* Dark mode switch */}
            <Switch
              value={dark}
              onValueChange={toggleDark}
              trackColor={{ false: '#555', true: '#4E9E4D' }}
              thumbColor={dark ? '#A8E0A7' : '#ccc'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
            <TouchableOpacity onPress={cargar} style={styles.btnIcon}>
              <Text style={styles.btnIconTxt}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plano / Cuadrícula */}
        <PlanoSVG
          lotes={lotes}
          onTapLote={handleTapLote}
          dark={dark}
        />

        {/* Modal */}
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
  contenedor:       { flex: 1, backgroundColor: COLORS.fondo },
  contenedorDark:   { backgroundColor: '#0f0f1a' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  titulo:           { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerRight:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaItem:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  leyendaDot:       { width: 8, height: 8, borderRadius: 4 },
  leyendaNum:       { color: '#fff', fontSize: 11 },
  btnIcon:          { padding: 6 },
  btnIconTxt:       { color: '#fff', fontSize: 18 },
  centro:           { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: COLORS.fondo },
  centroDark:       { backgroundColor: '#0f0f1a' },
  cargandoTxt:      { color: COLORS.textoSuave, fontSize: 14 },
  errorTxt:         { color: COLORS.peligro, fontSize: 15, textAlign: 'center', paddingHorizontal: 30 },
  btnReintentar:    { backgroundColor: COLORS.primario, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  btnReintentarTxt: { color: '#fff', fontWeight: 'bold' },
});