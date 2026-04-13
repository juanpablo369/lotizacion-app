import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../constants';

// ─────────────────────────────────────────────────────────
//  PlanoSVG
//  Props:
//    lotes      → mapa { lote_id: { estado, color, ... } }
//    onTapLote  → fn(lote_id) al tocar un lote
//    svgWidth   → ancho del viewBox del SVG (ej: 800)
//    svgHeight  → alto del viewBox del SVG (ej: 600)
// ─────────────────────────────────────────────────────────
export default function PlanoSVG({ lotes, onTapLote, svgWidth = 800, svgHeight = 600 }) {
  // ── Gestures: pinch zoom + pan ──
  const escala      = useSharedValue(1);
  const escalaBase  = useSharedValue(1);
  const transX      = useSharedValue(0);
  const transY      = useSharedValue(0);
  const transXBase  = useSharedValue(0);
  const transYBase  = useSharedValue(0);

  const MIN_SCALE = 0.8;
  const MAX_SCALE = 5;

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      escala.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, escalaBase.value * e.scale));
    })
    .onEnd(() => {
      escalaBase.value = escala.value;
    });

  const pan = Gesture.Pan()
    .onUpdate(e => {
      transX.value = transXBase.value + e.translationX;
      transY.value = transYBase.value + e.translationY;
    })
    .onEnd(() => {
      transXBase.value = transX.value;
      transYBase.value = transY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      escala.value     = withSpring(1);
      escalaBase.value = 1;
      transX.value     = withSpring(0);
      transY.value     = withSpring(0);
      transXBase.value = 0;
      transYBase.value = 0;
    });

  const composed = Gesture.Simultaneous(pinch, pan);
  const all      = Gesture.Exclusive(doubleTap, composed);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: transX.value },
      { translateY: transY.value },
      { scale: escala.value },
    ],
  }));

  return (
    <GestureDetector gesture={all}>
      <View style={styles.contenedor}>
        <Animated.View style={animStyle}>
          <Svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            {/* ── Renderizás los lotes del plano ── */}
            {LOTES_EJEMPLO.map(lote => {
              const info   = lotes[lote.id];
              const color  = info?.color ?? COLORS.disponible;
              const estado = info?.estado ?? 'disponible';

              return (
                <G
                  key={lote.id}
                  onPress={() => onTapLote(lote.id)}
                >
                  <Rect
                    x={lote.x}
                    y={lote.y}
                    width={lote.w}
                    height={lote.h}
                    fill={color}
                    stroke="#555"
                    strokeWidth={1}
                    opacity={0.9}
                  />
                  <SvgText
                    x={lote.x + lote.w / 2}
                    y={lote.y + lote.h / 2 - 6}
                    fontSize={9}
                    fontWeight="bold"
                    fill="#333"
                    textAnchor="middle"
                  >
                    {lote.id.replace('lote_', 'L')}
                  </SvgText>
                  {info?.precio && (
                    <SvgText
                      x={lote.x + lote.w / 2}
                      y={lote.y + lote.h / 2 + 8}
                      fontSize={7}
                      fill="#444"
                      textAnchor="middle"
                    >
                      ${(info.precio / 1000).toFixed(0)}k
                    </SvgText>
                  )}
                </G>
              );
            })}

            {/* ── Calles / etiquetas del plano (estáticas) ── */}
            <SvgText x={svgWidth / 2} y={svgHeight - 10} fontSize={10} fill="#888" textAnchor="middle">
              Calle Principal
            </SvgText>
          </Svg>
        </Animated.View>

        {/* Hint */}
        <Text style={styles.hint}>Pellizca para hacer zoom · Doble tap para resetear</Text>
      </View>
    </GestureDetector>
  );
}

// ─────────────────────────────────────────────────────────
//  LOTES_EJEMPLO
//  Reemplazá esto con la geometría real de tu SVG.
//  Cada lote debe tener el mismo id que en tu base de datos.
//  Si usás <Path> en lugar de <Rect>, reemplazá el componente
//  Rect por Path y usá el atributo `d` del SVG exportado.
// ─────────────────────────────────────────────────────────
const COLS = 4;
const FILAS = 5;
const W = 100, H = 80, GAP = 8, OFFSET_X = 80, OFFSET_Y = 40;

const LOTES_EJEMPLO = Array.from({ length: COLS * FILAS }, (_, i) => {
  const col = i % COLS;
  const fila = Math.floor(i / COLS);
  const n = (i + 1).toString().padStart(3, '0');
  return {
    id: `lote_${n}`,
    x: OFFSET_X + col * (W + GAP),
    y: OFFSET_Y + fila * (H + GAP),
    w: W,
    h: H,
  };
});

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORS.fondo,
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    fontSize: 11,
    color: COLORS.textoSuave,
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
