 import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { G, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─────────────────────────────────────────────────────────
//  Lotes reales exportados desde Figma
//  ID asignado en orden: lote_001 ... lote_037
// ─────────────────────────────────────────────────────────
const LOTES = [
  { id: 'lote_001', d: 'M275 115.5L270.5 109L312.5 69L336 79L340 84L294.5 126.5L275 115.5Z' },
  { id: 'lote_002', d: 'M370.5 15.5L331 53.5L345 80L392 36.5L370.5 15.5Z' },
  { id: 'lote_003', d: 'M410.5 57.5L363.5 104L345.5 81L392.5 36.5L410.5 57.5Z' },
  { id: 'lote_004', d: 'M427 76.5L382 129.5L363.5 104.5L410.5 58L427 76.5Z' },
  { id: 'lote_005', d: 'M443.5 95.5L399 153.5L382 129.5L427.5 77L443.5 95.5Z' },
  { id: 'lote_006', d: 'M458.5 117.5L415.5 176.5L399.5 153.5L444 96L451 103.5L458.5 117.5Z' },
  { id: 'lote_007', d: 'M432.5 199L416 177L459 118L473.5 144L432.5 199Z' },
  { id: 'lote_008', d: 'M453.5 224.5L433 199L474 144.5L477.5 151.5L484 170L486 173.5L453.5 224.5Z' },
  { id: 'lote_009', d: 'M475 250L454 225L486.5 174L507 204.5L475 250Z' },
  { id: 'lote_010', d: 'M499.5 278.5L475.5 250.5L507 204.5L510 210L529 232L499.5 278.5Z' },
  { id: 'lote_011', d: 'M522.5 305.5L500 278.5L529 232L541 244.5L552.5 261L522.5 305.5Z' },
  { id: 'lote_012', d: 'M523 306L547 334.5L576.5 292L552.5 261.5L523 306Z' },
  { id: 'lote_013', d: 'M547.5 335L573.5 365.5L599 322L576.5 292.5L547.5 335Z' },
  { id: 'lote_014', d: 'M625.5 354L600 396.5L573.5 365.5L599 322.5L625.5 354Z' },
  { id: 'lote_015', d: 'M625.5 354L652 384L625.5 427L600 396.5L625.5 354Z' },
  { id: 'lote_016', d: 'M677.5 413L652 457.5L625.5 427L652 384.5L677.5 413Z' },
  { id: 'lote_017', d: 'M677.5 413L702.5 443L677.5 489L652 457.5L677.5 413Z' },
  { id: 'lote_018', d: 'M677.5 489L708 523L730 478L702.5 443L677.5 489Z' },
  { id: 'lote_019', d: 'M704.5 529.5L677 497L643.5 560.5L672.5 597L704.5 529.5Z' },
  { id: 'lote_020', d: 'M658.5 474.5L625 537L630.5 544L644 560.5L677.5 497.5L658.5 474.5Z' },
  { id: 'lote_021', d: 'M625.5 537.5L606 513L640 452.5L658.5 474.5L625.5 537.5Z' },
  { id: 'lote_022', d: 'M592.5 496.5L586.5 489.5L620.5 430L640 452.5L606.5 513L592.5 496.5Z' },
  { id: 'lote_023', d: 'M576.5 479.5L567.5 469.5L600.5 406.5L620.5 430L586.5 490L576.5 479.5Z' },
  { id: 'lote_024', d: 'M600.5 407L581.5 385L548 449.5L567.5 469.5L600.5 407Z' },
  { id: 'lote_025', d: 'M581.5 385.5L563 363L529 428.5L537.5 437L548 449L581.5 385.5Z' },
  { id: 'lote_026', d: 'M563.5 363.5L544.5 341.5L511 408.5L529 428.5L563.5 363.5Z' },
  { id: 'lote_027', d: 'M544.5 341.5L527 320.5L493 386L511.5 408.5L544.5 341.5Z' },
  { id: 'lote_028', d: 'M527 320.5L509 298.5L476 362.5L493 386L527 320.5Z' },
  { id: 'lote_029', d: 'M490.5 277.5L456.5 337L476 363L509 299L490.5 277.5Z' },
  { id: 'lote_030', d: 'M490 277.5L471 255L438 312L456 337L490 277.5Z' },
  { id: 'lote_031', d: 'M471 255.5L451.5 232L418.5 286.5L438 312.5L471 255.5Z' },
  { id: 'lote_032', d: 'M418.5 287L398 260.5L431.5 207.5L451.5 231.5L418.5 287Z' },
  { id: 'lote_033', d: 'M432 208L413 182L378 234L398 260.5L432 208Z' },
  { id: 'lote_034', d: 'M413.5 182L394 156.5L357.5 206.5L378 234L413.5 182Z' },
  { id: 'lote_035', d: 'M394 157L376.5 133L337 179L351.5 197.5L357.5 206.5L394 157Z' },
  { id: 'lote_036', d: 'M376.5 133.5L358 108.5L316 151.5L337.5 178.5L376.5 133.5Z' },
  { id: 'lote_037', d: 'M358.5 109L339.5 84L294.5 126.5L300 130L315.5 151.5L358.5 109Z' },
];

// ─────────────────────────────────────────────────────────
//  Gradientes por estado (efecto 3D suavizado)
// ─────────────────────────────────────────────────────────
const GRADIENTES: Record<string, string> = {
  disponible: 'url(#grad_disponible)',
  reservado:  'url(#grad_reservado)',
  vendido:    'url(#grad_vendido)',
};

// ─────────────────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────────────────
interface Lote {
  id: string;
  estado: string;
  precio?: number;
  color?: string;
}

interface Props {
  lotes: Record<string, Lote>;
  onTapLote: (id: string) => void;
}

// ─────────────────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────────────────
export default function PlanoSVG({ lotes, onTapLote }: Props) {
  const SVG_W = 780;
  const SVG_H = 640;

  const escala     = useSharedValue(1);
  const escalaBase = useSharedValue(1);
  const transX     = useSharedValue(0);
  const transY     = useSharedValue(0);
  const transXBase = useSharedValue(0);
  const transYBase = useSharedValue(0);

  const MIN_SCALE = 0.8;
  const MAX_SCALE = 6;

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      escala.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, escalaBase.value * e.scale));
    })
    .onEnd(() => { escalaBase.value = escala.value; });

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
          <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>

            {/* ── Gradientes ── */}
            <Defs>
              <LinearGradient id="grad_disponible" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#A8E0A7" stopOpacity="1" />
                <Stop offset="1" stopColor="#4E9E4D" stopOpacity="1" />
              </LinearGradient>
              <LinearGradient id="grad_reservado" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#F9DF8A" stopOpacity="1" />
                <Stop offset="1" stopColor="#C49A20" stopOpacity="1" />
              </LinearGradient>
              <LinearGradient id="grad_vendido" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#D0D0D0" stopOpacity="1" />
                <Stop offset="1" stopColor="#888888" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* ── Lotes ── */}
            {LOTES.map(lote => {
              const info   = lotes[lote.id];
              const estado = info?.estado ?? 'disponible';
              const fill   = GRADIENTES[estado] ?? GRADIENTES.disponible;
              const numero = lote.id.replace('lote_0', '').replace('lote_', '');

              return (
                <G key={lote.id} onPress={() => onTapLote(lote.id)}>
                  {/* Sombra simulada para efecto 3D */}
                  <Path
                    d={lote.d}
                    fill="rgba(0,0,0,0.18)"
                    stroke="none"
                    translateX={1}
                    translateY={1.5}
                  />
                  {/* Lote con gradiente */}
                  <Path
                    d={lote.d}
                    fill={fill}
                    stroke="#444"
                    strokeWidth={1}
                  />
                  {/* Brillo superior (efecto 3D) */}
                  <Path
                    d={lote.d}
                    fill="rgba(255,255,255,0.18)"
                    stroke="none"
                  />
                </G>
              );
            })}

          </Svg>
        </Animated.View>

        <Text style={styles.hint}>Pellizca para zoom · Doble tap para resetear</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#E8E8E0',
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    fontSize: 11,
    color: '#666',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
});