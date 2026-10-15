/* ══════════════════════════════════════════════════════════════
   Calendario — la semana y las sesiones de cada día
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App, P = global.Planner;

  var diaElegido = null;   // null = hoy
  var offsetSemana = 0;    // 0 = semana actual

  function lunesDe(d, off) {
    var x = new Date(d.getTime());
    var dow = (x.getDay() + 6) % 7;             // lunes = 0
    x.setDate(x.getDate() - dow + (off || 0) * 7);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  R.add('/calendario', function () {
    var hoy = S.hoy();
    var lun = lunesDe(hoy, offsetSemana);
    var dias = [];
    for (var i = 0; i < 7; i++) dias.push(U.addDays(lun, i));

    var sel = diaElegido;
    if (!sel || U.daysBetween(lun, U.parseYmd(sel)) < 0 ||
        U.daysBetween(lun, U.parseYmd(sel)) > 6) {
      sel = (offsetSemana === 0) ? U.ymd(hoy) : U.ymd(lun);
    }

    var delDia = S.sesionesDe(sel);
    var hechas = delDia.filter(function (s) { return s.estado === 'hecha'; }).length;
    var minutos = delDia.reduce(function (a, s) { return a + s.duracion; }, 0);

    /* resumen de la semana mostrada */
    var ini = U.ymd(lun), fin = U.ymd(U.addDays(lun, 6));
    var enSemana = S.get().sesiones.filter(function (s) {
      return s.fecha >= ini && s.fecha <= fin;
    });
    var hechasSem = enSemana.filter(function (s) { return s.estado === 'hecha'; }).length;
    var pctSem = enSemana.length ? Math.round(hechasSem / enSemana.length * 100) : 0;

    var rotulo = offsetSemana === 0 ? 'Esta semana'
      : offsetSemana === 1 ? 'Semana próxima'
      : offsetSemana === -1 ? 'Semana pasada'
      : U.fmtDay(U.ymd(lun)) + ' al ' + U.fmtDay(fin);

    return {
      bar: {
        titulo: 'Calendario',
        sub: U.MON[lun.getMonth()].charAt(0).toUpperCase() + U.MON[lun.getMonth()].slice(1) +
          ' ' + lun.getFullYear(),
        acciones: [{ icono: 'plus', to: '/materia-nueva', label: 'Agregar materia' }]
      },
      tab: 'calendario',
      flush: true,
      body:
        /* ── cambio de semana ── */
        '<div class="row-between" style="margin-bottom:10px">' +
          '<button class="ab-btn" data-act="cal-prev" aria-label="Semana anterior">' +
            U.icon('back', 19) + '</button>' +
          '<b style="font:var(--t-subtitle)">' + U.esc(rotulo) + '</b>' +
          '<button class="ab-btn" data-act="cal-next" aria-label="Semana siguiente">' +
            U.icon('next', 19) + '</button>' +
        '</div>' +

        /* ── tira de días ── */
        '<div class="cal-strip" style="margin-bottom:14px">' +
          dias.map(function (d) {
            var f = U.ymd(d);
            var ses = S.sesionesDe(f);
            var esHoy = f === U.ymd(hoy);
            return '<button class="cal-day' + (f === sel ? ' on' : '') +
              (esHoy ? ' today' : '') + '" data-act="cal-dia" data-f="' + f + '">' +
              '<span class="cd-dow">' + U.DOW[d.getDay()] + '</span>' +
              '<span class="cd-n">' + d.getDate() + '</span>' +
              '<span class="cd-dots">' + ses.slice(0, 3).map(function (s) {
                return '<i class="' + (s.estado === 'hecha' ? 'done' : '') + '"></i>';
              }).join('') + '</span></button>';
          }).join('') +
        '</div>' +

        /* ── progreso de la semana ── */
        '<div class="card-flat" style="margin-bottom:16px">' +
          '<div class="row-between" style="margin-bottom:9px">' +
            '<b style="font:var(--t-subtitle)">' + hechasSem + ' de ' + enSemana.length +
            ' sesiones cumplidas</b>' +
            '<span class="p-small tnum">' + pctSem + '%</span>' +
          '</div>' +
          '<div class="bar"><i style="width:' + pctSem + '%"></i></div>' +
        '</div>' +

        /* ── sesiones del día ── */
        '<div class="section-h" style="margin-top:4px"><h3>' +
          (sel === U.ymd(hoy) ? 'Hoy, ' + U.fmtDay(sel) : U.fmtDate(sel, true)) + '</h3>' +
          (delDia.length ? '<span class="p-small">' + U.mins(minutos) + '</span>' : '') +
        '</div>' +

        (delDia.length
          ? '<div class="stack-sm">' + delDia.map(tarjetaSesion).join('') + '</div>' +
            (hechas === delDia.length && delDia.length
              ? '<div class="sp-12"></div><div class="note note-green">' +
                U.icon('check', 19, 2.3) + '<div>Cumpliste todas las sesiones de este día.</div></div>'
              : '')
          : '<div class="card-flat" style="text-align:center;padding:26px 18px">' +
            '<div style="color:var(--outline);margin-bottom:9px">' + U.icon('coffee', 28) + '</div>' +
            '<b style="font:var(--t-subtitle);display:block;margin-bottom:4px">Día libre</b>' +
            '<p class="p-small">No hay sesiones programadas para este día.</p></div>') +

        '<div class="sp-24"></div>'
      ,
      onMount: function () {
        A.accion('cal-dia', function (el) {
          diaElegido = el.getAttribute('data-f');
          R.render();
        });
        A.accion('cal-prev', function () { offsetSemana--; diaElegido = null; R.render(); });
        A.accion('cal-next', function () { offsetSemana++; diaElegido = null; R.render(); });
      }
    };
  });

  function tarjetaSesion(s) {
    var m = S.materia(s.materiaId);
    var u = S.unidad(s.materiaId, s.unidad);
    var t = S.TECNICAS[s.tecnica];
    var est = s.estado;
    var badge = est === 'hecha'
      ? '<span class="badge badge-green">' + U.icon('check', 12, 2.6) + 'Hecha</span>'
      : est === 'omitida'
        ? '<span class="badge badge-red">Omitida</span>'
        : s.ajuste
          ? '<span class="badge badge-amber">' + U.icon('repeat', 12, 2.3) + 'Refuerzo</span>'
          : '';

    return '<button class="session bar-left ' + (m ? m.color : 'grey') +
      (est === 'hecha' ? ' done' : '') + '" data-go="/sesion/' + s.id + '">' +
      '<span class="s-time">' + s.hora + '</span>' +
      '<span class="s-body">' +
        '<span class="row-between" style="gap:8px"><span class="s-title">' +
          U.esc(u ? u.titulo : 'Unidad ' + s.unidad) + '</span>' + badge + '</span>' +
        '<span class="s-sub">' + U.esc(m ? m.corto : '') + ' · ' + U.mins(s.duracion) +
        ' · ' + U.esc(t.nombre) + '</span>' +
      '</span></button>';
  }

  global.CalUI = { tarjetaSesion: tarjetaSesion };
})(window);
