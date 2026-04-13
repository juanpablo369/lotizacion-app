import { useState, useEffect, useCallback } from 'react';
import { getLotes, actualizarLote, revertirDisponible } from '../services/api';

export function useLotes(lotizacion_id) {
  const [lotes, setLotes]       = useState({});   // { lote_001: { estado, color, ... } }
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getLotes(lotizacion_id);
      const mapa = {};
      data.forEach(l => { mapa[l.id] = l; });
      setLotes(mapa);
    } catch (e) {
      setError('No se pudo cargar el plano. Verificá tu conexión.');
    } finally {
      setCargando(false);
    }
  }, [lotizacion_id]);

  useEffect(() => { cargar(); }, [cargar]);

  const actualizar = useCallback(async (id, datos) => {
    const loteActual = lotes[id];
    // Optimistic update
    setLotes(prev => ({
      ...prev,
      [id]: { ...prev[id], ...datos, color: colorEstado(datos.estado ?? prev[id].estado) },
    }));
    try {
      const actualizado = await actualizarLote(id, datos);
      setLotes(prev => ({ ...prev, [id]: actualizado }));
      return actualizado;
    } catch (e) {
      // Revertir si falla
      setLotes(prev => ({ ...prev, [id]: loteActual }));
      throw e;
    }
  }, [lotes]);

  const poner_disponible = useCallback(async (id, notas) => {
    const loteActual = lotes[id];
    setLotes(prev => ({
      ...prev,
      [id]: { ...prev[id], estado: 'disponible', color: '#7BC67A' },
    }));
    try {
      const actualizado = await revertirDisponible(id, notas);
      setLotes(prev => ({ ...prev, [id]: actualizado }));
      return actualizado;
    } catch (e) {
      setLotes(prev => ({ ...prev, [id]: loteActual }));
      throw e;
    }
  }, [lotes]);

  return { lotes, cargando, error, cargar, actualizar, poner_disponible };
}

function colorEstado(estado) {
  const m = { disponible: '#7BC67A', reservado: '#F0C060', vendido: '#ABABAB' };
  return m[estado] ?? '#CCCCCC';
}
