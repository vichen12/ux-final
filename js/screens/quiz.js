/* ══════════════════════════════════════════════════════════════
   Quizzes — el repaso espaciado sobre las preguntas que el
   propio estudiante escribió al cerrar cada sesión.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App, P = global.Planner;

  /* quiz en curso */
  var corriendo = null;  // {materiaId, unidad, ids:[], i, revelada, resultados:[]}

  /* ── /quizzes — qué hay para repasar ─────────────────────────── */
  R.add('/quizzes', function () {
    var hoy = S.hoyStr();
    var todas = S.get().tarjetas;
    var pend = todas.filter(function (t) { return t.proximo <= hoy; });

    /* agrupo por materia y unidad */
    var grupos = {};
    pend.forEach(function (t) {
      var k = t.materiaId + '|' + t.unidad;
      (grupos[k] = grupos[k] || []).push(t);
    });
    var lista = Object.keys(grupos).map(function (k) {
      var p = k.split('|');
      return { materiaId: p[0], unidad: +p[1], tarjetas: grupos[k] };
    }).sort(function (a, b) { return b.tarjetas.length - a.tarjetas.length; });

    /* próximos repasos, para que se vea que el sistema planifica solo */
    var futuras = todas.filter(function (t) { return t.proximo > hoy; })
      .sort(function (a, b) { return a.proximo < b.proximo ? -1 : 1; });

    var sinProbar = S.sinProbar();

    return {
      bar: {
        titulo: 'Quizzes', sub: pend.length ? pend.length + ' para repasar hoy' : 'Nada pendiente',
      },
      tab: 'quizzes',
      body:
        (pend.length
          ? '<div class="note note-green" style="margin-bottom:16px">' +
              U.icon('repeat', 19) +
              '<div><b>' + pend.length + ' ' + (pend.length === 1 ? 'pregunta' : 'preguntas') +
              ' en el día justo</b>El repaso espaciado las trae ahora, antes de que las olvides.' +
              '</div></div>' +
            '<div class="stack-sm">' +
              lista.map(function (g) {
                var m = S.materia(g.materiaId);
                var u = S.unidad(g.materiaId, g.unidad);
                var nuevas = g.tarjetas.filter(function (t) { return !t.repasos; }).length;
                return '<button class="card bar-left ' + (m ? m.color : 'grey') +
                  '" style="width:100%;text-align:left" data-go="/quiz/' + g.materiaId +
                  '/' + g.unidad + '">' +
                  '<div class="row-between" style="margin-bottom:9px">' +
                    '<div class="grow"><div class="card-title">' +
                    U.esc(u ? u.titulo : 'Unidad ' + g.unidad) + '</div>' +
                    '<div class="card-sub">' + U.esc(m ? m.corto : '') + ' · unidad ' +
                    g.unidad + '</div></div>' +
                    '<span class="badge badge-green">' + g.tarjetas.length + '</span>' +
                  '</div>' +
                  '<div class="row-between">' +
                    '<span class="p-small">' +
                      (nuevas ? U.plural(nuevas, 'pregunta nueva', 'preguntas nuevas') +
                        ' sin repasar' : 'Todas ya repasadas antes') +
                    '</span>' +
                    '<span class="chip chip-primary">' + U.icon('play', 13, 2.4) +
                    'Empezar</span>' +
                  '</div></button>';
              }).join('') +
            '</div>'
          : '<div class="empty" style="padding-top:36px">' +
            '<div class="em-ico" style="background:var(--secondary-c);color:var(--on-secondary-c)">' +
            U.icon('check', 32, 2.4) + '</div>' +
            '<h3>Estás al día</h3>' +
            '<p>No hay preguntas para repasar hoy. Las próximas aparecen solas cuando toque.</p>' +
            '</div>') +

        (sinProbar.length
          ? '<div class="section-h"><h3>Leídas sin probar</h3></div>' +
            '<div class="note note-amber" style="margin-bottom:10px">' + U.icon('alert', 19) +
              '<div>Estudiaste estas unidades pero todavía no tienen preguntas respondidas. ' +
              'Hasta que no las pruebes, no sabés si las sabés.</div></div>' +
            '<div class="stack-sm">' +
              sinProbar.map(function (x) {
                var n = S.tarjetasDe(x.materia.id, x.unidad.n).length;
                return '<button class="list-item" data-go="/unidad/' + x.materia.id + '/' +
                  x.unidad.n + '">' +
                  '<span class="li-ico amber">' + U.icon('eye', 19) + '</span>' +
                  '<span class="li-text"><span class="li-title">' + U.esc(x.unidad.titulo) +
                  '</span><span class="li-sub">' + U.esc(x.materia.corto) + ' · ' +
                  (n ? U.plural(n, 'pregunta guardada', 'preguntas guardadas')
                     : 'sin preguntas todavía') + '</span></span>' +
                  '<span class="li-end">' + U.icon('next', 18) + '</span></button>';
              }).join('') +
            '</div>'
          : '') +

        (futuras.length
          ? '<div class="section-h"><h3>Programadas</h3></div>' +
            '<div class="card">' +
              futuras.slice(0, 5).map(function (t) {
                var m = S.materia(t.materiaId);
                var d = U.daysBetween(S.hoy(), U.parseYmd(t.proximo));
                return '<div class="unit" style="padding:10px 0">' +
                  '<span class="unit-n">' + U.icon('clock', 14) + '</span>' +
                  '<span class="unit-text"><span class="unit-title" style="font:var(--t-body-sm);' +
                  'font-weight:600">' + U.esc(t.pregunta) + '</span>' +
                  '<span class="unit-sub">' + U.esc(m ? m.corto : '') + ' · unidad ' +
                  t.unidad + '</span></span>' +
                  '<span class="badge badge-grey nowrap">' + U.relDays(d) + '</span></div>';
              }).join('') +
            '</div>'
          : '') +
        '<div class="sp-24"></div>'
    };
  });

  /* ── /quiz/:materiaId/:unidad — la ronda ─────────────────────── */
  R.add('/quiz/:materiaId/:unidad', function (p) {
    var m = S.materia(p.materiaId);
    var u = S.unidad(p.materiaId, p.unidad);
    if (!m || !u) return { bar: { titulo: 'Quiz', back: '/quizzes' },
      body: global.noEncontrado('Esa unidad no existe.') };

    var hoy = S.hoyStr();
    var clave = p.materiaId + '|' + p.unidad;

    if (!corriendo || corriendo.clave !== clave) {
      var disponibles = S.tarjetasDe(p.materiaId, p.unidad)
        .filter(function (t) { return t.proximo <= hoy; });
      if (!disponibles.length) disponibles = S.tarjetasDe(p.materiaId, p.unidad);
      if (!disponibles.length) {
        return {
          bar: { titulo: 'Quiz', sub: u.titulo, back: '/quizzes' },
          body: '<div class="empty"><div class="em-ico">' + U.icon('cards', 32) + '</div>' +
            '<h3>Esta unidad no tiene preguntas</h3>' +
            '<p>Las preguntas se crean cuando terminás una sesión de estudio de esta unidad.</p>' +
            '<button class="btn btn-secondary" data-go="/materia/' + m.id + '">' +
            'Ver la materia</button></div>'
        };
      }
      corriendo = {
        clave: clave, materiaId: p.materiaId, unidad: +p.unidad,
        ids: disponibles.map(function (t) { return t.id; }),
        i: 0, revelada: false, resultados: []
      };
    }

    var q = corriendo;
    var t = S.tarjeta(q.ids[q.i]);
    if (!t) { corriendo = null; R.go('/quizzes'); return {}; }

    var creadaHace = U.daysBetween(U.parseYmd(t.creada), S.hoy());
    var pct = Math.round(q.i / q.ids.length * 100);
    var aciertos = q.resultados.filter(function (r) { return r === 2; }).length;

    return {
      bar: {
        titulo: 'Repaso de ' + (m.corto || m.nombre),
        sub: 'Pregunta ' + (q.i + 1) + ' de ' + q.ids.length,
        back: '/quizzes',
        acciones: [{ icono: 'x', act: 'quiz-salir', label: 'Salir del quiz' }]
      },
      body:
        '<div class="bar" style="margin-bottom:6px"><i style="width:' + pct + '%"></i></div>' +
        '<div class="row-between" style="margin-bottom:16px">' +
          '<span class="p-small">' + U.esc(u.titulo) + '</span>' +
          '<span class="p-small tnum">' + aciertos + ' correctas</span>' +
        '</div>' +

        '<div class="q-card">' +
          '<div class="q-meta">' + U.icon('note', 14) +
            '<span>La escribiste ' +
            (creadaHace === 0 ? 'hoy' : creadaHace === 1 ? 'ayer' : 'hace ' + creadaHace + ' días') +
            '</span>' +
            (t.repasos ? '<span class="badge badge-grey" style="margin-left:auto">' +
              'repaso ' + (t.repasos + 1) + '</span>'
              : '<span class="badge badge-amber" style="margin-left:auto">primera vez</span>') +
          '</div>' +
          '<div class="q-text">' + U.esc(t.pregunta) + '</div>' +

          (q.revelada
            ? (t.respuesta
                ? '<div class="q-answer"><b>Tu respuesta clave</b><p>' +
                  U.esc(t.respuesta) + '</p></div>'
                : '<div class="q-answer" style="background:var(--surface-c);' +
                  'color:var(--on-surface-var)"><b>No guardaste respuesta</b>' +
                  '<p>Contestala de memoria y calificá qué tan bien te acordabas.</p></div>')
            : '') +
        '</div>' +

        '<div class="sp-16"></div>' +

        (q.revelada
          ? '<div class="section-h" style="margin-top:0"><h3>¿Cómo te acordabas?</h3></div>' +
            '<div class="recall">' +
              '<button class="r-good" data-act="quiz-calificar" data-c="2">' +
                '<span class="emoji">🟢</span><span>Me acordaba</span>' +
                '<em>vuelve en ' + proxIntervalo(t, 2) + '</em></button>' +
              '<button class="r-mid" data-act="quiz-calificar" data-c="1">' +
                '<span class="emoji">🟡</span><span>A medias</span>' +
                '<em>vuelve en ' + proxIntervalo(t, 1) + '</em></button>' +
              '<button class="r-bad" data-act="quiz-calificar" data-c="0">' +
                '<span class="emoji">🔴</span><span>En blanco</span>' +
                '<em>vuelve mañana</em></button>' +
            '</div>' +
            '<div class="sp-12"></div>' +
            '<p class="p-small muted" style="text-align:center">Calificá con honestidad: de ' +
            'eso depende cuándo vuelve a aparecer.</p>'
          : '<div class="note note-info">' + U.icon('brain', 19) +
            '<div>Respondé primero en voz alta o por escrito. Recién después mirá la ' +
            'respuesta: el esfuerzo de recuperarla es lo que la fija.</div></div>') +
        '<div class="sp-16"></div>',

      footer: q.revelada ? null :
        '<button class="btn btn-primary btn-block" data-act="quiz-revelar">' +
        U.icon('eye', 18, 2.2) + 'Ver respuesta y calificar</button>',

      onMount: function () {
        A.accion('quiz-revelar', function () { q.revelada = true; R.render(); });
        A.accion('quiz-salir', function () {
          A.dialog({
            titulo: 'Salir del repaso',
            texto: 'Las preguntas que ya calificaste quedan guardadas. El resto vuelve a ' +
              'aparecer en la lista.',
            aceptar: 'Salir',
            onOk: function () { corriendo = null; R.go('/quizzes'); }
          });
        });
        A.accion('quiz-calificar', function (el) {
          var c = +el.getAttribute('data-c');
          P.calificar(t, c);
          q.resultados.push(c);
          q.revelada = false;
          q.i++;
          if (q.i >= q.ids.length) {
            var res = P.cerrarQuiz(q.materiaId, q.unidad);
            var destino = '/quiz-fin/' + q.materiaId + '/' + q.unidad;
            global.__ultimoQuiz = {
              clave: q.clave, resultados: q.resultados.slice(),
              nota: res.nota, ajuste: res.ajuste, total: q.ids.length
            };
            corriendo = null;
            R.go(destino);
          } else {
            R.render();
          }
        });
      }
    };
  });

  function proxIntervalo(t, calidad) {
    var copia = { facilidad: t.facilidad, intervalo: t.intervalo, repasos: t.repasos,
      historial: [], proximo: t.proximo };
    var f = copia.facilidad || 2.5, i = copia.intervalo || 1;
    if (calidad >= 2) { f = Math.min(3.1, f + 0.12); i = copia.repasos === 0 ? 2 : Math.round(i * f); }
    else if (calidad === 1) { i = Math.max(1, Math.round(i * 0.6)); }
    else { i = 1; }
    i = Math.min(i, 60);
    return i === 1 ? '1 día' : i + ' días';
  }

  /* ── /quiz-fin/:materiaId/:unidad — resultado ────────────────── */
  R.add('/quiz-fin/:materiaId/:unidad', function (p) {
    var m = S.materia(p.materiaId);
    var u = S.unidad(p.materiaId, p.unidad);
    if (!m || !u) return { bar: { titulo: 'Resultado', back: '/quizzes' },
      body: global.noEncontrado('Esa unidad no existe.') };

    var ult = global.__ultimoQuiz || {};
    var res = ult.resultados || [];
    var bien = res.filter(function (r) { return r === 2; }).length;
    var medio = res.filter(function (r) { return r === 1; }).length;
    var mal = res.filter(function (r) { return r === 0; }).length;
    var nota = ult.nota != null ? ult.nota : (u.nota || 0);
    var ajuste = ult.ajuste;
    var aprobo = nota >= 70;

    return {
      bar: { titulo: 'Resultado del repaso', back: '/quizzes' },
      body:
        '<div class="celebrate" style="padding-top:20px">' +
          U.ring(nota, 136, 12, aprobo ? 'var(--secondary)' : 'var(--tertiary-c)',
            '<b style="font:800 34px/1 var(--font);letter-spacing:-.03em" class="tnum">' +
            nota + '%</b><span class="p-small" style="margin-top:3px">' +
            (aprobo ? 'dominada' : 'a reforzar') + '</span>') +
          '<h2 class="h-head" style="margin-top:18px">' +
            (aprobo ? '¡Unidad dominada!' : 'Todavía no está firme') + '</h2>' +
          '<p class="p-body" style="max-width:30ch;margin:0 auto">' +
            U.esc(u.titulo) + ' · ' + U.esc(m.corto) + '</p>' +
        '</div>' +

        '<div class="sp-16"></div>' +
        '<div class="stats-row">' +
          '<div><b style="color:var(--secondary)">' + bien + '</b><span>me acordaba</span></div>' +
          '<div><b style="color:var(--tertiary-c)">' + medio + '</b><span>a medias</span></div>' +
          '<div><b style="color:var(--error)">' + mal + '</b><span>en blanco</span></div>' +
        '</div>' +

        '<div class="sp-16"></div>' +
        (aprobo
          ? '<div class="note note-green">' + U.icon('check', 19, 2.3) +
            '<div><b>Pasó de leída a dominada</b>En el panel de progreso ahora cuenta como ' +
            'una unidad que sabés, no solo que viste.</div></div>'
          : '<div class="note note-amber">' + U.icon('alert', 19) +
            '<div><b>Sigue contando como leída</b>Para que pase a dominada necesitás ' +
            'responder bien al menos el 70%.</div></div>') +

        /* el ajuste que la app sugiere y el estudiante confirma */
        (ajuste
          ? '<div class="section-h"><h3>Ajuste sugerido</h3></div>' +
            '<div class="card" style="border:1.5px solid var(--tertiary-fixed)">' +
              '<div class="row" style="margin-bottom:12px">' +
                '<span class="li-ico amber">' + U.icon('calendar', 19) + '</span>' +
                '<span class="grow"><b style="font:var(--t-subtitle);display:block">' +
                'Sumar un repaso de ' + U.mins(ajuste.duracion) + '</b>' +
                '<span class="p-small" style="display:block;margin-top:2px">' +
                U.fmtDate(ajuste.fecha, true) + ' a las ' + ajuste.hora + ' · ' +
                U.esc(S.TECNICAS[ajuste.tecnica].nombre) + '</span></span>' +
              '</div>' +
              '<p class="p-small" style="margin-bottom:14px">' + U.esc(ajuste.motivo) + '</p>' +
              '<div class="btn-row">' +
                '<button class="btn btn-outline btn-sm" data-act="aj-no">Dejar como está</button>' +
                '<button class="btn btn-primary btn-sm" data-act="aj-si">Aceptar ajuste</button>' +
              '</div>' +
            '</div>'
          : '<div class="section-h"><h3>Próximos repasos</h3></div>' +
            '<div class="card">' +
              S.tarjetasDe(p.materiaId, p.unidad).slice(0, 4).map(function (t) {
                var d = U.daysBetween(S.hoy(), U.parseYmd(t.proximo));
                return '<div class="unit" style="padding:9px 0">' +
                  '<span class="unit-n ' + (d > 6 ? 'master' : '') + '">' +
                  U.icon('repeat', 13) + '</span>' +
                  '<span class="unit-text"><span class="unit-title" ' +
                  'style="font:var(--t-body-sm);font-weight:600">' + U.esc(t.pregunta) + '</span>' +
                  '</span><span class="badge badge-grey nowrap">' + U.relDays(d) + '</span></div>';
              }).join('') +
            '</div>') +
        '<div class="sp-16"></div>',

      footer:
        '<button class="btn btn-primary btn-block" data-go="/quizzes">Volver a los quizzes</button>' +
        '<button class="btn btn-ghost btn-block btn-sm" data-go="/progreso">Ver mi progreso</button>',

      onMount: function () {
        A.accion('aj-si', function () {
          P.aplicarAjuste(ajuste);
          global.__ultimoQuiz.ajuste = null;
          A.toast('Repaso agregado el ' + U.fmtDate(ajuste.fecha));
          R.render();
        });
        A.accion('aj-no', function () {
          global.__ultimoQuiz.ajuste = null;
          A.toast('No tocamos tu cronograma', { icono: 'check' });
          R.render();
        });
      }
    };
  });
})(window);
