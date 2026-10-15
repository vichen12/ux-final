/* ══════════════════════════════════════════════════════════════
   Perfil, biblioteca de técnicas y ajustes
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App, P = global.Planner;

  /* ── /perfil ─────────────────────────────────────────────────── */
  R.add('/perfil', function () {
    var st = S.get();
    var u = st.usuario;
    var tot = { leidas: 0, dominadas: 0, total: 0 };
    st.materias.forEach(function (m) {
      var p = S.progresoMateria(m.id);
      tot.leidas += p.leidas; tot.dominadas += p.dominadas; tot.total += p.total;
    });
    var hechas = st.sesiones.filter(function (s) { return s.estado === 'hecha'; });
    var minutos = hechas.reduce(function (a, s) { return a + s.duracion; }, 0);
    var repasados = st.tarjetas.reduce(function (a, t) {
      return a + ((t.historial && t.historial.length) || 0);
    }, 0);

    return {
      bar: { titulo: 'Mi perfil',
        acciones: [{ icono: 'gear', to: '/ajustes', label: 'Ajustes' }] },
      tab: 'perfil',
      body:
        /* cabecera */
        '<div class="card" style="text-align:center;padding:22px 18px">' +
          '<div style="width:72px;height:72px;border-radius:50%;background:var(--primary-fixed);' +
          'color:var(--primary);display:grid;place-items:center;margin:0 auto 12px;' +
          'font:800 25px/1 var(--font)">' + U.esc(u.iniciales) + '</div>' +
          '<div class="h-title" style="margin-bottom:3px">' + U.esc(u.nombre + ' ' + u.apellido) + '</div>' +
          '<div class="p-small">' + U.esc(u.carrera) + '</div>' +
          '<div class="p-small muted" style="margin-top:2px">' + U.esc(u.institucion) +
          ' · ' + u.anio + '.º año</div>' +
          '<div class="chip-row" style="justify-content:center;margin-top:14px">' +
            '<span class="chip chip-amber">' + U.icon('flame', 14) + u.racha + ' días seguidos</span>' +
            '<span class="chip chip-green">' + U.icon('award', 14) + tot.dominadas +
            ' dominadas</span>' +
          '</div>' +
        '</div>' +

        /* números */
        '<div class="section-h"><h3>Desde que empezaste</h3></div>' +
        '<div class="stats-row" style="margin-bottom:9px">' +
          '<div><b>' + hechas.length + '</b><span>sesiones hechas</span></div>' +
          '<div><b>' + Math.round(minutos / 60) + ' h</b><span>de estudio</span></div>' +
          '<div><b>' + st.tarjetas.length + '</b><span>preguntas propias</span></div>' +
        '</div>' +
        '<div class="card-flat">' +
          '<div class="row-between" style="margin-bottom:8px">' +
            '<span class="p-small">Temas dominados sobre el total</span>' +
            '<b class="tnum" style="font:var(--t-subtitle)">' + tot.dominadas + '/' + tot.total + '</b>' +
          '</div>' +
          '<div class="bar"><i class="green" style="width:' +
          (tot.total ? Math.round(tot.dominadas / tot.total * 100) : 0) + '%"></i></div>' +
          '<div class="p-small muted" style="margin-top:8px">' + repasados +
          ' repasos respondidos hasta ahora.</div>' +
        '</div>' +

        /* accesos */
        '<div class="section-h"><h3>Mi estudio</h3></div>' +
        '<div class="stack-sm">' +
          item('book', '', 'Mis materias', st.materias.length + ' cargadas', '/materias') +
          item('chart', 'green', 'Progreso y dominio', 'Leído contra aprendido', '/progreso') +
          item('brain', 'amber', 'Técnicas de estudio', 'Las que usa tu plan', '/tecnicas') +
          item('spark', '', 'Mi diagnóstico', 'Rehacerlo cuando cambien tus tiempos', '/mi-diagnostico') +
        '</div>' +

        '<div class="section-h"><h3>La app</h3></div>' +
        '<div class="stack-sm">' +
          item('gear', 'grey', 'Ajustes', 'Recordatorios y preferencias', '/ajustes') +
          item('help', 'grey', 'Sobre esta maqueta', 'Qué es y qué no es', '/acerca') +
          item('file', 'grey', 'Términos y condiciones', 'Uso y privacidad', '/terminos') +
          '<button class="list-item" data-act="salir">' +
            '<span class="li-ico" style="background:var(--error-c);color:var(--on-error-c)">' +
            U.icon('logout', 19) + '</span>' +
            '<span class="li-text"><span class="li-title">Cerrar sesión</span>' +
            '<span class="li-sub">' + U.esc(st.cuenta.email || '') + '</span></span></button>' +
        '</div>' +
        '<div class="sp-24"></div>',
      onMount: function () {
        A.accion('salir', function () {
          A.dialog({
            titulo: 'Cerrar sesión', texto: 'Tu plan y tus preguntas quedan guardados en tu cuenta.',
            aceptar: 'Cerrar sesión', peligro: true,
            onOk: function () { S.get().cuenta.sesion = false; R.go('/acceso'); }
          });
        });
      }
    };
  });

  function item(ico, color, t, s, to) {
    return '<button class="list-item" data-go="' + to + '">' +
      '<span class="li-ico ' + color + '">' + U.icon(ico, 19) + '</span>' +
      '<span class="li-text"><span class="li-title">' + U.esc(t) + '</span>' +
      '<span class="li-sub">' + U.esc(s) + '</span></span>' +
      '<span class="li-end">' + U.icon('next', 18) + '</span></button>';
  }

  /* ── /tecnicas ───────────────────────────────────────────────── */
  R.add('/tecnicas', function () {
    var ids = Object.keys(S.TECNICAS);
    var st = S.get();
    /* cuántas sesiones usan cada técnica en el plan vigente */
    var uso = {};
    st.sesiones.forEach(function (s) { uso[s.tecnica] = (uso[s.tecnica] || 0) + 1; });

    return {
      bar: { titulo: 'Técnicas de estudio', back: '/perfil' },
      tab: 'perfil',
      body:
        '<p class="p-body" style="margin-bottom:18px">Tu plan elige una de estas para cada ' +
        'sesión según el tema y cuántas veces ya lo viste. No las elegís vos: ese es el punto.</p>' +
        '<div class="stack">' +
          ids.map(function (id) {
            var t = S.TECNICAS[id];
            var n = uso[id] || 0;
            return '<button class="card" style="width:100%;text-align:left" ' +
              'data-go="/tecnica/' + id + '">' +
              '<div class="row" style="margin-bottom:9px">' +
                '<span class="li-ico">' + U.icon(t.icono, 20) + '</span>' +
                '<span class="grow"><b style="font:var(--t-subtitle);display:block">' +
                U.esc(t.nombre) + '</b>' +
                '<span class="p-small" style="display:block;margin-top:2px">' +
                U.esc(t.corto) + '</span></span>' +
                '<span class="li-end">' + U.icon('next', 18) + '</span>' +
              '</div>' +
              '<div class="row" style="gap:7px;flex-wrap:wrap">' +
                '<span class="badge ' + (t.evidencia.indexOf('alta') >= 0 ? 'badge-green' :
                  t.evidencia.indexOf('moderada') >= 0 ? 'badge-amber' : 'badge-grey') + '">' +
                U.esc(t.evidencia) + '</span>' +
                (n ? '<span class="badge badge-grey">' + n + ' sesiones en tu plan</span>' : '') +
              '</div></button>';
          }).join('') +
        '</div>' +
        '<div class="sp-16"></div>' +
        '<div class="note note-grey">' + U.icon('book', 19) +
          '<div>Las valoraciones vienen de Dunlosky, Rawson, Marsh, Nathan y Willingham ' +
          '(2013), que compararon diez técnicas habituales de estudio.</div></div>' +
        '<div class="sp-16"></div>'
    };
  });

  /* ── /mi-diagnostico ─────────────────────────────────────────── */
  R.add('/mi-diagnostico', function () {
    var d = S.get().diagnostico;
    if (!d.hecho) {
      return {
        bar: { titulo: 'Mi diagnóstico', back: '/perfil' },
        tab: 'perfil',
        body: '<div class="empty"><div class="em-ico">' + U.icon('spark', 32) + '</div>' +
          '<h3>Todavía no lo hiciste</h3><p>Son seis preguntas cortas sobre cómo estudiás.</p>' +
          '<button class="btn btn-primary" data-go="/bienvenida">Hacerlo ahora</button></div>'
      };
    }
    var etiqueta = function (defId, valor) {
      var def = S.DIAGNOSTICO.filter(function (x) { return x.id === defId; })[0];
      if (!def) return valor;
      var arr = Array.isArray(valor) ? valor : [valor];
      return arr.map(function (v) {
        var o = def.opciones.filter(function (x) { return x.v === v; })[0];
        return o ? o.t : v;
      }).join(', ');
    };

    return {
      bar: { titulo: 'Mi diagnóstico', back: '/perfil' },
      tab: 'perfil',
      body:
        '<p class="p-body" style="margin-bottom:16px">Esto es lo que respondiste. Si cambian ' +
        'tus tiempos o tus hábitos, conviene rehacerlo: el plan se recalcula con estos datos.</p>' +
        '<div class="card">' +
          S.DIAGNOSTICO.map(function (def, i) {
            return '<div class="unit" style="align-items:flex-start;padding:13px 0">' +
              '<span class="unit-n">' + (i + 1) + '</span>' +
              '<span class="unit-text"><span class="unit-sub" style="margin:0 0 3px">' +
              U.esc(def.titulo) + '</span>' +
              '<span class="unit-title">' + U.esc(etiqueta(def.id, d[def.id]) || '—') +
              '</span></span></div>';
          }).join('') +
        '</div>' +
        '<div class="sp-16"></div>' +
        '<div class="card-flat">' +
          '<b style="font:var(--t-subtitle);display:block;margin-bottom:9px">Lo que se deduce</b>' +
          '<div class="p-small" style="margin-bottom:7px">· Hasta <b>' +
          U.mins(P.minutosPorDia(d)) + '</b> de estudio por día.</div>' +
          '<div class="p-small" style="margin-bottom:7px">· Sesiones en horarios: <b>' +
          P.horariosPreferidos(d).slice(0, 4).join(', ') + '</b>.</div>' +
          '<div class="p-small">· Las unidades difíciles reciben hasta <b>4 pasadas</b> con ' +
          'técnicas distintas.</div>' +
        '</div>' +
        '<div class="sp-16"></div>',
      footer:
        '<button class="btn btn-outline btn-block" data-go="/diag/0">' +
        U.icon('refresh', 18, 2.2) + 'Rehacer el diagnóstico</button>'
    };
  });

  /* ── /ajustes ────────────────────────────────────────────────── */
  R.add('/ajustes', function () {
    var a = S.get().ajustes;
    return {
      bar: { titulo: 'Ajustes', back: '/perfil' },
      tab: 'perfil',
      body:
        '<div class="section-h" style="margin-top:4px"><h3>Recordatorios</h3></div>' +
        '<div class="card">' +
          sw('recordatorios', 'Avisarme de cada sesión', 'Una notificación antes de empezar', a.recordatorios) +
          sw('repasoDiario', 'Aviso de repasos', 'Cuando haya preguntas listas para hoy', a.repasoDiario) +
          '<div class="switch"><div class="sw-text">' +
            '<div class="sw-title">Hora del aviso diario</div>' +
            '<div class="sw-sub">Antes de tu primera sesión</div></div>' +
            '<input id="aj-hora" type="time" value="' + a.recordatorioHora + '" ' +
            'style="width:108px;min-height:40px;padding:6px 10px;border-radius:10px;' +
            'border:1.5px solid var(--outline-var);background:var(--surface-lowest);' +
            'font:var(--t-body)"></div>' +
        '</div>' +

        '<div class="section-h"><h3>Durante la sesión</h3></div>' +
        '<div class="card">' +
          sw('modoFoco', 'Modo foco', 'Silencia el resto de los avisos mientras estudiás', a.modoFoco) +
          sw('sonido', 'Sonido al terminar', 'Un tono cuando se cumple el tiempo', a.sonido) +
        '</div>' +

        '<div class="section-h"><h3>Datos de la maqueta</h3></div>' +
        '<div class="stack-sm">' +
          '<button class="list-item" data-act="reiniciar-demo">' +
            '<span class="li-ico grey">' + U.icon('refresh', 19) + '</span>' +
            '<span class="li-text"><span class="li-title">Reiniciar la demostración</span>' +
            '<span class="li-sub">Vuelve a los datos de prueba iniciales</span></span></button>' +
          '<button class="list-item" data-act="empezar-vacio">' +
            '<span class="li-ico amber">' + U.icon('spark', 19) + '</span>' +
            '<span class="li-text"><span class="li-title">Empezar de cero</span>' +
            '<span class="li-sub">Recorrer la app como un estudiante nuevo</span></span></button>' +
        '</div>' +
        '<div class="sp-16"></div>' +
        '<div class="note note-grey">' + U.icon('help', 19) +
          '<div>Los cambios de esta pantalla viven solo mientras la app esté abierta: la ' +
          'maqueta no guarda nada en disco ni en un servidor.</div></div>' +
        '<div class="sp-24"></div>',

      onMount: function (root) {
        var hora = root.querySelector('#aj-hora');
        if (hora) hora.addEventListener('change', function () {
          S.get().ajustes.recordatorioHora = hora.value;
          A.toast('Aviso diario a las ' + hora.value);
        });
        A.accion('aj-sw', function (el) {
          var k = el.getAttribute('data-k');
          var aj = S.get().ajustes;
          aj[k] = !aj[k];
          R.render();
        });
      }
    };
  });

  function sw(clave, titulo, sub, valor) {
    return '<button class="switch" style="width:100%;text-align:left" data-act="aj-sw" ' +
      'data-k="' + clave + '" role="switch" aria-checked="' + !!valor + '">' +
      '<span class="sw-text"><span class="sw-title">' + U.esc(titulo) + '</span>' +
      '<span class="sw-sub">' + U.esc(sub) + '</span></span>' +
      '<span class="sw-track' + (valor ? ' on' : '') + '"><i></i></span></button>';
  }

  /* ── /acerca ─────────────────────────────────────────────────── */
  R.add('/acerca', function () {
    return {
      bar: { titulo: 'Sobre esta maqueta', back: '/perfil' },
      tab: 'perfil',
      body:
        '<div style="text-align:center;padding:10px 0 18px">' +
          U.logo(64, '') +
          '<div class="h-title" style="margin-top:12px">Asesor de Estudio</div>' +
          '<div class="p-small">Maqueta funcional · versión 1.0</div>' +
        '</div>' +

        '<div class="note note-info" style="margin-bottom:16px">' + U.icon('help', 19) +
          '<div><b>Es un prototipo navegable</b>Todas las pantallas funcionan y el plan se ' +
          'genera de verdad, pero los datos son de prueba: no hay servidor ni base de datos ' +
          'detrás. Al recargar la página vuelve al estado inicial.</div></div>' +

        '<div class="section-h" style="margin-top:4px"><h3>Qué sí hace</h3></div>' +
        '<div class="card">' +
          punto('check', 'Genera el plan', 'Reparte las unidades hasta el parcial según tu ' +
            'disponibilidad y la dificultad que marcaste.') +
          punto('check', 'Asigna una técnica a cada sesión', 'Según cuántas veces viste ' +
            'ese tema: primero entenderlo, después recuperarlo, después aplicarlo.') +
          punto('check', 'Programa los repasos', 'Con repaso espaciado sobre las preguntas ' +
            'que vos escribís al cerrar cada sesión.') +
          punto('check', 'Separa leído de dominado', 'Una unidad pasa a dominada recién ' +
            'cuando respondés bien el 70% de sus preguntas.') +
        '</div>' +

        '<div class="section-h"><h3>Qué no hace todavía</h3></div>' +
        '<div class="card">' +
          punto('x', 'No enseña los temas', 'No trae contenido académico ni genera ' +
            'resúmenes: el contenido lo ponés vos.') +
          punto('x', 'No se conecta al campus', 'Ni a Google Calendar ni al campus virtual.') +
          punto('x', 'No guarda nada', 'No hay cuentas, servidor ni sincronización.') +
        '</div>' +

        '<div class="section-h"><h3>El proyecto</h3></div>' +
        '<div class="card-flat">' +
          '<div class="p-small" style="line-height:1.65">' +
            'Proyecto final de la cátedra <b>Diseño UX-UI</b>.<br>' +
            'Universidad Tecnológica Nacional, Facultad Regional Mendoza.<br>' +
            'Departamento de Sistemas de Información.<br><br>' +
            '<b>Grupo C — Figma locos</b><br>' +
            'Ortiz Renzo · Dallape Vincenzo · Podesta Isidro<br>' +
            'Saini Alejo · Lovos David · Flores Martín<br><br>' +
            'Profesoras: Andrea Rotella y Carina Rotella.' +
          '</div>' +
        '</div>' +
        '<div class="sp-24"></div>'
    };
  });

  function punto(ico, t, s) {
    var verde = ico === 'check';
    return '<div class="unit" style="align-items:flex-start">' +
      '<span class="unit-n ' + (verde ? 'master' : '') + '" style="' +
      (verde ? '' : 'background:var(--error-c);color:var(--on-error-c)') + '">' +
      U.icon(ico, 14, 2.6) + '</span>' +
      '<span class="unit-text"><span class="unit-title">' + U.esc(t) + '</span>' +
      '<span class="unit-sub">' + U.esc(s) + '</span></span></div>';
  }
})(window);
