/* ══════════════════════════════════════════════════════════════
   Inicio — qué toca ahora y cómo viene la semana
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App;

  function saludo() {
    var h = new Date().getHours();
    return h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  }

  R.add('/inicio', function () {
    var st = S.get();
    var u = st.usuario;

    if (!st.diagnostico.hecho) return bienvenidaVacia();

    var prox = S.proximaSesion();
    var repasos = S.repasosHoy();
    var sem = S.cumplimientoSemana();
    var sinProbar = S.sinProbar();
    var hoyStr = S.hoyStr();
    var hechasHoy = st.sesiones.filter(function (s) {
      return s.fecha === hoyStr && s.estado === 'hecha';
    }).length;
    var pendHoy = S.pendientesHoy();

    /* materia con el parcial más cerca */
    var proxParcial = st.materias.slice().sort(function (a, b) {
      return a.parcial < b.parcial ? -1 : 1;
    })[0];

    return {
      bar: {
        logo: true,
        titulo: saludo() + ', ' + u.nombre,
        sub: pendHoy.length
          ? pendHoy.length + ' ' + (pendHoy.length === 1 ? 'sesión' : 'sesiones') + ' para hoy'
          : hechasHoy ? 'Terminaste todo lo de hoy' : 'Hoy no tenés sesiones',
        acciones: [
          { icono: 'bell', to: '/notificaciones', label: 'Avisos',
            dot: repasos.length > 0 },
          { avatar: u.iniciales }
        ]
      },
      tab: 'inicio',
      body:
        /* ── racha y cumplimiento ── */
        '<div class="stats-row" style="margin-bottom:16px">' +
          '<div><b>' + u.racha + '</b><span>días seguidos</span></div>' +
          '<div><b>' + sem.pct + '%</b><span>del plan semanal</span></div>' +
          '<div><b>' + Math.round(S.minutosSemana() / 60) + ' h</b><span>esta semana</span></div>' +
        '</div>' +

        /* ── próxima sesión ── */
        (prox ? tarjetaProxima(prox) : tarjetaSinPlan()) +

        /* ── repasos de hoy ── */
        (repasos.length ? bloqueRepasos(repasos) : '') +

        /* ── unidades leídas sin probar: el corazón del producto ── */
        (sinProbar.length
          ? '<div class="section-h"><h3>Leíste pero no probaste</h3>' +
            '<button data-go="/progreso">Ver progreso</button></div>' +
            '<div class="note note-amber">' + U.icon('alert', 19) +
            '<div><b>' + sinProbar.length + ' ' +
            (sinProbar.length === 1 ? 'unidad vista sin quiz' : 'unidades vistas sin quiz') +
            '</b>Haber leído el material no es lo mismo que saberlo. Poné a prueba estas ' +
            'unidades antes de que llegue el parcial.</div></div>' +
            '<div class="sp-8"></div>' +
            '<div class="stack-sm">' +
              sinProbar.slice(0, 3).map(function (x) {
                return '<button class="list-item" data-go="/unidad/' + x.materia.id + '/' +
                  x.unidad.n + '">' +
                  '<span class="li-ico amber">' + U.icon('eye', 19) + '</span>' +
                  '<span class="li-text"><span class="li-title">' + U.esc(x.unidad.titulo) +
                  '</span><span class="li-sub">' + U.esc(x.materia.corto) + ' · unidad ' +
                  x.unidad.n + '</span></span>' +
                  '<span class="li-end">' + U.icon('next', 18) + '</span></button>';
              }).join('') +
            '</div>'
          : '') +

        /* ── materias ── */
        '<div class="section-h"><h3>Mis materias</h3>' +
          '<button data-go="/materias">Ver todas</button></div>' +
        (st.materias.length
          ? '<div class="stack-sm">' + st.materias.map(function (m) {
              var pr = S.progresoMateria(m.id);
              var dias = U.daysBetween(S.hoy(), U.parseYmd(m.parcial));
              return '<button class="list-item bar-left ' + m.color + '" ' +
                'data-go="/materia/' + m.id + '">' +
                '<span class="li-text"><span class="li-title">' + U.esc(m.nombre) + '</span>' +
                '<span class="li-sub">' + pr.dominadas + ' de ' + pr.total +
                ' dominadas · parcial en ' + dias + ' días</span>' +
                '<span class="bar-stack" style="margin-top:7px">' +
                '<i class="master" style="width:' + pr.pctDom + '%"></i>' +
                '<i class="read" style="width:' + Math.max(0, pr.pct - pr.pctDom) + '%"></i>' +
                '</span></span>' +
                '<span class="li-end">' + U.icon('next', 18) + '</span></button>';
            }).join('') + '</div>'
          : '<button class="card-flat" style="width:100%;text-align:left" ' +
            'data-go="/materia-nueva"><div class="row">' +
            '<span class="li-ico">' + U.icon('plus', 19) + '</span>' +
            '<span class="grow"><b style="font:var(--t-subtitle)">Cargá tu primera materia</b>' +
            '<span class="p-small" style="display:block">Con el programa y la fecha del parcial</span>' +
            '</span></div></button>') +

        /* ── cuenta regresiva ── */
        (proxParcial ? bloqueParcial(proxParcial) : '') +
        '<div class="sp-24"></div>'

    };
  });

  /* ── piezas ──────────────────────────────────────────────────── */
  function tarjetaProxima(s) {
    var m = S.materia(s.materiaId);
    var u = S.unidad(s.materiaId, s.unidad);
    var t = S.TECNICAS[s.tecnica];
    var dias = U.daysBetween(S.hoy(), U.parseYmd(s.fecha));
    var cuando = dias === 0 ? 'Hoy a las ' + s.hora
      : dias === 1 ? 'Mañana a las ' + s.hora
      : U.fmtDate(s.fecha) + ' a las ' + s.hora;

    return '<div class="card" style="background:var(--primary);color:var(--on-primary);' +
      'box-shadow:var(--e2)">' +
      '<div class="eyebrow" style="color:var(--on-primary-c);margin-bottom:10px">' +
        U.icon('clock', 14, 2.2) + (dias === 0 ? 'Próxima sesión' : 'Siguiente sesión') + '</div>' +
      '<div style="font:var(--t-headline);letter-spacing:-.02em;margin-bottom:5px">' +
        U.esc(u ? u.titulo : 'Unidad ' + s.unidad) + '</div>' +
      '<div style="font:var(--t-body-sm);color:var(--on-primary-c);margin-bottom:14px">' +
        U.esc(m ? m.nombre : '') + ' · unidad ' + s.unidad + '</div>' +

      '<div style="background:rgba(255,255,255,.14);border-radius:12px;padding:12px;' +
        'margin-bottom:14px;display:flex;gap:11px;align-items:flex-start">' +
        '<span style="flex:none;color:#fff">' + U.icon(t.icono, 19) + '</span>' +
        '<span><b style="font:var(--t-label);display:block;margin-bottom:2px">' +
        U.esc(t.nombre) + '</b>' +
        '<span style="font:var(--t-caption);color:var(--on-primary-c);line-height:1.45">' +
        U.esc(t.corto) + '</span></span></div>' +

      '<div style="font:var(--t-caption);color:var(--on-primary-c);margin-bottom:12px">' +
        U.icon('clock', 13, 2.2).replace('<svg', '<svg style="vertical-align:-2px;margin-right:4px"') +
        cuando + ' · ' + U.mins(s.duracion) + '</div>' +
      '<button class="btn btn-block" style="background:#fff;color:var(--primary)" ' +
        'data-go="/sesion/' + s.id + (dias === 0 ? '/activa' : '') + '">' +
        U.icon('play', 17, 2.4) + (dias === 0 ? 'Empezar sesión' : 'Ver sesión') + '</button>' +
      '</div>' +
      '<div class="sp-16"></div>';
  }

  function tarjetaSinPlan() {
    return '<div class="card-flat" style="text-align:center;padding:26px 18px">' +
      '<div style="color:var(--outline);margin-bottom:10px">' + U.icon('calendar', 30) + '</div>' +
      '<b style="font:var(--t-title);display:block;margin-bottom:5px">No hay sesiones por delante</b>' +
      '<p class="p-small" style="margin-bottom:16px">Cargá una materia con su programa y te ' +
      'armamos el cronograma hasta el parcial.</p>' +
      '<button class="btn btn-primary btn-sm" data-go="/materia-nueva">' +
      U.icon('plus', 16, 2.2) + 'Agregar materia</button></div>' +
      '<div class="sp-16"></div>';
  }

  function bloqueRepasos(repasos) {
    var porMateria = {};
    repasos.forEach(function (t) {
      porMateria[t.materiaId] = (porMateria[t.materiaId] || 0) + 1;
    });
    var nombres = Object.keys(porMateria).map(function (id) {
      var m = S.materia(id);
      return (m ? m.corto : id) + ' (' + porMateria[id] + ')';
    }).join(' · ');

    return '<button class="card" style="width:100%;text-align:left;border:1.5px solid ' +
      'var(--secondary-c)" data-go="/quizzes">' +
      '<div class="row">' +
        '<span class="li-ico green" style="width:46px;height:46px">' +
          U.icon('cards', 22) + '</span>' +
        '<span class="grow">' +
          '<b style="font:var(--t-subtitle);display:block">' + repasos.length +
          ' ' + (repasos.length === 1 ? 'pregunta lista' : 'preguntas listas') + ' para repasar</b>' +
          '<span class="p-small" style="display:block;margin-top:2px">' + U.esc(nombres) + '</span>' +
        '</span>' +
        '<span class="li-end">' + U.icon('next', 18) + '</span>' +
      '</div>' +
      '<div class="p-small" style="margin-top:10px;color:var(--on-surface-var)">' +
        'Son las que escribiste vos al terminar de estudiar.</div>' +
      '</button>' +
      '<div class="sp-16"></div>';
  }

  function bloqueParcial(m) {
    var dias = U.daysBetween(S.hoy(), U.parseYmd(m.parcial));
    var pr = S.progresoMateria(m.id);
    var falta = pr.total - pr.dominadas;
    return '<div class="section-h"><h3>Lo que viene</h3></div>' +
      '<div class="card bar-left ' + (dias <= 7 ? 'red' : m.color) + '">' +
        '<div class="row-between" style="margin-bottom:10px">' +
          '<div class="grow"><b style="font:var(--t-subtitle);display:block">Parcial de ' +
          U.esc(m.corto) + '</b>' +
          '<span class="p-small">' + U.fmtDate(m.parcial, true) + '</span></div>' +
          '<span class="badge ' + (dias <= 7 ? 'badge-red' : 'badge-amber') + '">' +
          U.icon('clock', 12, 2.4) + dias + ' días</span>' +
        '</div>' +
        '<div class="p-small">' +
          (falta === 0
            ? 'Tenés todas las unidades dominadas. Llegás listo.'
            : 'Te faltan <b>' + falta + '</b> de ' + pr.total + ' unidades por dominar. ' +
              'Son ' + Math.ceil(falta / Math.max(1, dias) * 7) + ' por semana para llegar.') +
        '</div>' +
      '</div>';
  }

  function bienvenidaVacia() {
    return {
      bar: { logo: true, titulo: 'Asesor de Estudio' },
      tab: 'inicio',
      body: '<div class="empty" style="padding-top:60px">' +
        '<div class="em-ico">' + U.icon('spark', 32) + '</div>' +
        '<h3>Todavía no hicimos el diagnóstico</h3>' +
        '<p>Son seis preguntas cortas sobre cómo estudiás hoy. Con eso armamos tu método.</p>' +
        '<button class="btn btn-primary" data-go="/bienvenida">Empezar</button></div>'
    };
  }

  /* ── /notificaciones ─────────────────────────────────────────── */
  R.add('/notificaciones', function () {
    var st = S.get();
    var repasos = S.repasosHoy();
    var pend = S.pendientesHoy();
    var sinProbar = S.sinProbar();
    var items = [];

    if (repasos.length) items.push({
      ico: 'cards', c: 'green', t: repasos.length + ' preguntas para repasar',
      s: 'El repaso espaciado dice que hoy es el día justo', to: '/quizzes', cuando: 'Hoy'
    });
    pend.forEach(function (s) {
      var u = S.unidad(s.materiaId, s.unidad);
      items.push({
        ico: 'clock', c: '', t: 'Sesión a las ' + s.hora,
        s: (u ? u.titulo : 'Unidad ' + s.unidad) + ' · ' + U.mins(s.duracion),
        to: '/sesion/' + s.id, cuando: 'Hoy'
      });
    });
    sinProbar.slice(0, 2).forEach(function (x) {
      items.push({
        ico: 'alert', c: 'amber', t: 'Leíste y no probaste: ' + x.unidad.titulo,
        s: x.materia.corto + ' · conviene un quiz antes del parcial',
        to: '/unidad/' + x.materia.id + '/' + x.unidad.n, cuando: 'Esta semana'
      });
    });
    st.materias.forEach(function (m) {
      var d = U.daysBetween(S.hoy(), U.parseYmd(m.parcial));
      if (d <= 20 && d >= 0) items.push({
        ico: 'calendar', c: d <= 7 ? 'amber' : 'grey', t: 'Parcial de ' + m.corto + ' en ' + d + ' días',
        s: U.fmtDate(m.parcial, true), to: '/materia/' + m.id, cuando: 'Próximamente'
      });
    });

    return {
      bar: { titulo: 'Avisos', back: '/inicio' },
      tab: 'inicio',
      body: items.length
        ? '<div class="stack-sm">' + items.map(function (i) {
            return '<button class="list-item" data-go="' + i.to + '">' +
              '<span class="li-ico ' + i.c + '">' + U.icon(i.ico, 19) + '</span>' +
              '<span class="li-text"><span class="li-title">' + U.esc(i.t) + '</span>' +
              '<span class="li-sub">' + U.esc(i.s) + '</span></span>' +
              '<span class="li-end"><span class="badge badge-grey nowrap">' + i.cuando + '</span></span>' +
              '</button>';
          }).join('') + '</div><div class="sp-16"></div>'
        : '<div class="empty"><div class="em-ico">' + U.icon('bell', 32) + '</div>' +
          '<h3>Nada pendiente</h3><p>Cuando tengas sesiones o repasos, aparecen acá.</p></div>'
    };
  });
})(window);
