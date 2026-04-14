import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { G, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const LOTES = [
  { id: 'lote_001', d: 'M370.5 15.5L331 53.5L345 80L392 36.5L370.5 15.5Z' },
  { id: 'lote_002', d: 'M410.5 57.5L363.5 104L345.5 81L392.5 36.5L410.5 57.5Z' },
  { id: 'lote_003', d: 'M427 76.5L382 129.5L363.5 104.5L410.5 58L427 76.5Z' },
  { id: 'lote_004', d: 'M443.5 95.5L399 153.5L382 129.5L427.5 77L443.5 95.5Z' },
  { id: 'lote_005', d: 'M458.5 117.5L415.5 176.5L399.5 153.5L444 96L451 103.5L458.5 117.5Z' },
  { id: 'lote_006', d: 'M432.5 199L416 177L459 118L473.5 144L432.5 199Z' },
  { id: 'lote_007', d: 'M453.5 224.5L433 199L474 144.5L477.5 151.5L484 170L486 173.5L453.5 224.5Z' },
  { id: 'lote_008', d: 'M475 250L454 225L486.5 174L507 204.5L475 250Z' },
  { id: 'lote_009', d: 'M499.5 278.5L475.5 250.5L507 204.5L510 210L529 232L499.5 278.5Z' },
  { id: 'lote_010', d: 'M522.5 305.5L500 278.5L529 232L541 244.5L552.5 261L522.5 305.5Z' },
  { id: 'lote_011', d: 'M523 306L547 334.5L576.5 292L552.5 261.5L523 306Z' },
  { id: 'lote_012', d: 'M547.5 335L573.5 365.5L599 322L576.5 292.5L547.5 335Z' },
  { id: 'lote_013', d: 'M625.5 354L600 396.5L573.5 365.5L599 322.5L625.5 354Z' },
  { id: 'lote_014', d: 'M625.5 354L652 384L625.5 427L600 396.5L625.5 354Z' },
  { id: 'lote_015', d: 'M677.5 413L652 457.5L625.5 427L652 384.5L677.5 413Z' },
  { id: 'lote_016', d: 'M677.5 413L702.5 443L677.5 489L652 457.5L677.5 413Z' },
  { id: 'lote_017', d: 'M677.5 489L708 523L730 478L702.5 443L677.5 489Z' },
  { id: 'lote_018', d: 'M704.5 529.5L677 497L643.5 560.5L672.5 597L704.5 529.5Z' },
  { id: 'lote_019', d: 'M658.5 474.5L625 537L630.5 544L644 560.5L677.5 497.5L658.5 474.5Z' },
  { id: 'lote_020', d: 'M625.5 537.5L606 513L640 452.5L658.5 474.5L625.5 537.5Z' },
  { id: 'lote_021', d: 'M592.5 496.5L586.5 489.5L620.5 430L640 452.5L606.5 513L592.5 496.5Z' },
  { id: 'lote_022', d: 'M576.5 479.5L567.5 469.5L600.5 406.5L620.5 430L586.5 490L576.5 479.5Z' },
  { id: 'lote_023', d: 'M600.5 407L581.5 385L548 449.5L567.5 469.5L600.5 407Z' },
  { id: 'lote_024', d: 'M581.5 385.5L563 363L529 428.5L537.5 437L548 449L581.5 385.5Z' },
  { id: 'lote_025', d: 'M563.5 363.5L544.5 341.5L511 408.5L529 428.5L563.5 363.5Z' },
  { id: 'lote_026', d: 'M544.5 341.5L527 320.5L493 386L511.5 408.5L544.5 341.5Z' },
  { id: 'lote_027', d: 'M527 320.5L509 298.5L476 362.5L493 386L527 320.5Z' },
  { id: 'lote_028', d: 'M490.5 277.5L456.5 337L476 363L509 299L490.5 277.5Z' },
  { id: 'lote_029', d: 'M490 277.5L471 255L438 312L456 337L490 277.5Z' },
  { id: 'lote_030', d: 'M471 255.5L451.5 232L418.5 286.5L438 312.5L471 255.5Z' },
  { id: 'lote_031', d: 'M418.5 287L398 260.5L431.5 207.5L451.5 231.5L418.5 287Z' },
  { id: 'lote_032', d: 'M432 208L413 182L378 234L398 260.5L432 208Z' },
  { id: 'lote_033', d: 'M413.5 182L394 156.5L357.5 206.5L378 234L413.5 182Z' },
  { id: 'lote_034', d: 'M394 157L376.5 133L337 179L351.5 197.5L357.5 206.5L394 157Z' },
  { id: 'lote_035', d: 'M376.5 133.5L358 108.5L316 151.5L337.5 178.5L376.5 133.5Z' },
  { id: 'lote_036', d: 'M358.5 109L339.5 84L294.5 126.5L300 130L315.5 151.5L358.5 109Z' },
  { id: 'lote_037', d: 'M275 115.5L270.5 109L312.5 69L336 79L340 84L294.5 126.5L275 115.5Z' },
];

const BB    = { minX: 270, minY: 15, maxX: 730, maxY: 597 };
const BB_W  = BB.maxX - BB.minX;
const BB_H  = BB.maxY - BB.minY;
const BB_CX = BB.minX + BB_W / 2;
const BB_CY = BB.minY + BB_H / 2;

function getCentro(d: string): { x: number; y: number } {
  const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  return {
    x: xs.reduce((a, b) => a + b, 0) / xs.length,
    y: ys.reduce((a, b) => a + b, 0) / ys.length,
  };
}

function puntoDentroDePoligono(px: number, py: number, d: string): boolean {
  const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
  let dentro = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
    if (((yi > py) !== (yj > py)) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      dentro = !dentro;
  }
  return dentro;
}

function primerNombre(n: string): string { return n.split(' ')[0] ?? n; }
function formatNum(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString();
}

const GRADIENTES: Record<string, string> = {
  disponible: 'url(#grad_disponible)',
  reservado:  'url(#grad_reservado)',
  vendido:    'url(#grad_vendido)',
};

interface LoteInfo {
  id: string; estado: string;
  precio?: number; monto_reserva?: number; comprador?: string;
}
interface Props {
  lotes: Record<string, LoteInfo>;
  onTapLote: (id: string) => void;
}

export default function PlanoSVG({ lotes, onTapLote }: Props) {
  const contW = useSharedValue(Dimensions.get('window').width);
  const contH = useSharedValue(Dimensions.get('window').height);

  const offsetX     = useSharedValue(0);
  const offsetY     = useSharedValue(0);
  const offsetXBase = useSharedValue(0);
  const offsetYBase = useSharedValue(0);
  const escala      = useSharedValue(1);
  const escalaBase  = useSharedValue(1);
  const rotacion    = useSharedValue(0);
  const rotBase     = useSharedValue(0);

  // Guardamos escala y offset en refs para leerlos desde el hilo JS (tap)
  const escalaRef  = useRef(1);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const contWRef   = useRef(Dimensions.get('window').width);
  const contHRef   = useRef(Dimensions.get('window').height);

  const calcFit = (w: number, h: number) => Math.min(w / BB_W, h / BB_H) * 0.88;

  const centrar = (w: number, h: number) => {
    contW.value = w; contH.value = h;
    contWRef.current = w; contHRef.current = h;
    const fit = calcFit(w, h);
    escala.value = escalaBase.value = fit;
    escalaRef.current = fit;
    offsetX.value = offsetXBase.value = 0;
    offsetY.value = offsetYBase.value = 0;
    offsetXRef.current = 0; offsetYRef.current = 0;
    rotacion.value = rotBase.value = 0;
  };

  // Sync refs desde worklet → JS thread
  const syncRefs = useCallback((sc: number, ox: number, oy: number) => {
    escalaRef.current  = sc;
    offsetXRef.current = ox;
    offsetYRef.current = oy;
  }, []);

  const pan = Gesture.Pan()
    .minPointers(1).maxPointers(1)
    .onUpdate(e => {
      offsetX.value = offsetXBase.value + e.translationX;
      offsetY.value = offsetYBase.value + e.translationY;
    })
    .onEnd(() => {
      offsetXBase.value = offsetX.value;
      offsetYBase.value = offsetY.value;
      runOnJS(syncRefs)(escala.value, offsetX.value, offsetY.value);
    });

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      escala.value = Math.min(6, Math.max(0.3, escalaBase.value * e.scale));
    })
    .onEnd(() => {
      escalaBase.value = escala.value;
      runOnJS(syncRefs)(escala.value, offsetX.value, offsetY.value);
    });

  const rotate = Gesture.Rotation()
    .onUpdate(e => { rotacion.value = rotBase.value + e.rotation; })
    .onEnd(() => { rotBase.value = rotacion.value; });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_e, success) => {
      if (!success) return;
      const { width: w, height: h } = Dimensions.get('window');
      const fit = calcFit(w, h);
      escala.value = withSpring(fit); escalaBase.value = fit;
      offsetX.value = withSpring(0);  offsetXBase.value = 0;
      offsetY.value = withSpring(0);  offsetYBase.value = 0;
      rotacion.value = withSpring(0); rotBase.value = 0;
      runOnJS(syncRefs)(fit, 0, 0);
    });

  const multiTouch = Gesture.Simultaneous(pinch, rotate, pan);
  const all        = Gesture.Simultaneous(doubleTap, multiTouch);

  const animStyle = useAnimatedStyle(() => {
    const cx = contW.value / 2 + offsetX.value;
    const cy = contH.value / 2 + offsetY.value;
    return {
      transform: [
        { translateX: cx - BB_CX },
        { translateY: cy - BB_CY },
        { translateX:  BB_CX },
        { translateY:  BB_CY },
        { scale: escala.value },
        { rotate: `${rotacion.value}rad` },
        { translateX: -BB_CX },
        { translateY: -BB_CY },
      ],
    };
  });

  // ── Tap usando TouchableOpacity sobre el SVG ──
  // Se lee la posición del toque y se convierte a coordenadas SVG
  // usando los refs (que se actualizan al terminar cada gesto)
  const handleTouchableTap = useCallback((e: any) => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    const cx   = contWRef.current / 2 + offsetXRef.current;
    const cy   = contHRef.current / 2 + offsetYRef.current;
    const svgX = (x - cx) / escalaRef.current + BB_CX;
    const svgY = (y - cy) / escalaRef.current + BB_CY;
    for (const lote of LOTES) {
      if (puntoDentroDePoligono(svgX, svgY, lote.d)) {
        onTapLote(lote.id);
        break;
      }
    }
  }, [onTapLote]);

  return (
    <View
      style={styles.contenedor}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        centrar(width, height);
      }}
    >
      <GestureDetector gesture={all}>
        <Animated.View style={[{ position: 'absolute', width: 780, height: 640 }, animStyle]}>
          <Svg width={780} height={640} viewBox="0 0 780 640">
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

            {LOTES.map(lote => {
              const info   = lotes[lote.id];
              const estado = info?.estado ?? 'disponible';
              const fill   = GRADIENTES[estado] ?? GRADIENTES.disponible;
              const centro = getCentro(lote.d);

              const lineas: string[] = [];
              if (estado === 'vendido') {
                if (info?.comprador) lineas.push(primerNombre(info.comprador));
                if (info?.precio)    lineas.push(`$${formatNum(info.precio)}`);
              } else if (estado === 'reservado') {
                if (info?.comprador)     lineas.push(primerNombre(info.comprador));
                if (info?.monto_reserva) lineas.push(`Res $${formatNum(info.monto_reserva)}`);
                if (info?.precio)        lineas.push(`Tot $${formatNum(info.precio)}`);
              } else {
                lineas.push(lote.id.replace('lote_0', 'L').replace('lote_', 'L'));
              }

              const LINE_H = 9;
              const oY     = -((lineas.length - 1) * LINE_H) / 2;

              return (
                <G key={lote.id}>
                  <Path d={lote.d} fill="rgba(0,0,0,0.18)" stroke="none" translateX={3} translateY={3} />
                  <Path d={lote.d} fill={fill} stroke="#444" strokeWidth={1} />
                  <Path d={lote.d} fill="rgba(255,255,255,0.18)" stroke="none" scaleY={0.4} originY={centro.y} />
                  {lineas.map((linea, i) => (
                    <SvgText
                      key={i}
                      x={centro.x}
                      y={centro.y + oY + i * LINE_H}
                      fontSize={7}
                      fontWeight={i === 0 ? 'bold' : 'normal'}
                      fill="#1a1a1a"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {linea}
                    </SvgText>
                  ))}
                </G>
              );
            })}
          </Svg>
        </Animated.View>
      </GestureDetector>

      {/* Capa invisible encima para capturar taps sin interferir con gestures */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={handleTouchableTap}
      />

      <Text style={styles.hint}>Zoom · Rota 2 dedos · Doble tap centra</Text>
    </View>
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
    zIndex: 10,
  },
});