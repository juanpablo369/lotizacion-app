import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, SafeAreaView, Switch, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlanoSVG           from '../components/PlanoSVG';
import ModalLote          from '../components/ModalLote';
// import PantallaPIN        from '../components/PantallaPIN';
import PantallaHistorial  from '../components/PantallaHistorial';
import { useLotes }       from '../hooks/useLotes';
// import { useAuth  }       from '../hooks/useAuth';
import { COLORS, ESTADOS } from '../constants';
import { generarPDFGeneral, compartirPDF, descargarPDF } from '../services/pdf';

const LOTIZACION_ID = 1;
const DARK_MODE_KEY = 'dark_mode';

export default function PlanoPantalla() {
  // const { token, checking, login, logout }                       = useAuth();
  const { lotes, cargando, error, cargar, actualizar, poner_disponible } = useLotes(LOTIZACION_ID);
  const [loteSeleccionado, setLoteSeleccionado] = useState<any>(null);
  const [modalVisible,     setModalVisible]     = useState(false);
  const [historialVisible, setHistorialVisible] = useState(false);
  const [dark,             setDark]             = useState(false);
  const [darkCargado,      setDarkCargado]      = useState(false);
  const [generandoPDF,     setGenerandoPDF]     = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DARK_MODE_KEY).then(val => {
      if (val !== null) setDark(val === 'true');
      setDarkCargado(true);
    }).catch(() => setDarkCargado(true));
  }, []);

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

  const handlePDFGeneral = () => {
    Alert.alert(
      '📄 Reporte general',
      '¿Qué querés hacer con el reporte de todos los propietarios?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '📤 Compartir',
          onPress: async () => {
            setGenerandoPDF(true);
            try {
              const uri = await generarPDFGeneral(lotes);
              await compartirPDF(uri, 'refugio_verde_reporte.pdf');
            } catch {
              Alert.alert('Error', 'No se pudo generar el PDF.');
            } finally {
              setGenerandoPDF(false);
            }
          },
        },
        {
          text: '💾 Descargar',
          onPress: async () => {
            setGenerandoPDF(true);
            try {
              const uri = await generarPDFGeneral(lotes);
              const destino = await descargarPDF(uri, 'refugio_verde_reporte.pdf');
              Alert.alert('✅ Descargado', `Guardado en:\n${destino}`);
            } catch {
              Alert.alert('Error', 'No se pudo generar el PDF.');
            } finally {
              setGenerandoPDF(false);
            }
          },
        },
      ]
    );
  };

  const conteo = Object.values(lotes).reduce((acc: Record<string, number>, l: any) => {
    acc[l.estado] = (acc[l.estado] ?? 0) + 1;
    return acc;
  }, {});

  if (!darkCargado) {
    return <View style={styles.centro}><ActivityIndicator size="large" color={COLORS.primario}/></View>;
  }

  // if (!token) return <PantallaPIN onAutenticado={login}/>;

  const bg    = dark ? '#0f0f1a' : COLORS.fondo;
  const bgBar = dark ? '#16162a' : COLORS.primario;

  if (cargando) {
    return (
      <View style={[styles.centro, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={COLORS.primario} />
        <Text style={[styles.cargandoTxt, dark && { color: '#aaa' }]}>Cargando plano...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centro, { backgroundColor: bg }]}>
        <Text style={styles.errorTxt}>{error}</Text>
        <TouchableOpacity style={styles.btnReintentar} onPress={cargar}>
          <Text style={styles.btnReintentarTxt}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.contenedor, { backgroundColor: bg }]}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: bgBar }]}>
          {/* Título + leyenda */}
          <View style={styles.headerLeft}>
            <Text style={styles.titulo}>Refugio Verde</Text>
            <View style={styles.leyendaRow}>
              {Object.entries(ESTADOS).map(([key, val]: any) => (
                <View key={key} style={styles.leyendaItem}>
                  <View style={[styles.leyendaDot, { backgroundColor: val.color }]} />
                  <Text style={styles.leyendaNum}>{conteo[key] ?? 0}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Botones derecha */}
          <View style={styles.headerRight}>
            {/* Dark mode */}
            <Switch
              value={dark}
              onValueChange={toggleDark}
              trackColor={{ false: '#555', true: '#4E9E4D' }}
              thumbColor={dark ? '#A8E0A7' : '#ccc'}
              style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
            />
            {/* Historial / Bitácora */}
            <TouchableOpacity onPress={() => setHistorialVisible(true)} style={styles.btnIcon}>
              <Text style={styles.btnIconTxt}>📋</Text>
            </TouchableOpacity>
            {/* PDF general */}
            <TouchableOpacity onPress={handlePDFGeneral} style={styles.btnIcon} disabled={generandoPDF}>
              {generandoPDF
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.btnIconTxt}>📄</Text>
              }
            </TouchableOpacity>
            {/* Reload */}
            <TouchableOpacity onPress={cargar} style={styles.btnIcon}>
              <Text style={styles.btnIconTxt}>↻</Text>
            </TouchableOpacity>
            {/* Logout
            <TouchableOpacity onPress={logout} style={styles.btnIcon}>
              <Text style={styles.btnIconTxt}>⏻</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Plano / Lista */}
        <PlanoSVG lotes={lotes} onTapLote={handleTapLote} dark={dark} />

        {/* Modal lote */}
        <ModalLote
          visible={modalVisible}
          lote={loteSeleccionado}
          onCerrar={handleCerrarModal}
          onGuardar={actualizar}
          onDisponible={poner_disponible}
        />

        {/* Pantalla historial */}
        <PantallaHistorial
          visible={historialVisible}
          onCerrar={() => setHistorialVisible(false)}
          dark={dark}
        />

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contenedor:       { flex: 1 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, paddingTop: 14 },
  headerLeft:       { flex: 1 },
  titulo:           { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  leyendaRow:       { flexDirection: 'row', gap: 8, marginTop: 3 },
  leyendaItem:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  leyendaDot:       { width: 7, height: 7, borderRadius: 4 },
  leyendaNum:       { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  headerRight:      { flexDirection: 'row', alignItems: 'center', gap: 2 },
  btnIcon:          { padding: 6 },
  btnIconTxt:       { fontSize: 17 },
  centro:           { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  cargandoTxt:      { color: COLORS.textoSuave, fontSize: 14 },
  errorTxt:         { color: COLORS.peligro, fontSize: 15, textAlign: 'center', paddingHorizontal: 30 },
  btnReintentar:    { backgroundColor: COLORS.primario, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  btnReintentarTxt: { color: '#fff', fontWeight: 'bold' },
});