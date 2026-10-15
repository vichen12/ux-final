/* ══════════════════════════════════════════════════════════════
   Sesión de estudio — el detalle, el cronómetro con la guía
   metodológica y el cierre donde el estudiante escribe sus
   propias preguntas.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App, P = global.Planner;

  /* cronómetro vivo entre renders */
  var reloj = { sesionId: null, restante: 0, total: 0, corriendo: false, tick: null, paso: 0 };
  /* preguntas que se están escribiendo */
  var borradorPreguntas = {};

  function faltaSesion() {
    return { bar: { titulo: 'Sesión', back: '/calendario' },
      body: global.noEncontrado('Esa sesión ya no existe.') };
  }

  /* ── /sesion/:id — detalle ───────────────────────────────────── */
  R.add('/sesion/:id', function (p) {
    var s = S.sesion(p.id);
    if (!s) return faltaSesion();
    var m = S.materia(s.materiaId);
    var u = S.unidad(s.materiaId, s.unidad);
    var t = S.TECNICAS[s.tecnica];
    var dias = U.daysBetween(S.hoy(), U.parseYmd(s.fecha));
    var tarjetas = S.tarjetasDe(s.materiaId, s.unidad);

    return {
      bar: {
        titulo: 'Sesión de estudio', sub: m ? m.nombre : '', back: '/calendario',
        acciones: [{ icono: 'more', act: 'ses-menu', label: 'Más opciones' }]
      },
      body:
        '<div class="card bar-left ' + (m ? m.color : 'grey') + '">' +
          '<div class="eyebrow" style="margin-bottom:9px">' +
            U.icon('book', 14, 2.2) + 'Unidad ' + s.unidad + ' · ' + U.esc(m ? m.corto : '') + '</div>' +
          '<div class="h-title" style="margin-bottom:10px">' +
            U.esc(u ? u.titulo : 'Unidad ' + s.unidad) + '</div>' +
          '<div class="chip-row">' +
            '<span class="chip">' + U.icon('calendar', 14) +
              (dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : U.fmtDate(s.fecha)) + '</span>' +
            '<span class="chip">' + U.icon('clock', 14) + s.hora + '</span>' +
            '<span class="chip">' + U.icon('timer', 14) + U.mins(s.duracion) + '</span>' +
          '</div>' +
        '</div>' +

        (s.estado === 'hecha'
          ? '<div class="note note-green" style="margin-top:12px">' + U.icon('check', 19, 2.3) +
            '<div><b>Sesión completada</b>' +
            (s.preguntas && s.preguntas.length
              ? 'Escribiste ' + s.preguntas.length + ' preguntas de repaso.'
              : 'La marcaste como hecha.') + '</div></div>'
          : s.estado === 'omitida'
            ? '<div class="note note-amber" style="margin-top:12px">' + U.icon('alert', 19) +
              '<div><b>Sesión omitida</b>Podés reprogramarla para otro día.</div></div>'
            : '') +

        /* la técnica y sus pasos: esto es lo que una agenda no te da */
        '<div class="section-h"><h3>Cómo vas a estudiar</h3></div>' +
        '<div class="card">' +
          '<div class="row" style="margin-bottom:13px">' +
            '<span class="li-ico">' + U.icon(t.icono, 20) + '</span>' +
            '<span class="grow"><b style="font:var(--t-subtitle);display:block">' +
            U.esc(t.nombre) + '</b>' +
            '<span class="p-small" style="display:block;margin-top:2px">' +
            U.esc(t.corto) + '</span></span>' +
            '<button class="ab-btn" data-go="/tecnica/' + t.id + '" aria-label="Sobre la técnica" ' +
            'style="flex:none;color:var(--outline)">' + U.icon('help', 18) + '</button>' +
          '</div>' +
          '<div class="steps">' +
            t.pasos.map(function (x, i) {
              return '<div class="step"><span class="step-n">' + (i + 1) + '</span>' +
                '<span class="step-text"><span class="step-title" ' +
                'style="font:var(--t-body);font-weight:600">' + U.esc(x) + '</span></span></div>';
            }).join('') +
          '</div>' +
        '</div>' +

        (tarjetas.length
          ? '<div class="section-h"><h3>Preguntas que ya tenés de esta unidad</h3></div>' +
            '<div class="stack-sm">' + tarjetas.slice(0, 3).map(function (c) {
              return '<div class="card" style="padding:13px 14px">' +
                '<div class="p-small" style="color:var(--on-surface);font-weight:600">' +
                U.esc(c.pregunta) + '</div>' +
                '<div class="p-small muted" style="margin-top:5px">Próximo repaso: ' +
                U.relDays(U.daysBetween(S.hoy(), U.parseYmd(c.proximo))) + '</div></div>';
            }).join('') + '</div>'
          : '') +
        '<div class="sp-16"></div>',

      footer: s.estado === 'pendiente'
        ? '<button class="btn btn-primary btn-block" data-go="/sesion/' + s.id + '/activa">' +
            U.icon('play', 18, 2.3) + 'Comenzar sesión</button>' +
          '<button class="btn btn-ghost btn-block btn-sm" data-act="ses-reprogramar" ' +
            'data-id="' + s.id + '">Reprogramar</button>'
        : s.estado === 'omitida'
          ? '<button class="btn btn-secondary btn-block" data-act="ses-reprogramar" ' +
            'data-id="' + s.id + '">Reprogramar esta sesión</button>'
          : '<button class="btn btn-outline btn-block" data-go="/quizzes">' +
            'Ir a los repasos</button>',

      onMount: function () {
        A.accion('ses-menu', function () {
          A.sheet(
            '<h3>Opciones de la sesión</h3>' +
            '<div class="sh-sub">' + U.esc(u ? u.titulo : '') + '</div>' +
            '<div class="stack-sm">' +
              (s.estado === 'pendiente'
                ? '<button class="list-item" data-act="ses-reprogramar" data-id="' + s.id + '">' +
                  '<span class="li-ico grey">' + U.icon('calendar', 19) + '</span>' +
                  '<span class="li-text"><span class="li-title">Reprogramar</span>' +
                  '<span class="li-sub">Moverla a otro día</span></span></button>' +
                  '<button class="list-item" data-act="ses-omitir" data-id="' + s.id + '">' +
                  '<span class="li-ico amber">' + U.icon('x', 19) + '</span>' +
                  '<span class="li-text"><span class="li-title">Marcar como omitida</span>' +
                  '<span class="li-sub">Hoy no la voy a hacer</span></span></button>' +
                  '<button class="list-item" data-act="ses-hecha-rapido" data-id="' + s.id + '">' +
                  '<span class="li-ico green">' + U.icon('check', 19) + '</span>' +
                  '<span class="li-text"><span class="li-title">Ya la hice</span>' +
                  '<span class="li-sub">Marcarla sin usar el cronómetro</span></span></button>'
                : '') +
              '<button class="list-item" data-go="/materia/' + s.materiaId + '">' +
              '<span class="li-ico">' + U.icon('book', 19) + '</span>' +
              '<span class="li-text"><span class="li-title">Ver la materia</span>' +
              '<span class="li-sub">' + U.esc(m ? m.nombre : '') + '</span></span></button>' +
            '</div><div class="sp-8"></div>'
          );
        });
        A.accion('ses-omitir', function (el) {
          var ss = S.sesion(el.getAttribute('data-id'));
          if (ss) { ss.estado = 'omitida'; S.emit(); }
          A.cerrarOverlay();
          A.toast('Sesión marcada como omitida', { icono: 'alert' });
          R.render();
        });
        A.accion('ses-hecha-rapido', function (el) {
          P.completarSesion(el.getAttribute('data-id'), []);
          A.cerrarOverlay();
          A.toast('Sesión marcada como hecha');
          R.render();
        });
        A.accion('ses-reprogramar', function (el) {
          abrirReprogramar(el.getAttribute('data-id'));
        });
      }
    };
  });

  /* ── hoja de reprogramación ──────────────────────────────────── */
  function abrirReprogramar(id) {
    var s = S.sesion(id);
    if (!s) return;
    var opciones = [];
    for (var i = 1; i <= 6; i++) {
      var f = U.ymd(U.addDays(S.hoy(), i));
      opciones.push({ f: f, n: S.sesionesDe(f).length });
    }
    A.sheet(
      '<h3>Reprogramar la sesión</h3>' +
      '<div class="sh-sub">Elegí otro día. Mostramos cuántas sesiones ya tenés en cada uno.</div>' +
      '<div class="stack-sm">' +
        opciones.map(function (o) {
          var libre = o.n < 2;
          return '<button class="list-item" data-act="ses-mover" data-id="' + id +
            '" data-f="' + o.f + '">' +
            '<span class="li-ico ' + (libre ? 'green' : 'amber') + '">' +
            U.icon('calendar', 19) + '</span>' +
            '<span class="li-text"><span class="li-title">' + U.fmtDate(o.f, true) + '</span>' +
            '<span class="li-sub">' + (o.n === 0 ? 'Día libre' :
              o.n + (o.n === 1 ? ' sesión' : ' sesiones') + ' ese día') + '</span></span>' +
            '<span class="li-end">' + U.icon('next', 18) + '</span></button>';
        }).join('') +
      '</div><div class="sp-8"></div>'
    );
    A.accion('ses-mover', function (el) {
      P.reprogramar(el.getAttribute('data-id'), el.getAttribute('data-f'));
      A.cerrarOverlay();
      A.toast('Sesión movida al ' + U.fmtDate(el.getAttribute('data-f')));
      R.render();
    });
  }

  /* ── /sesion/:id/activa — cronómetro ─────────────────────────── */
  R.add('/sesion/:id/activa', function (p) {
    var s = S.sesion(p.id);
    if (!s) return faltaSesion();
    var m = S.materia(s.materiaId);
    var u = S.unidad(s.materiaId, s.unidad);
    var t = S.TECNICAS[s.tecnica];

    if (reloj.sesionId !== s.id) {
      reloj = { sesionId: s.id, restante: s.duracion * 60, total: s.duracion * 60,
        corriendo: true, tick: null, paso: 0 };
    }

    return {
      bar: {
        titulo: u ? u.titulo : 'Unidad ' + s.unidad,
        sub: (m ? m.corto : '') + ' · ' + t.nombre,
        back: '/sesion/' + s.id
      },
      body:
        '<div class="timer-wrap">' +
          U.ring(0, 196, 13, 'var(--primary)',
            '<div class="timer-time" id="t-time">' + U.clock(reloj.restante) + '</div>' +
            '<div class="timer-of" id="t-of">de ' + U.mins(s.duracion) + '</div>') +
        '</div>' +

        '<div class="row" style="justify-content:center;gap:10px;margin:6px 0 20px">' +
          '<button class="btn btn-secondary" id="t-toggle" data-act="t-toggle">' +
            U.icon(reloj.corriendo ? 'pause' : 'play', 18, 2.3) +
            '<span>' + (reloj.corriendo ? 'Pausar' : 'Reanudar') + '</span></button>' +
          '<button class="btn btn-outline" data-act="t-terminar">' +
            U.icon('check', 18, 2.3) + 'Terminar</button>' +
        '</div>' +

        '<div class="section-h" style="margin-top:0"><h3>' + U.esc(t.nombre) + '</h3>' +
          '<span class="p-small" id="t-pasoinfo">Paso 1 de ' + t.pasos.length + '</span></div>' +
        '<div class="steps" id="t-steps">' +
          t.pasos.map(function (x, i) {
            return '<button class="step' + (i === 0 ? ' on' : '') + '" data-act="t-paso" ' +
              'data-i="' + i + '" style="width:100%;text-align:left">' +
              '<span class="step-n">' + (i + 1) + '</span>' +
              '<span class="step-text"><span class="step-title" ' +
              'style="font:var(--t-body);font-weight:600">' + U.esc(x) + '</span></span></button>';
          }).join('') +
        '</div>' +

        '<div class="sp-16"></div>' +
        '<div class="note note-info">' + U.icon('bulb', 19) +
          '<div><b>Al terminar te vamos a pedir preguntas</b>' +
          'Escribir lo que deberías poder responder ya es un ejercicio de recuperación, ' +
          'y con eso armamos tu quiz.</div></div>' +
        '<div class="sp-16"></div>' +
        '<button class="btn btn-ghost btn-block btn-sm" data-act="t-saltar">' +
          U.icon('next', 16, 2.2) + 'Adelantar el reloj (demostración)</button>' +
        '<div class="sp-16"></div>',

      onMount: function (root) {
        var anillo = root.querySelector('.ring circle:last-child');
        var circ = anillo ? parseFloat(anillo.getAttribute('stroke-dasharray')) : 0;
        var tiempoEl = root.querySelector('#t-time');

        function pintar() {
          if (!tiempoEl) return;
          tiempoEl.textContent = U.clock(Math.max(0, reloj.restante));
          var pct = reloj.total ? (reloj.total - reloj.restante) / reloj.total : 0;
          if (anillo) anillo.setAttribute('stroke-dashoffset', (circ * (1 - pct)).toFixed(1));
          if (reloj.restante <= 0) terminar(true);
        }

        function arrancar() {
          clearInterval(reloj.tick);
          reloj.tick = setInterval(function () {
            if (!reloj.corriendo) return;
            reloj.restante--;
            pintar();
          }, 1000);
        }

        function terminar(auto) {
          clearInterval(reloj.tick);
          reloj.corriendo = false;
          R.go('/sesion/' + s.id + '/preguntas');
          if (auto) A.toast('Se cumplió el tiempo de la sesión', { icono: 'timer' });
        }

        pintar();
        arrancar();

        A.accion('t-toggle', function () {
          reloj.corriendo = !reloj.corriendo;
          var b = document.getElementById('t-toggle');
          if (b) b.innerHTML = U.icon(reloj.corriendo ? 'pause' : 'play', 18, 2.3) +
            '<span>' + (reloj.corriendo ? 'Pausar' : 'Reanudar') + '</span>';
          A.toast(reloj.corriendo ? 'Sesión reanudada' : 'Sesión en pausa',
            { icono: reloj.corriendo ? 'play' : 'pause', ms: 1400 });
        });
        A.accion('t-terminar', function () {
          A.dialog({
            titulo: 'Terminar la sesión',
            texto: 'Faltan ' + U.clock(Math.max(0, reloj.restante)) + '. ' +
              'Si la cerrás ahora igual vas a poder escribir tus preguntas.',
            aceptar: 'Terminar',
            onOk: function () { terminar(false); }
          });
        });
        A.accion('t-saltar', function () { reloj.restante = 3; pintar(); });
        A.accion('t-paso', function (el) {
          reloj.paso = +el.getAttribute('data-i');
          root.querySelectorAll('[data-act="t-paso"]').forEach(function (b, i) {
            b.className = 'step' + (i === reloj.paso ? ' on' : i < reloj.paso ? ' done' : '');
          });
          var info = document.getElementById('t-pasoinfo');
          if (info) info.textContent = 'Paso ' + (reloj.paso + 1) + ' de ' + t.pasos.length;
        });

        this.onUnmount = function () { clearInterval(reloj.tick); };
      }
    };
  });

  /* ── /sesion/:id/preguntas — cierre de la sesión ─────────────── */
  R.add('/sesion/:id/preguntas', function (p) {
    var s = S.sesion(p.id);
    if (!s) return faltaSesion();
    var m = S.materia(s.materiaId);
    var u = S.unidad(s.materiaId, s.unidad);

    if (!borradorPreguntas[s.id]) {
      borradorPreguntas[s.id] = [{ pregunta: '', respuesta: '' }, { pregunta: '', respuesta: '' }];
    }
    var lista = borradorPreguntas[s.id];

    return {
      bar: { titulo: '¿Qué aprendiste?', sub: u ? u.titulo : '', back: '/sesion/' + s.id },
      body:
        '<div class="note note-green" style="margin-bottom:16px">' +
          U.icon('check', 19, 2.3) +
          '<div><b>Sesión de ' + U.mins(s.duracion) + ' completada</b>' +
          U.esc(m ? m.corto : '') + ' · ' + U.esc(u ? u.titulo : '') + '</div></div>' +

        '<h2 class="h-head">Escribí 2 o 3 preguntas</h2>' +
        '<p class="p-body" style="margin-bottom:8px">Sobre lo que acabás de estudiar. ' +
        'La app te las va a devolver en unos días para ver si todavía te acordás.</p>' +
        '<div class="note note-info" style="margin-bottom:18px">' + U.icon('brain', 19) +
          '<div>Formular la pregunta ya es recuperación activa: te obliga a decidir qué era ' +
          'lo importante.</div></div>' +

        '<div class="p-small" style="margin-bottom:8px;font-weight:700;color:var(--on-surface)">' +
          '¿No sabés cómo empezar? Tocá un disparador</div>' +
        '<div class="chip-row" style="margin-bottom:16px">' +
          ['¿Qué es…?', '¿Por qué…?', '¿Cuál es la diferencia entre…?', '¿Cómo se aplica…?',
           '¿Qué pasa si…?'].map(function (t) {
            return '<button class="chip chip-outline" data-act="q-disparador" data-t="' +
              U.esc(t) + '">' + U.esc(t) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="stack" id="preguntas">' +
          lista.map(function (q, i) { return bloquePregunta(q, i, lista.length); }).join('') +
        '</div>' +

        '<div class="sp-12"></div>' +
        '<button class="btn btn-outline btn-block btn-sm" data-act="q-agregar">' +
          U.icon('plus', 16, 2.2) + 'Agregar otra pregunta</button>' +
        '<div class="sp-16"></div>',

      footer:
        '<button class="btn btn-primary btn-block" data-act="q-guardar" data-id="' + s.id + '">' +
          U.icon('check', 18, 2.3) + 'Guardar y finalizar</button>' +
        '<button class="btn btn-ghost btn-block btn-sm" data-act="q-omitir" data-id="' + s.id + '">' +
          'Omitir por hoy</button>',

      onMount: function (root) {
        function sincronizar() {
          root.querySelectorAll('[data-q]').forEach(function (el) {
            var i = +el.getAttribute('data-q');
            var campo = el.getAttribute('data-campo');
            if (lista[i]) lista[i][campo] = el.value;
          });
        }
        root.addEventListener('input', function (e) {
          if (e.target.matches('[data-q]')) {
            var i = +e.target.getAttribute('data-q');
            var campo = e.target.getAttribute('data-campo');
            if (lista[i]) lista[i][campo] = e.target.value;
          }
        });
        A.accion('q-disparador', function (el) {
          sincronizar();
          var t = el.getAttribute('data-t').replace('…?', ' ');
          var i = lista.findIndex(function (q) { return !q.pregunta.trim(); });
          if (i < 0) { lista.push({ pregunta: '', respuesta: '' }); i = lista.length - 1; }
          lista[i].pregunta = t;
          R.render();
          var campo = document.querySelector('[data-q="' + i + '"][data-campo="pregunta"]');
          if (campo) { campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
        });
        A.accion('q-agregar', function () {
          sincronizar();
          if (lista.length >= 6) { A.toast('Con 6 preguntas alcanza', { icono: 'help' }); return; }
          lista.push({ pregunta: '', respuesta: '' });
          R.render();
          var qs = document.querySelectorAll('[data-campo="pregunta"]');
          if (qs.length) qs[qs.length - 1].focus();
        });
        A.accion('q-quitar', function (el) {
          sincronizar();
          lista.splice(+el.getAttribute('data-i'), 1);
          if (!lista.length) lista.push({ pregunta: '', respuesta: '' });
          R.render();
        });
        A.accion('q-guardar', function (el) {
          sincronizar();
          var validas = lista.filter(function (q) { return q.pregunta.trim(); });
          if (!validas.length) {
            A.toast('Escribí al menos una pregunta', { icono: 'alert' });
            return;
          }
          P.completarSesion(el.getAttribute('data-id'), validas);
          delete borradorPreguntas[el.getAttribute('data-id')];
          R.go('/sesion/' + el.getAttribute('data-id') + '/fin');
        });
        A.accion('q-omitir', function (el) {
          var id = el.getAttribute('data-id');
          A.dialog({
            titulo: 'Terminar sin preguntas',
            texto: 'Sin preguntas propias no vamos a poder armarte el quiz de esta unidad, ' +
              'y va a quedar como leída pero sin probar.',
            aceptar: 'Terminar igual',
            onOk: function () {
              P.completarSesion(id, []);
              delete borradorPreguntas[id];
              R.go('/sesion/' + id + '/fin');
            }
          });
        });
      }
    };
  });

  function bloquePregunta(q, i, total) {
    return '<div class="card">' +
      '<div class="row-between" style="margin-bottom:10px">' +
        '<span class="row" style="gap:9px"><span class="unit-n">' + (i + 1) + '</span>' +
        '<b style="font:var(--t-subtitle)">Pregunta ' + (i + 1) + '</b></span>' +
        (total > 1 ? '<button class="ab-btn" data-act="q-quitar" data-i="' + i + '" ' +
          'style="width:32px;height:32px;color:var(--outline)" aria-label="Quitar">' +
          U.icon('x', 16, 2.2) + '</button>' : '') +
      '</div>' +
      '<label class="field" style="margin-bottom:10px"><span>Tu pregunta de repaso</span>' +
        '<textarea data-q="' + i + '" data-campo="pregunta" rows="2" ' +
        'placeholder="¿Qué condición debe cumplirse para que…?">' + U.esc(q.pregunta) +
        '</textarea></label>' +
      '<label class="field" style="margin-bottom:0"><span>Respuesta clave ' +
        '<em class="muted">(opcional)</em></span>' +
        '<textarea data-q="' + i + '" data-campo="respuesta" rows="2" ' +
        'placeholder="La idea que tendrías que poder recuperar">' + U.esc(q.respuesta) +
        '</textarea></label>' +
      '</div>';
  }

  /* ── /sesion/:id/fin — resultado ─────────────────────────────── */
  R.add('/sesion/:id/fin', function (p) {
    var s = S.sesion(p.id);
    if (!s) return faltaSesion();
    var m = S.materia(s.materiaId);
    var u = S.unidad(s.materiaId, s.unidad);
    var nuevas = (s.preguntas || []).length;
    var st = S.get();
    var hoyHechas = st.sesiones.filter(function (x) {
      return x.fecha === S.hoyStr() && x.estado === 'hecha';
    }).length;
    var pr = S.progresoMateria(s.materiaId);

    return {
      celebrar: true,
      bar: null,
      body:
        '<div class="celebrate" style="padding-top:28px">' +
          '<div class="cel-ico">' + U.icon('check', 40, 2.6) + '</div>' +
          '<h2 class="h-head">Sesión terminada</h2>' +
          '<p class="p-body" style="max-width:28ch;margin:0 auto">' +
            U.esc(u ? u.titulo : '') + ' · ' + U.mins(s.duracion) + '</p>' +
        '</div>' +

        '<div class="sp-16"></div>' +
        '<div class="stats-row">' +
          '<div><b>' + hoyHechas + '</b><span>sesiones hoy</span></div>' +
          '<div><b>' + nuevas + '</b><span>preguntas nuevas</span></div>' +
          '<div><b>' + st.usuario.racha + '</b><span>días seguidos</span></div>' +
        '</div>' +

        (nuevas
          ? '<div class="section-h"><h3>Vas a volver a verlas</h3></div>' +
            '<div class="card">' +
              '<div class="row" style="margin-bottom:12px">' +
                '<span class="li-ico green">' + U.icon('repeat', 19) + '</span>' +
                '<span class="grow"><b style="font:var(--t-subtitle);display:block">' +
                'Primer repaso: mañana</b>' +
                '<span class="p-small" style="display:block;margin-top:2px">Si te salen bien, ' +
                'el siguiente se aleja; si no, se acerca.</span></span>' +
              '</div>' +
              '<div class="divider" style="margin:10px 0"></div>' +
              (s.preguntas || []).map(function (q) {
                return '<div class="p-small" style="padding:7px 0;color:var(--on-surface)">' +
                  U.icon('help', 14, 2.2) + ' ' + U.esc(q.pregunta) + '</div>';
              }).join('') +
            '</div>'
          : '<div class="note note-amber">' + U.icon('alert', 19) +
            '<div><b>Quedó como leída, no como dominada</b>Sin preguntas propias no hay ' +
            'forma de comprobar si la retenés.</div></div>') +

        '<div class="section-h"><h3>' + U.esc(m ? m.nombre : '') + '</h3></div>' +
        '<div class="card">' +
          '<div class="duo">' +
            '<div class="d-read"><b>' + pr.leidas + '/' + pr.total + '</b><span>temas leídos</span></div>' +
            '<div class="d-master"><b>' + pr.dominadas + '/' + pr.total + '</b><span>temas dominados</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="sp-16"></div>',

      footer:
        '<button class="btn btn-primary btn-block" data-go="/inicio">Volver al inicio</button>' +
        '<button class="btn btn-ghost btn-block btn-sm" data-go="/calendario">' +
          'Ver el resto del plan</button>'
    };
  });
})(window);
