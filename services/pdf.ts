import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// ── Genera y comparte el PDF general ─────────────────────
export async function generarPDFGeneral(lotes: Record<string, any>) {
  const vendidosReservados = Object.values(lotes).filter(
    l => l.estado === 'vendido' || l.estado === 'reservado'
  );

  const total    = Object.values(lotes).length;
  const vendidos = Object.values(lotes).filter(l => l.estado === 'vendido').length;
  const reservados = Object.values(lotes).filter(l => l.estado === 'reservado').length;
  const disponibles = Object.values(lotes).filter(l => l.estado === 'disponible').length;
  const totalVendido = Object.values(lotes)
    .filter(l => l.estado === 'vendido' && l.precio)
    .reduce((sum, l) => sum + Number(l.precio), 0);
  const totalReservado = Object.values(lotes)
    .filter(l => l.estado === 'reservado' && l.precio)
    .reduce((sum, l) => sum + Number(l.precio), 0);

  const fecha = new Date().toLocaleDateString('es-EC', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #222; padding: 30px; }
    h1 { font-size: 22px; color: #1A1A2E; margin-bottom: 4px; }
    .fecha { font-size: 11px; color: #888; margin-bottom: 24px; }
    .resumen { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
    .stat { background: #f5f5f0; border-radius: 8px; padding: 12px 18px; flex: 1; min-width: 120px; }
    .stat-num { font-size: 24px; font-weight: bold; color: #1A1A2E; }
    .stat-lbl { font-size: 10px; color: #888; margin-top: 2px; }
    .stat.verde .stat-num { color: #4E9E4D; }
    .stat.amarillo .stat-num { color: #C49A20; }
    .stat.gris .stat-num { color: #888; }
    h2 { font-size: 14px; color: #1A1A2E; margin-bottom: 12px; border-bottom: 2px solid #1A1A2E; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { background: #1A1A2E; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
    td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 11px; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .badge.vendido { background: #e0e0e0; color: #555; }
    .badge.reservado { background: #FFF0C0; color: #996600; }
    .footer { margin-top: 20px; font-size: 10px; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <h1>Refugio Verde — Reporte de Lotización</h1>
  <p class="fecha">Generado el ${fecha}</p>

  <div class="resumen">
    <div class="stat">
      <div class="stat-num">${total}</div>
      <div class="stat-lbl">Total lotes</div>
    </div>
    <div class="stat verde">
      <div class="stat-num">${disponibles}</div>
      <div class="stat-lbl">Disponibles</div>
    </div>
    <div class="stat amarillo">
      <div class="stat-num">${reservados}</div>
      <div class="stat-lbl">Reservados</div>
    </div>
    <div class="stat gris">
      <div class="stat-num">${vendidos}</div>
      <div class="stat-lbl">Vendidos</div>
    </div>
    <div class="stat">
      <div class="stat-num">$${(totalVendido/1000).toFixed(0)}k</div>
      <div class="stat-lbl">Total vendido</div>
    </div>
    <div class="stat amarillo">
      <div class="stat-num">$${(totalReservado/1000).toFixed(0)}k</div>
      <div class="stat-lbl">En reservas</div>
    </div>
  </div>

  <h2>Propietarios y Reservas</h2>
  <table>
    <thead>
      <tr>
        <th>Lote</th>
        <th>Estado</th>
        <th>Propietario</th>
        <th>Cédula</th>
        <th>Teléfono</th>
        <th>Email</th>
        <th>Precio</th>
        <th>Reserva</th>
      </tr>
    </thead>
    <tbody>
      ${vendidosReservados
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(l => `
        <tr>
          <td><strong>${l.id.replace('lote_0','L').replace('lote_','L')}</strong></td>
          <td><span class="badge ${l.estado}">${l.estado === 'vendido' ? 'Vendido' : 'Reservado'}</span></td>
          <td>${l.comprador ?? '—'}</td>
          <td>${l.cedula ?? '—'}</td>
          <td>${l.telefono ?? '—'}</td>
          <td>${l.email ?? '—'}</td>
          <td>${l.precio ? '$' + Number(l.precio).toLocaleString('es-EC') : '—'}</td>
          <td>${l.monto_reserva ? '$' + Number(l.monto_reserva).toLocaleString('es-EC') : '—'}</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <p class="footer">Refugio Verde · Reporte generado automáticamente</p>
</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

// ── Genera PDF de un solo lote ────────────────────────────
export async function generarPDFLote(lote: any) {
  const fecha = new Date().toLocaleDateString('es-EC', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const num = lote.id.replace('lote_0','L').replace('lote_','L');
  const esVendido = lote.estado === 'vendido';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 40px; }
    h1 { font-size: 20px; color: #1A1A2E; margin-bottom: 4px; }
    .sub { font-size: 11px; color: #888; margin-bottom: 28px; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
    .card-title { font-size: 12px; color: #888; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-value { font-size: 15px; font-weight: bold; color: #1A1A2E; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;
      background: ${esVendido ? '#e0e0e0' : '#FFF0C0'}; color: ${esVendido ? '#555' : '#996600'}; margin-bottom: 20px; }
    .footer { margin-top: 30px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>Refugio Verde — ${num}</h1>
  <p class="sub">Generado el ${fecha}</p>
  <span class="badge">${lote.estado === 'vendido' ? 'Vendido' : 'Reservado'}</span>

  <div class="grid">
    <div class="card">
      <div class="card-title">Propietario</div>
      <div class="card-value">${lote.comprador ?? '—'}</div>
    </div>
    <div class="card">
      <div class="card-title">Cédula / RUC</div>
      <div class="card-value">${lote.cedula ?? '—'}</div>
    </div>
    <div class="card">
      <div class="card-title">Teléfono</div>
      <div class="card-value">${lote.telefono ?? '—'}</div>
    </div>
    <div class="card">
      <div class="card-title">Correo electrónico</div>
      <div class="card-value">${lote.email ?? '—'}</div>
    </div>
    <div class="card">
      <div class="card-title">Precio ${esVendido ? 'de venta' : 'acordado'}</div>
      <div class="card-value">${lote.precio ? '$' + Number(lote.precio).toLocaleString('es-EC') : '—'}</div>
    </div>
    ${lote.monto_reserva ? `
    <div class="card">
      <div class="card-title">Monto de reserva</div>
      <div class="card-value">$${Number(lote.monto_reserva).toLocaleString('es-EC')}</div>
    </div>` : ''}
  </div>

  ${lote.notas ? `
  <div class="card">
    <div class="card-title">Notas</div>
    <div class="card-value" style="font-weight:normal">${lote.notas}</div>
  </div>` : ''}

  <p class="footer">Refugio Verde · Reporte generado automáticamente</p>
</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

// ── Compartir un PDF (WhatsApp, email, Drive, etc) ────────
export async function compartirPDF(uri: string, nombre: string) {
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartir reporte',
    UTI: 'com.adobe.pdf',
  });
}

// ── Descargar PDF al almacenamiento del celular ───────────
export async function descargarPDF(uri: string, nombre: string) {
  // En versiones nuevas de expo-file-system, usamos el uri directo
  // que ya está en el directorio de caché de la app
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Guardar PDF',
    UTI: 'com.adobe.pdf',
  });
  return uri;
}