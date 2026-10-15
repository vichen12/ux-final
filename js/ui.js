/* ══════════════════════════════════════════════════════════════
   ui.js — iconos y utilidades de render
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var P = {
    home:'<path d="M3 10.3 12 3l9 7.3V20a1 1 0 0 1-1 1h-5v-6.3H9V21H4a1 1 0 0 1-1-1z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    cards:'<rect x="6.5" y="3.5" width="14" height="14" rx="2.5"/><path d="M17 20.5H5.5a2 2 0 0 1-2-2V7"/>',
    user:'<circle cx="12" cy="8.2" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    back:'<path d="m15 5-7 7 7 7"/>',
    next:'<path d="m9 5 7 7-7 7"/>',
    up:'<path d="m5 15 7-7 7 7"/>',
    down:'<path d="m5 9 7 7 7-7"/>',
    plus:'<path d="M12 5.5v13M5.5 12h13"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x:'<path d="M6 6l12 12M18 6 6 18"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.3V12l3.2 1.9"/>',
    book:'<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H18a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 0 18 16H5.5A1.5 1.5 0 0 0 4 17.5z"/><path d="M4 17.5A1.5 1.5 0 0 0 5.5 19H19"/>',
    play:'<path d="M7.5 5.2 18.5 12 7.5 18.8z"/>',
    pause:'<rect x="7" y="5" width="3.6" height="14" rx="1.4"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.4"/>',
    stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/>',
    bell:'<path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.8 5.6 1.8 5.6H4.2S6 13.5 6 9Z"/><path d="M10.2 19a2 2 0 0 0 3.6 0"/>',
    gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.6v2.5M12 18.9v2.5M21.4 12h-2.5M5.1 12H2.6M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3"/>',
    edit:'<path d="m4 20 .8-3.6L15.9 5.3a2 2 0 0 1 2.8 0l.9.9a2 2 0 0 1 0 2.8L8.5 20z"/>',
    flame:'<path d="M12 2.5s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.6-2.8 1.4-3.8 0 1.6.9 2.6 2 2.6 1.6 0 2.2-1.6 1.6-7.8Z"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    brain:'<path d="M9.5 3.5A3 3 0 0 0 6.6 6 2.8 2.8 0 0 0 5 8.6c0 .9.4 1.7 1 2.3a3 3 0 0 0 .4 4.3A3 3 0 0 0 9.5 20c1 0 1.9-.5 2.5-1.2V4.7a3 3 0 0 0-2.5-1.2Z"/><path d="M14.5 3.5A3 3 0 0 1 17.4 6 2.8 2.8 0 0 1 19 8.6c0 .9-.4 1.7-1 2.3a3 3 0 0 1-.4 4.3A3 3 0 0 1 14.5 20c-1 0-1.9-.5-2.5-1.2"/>',
    repeat:'<path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9L20.5 8"/><path d="M20.5 3.5V8H16"/><path d="M20.5 12a8.5 8.5 0 0 1-14.6 5.9L3.5 16"/><path d="M3.5 20.5V16H8"/>',
    bulb:'<path d="M9.2 17.5a6 6 0 1 1 5.6 0"/><path d="M9.5 17.5h5M10.2 21h3.6"/>',
    trend:'<path d="M3 16.5 9 10l4 3.5L21 6"/><path d="M15.5 6H21v5.5"/>',
    alert:'<path d="M12 3.6 22 20H2z"/><path d="M12 10v4.2M12 17.2h.01"/>',
    star:'<path d="m12 3.5 2.7 5.5 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.3 9.9l6-.9z"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3.6 6h.01M3.6 12h.01M3.6 18h.01"/>',
    more:'<circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    award:'<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.8-1.3 6.7 4.8-2.6 4.8 2.6-1.3-6.7"/>',
    refresh:'<path d="M20.5 11A8.5 8.5 0 0 0 6 6.3L3.5 8.8"/><path d="M3.5 4v5h5"/><path d="M3.5 13a8.5 8.5 0 0 0 14.5 4.7l2.5-2.5"/><path d="M20.5 20v-5h-5"/>',
    arrow:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    spark:'<path d="M12 3.2 13.8 9l5.8 1.8-5.8 1.8L12 18.4 10.2 12.6 4.4 10.8 10.2 9z"/><path d="M18.5 3.5v3M20 5h-3"/>',
    timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.8v3.7l2.5 1.5M9.5 2.5h5"/>',
    cap:'<path d="M12 3 2.5 7.8 12 12.6l9.5-4.8z"/><path d="M6 10.2v5c0 2 2.7 3.6 6 3.6s6-1.6 6-3.6v-5"/><path d="M21.5 7.8v6"/>',
    file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    note:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h8L19 7.5v12A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5z"/><path d="M9 11h6M9 15h4"/>',
    moon:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
    sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"/>',
    coffee:'<path d="M4 8h13v6.5a4.5 4.5 0 0 1-4.5 4.5h-4A4.5 4.5 0 0 1 4 14.5z"/><path d="M17 9.5h1.8a2.6 2.6 0 0 1 0 5.2H17"/><path d="M4 21.5h13"/>',
    users:'<circle cx="9.5" cy="8.5" r="3.4"/><path d="M3.2 19.5a6.3 6.3 0 0 1 12.6 0"/><path d="M16.5 5.6a3.4 3.4 0 0 1 0 6.1M18 19.5a6.4 6.4 0 0 0-2-4.6"/>',
    help:'<circle cx="12" cy="12" r="8.6"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4M12 17h.01"/>',
    trash:'<path d="M4.5 6.5h15M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7"/><path d="M6.5 6.5 7.4 20a1.3 1.3 0 0 0 1.3 1.2h6.6a1.3 1.3 0 0 0 1.3-1.2l.9-13.5"/>',
    logout:'<path d="M9.5 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3h4"/><path d="M15.5 16.5 20 12l-4.5-4.5M20 12H9"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/>',
    lock:'<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.4"/><path d="M8 10.5V7.4a4 4 0 1 1 8 0v3.1"/>',
    chart:'<path d="M4 20V11M10 20V5M16 20v-6M22 20H2"/>'
  };

  function icon(name, size, sw) {
    var d = P[name] || P.help;
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) +
      '" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.85) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* ── logotipo del producto ── */
  function logo(size, cls) {
    return '<svg class="' + (cls || 'logo') + '" viewBox="0 0 48 48" fill="none" width="' +
      (size || 40) + '" height="' + (size || 40) + '" aria-hidden="true">' +
      '<rect width="48" height="48" rx="12" fill="#0037b0"/>' +
      '<path d="M12 18L24 12L36 18L24 24L12 18Z" stroke="#fff" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M16 20.5V28C16 31 20 34 24 34C28 34 32 31 32 28V20.5" stroke="#fff" ' +
      'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M36 18V26" stroke="#ffcb8f" stroke-width="2.5" stroke-linecap="round"/></svg>';
  }

  /* ── anillo de progreso ── */
  function ring(pct, size, stroke, color, inner) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r;
    var off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return '<div class="ring" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" ' +
      'stroke="var(--surface-high)" stroke-width="' + stroke + '"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" ' +
      'stroke="' + (color || 'var(--primary)') + '" stroke-width="' + stroke +
      '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) +
      '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
      '<div class="ring-val">' + (inner || '') + '</div></div>';
  }

  /* ── texto seguro ── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── fechas en castellano ── */
  var DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var DOW_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MON = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function ymd(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function parseYmd(s) {
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(s, long) {
    var d = typeof s === 'string' ? parseYmd(s) : s;
    return long
      ? DOW_L[d.getDay()] + ' ' + d.getDate() + ' de ' + MON[d.getMonth()]
      : DOW[d.getDay()] + ' ' + d.getDate() + '/' + pad(d.getMonth() + 1);
  }
  function fmtDay(s) {
    var d = typeof s === 'string' ? parseYmd(s) : s;
    return d.getDate() + ' de ' + MON[d.getMonth()];
  }
  function addDays(d, n) {
    var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x;
  }
  function daysBetween(a, b) {
    var A = typeof a === 'string' ? parseYmd(a) : a, B = typeof b === 'string' ? parseYmd(b) : b;
    return Math.round((B - A) / 86400000);
  }
  function relDays(n) {
    if (n === 0) return 'hoy';
    if (n === 1) return 'mañana';
    if (n === -1) return 'ayer';
    if (n > 1) return 'en ' + n + ' días';
    return 'hace ' + Math.abs(n) + ' días';
  }
  function mins(m) {
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + ' h ' + r + ' min' : h + ' h';
  }
  function clock(sec) {
    var m = Math.floor(Math.abs(sec) / 60), s = Math.abs(sec) % 60;
    return (sec < 0 ? '-' : '') + pad(m) + ':' + pad(s);
  }

  /* "1 pregunta" / "3 preguntas" */
  function plural(n, sing, plu) {
    return n + ' ' + (n === 1 ? sing : (plu || sing + 's'));
  }

  global.UI = {
    plural: plural,
    icon: icon, logo: logo, ring: ring, esc: esc,
    ymd: ymd, parseYmd: parseYmd, pad: pad, fmtDate: fmtDate, fmtDay: fmtDay,
    addDays: addDays, daysBetween: daysBetween, relDays: relDays,
    mins: mins, clock: clock, DOW: DOW, DOW_L: DOW_L, MON: MON
  };
})(window);
