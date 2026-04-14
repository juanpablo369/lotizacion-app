import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getLotes } from '../services/api';
import { generarPDFLote, compartirPDF, descargarPDF } from '../services/pdf';
import { COLORS, ESTADOS } from '../constants';

interface Props {
  visible: boolean;
  onCerrar: () => void;
  dark?: boolean;
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-EC', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PantallaHistorial({ visible, onCerrar, dark = false }: Props) {
  const [lotes, setLotes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pdfId, setPdfId] = useState<string | null>(null); // lote generando PDF

  const bg = dark ? '#0f0f1a' : '#F5F5F0';
  const bgCard = dark ? '#1e1e30' : '#ffffff';
  const border = dark ? '#2a2a3a' : '#e0e0e0';
  const txt = dark ? '#e0e0e0' : '#222';
  const soft = dark ? '#777' : '#999';

  useEffect(() => {
    if (visible) cargar();
  }, [visible]);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await getLotes(1);
      // Solo vendidos y reservados, ordenados por id
      const filtrados = data
        .filter((l: any) => l.estado === 'vendido' || l.estado === 'reservado')
        .sort((a: any, b: any) => a.id.localeCompare(b.id));
      setLotes(filtrados);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el historial.');
    } finally {
      setCargando(false);
    }
  };

  const handlePDF = async (lote: any) => {
    Alert.alert(
      `${lote.id.replace('lote_0', 'L').replace('lote_', 'L')} — ${lote.comprador ?? 'Sin nombre'}`,
      '¿Qué deseas hacer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Compartir',
          onPress: async () => {
            setPdfId(lote.id);
            try {
              const uri = await generarPDFLote(lote);
              const nombre = `lote_${lote.id}_${(lote.comprador ?? 'sin_nombre').replace(/\s+/g, '_')}.pdf`;
              await compartirPDF(uri, nombre);
            } catch (e: any) {
              console.log('PDF ERROR:', e?.message ?? e);
              Alert.alert('Error', e?.message ?? 'No se pudo generar el PDF.');
            } finally {
              setPdfId(null);
            }
          },
        },
        {
          text: 'Descargar',
          onPress: async () => {
            setPdfId(lote.id);
            try {
              const uri = await generarPDFLote(lote);
              const nombre = `lote_${lote.id}_${(lote.comprador ?? 'sin_nombre').replace(/\s+/g, '_')}.pdf`;
              const destino = await descargarPDF(uri, nombre);
              Alert.alert('Descargado', `Guardado en:\n${destino}`);
            } catch {
              Alert.alert('Error', 'No se pudo descargar el PDF.');
            } finally {
              setPdfId(null);
            }
          },
        },
      ]
    );
  };

  const vendidos = lotes.filter(l => l.estado === 'vendido').length;
  const reservados = lotes.filter(l => l.estado === 'reservado').length;
  const totalVendido = lotes
    .filter(l => l.estado === 'vendido' && l.precio)
    .reduce((s, l) => s + Number(l.precio), 0);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCerrar}>
      <View style={[styles.contenedor, { backgroundColor: bg }]}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: dark ? '#16162a' : COLORS.primario }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="assignment" size={20} color="#fff" />
            <Text style={styles.headerTxt}>Bitácora</Text>
          </View>
          <TouchableOpacity onPress={onCerrar} style={styles.btnCerrar}>
            <Text style={styles.btnCerrarTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primario} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>

            {/* Resumen */}
            <View style={[styles.resumen, { backgroundColor: bgCard, borderColor: border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: '#ABABAB' }]}>{vendidos}</Text>
                <Text style={[styles.statLbl, { color: soft }]}>Vendidos</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: '#C49A20' }]}>{reservados}</Text>
                <Text style={[styles.statLbl, { color: soft }]}>Reservados</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: txt }]}>
                  ${totalVendido >= 1000 ? (totalVendido / 1000).toFixed(0) + 'k' : totalVendido}
                </Text>
                <Text style={[styles.statLbl, { color: soft }]}>Total vendido</Text>
              </View>
            </View>

            {lotes.length === 0 && (
              <Text style={[styles.vacio, { color: soft }]}>No hay lotes vendidos o reservados aún.</Text>
            )}

            {/* Lista de lotes */}
            {lotes.map(lote => {
              const num = lote.id.replace('lote_0', 'L').replace('lote_', 'L');
              const color = lote.estado === 'vendido' ? '#ABABAB' : '#F0C060';
              const label = lote.estado === 'vendido' ? 'Vendido' : 'Reservado';
              const generando = pdfId === lote.id;

              return (
                <View key={lote.id} style={[styles.card, { backgroundColor: bgCard, borderColor: border }]}>
                  <View style={[styles.cardStripe, { backgroundColor: color }]} />
                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.cardTitleRow}>
                          <Text style={[styles.cardNum, { color: txt }]}>{num}</Text>
                          <View style={[styles.badge, { backgroundColor: color + '33' }]}>
                            <Text style={[styles.badgeTxt, { color }]}>{label}</Text>
                          </View>
                        </View>
                        {lote.comprador && (
                          <Text style={[styles.cardNombre, { color: txt }]}>{lote.comprador}</Text>
                        )}
                        {lote.cedula && (
                          <Text style={[styles.cardDato, { color: soft }]}>CI: {lote.cedula}</Text>
                        )}
                        {lote.telefono && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <MaterialIcons name="phone" size={12} color={soft} />
                            <Text style={[styles.cardDato, { color: soft }]}>{lote.telefono}</Text>
                          </View>
                        )}
                        {lote.email && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <MaterialIcons name="email" size={12} color={soft} />
                            <Text style={[styles.cardDato, { color: soft }]}>{lote.email}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.cardRight}>
                        {lote.precio && (
                          <Text style={[styles.cardPrecio, { color: txt }]}>
                            ${Number(lote.precio).toLocaleString('es-EC')}
                          </Text>
                        )}
                        {lote.monto_reserva && (
                          <Text style={[styles.cardReserva, { color: soft }]}>
                            Res ${Number(lote.monto_reserva).toLocaleString('es-EC')}
                          </Text>
                        )}
                        {lote.updated_at && (
                          <Text style={[styles.cardFecha, { color: soft }]}>{formatFecha(lote.updated_at)}</Text>
                        )}
                      </View>
                    </View>

                    {/* Botón PDF */}
                    <TouchableOpacity
                      style={[styles.btnPDF, { borderColor: border }, generando && { opacity: 0.5 }]}
                      onPress={() => handlePDF(lote)}
                      disabled={generando}
                    >
                      {generando
                        ? <ActivityIndicator size="small" color={txt} />
                        : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MaterialIcons name="picture-as-pdf" size={16} color={txt} />
                            <Text style={[styles.btnPDFTxt, { color: txt }]}>Descargar / Compartir PDF</Text>
                          </View>
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50 },
  headerTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  btnCerrar: { padding: 6 },
  btnCerrarTxt: { color: '#fff', fontSize: 20 },
  resumen: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 16, marginBottom: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLbl: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, marginHorizontal: 8 },
  vacio: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  card: { borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  cardStripe: { height: 4 },
  cardBody: { padding: 12 },
  cardTop: { flexDirection: 'row', gap: 8 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardNum: { fontSize: 14, fontWeight: 'bold' },
  cardNombre: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  cardDato: { fontSize: 12, marginBottom: 1 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'flex-start', minWidth: 100 },
  cardPrecio: { fontSize: 14, fontWeight: 'bold' },
  cardReserva: { fontSize: 12, marginTop: 2 },
  cardFecha: { fontSize: 10, marginTop: 4 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: '600' },
  btnPDF: { marginTop: 10, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  btnPDFTxt: { fontSize: 13, fontWeight: '500' },
});
