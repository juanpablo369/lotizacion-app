import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
} from 'react-native-reanimated';
import Svg, { G, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { ESTADOS } from '../constants';

// ── Distribución real ─────────────────────────────────────
const COL_IZQ = [
  'lote_001','lote_037','lote_036','lote_035','lote_034','lote_033','lote_032','lote_031','lote_030','lote_029', 'lote_028','lote_027','lote_026','lote_025','lote_024','lote_023','lote_022','lote_021','lote_020','lote_019',  // 20 lotes
];
const COL_DER = [
  'lote_002','lote_003','lote_004','lote_005', 'lote_006','lote_007','lote_008','lote_009','lote_010', 'lote_011','lote_012','lote_013','lote_014','lote_015', 'lote_016','lote_017','lote_018',  // 17 lotes
];

const LOTES_SVG = [
  { id: 'lote_001', d: 'M5 100.5L0.5 94L42.5 54L66 64L70 69L24.5 111.5L5 100.5Z' },
  { id: 'lote_002', d: 'M100.5 0.5L61 38.5L75 65L122 21.5L100.5 0.5Z' },
  { id: 'lote_003', d: 'M140.5 42.5L93.5 89L75.5 66L122.5 21.5L140.5 42.5Z' },
  { id: 'lote_004', d: 'M157 61.5L112 114.5L93.5 89.5L140.5 43L157 61.5Z' },
  { id: 'lote_005', d: 'M173.5 80.5L129 138.5L112 114.5L157.5 62L173.5 80.5Z' },
  { id: 'lote_006', d: 'M188.5 102.5L145.5 161.5L129.5 138.5L174 81L181 88.5L188.5 102.5Z' },
  { id: 'lote_007', d: 'M162.5 184L146 162L189 103L203.5 129L162.5 184Z' },
  { id: 'lote_008', d: 'M183.5 209.5L163 184L204 129.5L207.5 136.5L214 155L216 158.5L183.5 209.5Z' },
  { id: 'lote_009', d: 'M205 235L184 210L216.5 159L237 189.5L205 235Z' },
  { id: 'lote_010', d: 'M229.5 263.5L205.5 235.5L237 189.5L240 195L259 217L229.5 263.5Z' },
  { id: 'lote_011', d: 'M252.5 290.5L230 263.5L259 217L271 229.5L282.5 246L252.5 290.5Z' },
  { id: 'lote_012', d: 'M253 291L277 319.5L306.5 277L282.5 246.5L253 291Z' },
  { id: 'lote_013', d: 'M277.5 320L303.5 350.5L329 307L306.5 277.5L277.5 320Z' },
  { id: 'lote_014', d: 'M355.5 339L330 381.5L303.5 350.5L329 307.5L355.5 339Z' },
  { id: 'lote_015', d: 'M355.5 339L382 369L355.5 412L330 381.5L355.5 339Z' },
  { id: 'lote_016', d: 'M407.5 398L382 442.5L355.5 412L382 369.5L407.5 398Z' },
  { id: 'lote_017', d: 'M407.5 398L432.5 428L407.5 474L382 442.5L407.5 398Z' },
  { id: 'lote_018', d: 'M407.5 474L438 508L460 463L432.5 428L407.5 474Z' },
  { id: 'lote_019', d: 'M434.5 514.5L407 482L373.5 545.5L402.5 582L434.5 514.5Z' },
  { id: 'lote_020', d: 'M388.5 459.5L355 522L360.5 529L374 545.5L407.5 482.5L388.5 459.5Z' },
  { id: 'lote_021', d: 'M355.5 522.5L336 498L370 437.5L388.5 459.5L355.5 522.5Z' },
  { id: 'lote_022', d: 'M322.5 481.5L316.5 474.5L350.5 415L370 437.5L336.5 498L322.5 481.5Z' },
  { id: 'lote_023', d: 'M306.5 464.5L297.5 454.5L330.5 391.5L350.5 415L316.5 475L306.5 464.5Z' },
  { id: 'lote_024', d: 'M330.5 392L311.5 370L278 434.5L297.5 454.5L330.5 392Z' },
  { id: 'lote_025', d: 'M311.5 370.5L293 348L259 413.5L267.5 422L278 434L311.5 370.5Z' },
  { id: 'lote_026', d: 'M293.5 348.5L274.5 326.5L241 393.5L259 413.5L293.5 348.5Z' },
  { id: 'lote_027', d: 'M274.5 326.5L257 305.5L223 371L241.5 393.5L274.5 326.5Z' },
  { id: 'lote_028', d: 'M257 305.5L239 283.5L206 347.5L223 371L257 305.5Z' },
  { id: 'lote_029', d: 'M220.5 262.5L186.5 322L206 348L239 284L220.5 262.5Z' },
  { id: 'lote_030', d: 'M220 262.5L201 240L168 297L186 322L220 262.5Z' },
  { id: 'lote_031', d: 'M201 240.5L181.5 217L148.5 271.5L168 297.5L201 240.5Z' },
  { id: 'lote_032', d: 'M148.5 272L128 245.5L161.5 192.5L181.5 216.5L148.5 272Z' },
  { id: 'lote_033', d: 'M162 193L143 167L108 219L128 245.5L162 193Z' },
  { id: 'lote_034', d: 'M143.5 167L124 141.5L87.5 191.5L108 219L143.5 167Z' },
  { id: 'lote_035', d: 'M124 142L106.5 118L67 164L81.5 182.5L87.5 191.5L124 142Z' },
  { id: 'lote_036', d: 'M106.5 118.5L88 93.5L46 136.5L67.5 163.5L106.5 118.5Z' },
  { id: 'lote_037', d: 'M88.5 94L69.5 69L24.5 111.5L30 115L45.5 136.5L88.5 94Z' },
];

const BB   = { minX: 0, minY: 0, maxX: 460, maxY: 582 };
const BB_W = 460;
const BB_H = 582;

// ── Helpers ───────────────────────────────────────────────
function getCentro(d: string) {
  const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) { xs.push(nums[i]); ys.push(nums[i+1]); }
  return { x: xs.reduce((a,b)=>a+b,0)/xs.length, y: ys.reduce((a,b)=>a+b,0)/ys.length };
}

