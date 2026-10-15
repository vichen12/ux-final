/* ══════════════════════════════════════════════════════════════
   Bienvenida y diagnóstico inicial (6 pasos, menos de 5 minutos)
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App, P = global.Planner;

  /* respuestas mientras dura el diagnóstico */
  var borrador = {};

  /* ── /bienvenida ─────────────────────────────────────────────── */
  R.add('/bienvenida', function () {
    return {
      body:
        '<div style="display:grid;place-items:center;text-align:center;min-height:100%;' +
        'padding:30px 6px 10px">' +
          '<div>' +
            U.logo(76, '') +
            '<h1 class="h-display" style="margin-top:22px">Asesor de Estudio</h1>' +
            '<p class="p-body" style="max-width:27ch;margin:0 auto 26px">' +
              'No te decimos cuándo estudiar. Te decimos <b>cómo</b>, y te mostramos si de ' +
              'verdad lo aprendiste.</p>' +

            '<div class="stack" style="text-align:left;margin-bottom:26px">' +
              feature('brain', 'Un método, no una agenda',
                'Cada sesión llega con la técnica ya elegida según el tema.') +
              feature('cards', 'Tus propias preguntas',
                'Las escribís al terminar de estudiar y la app te las devuelve después.') +
              feature('target', 'Leído no es lo mismo que sabido',
                'El progreso distingue lo que viste de lo que ya dominás.') +
            '</div>' +
          '</div>' +
        '</div>',
      footer:
        '<button class="btn btn-primary btn-block" data-go="/diag/0">' +
          'Empezar el diagnóstico' + U.icon('arrow', 18, 2.2) + '</button>' +
        '<div class="hint">Son 6 preguntas. Menos de 5 minutos.</div>'
    };
  });

  function feature(ico, t, s) {
    return '<div class="row" style="gap:13px">' +
      '<span class="li-ico">' + U.icon(ico, 20) + '</span>' +
      '<span class="grow"><b style="font:var(--t-subtitle);display:block">' + t + '</b>' +
      '<span class="p-small" style="display:block;margin-top:2px">' + s + '</span></span></div>';
  }

  /* ── /diag/:paso ─────────────────────────────────────────────── */
  R.add('/diag/:paso', function (p) {
    var i = Math.max(0, Math.min(S.DIAGNOSTICO.length - 1, parseInt(p.paso, 10) || 0));
    var def = S.DIAGNOSTICO[i];
    var total = S.DIAGNOSTICO.length;
    var valor = borrador[def.id];
    if (def.multiple && !Array.isArray(valor)) valor = valor ? [valor] : [];

    var marcado = function (v) {
      return def.multiple ? valor.indexOf(v) >= 0 : valor === v;
    };

    var opciones = def.opciones.map(function (o) {
      var on = marcado(o.v);
      return '<button class="option' + (def.multiple ? ' sq' : '') + (on ? ' on' : '') +
        '" data-act="diag-elegir" data-v="' + o.v + '" role="' +
        (def.multiple ? 'checkbox' : 'radio') + '" aria-checked="' + on + '">' +
        '<span class="opt-ico">' + U.icon(o.i, 19) + '</span>' +
        '<span class="opt-text"><span class="opt-title">' + U.esc(o.t) + '</span>' +
        '<span class="opt-sub">' + U.esc(o.s) + '</span></span>' +
        '<span class="opt-check">' + U.icon('check', 13, 3) + '</span></button>';
    }).join('');

    var completo = def.multiple ? valor.length > 0 : !!valor;

    return {
      bar: {
        titulo: 'Paso ' + (i + 1) + ' de ' + total,
        back: i === 0 ? '/bienvenida' : '/diag/' + (i - 1)
      },
      body:
        '<div class="stepper" style="margin-bottom:18px">' +
          S.DIAGNOSTICO.map(function (_, j) {
            return '<i class="' + (j <= i ? 'done' : '') + '"></i>';
          }).join('') + '</div>' +
        '<h2 class="h-head">' + U.esc(def.titulo) + '</h2>' +
        '<p class="p-body" style="margin-bottom:18px">' + U.esc(def.bajada) + '</p>' +
        (def.multiple ? '<p class="p-small muted" style="margin-bottom:10px">' +
          'Podés marcar más de una.</p>' : '') +
        '<div class="stack-sm">' + opciones + '</div>' +
        '<div class="sp-16"></div>',
      footer:
        '<button class="btn btn-primary btn-block" id="diag-next"' +
          (completo ? '' : ' disabled') + ' data-act="diag-seguir" data-i="' + i + '">' +
          (i === total - 1 ? 'Ver mi perfil de estudio' : 'Siguiente') +
          U.icon('arrow', 18, 2.2) + '</button>' +
        (i < 2 ? '<div class="hint">Todo el diagnóstico lleva menos de 5 minutos</div>' : ''),
      onMount: function () {
        A.accion('diag-elegir', function (el) {
          var v = el.getAttribute('data-v');
          if (def.multiple) {
            var arr = Array.isArray(borrador[def.id]) ? borrador[def.id].slice() : [];
            var k = arr.indexOf(v);
            if (k >= 0) arr.splice(k, 1); else arr.push(v);
            borrador[def.id] = arr;
          } else {
            borrador[def.id] = v;
          }
          R.render();
        });
        A.accion('diag-seguir', function (el) {
          var j = parseInt(el.getAttribute('data-i'), 10);
          if (j === total - 1) {
            var st = S.get();
            st.diagnostico = Object.assign({ hecho: true }, borrador);
            R.go('/diag-resultado');
          } else {
            R.go('/diag/' + (j + 1));
          }
        });
      }
    };
  });

  /* ── /diag-resultado ─────────────────────────────────────────── */
  R.add('/diag-resultado', function () {
    var d = S.get().diagnostico;
    var hab = d.habitos || [];
    var pasivas = ['releer', 'subrayar', 'resumir'].filter(function (h) {
      return hab.indexOf(h) >= 0;
    }).length;
    var activas = ['ejercicios', 'explicar', 'autoevaluar'].filter(function (h) {
      return hab.indexOf(h) >= 0;
    }).length;

    /* el diagnóstico se traduce en técnicas concretas */
    var reco = [];
    if (d.certeza === 'lei' || d.certeza === 'nose' || hab.indexOf('autoevaluar') < 0) {
      reco.push('recuperacion');
    }
    if (d.experiencia === 'varias' || d.experiencia === 'alguna') reco.push('espaciado');
    if (hab.indexOf('ejercicios') < 0) reco.push('ejercitacion');
    if (reco.length < 3) reco.push('intercalada');
    reco = reco.filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 3);

    var perfil = pasivas >= 2 && activas === 0
      ? { t: 'Estudiás en modo lectura', c: 'amber',
          s: 'Tus técnicas actuales sirven para familiarizarte con el material, pero no ' +
             'para comprobar si lo retenés. Es el punto exacto donde podemos ayudarte.' }
      : activas >= 2
        ? { t: 'Ya usás técnicas activas', c: 'green',
            s: 'Vas bien encaminado. Vamos a ordenar cuándo usar cada una y a sumar el ' +
               'repaso espaciado, que es lo que más rinde cerca del parcial.' }
        : { t: 'Estás a mitad de camino', c: 'primary',
            s: 'Mezclás técnicas pasivas con alguna activa. Con un orden claro y ' +
               'autoevaluación constante, el salto es grande.' };

    var minutos = P.minutosPorDia(d);
    var franjas = (d.momento || ['tarde']).map(function (m) {
      return {
      manana: 'a la mañana', mediodia: 'al mediodía', tarde: 'a la tarde',
        noche: 'a la noche' }[m];
    }).join(' y ');

    return {
      celebrar: true,
      bar: { titulo: 'Tu perfil de estudio', back: '/diag/' + (S.DIAGNOSTICO.length - 1) },
      body:
        '<div class="celebrate">' +
          '<div class="cel-ico">' + U.icon('check', 40, 2.6) + '</div>' +
          '<h2 class="h-head">Listo, ' + U.esc(S.get().usuario.nombre) + '</h2>' +
          '<p class="p-body">Con esto ya podemos armarte un plan.</p>' +
        '</div>' +

        '<div class="note note-' + (perfil.c === 'primary' ? 'info' : perfil.c) +
          '" style="margin:18px 0">' + U.icon('brain', 19) +
          '<div><b>' + U.esc(perfil.t) + '</b>' + U.esc(perfil.s) + '</div></div>' +

        '<div class="section-h"><h3>Lo que vamos a usar</h3></div>' +
        '<div class="stack-sm">' +
          reco.map(function (id) {
            var t = S.TECNICAS[id];
            return '<button class="tech" style="width:100%;text-align:left" ' +
              'data-go="/tecnica/' + id + '">' +
              '<span class="tech-ico">' + U.icon(t.icono, 20) + '</span>' +
              '<span class="grow"><b>' + U.esc(t.nombre) + '</b>' +
              '<p>' + U.esc(t.corto) + '</p>' +
              '<span class="ev">' + U.esc(t.evidencia) + '</span></span></button>';
          }).join('') +
        '</div>' +

        '<div class="section-h"><h3>Cómo vamos a repartir tu tiempo</h3></div>' +
        '<div class="card">' +
          linea('clock', 'Hasta ' + U.mins(minutos) + ' por día',
            'Según lo que nos dijiste que podés sostener') +
          '<div class="divider"></div>' +
          linea('sun', 'Sesiones ' + franjas,
            'Las unidades difíciles van en tus mejores horas') +
          '<div class="divider"></div>' +
          linea('repeat', 'Cada unidad se ve más de una vez',
            'Primero para entenderla, después para comprobar que quedó') +
        '</div>' +
        '<div class="sp-16"></div>',
      footer:
        '<button class="btn btn-primary btn-block" data-go="/materia-nueva">' +
          'Cargar mi primera materia' + U.icon('arrow', 18, 2.2) + '</button>' +
        '<button class="btn btn-ghost btn-block btn-sm" data-go="/inicio">Lo hago después</button>'
    };
  });

  function linea(ico, t, s) {
    return '<div class="row">' +
      '<span class="li-ico grey">' + U.icon(ico, 19) + '</span>' +
      '<span class="grow"><b style="font:var(--t-subtitle);display:block">' + U.esc(t) + '</b>' +
      '<span class="p-small" style="display:block;margin-top:2px">' + U.esc(s) + '</span></span></div>';
  }

  /* ── /tecnica/:id — ficha de una técnica ─────────────────────── */
  R.add('/tecnica/:id', function (p) {
    var t = S.TECNICAS[p.id];
    if (!t) return { bar: { titulo: 'Técnica', back: true }, body: noEncontrado('Esa técnica no existe.') };
    return {
      bar: { titulo: t.nombre, back: true },
      body:
        '<div class="card-flat" style="display:flex;gap:14px;align-items:flex-start">' +
          '<span class="tech-ico" style="width:48px;height:48px">' + U.icon(t.icono, 24) + '</span>' +
          '<div class="grow"><b style="font:var(--t-title);display:block">' + U.esc(t.nombre) + '</b>' +
          '<span class="ev" style="display:inline-block;margin-top:7px">' +
          U.esc(t.evidencia) + '</span></div></div>' +
        '<div class="sp-16"></div>' +
        '<p class="p-body">' + U.esc(t.detalle) + '</p>' +
        '<div class="section-h"><h3>Cómo se aplica</h3></div>' +
        '<div class="steps">' +
          t.pasos.map(function (s, i) {
            return '<div class="step"><span class="step-n">' + (i + 1) + '</span>' +
              '<span class="step-text"><span class="step-title" style="font:var(--t-body);' +
              'font-weight:600">' + U.esc(s) + '</span></span></div>';
          }).join('') +
        '</div>' +
        '<div class="sp-16"></div>' +
        '<div class="note note-grey">' + U.icon('bulb', 19) +
          '<div>La app elige la técnica de cada sesión por vos, según el tema y cuántas ' +
          'veces ya lo viste. Esta ficha está para que sepas qué vas a estar haciendo.</div></div>' +
        '<div class="sp-16"></div>'
    };
  });

  function noEncontrado(msg) {
    return '<div class="empty"><div class="em-ico">' + U.icon('help', 32) + '</div>' +
      '<h3>No encontramos eso</h3><p>' + U.esc(msg) + '</p>' +
      '<button class="btn btn-secondary" data-go="/inicio">Ir al inicio</button></div>';
  }

  global.noEncontrado = noEncontrado;
})(window);
