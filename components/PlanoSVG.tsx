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
  'lote_001','lote_037','lote_036','lote_035','lote_034',
  'lote_033','lote_032','lote_031','lote_030','lote_029',
  'lote_028','lote_027','lote_026','lote_025','lote_024',
  'lote_023','lote_022','lote_021','lote_020','lote_019',  // 20 lotes
];
const COL_DER = [
  'lote_002','lote_003','lote_004','lote_005',
  'lote_006','lote_007','lote_008','lote_009','lote_010',
  'lote_011','lote_012','lote_013','lote_014','lote_015',
  'lote_016','lote_017','lote_018',  // 17 lotes
];

const LOTES_SVG = [
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

const BB   = { minX: 270, minY: 15, maxX: 730, maxY: 597 };
const BB_W = BB.maxX - BB.minX;
const BB_H = BB.maxY - BB.minY;

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

  // Anchos de cada columna
  const wIzq = Math.floor((W - PAD * 2 - GAP_COL) * 0.38);
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
          <View style={{ flex: 1 }}>
            <Text style={[st.num, { color: txt }]}>L{num}</Text>
            {estado !== 'disponible' && info?.comprador ? (
              <Text style={[st.nombre, { color: txt }]} numberOfLines={1}>
                {primerNombre(info.comprador)}
              </Text>
            ) : null}
            {estado === 'vendido' && info?.precio ? (
              <Text style={[st.precio, { color: txtSoft }]}>${formatNum(info.precio)}</Text>
            ) : null}
            {estado === 'reservado' ? (
              <>
                {info?.monto_reserva ? <Text style={[st.precio,{color:txtSoft}]}>Res ${formatNum(info.monto_reserva)}</Text> : null}
                {info?.precio        ? <Text style={[st.precio,{color:txtSoft}]}>Tot ${formatNum(info.precio)}</Text>        : null}
              </>
            ) : null}
          </View>
          <View style={[st.badge, { backgroundColor: color + '33' }]}>
            <Text style={[st.badgeTxt, { color }]}>{label}</Text>
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
  const tx = useSharedValue(0); const ty = useSharedValue(0); const s = useSharedValue(1);
  const txBase = useSharedValue(0); const tyBase = useSharedValue(0); const sBase = useSharedValue(1);
  const txRef = useRef(0); const tyRef = useRef(0); const sRef = useRef(1);

  const syncRefs = useCallback((sv:number,txv:number,tyv:number)=>{ sRef.current=sv; txRef.current=txv; tyRef.current=tyv; },[]);
  const calcFit  = (w:number,h:number) => Math.min(w/BB_W,h/BB_H)*0.88;

  const centrar = (w:number,h:number) => {
    const fit=calcFit(w,h);
    const ix=w/2-(BB.minX+BB_W/2)*fit, iy=h/2-(BB.minY+BB_H/2)*fit;
    tx.value=txBase.value=ix; ty.value=tyBase.value=iy; s.value=sBase.value=fit;
    txRef.current=ix; tyRef.current=iy; sRef.current=fit;
  };

  const pan = Gesture.Pan().minPointers(1).maxPointers(1)
    .onUpdate(e=>{ tx.value=txBase.value+e.translationX; ty.value=tyBase.value+e.translationY; })
    .onEnd(()=>{ txBase.value=tx.value; tyBase.value=ty.value; runOnJS(syncRefs)(s.value,tx.value,ty.value); });

  const pinch = Gesture.Pinch()
    .onUpdate(e=>{
      const ns=Math.min(6,Math.max(0.3,sBase.value*e.scale));
      const fx=(e.focalX-txBase.value)/sBase.value, fy=(e.focalY-tyBase.value)/sBase.value;
      tx.value=e.focalX-fx*ns; ty.value=e.focalY-fy*ns; s.value=ns;
    })
    .onEnd(()=>{ sBase.value=s.value; txBase.value=tx.value; tyBase.value=ty.value; runOnJS(syncRefs)(s.value,tx.value,ty.value); });

  const doubleTap = Gesture.Tap().numberOfTaps(2)
    .onEnd((_e,ok)=>{
      if(!ok) return;
      const {width:w,height:h}=Dimensions.get('window');
      const fit=calcFit(w,h), ix=w/2-(BB.minX+BB_W/2)*fit, iy=h/2-(BB.minY+BB_H/2)*fit;
      s.value=withSpring(fit); sBase.value=fit;
      tx.value=withSpring(ix); txBase.value=ix;
      ty.value=withSpring(iy); tyBase.value=iy;
      runOnJS(syncRefs)(fit,ix,iy);
    });

  const all = Gesture.Simultaneous(Gesture.Exclusive(doubleTap,pan),pinch);
  const animStyle = useAnimatedStyle(()=>({ transform:[{translateX:tx.value},{translateY:ty.value},{scale:s.value}] }));

  const handleTap = useCallback((e:any)=>{
    const {locationX:x,locationY:y}=e.nativeEvent;
    const svgX=(x-txRef.current)/sRef.current, svgY=(y-tyRef.current)/sRef.current;
    for(const lote of LOTES_SVG){ if(puntoDentroDePoligono(svgX,svgY,lote.d)){ onTapLote(lote.id); break; } }
  },[onTapLote]);

  const bgMap = dark ? '#1a1a2e' : '#E8E8E0';

  return (
    <View style={[st.mapaWrap,{backgroundColor:bgMap}]}
      onLayout={e=>{ const{width:w,height:h}=e.nativeEvent.layout; centrar(w,h); }}>
      <GestureDetector gesture={all}>
        <Animated.View style={[{position:'absolute',width:780,height:640},animStyle]}>
          <Svg width={780} height={640} viewBox="0 0 780 640">
            <Defs>
              <LinearGradient id="grad_disponible" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#A8E0A7" stopOpacity="1"/><Stop offset="1" stopColor="#4E9E4D" stopOpacity="1"/>
              </LinearGradient>
              <LinearGradient id="grad_reservado" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#F9DF8A" stopOpacity="1"/><Stop offset="1" stopColor="#C49A20" stopOpacity="1"/>
              </LinearGradient>
              <LinearGradient id="grad_vendido" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#D0D0D0" stopOpacity="1"/><Stop offset="1" stopColor="#888888" stopOpacity="1"/>
              </LinearGradient>
            </Defs>
            {LOTES_SVG.map(lote=>{
              const info=lotes[lote.id], estado=info?.estado??'disponible';
              const centro=getCentro(lote.d);
              const color = estado==='vendido' ? '#ABABAB' : estado==='reservado' ? '#F0C060' : '#7BC67A';
              const strokeColor = dark ? '#555' : '#333';
              const lineas:string[]=[];
              if(estado==='vendido'){ if(info?.comprador)lineas.push(primerNombre(info.comprador)); if(info?.precio)lineas.push('$'+formatNum(info.precio)); }
              else if(estado==='reservado'){ if(info?.comprador)lineas.push(primerNombre(info.comprador)); if(info?.monto_reserva)lineas.push('Res $'+formatNum(info.monto_reserva)); if(info?.precio)lineas.push('Tot $'+formatNum(info.precio)); }
              else lineas.push(lote.id.replace('lote_0','L').replace('lote_','L'));
              const LINE_H=9, oY=-((lineas.length-1)*LINE_H)/2;
              return (
                <G key={lote.id}>
                  <Path d={lote.d} fill={color} stroke={strokeColor} strokeWidth={1}/>
                  {lineas.map((linea,i)=>(
                    <SvgText key={i} x={centro.x} y={centro.y+oY+i*LINE_H}
                      fontSize={7} fontWeight={i===0?'bold':'normal'}
                      fill={dark?'#eee':'#1a1a1a'} textAnchor="middle" alignmentBaseline="middle">
                      {linea}
                    </SvgText>
                  ))}
                </G>
              );
            })}
          </Svg>
        </Animated.View>
      </GestureDetector>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleTap}/>
      <Text style={[st.hint,{color:dark?'#aaa':'#555',backgroundColor:dark?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.75)'}]}>
        Zoom · Doble tap centra
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
  cardInner:{ flex: 1, padding: 7, justifyContent: 'space-between' },
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
  mapaWrap: { flex: 1, overflow: 'hidden' },
  hint:     { position: 'absolute', bottom: 8, alignSelf: 'center', fontSize: 11, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
});