function puntoDentroDePoligono(px: number, py: number, d: string): boolean {
  const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
  const pts: {x:number;y:number}[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) pts.push({ x: nums[i], y: nums[i+1] });
  let dentro = false;
  for (let i = 0, j = pts.length-1; i < pts.length; j = i++) {
    const xi=pts[i].x, yi=pts[i].y, xj=pts[j].x, yj=pts[j].y;
    if(((yi>py)!==(yj>py))&&px<((xj-xi)*(py-yi))/(yj-yi)+xi) dentro=!dentro;
  }
  return dentro;
}

function primerNombre(n: string) { return n.split(' ')[0] ?? n; }
function formatNum(n: number) { return n >= 1000 ? `${(n/1000).toFixed(0)}k` : n.toString(); }

const GRAD: Record<string,string> = {
  disponible: 'url(#grad_disponible)',
  reservado:  'url(#grad_reservado)',
  vendido:    'url(#grad_vendido)',
};

// ── Tipos ─────────────────────────────────────────────────
interface LoteInfo { id:string; estado:string; precio?:number; monto_reserva?:number; comprador?:string; }
interface Props {
  lotes: Record<string, LoteInfo>;
  onTapLote: (id: string) => void;
  dark?: boolean;
}

// ── Vista Cuadrícula ──────────────────────────────────────
function VistaCuadricula({ lotes, onTapLote, dark = false }: Props) {
  const bg      = dark ? '#0f0f1a' : '#F5F5F0';
  const bgCard  = dark ? '#1e1e30' : '#ffffff';
  const border  = dark ? '#2a2a3a' : '#e0e0e0';
  const txt     = dark ? '#e0e0e0' : '#222222';
  const txtSoft = dark ? '#777'    : '#999';

  const W         = Dimensions.get('window').width;
  const PAD       = 10;
  const GAP_COL   = 6;   // gap entre columna izq y der
  const GAP_CARD  = 4;   // gap entre cards de la misma columna

  // Anchos iguales para ambas columnas
  const wIzq = Math.floor((W - PAD * 2 - GAP_COL) / 2);
  const wDer = W - PAD * 2 - GAP_COL - wIzq;

  // ── Cálculo de alturas para que ambas columnas tengan la misma altura total ──
  // Altura total = N * h + (N-1) * GAP_CARD
  // Usamos h_izq = 62px como referencia (20 lotes)
  const H_CARD_IZQ = 62;
  const H_TOTAL    = COL_IZQ.length * H_CARD_IZQ + (COL_IZQ.length - 1) * GAP_CARD;
  // h_der = (H_total - (N_der-1) * GAP_CARD) / N_der
  const H_CARD_DER = Math.round((H_TOTAL - (COL_DER.length - 1) * GAP_CARD) / COL_DER.length);

  const renderCard = (id: string, w: number, h: number) => {
    const info   = lotes[id];
    const estado = info?.estado ?? 'disponible';
    const color  = estado === 'vendido' ? '#ABABAB' : estado === 'reservado' ? '#F0C060' : '#7BC67A';
    const num    = id.replace('lote_0','').replace('lote_','');
    const label  = (ESTADOS as any)[estado]?.label ?? estado;

    return (
      <TouchableOpacity
        key={id}
        onPress={() => onTapLote(id)}
        activeOpacity={0.75}
        style={[st.card, { width: w, height: h, backgroundColor: bgCard, borderColor: border }]}
      >
        <View style={[st.stripe, { backgroundColor: color }]} />
        <View style={st.cardInner}>
          {/* Izquierda: número y nombre */}
          <View style={{ flex: 1, marginRight: 4 }}>
            <Text style={[st.num, { color: txt }]}>L{num}</Text>
            {estado !== 'disponible' && info?.comprador ? (
              <Text style={[st.nombre, { color: txt }]} numberOfLines={1}>
                {primerNombre(info.comprador)}
              </Text>
            ) : null}
          </View>
          {/* Derecha: badge estado + precios */}
          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            <View style={[st.badge, { backgroundColor: color + '33' }]}>
              <Text style={[st.badgeTxt, { color }]}>{label}</Text>
            </View>
            {estado === 'vendido' && info?.precio ? (
              <Text style={[st.precio, { color: txtSoft, marginTop: 2 }]}>${formatNum(info.precio)}</Text>
            ) : null}
            {estado === 'reservado' ? (
              <>
                {info?.monto_reserva ? <Text style={[st.precio,{color:txtSoft,marginTop:2}]}>Res ${formatNum(info.monto_reserva)}</Text> : null}
                {info?.precio        ? <Text style={[st.precio,{color:txtSoft}]}>Tot ${formatNum(info.precio)}</Text> : null}
              </>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: PAD }}>
      <View style={{ flexDirection: 'row', gap: GAP_COL }}>
        {/* Col izquierda — 20 lotes, cards más chicos */}
        <View style={{ gap: GAP_CARD }}>
          {COL_IZQ.map(id => renderCard(id, wIzq, H_CARD_IZQ))}
        </View>
        {/* Col derecha — 17 lotes, cards más altos para igualar altura total */}
        <View style={{ gap: GAP_CARD }}>
          {COL_DER.map(id => renderCard(id, wDer, H_CARD_DER))}
        </View>
      </View>
    </ScrollView>
  );
}

// ── Vista Mapa SVG ────────────────────────────────────────
function VistaMapa({ lotes, onTapLote, dark = false }: Props) {
  const SVG_W = 460; const SVG_H = 582;

  // Un solo objeto de estado — matriz 2D simple: translate + scale
  // transform: translate(tx, ty) scale(s)
  // punto SVG → pantalla: screenX = svgX * s + tx
  // pantalla → SVG:        svgX   = (screenX - tx) / s
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const s  = useSharedValue(1);

  // Refs para hilo JS (tap)
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const sRef  = useRef(1);
  const contW = useRef(0);
  const contH = useRef(0);

  const syncRefs = useCallback((sv:number, txv:number, tyv:number) => {
    sRef.current = sv; txRef.current = txv; tyRef.current = tyv;
  }, []);

  const initTransform = (w: number, h: number) => {
    contW.current = w; contH.current = h;
    const ix = (w - SVG_W) / 2;
    const iy = (h - SVG_H) / 2;
    tx.value = ix; ty.value = iy; s.value = 1;
    txRef.current = ix; tyRef.current = iy; sRef.current = 1;
  };

  // ── Pan sin delay — NO usar Exclusive con doubleTap ──
  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .averageTouches(true)
    .onBegin(() => {
      'worklet';
    })
    .onChange(e => {
      'worklet';
      tx.value += e.changeX;
      ty.value += e.changeY;
    })
    .onEnd(() => {
      'worklet';
      runOnJS(syncRefs)(s.value, tx.value, ty.value);
    });

  // ── Pinch — captura estado al inicio con context ──
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
    })
    .onChange(e => {
      'worklet';
      const prevS = s.value;
      const ns = Math.min(6, Math.max(0.3, prevS * e.scaleChange));
      const ratio = ns / prevS;
      // RN escala alrededor del centro del elemento (SVG_W/2, SVG_H/2),
      // por eso se descuenta ese offset antes de aplicar la fórmula focal.
      const fcx = e.focalX - SVG_W / 2;
      const fcy = e.focalY - SVG_H / 2;
      tx.value = fcx - ratio * (fcx - tx.value);
      ty.value = fcy - ratio * (fcy - ty.value);
      s.value  = ns;
    })
    .onEnd(() => {
      'worklet';
      runOnJS(syncRefs)(s.value, tx.value, ty.value);
    });

  // ── Doble tap — sin bloquear el pan ──
  const lastTap = useRef(0);
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const ix = (contW.current - SVG_W) / 2;
      const iy = (contH.current - SVG_H) / 2;
      tx.value = ix; ty.value = iy; s.value = 1;
      syncRefs(1, ix, iy);
    }
    lastTap.current = now;
  }, [syncRefs]);

  // Pan y pinch simultáneos — sin Exclusive que causa delay
  const all = Gesture.Simultaneous(pan, pinch);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    width: SVG_W,
    height: SVG_H,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: s.value },
    ],
  }));

  const handleTap = useCallback((e: any) => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    handleDoubleTap();
    // Inversión correcta: RN escala alrededor del centro del elemento.
    // screenX = (svgX - SVG_W/2) * s + SVG_W/2 + tx  →  svgX = (screenX - tx - SVG_W/2) / s + SVG_W/2
    const svgX = (x - txRef.current - SVG_W / 2) / sRef.current + SVG_W / 2;
    const svgY = (y - tyRef.current - SVG_H / 2) / sRef.current + SVG_H / 2;
    for (const lote of LOTES_SVG) {
      if (puntoDentroDePoligono(svgX, svgY, lote.d)) {
        onTapLote(lote.id);
        return;
      }
    }
  }, [onTapLote, handleDoubleTap]);

  const bgMap = dark ? '#1a1a2e' : '#E8E8E0';

  return (
    <View
      style={[st.mapaWrap, { backgroundColor: bgMap }]}
      onLayout={e => {
        const { width: w, height: h } = e.nativeEvent.layout;
        initTransform(w, h);
      }}
    >
      <GestureDetector gesture={all}>
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={animStyle}>
            <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
              <Defs>
                <LinearGradient id="grad_disponible" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#A8E0A7" stopOpacity="1"/>
                  <Stop offset="1" stopColor="#4E9E4D" stopOpacity="1"/>
                </LinearGradient>
                <LinearGradient id="grad_reservado" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#F9DF8A" stopOpacity="1"/>
                  <Stop offset="1" stopColor="#C49A20" stopOpacity="1"/>
                </LinearGradient>
                <LinearGradient id="grad_vendido" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#D0D0D0" stopOpacity="1"/>
                  <Stop offset="1" stopColor="#888888" stopOpacity="1"/>
                </LinearGradient>
              </Defs>
              {LOTES_SVG.map(lote => {
                const info   = lotes[lote.id];
                const estado = info?.estado ?? 'disponible';
                const color  = estado === 'vendido' ? '#ABABAB' : estado === 'reservado' ? '#F0C060' : '#7BC67A';
                const centro = getCentro(lote.d);
                const lineas: string[] = [];
                if (estado === 'vendido') {
                  if (info?.comprador) lineas.push(primerNombre(info.comprador));
                  if (info?.precio)    lineas.push('$' + formatNum(info.precio));
                } else if (estado === 'reservado') {
                  if (info?.comprador)     lineas.push(primerNombre(info.comprador));
                  if (info?.monto_reserva) lineas.push('Res $' + formatNum(info.monto_reserva));
                  if (info?.precio)        lineas.push('Tot $' + formatNum(info.precio));
                } else {
                  lineas.push(lote.id.replace('lote_0', 'L').replace('lote_', 'L'));
                }
                const LINE_H = 9;
                const oY = -((lineas.length - 1) * LINE_H) / 2;
                return (
                  <G key={lote.id}>
                    <Path d={lote.d} fill={color} stroke={dark ? '#555' : '#333'} strokeWidth={1}/>
                    {lineas.map((linea, i) => (
                      <SvgText key={i} x={centro.x} y={centro.y + oY + i * LINE_H}
                        fontSize={7} fontWeight={i === 0 ? 'bold' : 'normal'}
                        fill={dark ? '#eee' : '#1a1a1a'} textAnchor="middle" alignmentBaseline="middle">
                        {linea}
                      </SvgText>
                    ))}
                  </G>
                );
              })}
            </Svg>
          </Animated.View>
        </View>
      </GestureDetector>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleTap}/>
      <Text style={[st.hint, {
        color: dark ? '#aaa' : '#555',
        backgroundColor: dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.75)'
      }]}>
        Zoom · Doble tap resetea
      </Text>
    </View>
  );
}


