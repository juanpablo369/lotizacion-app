import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { getHistorialLote } from '../services/api';
import { COLORS, ESTADOS, USUARIO_ID } from '../constants';

export default function ModalLote({ visible, lote, onCerrar, onGuardar, onDisponible }) {
  const [tab, setTab]             = useState('accion');
  const [estado, setEstado]       = useState('disponible');
  const [precio, setPrecio]       = useState('');
  const [reserva, setReserva]     = useState('');
  const [comprador, setComprador] = useState('');
  const [telefono, setTelefono]   = useState('');
  const [cedula, setCedula]       = useState('');
  const [email, setEmail]         = useState('');
  const [notas, setNotas]         = useState('');
  const [guardando, setGuardando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadHist, setLoadHist]   = useState(false);

  useEffect(() => {
    if (lote && visible) {
      setTab('accion');
      setEstado(lote.estado ?? 'disponible');
      setPrecio(lote.precio?.toString() ?? '');
      setReserva(lote.monto_reserva?.toString() ?? '');
      setComprador(lote.comprador ?? '');
      setTelefono(lote.telefono ?? '');
      setCedula(lote.cedula ?? '');
      setEmail(lote.email ?? '');
      setNotas(lote.notas ?? '');
    }
  }, [lote, visible]);

  useEffect(() => {
    if (tab === 'historial' && lote) {
      setLoadHist(true);
      getHistorialLote(lote.id)
        .then(setHistorial)
        .catch(() => setHistorial([]))
        .finally(() => setLoadHist(false));
    }
  }, [tab, lote]);

  const handleGuardar = async () => {
    if (!lote) return;

    if (estado === 'vendido' && !precio) {
      return Alert.alert('Falta el precio', 'Ingresá el precio de venta.');
    }
    if (estado === 'reservado' && !reserva) {
      return Alert.alert('Falta el monto', 'Ingresá el monto de la reserva.');
    }
    if ((estado === 'vendido' || estado === 'reservado') && !comprador) {
      return Alert.alert('Falta el comprador', 'Ingresá el nombre del comprador.');
    }

    try {
      setGuardando(true);
      if (estado === 'disponible') {
        await onDisponible(lote.id, notas || 'Revertido a disponible');
      } else {
        await onGuardar(lote.id, {
          estado,
          precio:        precio    ? parseFloat(precio)  : null,
          monto_reserva: reserva   ? parseFloat(reserva) : null,
          comprador:     comprador || null,
          telefono:      telefono  || null,
          cedula:        cedula    || null,
          email:         email     || null,
          notas:         notas     || null,
          usuario_id:    USUARIO_ID,
        });
      }
      onCerrar();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar. Verificá tu conexión.');
    } finally {
      setGuardando(false);
    }
  };

  if (!lote) return null;

  const colorActual = ESTADOS[estado]?.color ?? COLORS.disponible;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={[styles.header, { borderLeftColor: colorActual }]}>
            <View>
              <Text style={styles.titulo}>{lote.id.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.subtitulo}>
                {lote.area_m2 ? `${lote.area_m2} m²  ·  ` : ''}
                Estado actual: <Text style={{ color: colorActual, fontWeight: 'bold' }}>
                  {ESTADOS[lote.estado]?.label ?? lote.estado}
                </Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onCerrar} style={styles.btnCerrar}>
              <Text style={styles.btnCerrarTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {['accion', 'historial'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActivo]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabTxt, tab === t && styles.tabTxtActivo]}>
                  {t === 'accion' ? 'Acción' : 'Historial'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.cuerpo} keyboardShouldPersistTaps="handled">

            {/* TAB ACCIÓN */}
            {tab === 'accion' && (
              <>
                <Text style={styles.label}>Nuevo estado</Text>
                <View style={styles.estadoRow}>
                  {Object.entries(ESTADOS).map(([key, val]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, { borderColor: val.color }, estado === key && { backgroundColor: val.color }]}
                      onPress={() => setEstado(key)}
                    >
                      <Text style={[styles.chipTxt, estado === key && { color: '#fff', fontWeight: 'bold' }]}>
                        {val.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {estado !== 'disponible' && (
                  <>
                    <Campo label="Comprador / Cliente" value={comprador} onChangeText={setComprador} placeholder="Nombre completo" />
                    <Campo label="Cédula / RUC" value={cedula} onChangeText={setCedula} placeholder="0912345678" keyboardType="numeric" />
                    <Campo label="Teléfono" value={telefono} onChangeText={setTelefono} placeholder="0991234567" keyboardType="phone-pad" />
                    <Campo label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
                    {estado === 'vendido' && (
                      <Campo label="Precio de venta ($)" value={precio} onChangeText={setPrecio} placeholder="80000" keyboardType="numeric" />
                    )}
                    {estado === 'reservado' && (
                      <>
                        <Campo label="Monto de reserva ($)" value={reserva} onChangeText={setReserva} placeholder="1000" keyboardType="numeric" />
                        <Campo label="Precio acordado ($)" value={precio} onChangeText={setPrecio} placeholder="75000" keyboardType="numeric" />
                      </>
                    )}
                  </>
                )}

                <Campo
                  label="Notas internas"
                  value={notas}
                  onChangeText={setNotas}
                  placeholder="Observaciones..."
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.btnGuardar, { backgroundColor: colorActual }, guardando && styles.btnDeshabilitado]}
                  onPress={handleGuardar}
                  disabled={guardando}
                >
                  {guardando
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnGuardarTxt}>Guardar cambios</Text>
                  }
                </TouchableOpacity>
              </>
            )}

            {/* TAB HISTORIAL */}
            {tab === 'historial' && (
              loadHist
                ? <ActivityIndicator style={{ marginTop: 30 }} color={COLORS.primario} />
                : historial.length === 0
                  ? <Text style={styles.vacio}>Sin cambios registrados aún.</Text>
                  : historial.map(h => (
                      <View key={h.id} style={styles.histItem}>
                        <View style={styles.histHeader}>
                          <View style={[styles.badge, { backgroundColor: ESTADOS[h.estado_nuevo]?.color ?? '#ccc' }]}>
                            <Text style={styles.badgeTxt}>{ESTADOS[h.estado_nuevo]?.label ?? h.estado_nuevo}</Text>
                          </View>
                          <Text style={styles.histFecha}>{formatFecha(h.fecha)}</Text>
                        </View>
                        {h.comprador     && <Text style={styles.histDato}>👤 {h.comprador}</Text>}
                        {h.email         && <Text style={styles.histDato}>✉️  {h.email}</Text>}
                        {h.precio        && <Text style={styles.histDato}>💰 ${Number(h.precio).toLocaleString()}</Text>}
                        {h.monto_reserva && <Text style={styles.histDato}>🔒 Reserva: ${Number(h.monto_reserva).toLocaleString()}</Text>}
                        {h.notas         && <Text style={styles.histNota}>{h.notas}</Text>}
                        {h.vendedor      && <Text style={styles.histVendedor}>por {h.vendedor}</Text>}
                        {h.estado_anterior && (
                          <Text style={styles.histAnterior}>
                            Antes: {ESTADOS[h.estado_anterior]?.label ?? h.estado_anterior}
                          </Text>
                        )}
                      </View>
                    ))
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Campo({ label, ...props }) {
  return (
    <View style={styles.campoWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, props.multiline && styles.inputMulti]} {...props} />
    </View>
  );
}

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: COLORS.blanco, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%', paddingBottom: 30 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, borderLeftWidth: 5, borderTopLeftRadius: 20 },
  titulo:       { fontSize: 18, fontWeight: 'bold', color: COLORS.texto },
  subtitulo:    { fontSize: 13, color: COLORS.textoSuave, marginTop: 2 },
  btnCerrar:    { padding: 4 },
  btnCerrarTxt: { fontSize: 18, color: COLORS.textoSuave },
  tabs:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.borde, marginHorizontal: 20 },
  tab:          { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActivo:    { borderBottomWidth: 2, borderBottomColor: COLORS.primario },
  tabTxt:       { color: COLORS.textoSuave, fontSize: 14 },
  tabTxtActivo: { color: COLORS.primario, fontSize: 14, fontWeight: 'bold' },
  cuerpo:       { paddingHorizontal: 20, marginTop: 12 },
  label:        { fontSize: 12, color: COLORS.textoSuave, marginBottom: 4, marginTop: 12 },
  estadoRow:    { flexDirection: 'row', gap: 8 },
  chip:         { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
  chipTxt:      { fontSize: 13, color: COLORS.texto },
  campoWrap:    { marginTop: 4 },
  input:        { borderWidth: 1, borderColor: COLORS.borde, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: COLORS.texto, backgroundColor: '#FAFAFA' },
  inputMulti:   { minHeight: 70, textAlignVertical: 'top' },
  btnGuardar:   { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24, marginBottom: 8 },
  btnDeshabilitado: { opacity: 0.6 },
  btnGuardarTxt:{ color: '#fff', fontWeight: 'bold', fontSize: 16 },
  histItem:     { borderWidth: 1, borderColor: COLORS.borde, borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: '#FAFAFA' },
  histHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badge:        { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt:     { fontSize: 12, fontWeight: 'bold', color: '#333' },
  histFecha:    { fontSize: 11, color: COLORS.textoSuave },
  histDato:     { fontSize: 13, color: COLORS.texto, marginBottom: 2 },
  histNota:     { fontSize: 12, color: COLORS.textoSuave, fontStyle: 'italic', marginTop: 4 },
  histVendedor: { fontSize: 11, color: COLORS.textoSuave, marginTop: 4 },
  histAnterior: { fontSize: 11, color: COLORS.textoSuave },
  vacio:        { textAlign: 'center', color: COLORS.textoSuave, marginTop: 30, fontSize: 14 },
});