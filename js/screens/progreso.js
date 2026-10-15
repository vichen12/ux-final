/* ══════════════════════════════════════════════════════════════
   Progreso — la distinción que sostiene el proyecto:
   un tema leído no es un tema dominado.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App, P = global.Planner;

  var materiaElegida = null;

  R.add('/progreso', function () {
    var st = S.get();
    if (!st.materias.length) {
      return {
        bar: { titulo: 'Mi progreso' },
        tab: 'progreso',
        body: '<div class="empty"><div class="em-ico">' + U.icon('chart', 32) + '</div>' +
          '<h3>Todavía no hay nada que medir</h3>' +
          '<p>Cargá una materia y empezá a estudiar: acá vas a ver cuánto leíste y cuánto ' +
          'realmente dominás.</p>' +
          '<button class="btn btn-primary" data-go="/materia-nueva">Agregar materia</button></div>'
      };
    }

    var sel = materiaElegida && S.materia(materiaElegida) ? materiaElegida : st.materias[0].id;
    var m = S.materia(sel);
    var pr = S.progresoMateria(sel);
    var sinProbar = pr.leidas - pr.dominadas;
    var dias = U.daysBetween(S.hoy(), U.parseYmd(m.parcial));

    /* totales de todas las materias */
    var tot = { leidas: 0, dominadas: 0, total: 0 };
    st.materias.forEach(function (x) {
      var p = S.progresoMateria(x.id);
      tot.leidas += p.leidas; tot.dominadas += p.dominadas; tot.total += p.total;
    });

    return {
      bar: { titulo: 'Mi progreso', sub: tot.dominadas + ' de ' + tot.total +
        ' unidades dominadas en total',
        acciones: [{ icono: 'help', act: 'pg-ayuda', label: 'Qué significa cada estado' }] },
      tab: 'progreso',
      flush: true,
      body:
        /* selector de materia */
        '<div class="cal-strip" style="margin-bottom:16px">' +
          st.materias.map(function (x) {
            var on = x.id === sel;
            return '<button class="chip' + (on ? ' chip-primary' : ' chip-outline') +
              '" style="flex:none;height:34px" data-act="pg-materia" data-id="' + x.id + '">' +
              U.esc(x.corto || x.nombre) + '</button>';
          }).join('') +
        '</div>' +

        '<div class="home-grid"><div class="home-col">' +
        /* las dos cifras enfrentadas */
        '<div class="card bar-left ' + m.color + '" style="margin-bottom:12px">' +
          '<div class="row-between" style="margin-bottom:13px">' +
            '<div class="grow"><div class="card-title">' + U.esc(m.nombre) + '</div>' +
            '<div class="card-sub">Parcial en ' + dias + ' días</div></div>' +
          '</div>' +
          '<div class="duo" style="margin-bottom:12px">' +
            '<div class="d-read"><b>' + pr.leidas + ' de ' + pr.total + '</b>' +
            '<span>temas leídos</span></div>' +
            '<div class="d-master"><b>' + pr.dominadas + ' de ' + pr.total + '</b>' +
            '<span>temas dominados</span></div>' +
          '</div>' +
          '<div class="bar-stack">' +
            '<i class="master" style="width:' + pr.pctDom + '%"></i>' +
            '<i class="read" style="width:' + Math.max(0, pr.pct - pr.pctDom) + '%"></i>' +
          '</div>' +
          '<div class="row" style="gap:16px;margin-top:9px">' +
            '<span class="p-small row" style="gap:6px"><i style="width:9px;height:9px;' +
            'border-radius:2px;background:var(--secondary);display:block"></i>Dominado</span>' +
            '<span class="p-small row" style="gap:6px"><i style="width:9px;height:9px;' +
            'border-radius:2px;background:var(--marker);display:block"></i>Leído sin probar</span>' +
            '<span class="p-small row" style="gap:6px"><i style="width:9px;height:9px;' +
            'border-radius:2px;background:var(--surface-high);display:block"></i>Pendiente</span>' +
          '</div>' +
        '</div>' +

        /* el aviso que es el corazón del producto */
        (sinProbar
          ? '<div class="note note-amber" style="margin-bottom:14px">' + U.icon('alert', 19) +
            '<div><b>Tenés ' + sinProbar + ' ' +
            (sinProbar === 1 ? 'unidad leída que todavía no aprobaste' :
              'unidades leídas que todavía no aprobaste') + ' en quiz</b>' +
            'Es la diferencia entre creer que sabés y comprobarlo. Faltan ' + dias +
            ' días para el parcial.</div></div>'
          : pr.dominadas === pr.total
            ? '<div class="note note-green" style="margin-bottom:14px">' +
              U.icon('award', 19) + '<div><b>Dominás todo el programa</b>' +
              'Llegás al parcial con todas las unidades comprobadas.</div></div>'
            : '') +

        /* unidades */
        '<div class="section-h" style="margin-top:4px"><h3>Unidad por unidad</h3></div>' +
        '<div class="card">' +
          m.unidades.map(function (u) {
            return global.MateriaUI.filaUnidadEstado(m, u);
          }).join('') +
        '</div>' +

        '</div><div class="home-col">' +
        /* todas las materias juntas */
        '<div class="section-h"><h3>Todas tus materias</h3></div>' +
        '<div class="card"><div class="row" style="gap:18px">' +
          '<div class="chart-box" style="width:132px;height:132px;flex:none"><canvas id="pg-dona" aria-label="Unidades dominadas, leídas y pendientes"></canvas></div>' +
          '<div class="grow">' +
            leyenda('var(--secondary)', 'Dominadas', tot.dominadas) +
            leyenda('var(--marker)', 'Leídas sin probar', tot.leidas - tot.dominadas) +
            leyenda('var(--surface-high)', 'Pendientes', tot.total - tot.leidas) +
          '</div></div></div>' +
        /* constancia */
        '<div class="section-h"><h3>Tu constancia</h3></div>' +
        bloqueConstancia() +
        '</div></div>',

      onMount: function () {
        var css = getComputedStyle(document.documentElement);
        var col = function (v) { return css.getPropertyValue(v).trim(); };
        global.Anim.grafico(document.getElementById('pg-dona'), {
          type: 'doughnut',
          data: { labels: ['Dominadas', 'Leídas sin probar', 'Pendientes'],
            datasets: [{ data: [tot.dominadas, tot.leidas - tot.dominadas, tot.total - tot.leidas],
              backgroundColor: [col('--secondary'), col('--marker'), col('--surface-high')], borderWidth: 0, borderRadius: 4, spacing: 2 }] },
          options: { cutout: '68%', maintainAspectRatio: false, plugins: { legend: { display: false } },
            animation: { animateRotate: true, duration: 1100, easing: 'easeOutQuart' } }
        });
        var d = diasConstancia();
        global.Anim.grafico(document.getElementById('pg-const'), {
          type: 'bar',
          data: { labels: d.map(function (x) { return U.parseYmd(x.f).getDate(); }),
            datasets: [
              { label: 'Hechas', data: d.map(function (x) { return x.hechas; }), backgroundColor: col('--secondary'), borderRadius: 5, stack: 's' },
              { label: 'Sin hacer', data: d.map(function (x) { return x.total - x.hechas; }), backgroundColor: col('--surface-high'), borderRadius: 5, stack: 's' }
            ] },
          options: { maintainAspectRatio: false, plugins: { legend: { display: false },
              tooltip: { callbacks: { title: function (it) { return U.fmtDate(d[it[0].dataIndex].f, true); } } } },
            scales: { x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
              y: { stacked: true, display: false, beginAtZero: true } },
            animation: { duration: 900, easing: 'easeOutQuart' } }
        });
        A.accion('pg-ayuda', function () {
          A.sheet('<h3>Qué significa cada estado</h3>' +
            '<div class="sh-sub">La diferencia entre haber leído un tema y saberlo.</div>' +
            '<div class="stack-sm">' +
            ayuda('master', 'check', 'Dominada', 'Respondiste bien al menos el 70 % de tus ' +
              'preguntas de la unidad en un quiz.') +
            ayuda('read', 'eye', 'Leída, sin probar', 'Hiciste sesiones de la unidad pero ' +
              'todavía no comprobaste si la recordás.') +
            ayuda('', 'clock', 'Pendiente', 'Todavía no la estudiaste; está en tu plan.') +
            '</div><div class="sp-12"></div>' +
            '<button class="btn btn-secondary btn-block" data-cerrar>Entendido</button>');
        });
        A.accion('pg-materia', function (el) {
          materiaElegida = el.getAttribute('data-id');
          R.render();
        });
      }
    };
  });

  function ayuda(c, ico, t, s) {
    return '<div class="unit" style="align-items:flex-start;padding:10px 0">' +
      '<span class="unit-n ' + c + '">' + U.icon(ico, 14, 2.4) + '</span>' +
      '<span class="unit-text"><span class="unit-title">' + t + '</span>' +
      '<span class="unit-sub">' + s + '</span></span></div>';
  }

  function diasConstancia() {
    var st = S.get();
    var dias = [];
    for (var i = 13; i >= 0; i--) {
      var f = U.ymd(U.addDays(S.hoy(), -i));
      var ses = st.sesiones.filter(function (s) { return s.fecha === f; });
      var hechas = ses.filter(function (s) { return s.estado === 'hecha'; }).length;
      dias.push({ f: f, total: ses.length, hechas: hechas });
    }
    return dias;
  }

  function leyenda(color, texto, n) {
    return '<div class="row-between" style="padding:7px 0">' +
      '<span class="row" style="gap:9px;font:var(--t-body-sm);font-weight:600">' +
      '<i style="width:12px;height:12px;border-radius:4px;background:' + color + ';display:block"></i>' + texto + '</span>' +
      '<b style="font:800 18px/1 var(--display)" data-count="' + n + '">' + n + '</b></div>';
  }

  function bloqueConstancia() {
    var st = S.get();
    var sem = S.cumplimientoSemana();
    return '<div class="card">' +
      '<div class="row-between" style="margin-bottom:12px">' +
        '<b style="font:var(--t-subtitle)">Sesiones de las últimas dos semanas</b>' +
        '<span class="p-small tnum">' + sem.hechas + '/' + sem.total + ' esta semana</span>' +
      '</div>' +
      '<div class="chart-box"><canvas id="pg-const" aria-label="Sesiones hechas por día"></canvas></div>' +
      '<div class="divider" style="margin:14px 0"></div>' +
      '<div class="row">' +
        '<span class="li-ico amber">' + U.icon('flame', 19) + '</span>' +
        '<span class="grow"><b style="font:var(--t-subtitle);display:block">' +
        st.usuario.racha + ' días seguidos estudiando</b>' +
        '<span class="p-small">Tu mejor racha desde que empezaste</span></span></div>' +
      '</div>';
  }

  /* ── /unidad/:materiaId/:n — detalle de una unidad ───────────── */
  R.add('/unidad/:materiaId/:n', function (p) {
    var m = S.materia(p.materiaId);
    var u = S.unidad(p.materiaId, p.n);
    if (!m || !u) return { bar: { titulo: 'Unidad', back: '/progreso' },
      body: global.noEncontrado('Esa unidad no existe.') };

    var tarjetas = S.tarjetasDe(m.id, u.n);
    var hoy = S.hoyStr();
    var paraHoy = tarjetas.filter(function (t) { return t.proximo <= hoy; });
    var sesiones = S.get().sesiones.filter(function (s) {
      return s.materiaId === m.id && s.unidad === u.n;
    }).sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    var hechas = sesiones.filter(function (s) { return s.estado === 'hecha'; });
    var dif = global.MateriaUI.DIF[u.dif];

    var est = u.estado === 'dominada'
      ? { t: 'Dominada', c: 'note-green', i: 'check',
          s: 'Respondiste bien las preguntas de esta unidad. Cuenta como aprendida.' }
      : u.estado === 'leida'
        ? { t: 'Leída, sin probar', c: 'note-amber', i: 'eye',
            s: 'La estudiaste pero todavía no comprobaste si la retenés.' }
        : { t: 'Pendiente', c: 'note-grey', i: 'clock',
            s: 'Todavía no la trabajaste. Está en el plan.' };

    return {
      bar: { titulo: 'Unidad ' + u.n, sub: m.corto, back: '/progreso' },
      body:
        '<h2 class="h-head">' + U.esc(u.titulo) + '</h2>' +
        '<div class="chip-row" style="margin-bottom:14px">' +
          '<span class="chip ' + dif.c + '">' + dif.t + '</span>' +
          '<span class="chip">' + U.icon('book', 14) + U.esc(m.nombre) + '</span>' +
          (u.nota != null ? '<span class="chip ' + (u.nota >= 70 ? 'chip-green' : 'chip-amber') +
            '">último quiz ' + u.nota + '%</span>' : '') +
        '</div>' +

        '<div class="note ' + est.c + '" style="margin-bottom:16px">' + U.icon(est.i, 19) +
          '<div><b>' + est.t + '</b>' + est.s + '</div></div>' +

        /* sesiones de esta unidad */
        '<div class="section-h" style="margin-top:4px"><h3>Sesiones</h3>' +
          '<span class="p-small">' + hechas.length + ' de ' + sesiones.length + '</span></div>' +
        (sesiones.length
          ? '<div class="stack-sm">' + sesiones.map(function (s) {
              var t = S.TECNICAS[s.tecnica];
              var done = s.estado === 'hecha';
              return '<button class="list-item" data-go="/sesion/' + s.id + '">' +
                '<span class="li-ico ' + (done ? 'green' : s.estado === 'omitida' ? 'amber' : 'grey') +
                '">' + U.icon(done ? 'check' : s.estado === 'omitida' ? 'x' : 'clock', 18) + '</span>' +
                '<span class="li-text"><span class="li-title">' + U.esc(t.nombre) + '</span>' +
                '<span class="li-sub">' + U.fmtDate(s.fecha) + ' · ' + U.mins(s.duracion) +
                (done ? ' · hecha' : s.estado === 'omitida' ? ' · omitida' : '') + '</span></span>' +
                '<span class="li-end">' + U.icon('next', 18) + '</span></button>';
            }).join('') + '</div>'
          : '<div class="card-flat"><div class="p-small">Esta unidad no tiene sesiones ' +
            'programadas todavía.</div></div>') +

        /* preguntas */
        '<div class="section-h"><h3>Tus preguntas</h3>' +
          (paraHoy.length ? '<span class="badge badge-green">' + paraHoy.length +
            ' para hoy</span>' : '') + '</div>' +
        (tarjetas.length
          ? '<div class="stack-sm">' + tarjetas.map(function (t) {
              var d = U.daysBetween(S.hoy(), U.parseYmd(t.proximo));
              var ultima = t.historial && t.historial.length
                ? t.historial[t.historial.length - 1].calidad : null;
              return '<div class="card" style="padding:14px">' +
                '<div class="p-small" style="color:var(--on-surface);font-weight:600;' +
                'margin-bottom:6px">' + U.esc(t.pregunta) + '</div>' +
                (t.respuesta ? '<div class="p-small" style="margin-bottom:9px">' +
                  U.esc(t.respuesta) + '</div>' : '') +
                '<div class="row" style="gap:7px;flex-wrap:wrap">' +
                  '<span class="badge ' + (d <= 0 ? 'badge-green' : 'badge-grey') + '">' +
                  U.icon('repeat', 12, 2.3) + (d <= 0 ? 'Listo para repasar' : U.relDays(d)) +
                  '</span>' +
                  (ultima != null ? '<span class="badge ' +
                    (ultima === 2 ? 'badge-green' : ultima === 1 ? 'badge-amber' : 'badge-red') +
                    '">' + (ultima === 2 ? 'Me acordaba' : ultima === 1 ? 'A medias' : 'En blanco') +
                    '</span>' : '<span class="badge badge-grey">Sin repasar</span>') +
                  '<span class="badge badge-grey">' +
                  U.plural(t.repasos, 'repaso', 'repasos') + '</span>' +
                '</div></div>';
            }).join('') + '</div>'
          : '<div class="card-flat"><div class="p-small">Todavía no escribiste preguntas de ' +
            'esta unidad. Se crean al terminar una sesión de estudio.</div></div>') +
        '<div class="sp-16"></div>',

      footer: paraHoy.length
        ? '<button class="btn btn-primary btn-block" data-go="/quiz/' + m.id + '/' + u.n + '">' +
          U.icon('cards', 18, 2.2) + 'Repasar ' + paraHoy.length +
          (paraHoy.length === 1 ? ' pregunta' : ' preguntas') + '</button>'
        : tarjetas.length
          ? '<button class="btn btn-outline btn-block" data-go="/quiz/' + m.id + '/' + u.n + '">' +
            'Repasar igual' + '</button>'
          : null
    };
  });
})(window);