// ── Componente principal ──────────────────────────────────
export default function PlanoSVG({ lotes, onTapLote, dark = false }: Props) {
  const [vistaGrid, setVistaGrid] = useState(true);
  const bgBar  = dark ? '#16162a' : '#ffffff';
  const border = dark ? '#2a2a3a' : '#e8e8e8';
  const txt    = dark ? '#ccc'    : '#444';

  return (
    <View style={{ flex: 1 }}>
      {/* Barra switch Lista / Mapa */}
      <View style={[st.switchBar, { backgroundColor: bgBar, borderBottomColor: border }]}>
        <View style={[st.pill, { borderColor: border }]}>
          <TouchableOpacity
            onPress={() => setVistaGrid(true)}
            style={[st.pillBtn, vistaGrid && st.pillBtnActive, vistaGrid && { backgroundColor: dark ? '#2a2a4a' : '#1A1A2E' }]}
          >
            <Text style={[st.pillTxt, { color: vistaGrid ? '#fff' : txt }]}>⊞  Lista</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVistaGrid(false)}
            style={[st.pillBtn, !vistaGrid && st.pillBtnActive, !vistaGrid && { backgroundColor: dark ? '#2a2a4a' : '#1A1A2E' }]}
          >
            <Text style={[st.pillTxt, { color: !vistaGrid ? '#fff' : txt }]}>⌖  Mapa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {vistaGrid
        ? <VistaCuadricula lotes={lotes} onTapLote={onTapLote} dark={dark}/>
        : <VistaMapa       lotes={lotes} onTapLote={onTapLote} dark={dark}/>
      }
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────
const st = StyleSheet.create({
  // Cards
  card:     { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  stripe:   { height: 4 },
  cardInner:{ flex: 1, padding: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  num:      { fontSize: 12, fontWeight: 'bold' },
  nombre:   { fontSize: 11, marginTop: 1 },
  precio:   { fontSize: 10, marginTop: 1 },
  badge:    { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 3 },
  badgeTxt: { fontSize: 9, fontWeight: '600' },
  // Switch bar
  switchBar:{ paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, alignItems: 'center' },
  pill:     { flexDirection: 'row', borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  pillBtn:  { paddingHorizontal: 20, paddingVertical: 7 },
  pillBtnActive: {},
  pillTxt:  { fontSize: 13, fontWeight: '500' },
  // Mapa
  mapaWrap: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  hint:     { position: 'absolute', bottom: 8, alignSelf: 'center', fontSize: 11, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
});