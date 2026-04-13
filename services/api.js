import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Lotes ───────────────────────────────────────────
export const getLotes = (lotizacion_id) =>
  api.get('/api/lotes', { params: { lotizacion_id } }).then(r => r.data);

export const getLote = (id) =>
  api.get(`/api/lotes/${id}`).then(r => r.data);

export const actualizarLote = (id, datos) =>
  api.put(`/api/lotes/${id}`, datos).then(r => r.data);

export const revertirDisponible = (id, notas) =>
  api.patch(`/api/lotes/${id}/disponible`, { notas }).then(r => r.data);

// ─── Historial ───────────────────────────────────────
export const getHistorialLote = (id) =>
  api.get(`/api/historial/lote/${id}`).then(r => r.data);

// ─── Lotizaciones ────────────────────────────────────
export const getLotizaciones = () =>
  api.get('/api/lotizaciones').then(r => r.data);
