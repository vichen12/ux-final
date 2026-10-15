/* ══════════════════════════════════════════════════════════════
   Materias: alta, carga del programa y generación del plan
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App, P = global.Planner;

  var COLORES = ['primary', 'green', 'amber', 'red', 'grey'];
  var DIF = {
    facil: { t: 'Fácil', c: 'chip-green' },
    media: { t: 'Media', c: 'chip-amber' },
    dificil: { t: 'Difícil', c: 'chip-red' }
  };

  /* borrador de alta de materia */
  var nueva = null;

  function colorVar(c) {
    return { primary: 'var(--primary)', green: 'var(--secondary)', amber: 'var(--tertiary-c)',
      red: 'var(--error)', grey: 'var(--outline)' }[c] || 'var(--primary)';
  }

  /* ── /materias ───────────────────────────────────────────────── */
  R.add('/materias', function () {
    var ms = S.get().materias;
    return {
      bar: { titulo: 'Mis materias', back: '/perfil',
        acciones: [{ icono: 'plus', to: '/materia-nueva', label: 'Agregar materia' }] },
      tab: 'perfil',
      body: !ms.length
        ? '<div class="empty"><div class="em-ico">' + U.icon('book', 32) + '</div>' +
          '<h3>Todavía no cargaste materias</h3>' +
          '<p>Cargá una materia con sus unidades y la fecha del parcial, y te armamos el plan.</p>' +
          '<button class="btn btn-primary" data-go="/materia-nueva">' +
          U.icon('plus', 18, 2.2) + 'Agregar materia</button></div>'
        : '<div class="stack">' + ms.map(function (m) {
            var pr = S.progresoMateria(m.id);
            var dias = U.daysBetween(S.hoy(), U.parseYmd(m.parcial));
            return '<button class="card bar-left ' + m.color + '" style="width:100%;text-align:left"' +
              ' data-go="/materia/' + m.id + '">' +
              '<div class="row-between" style="margin-bottom:10px">' +
                '<div class="grow"><div class="card-title">' + U.esc(m.nombre) + '</div>' +
                '<div class="card-sub">' + m.unidades.length + ' unidades · ' +
                U.esc(m.docente) + '</div></div>' +
                '<span class="badge ' + (dias <= 7 ? 'badge-red' : dias <= 21 ? 'badge-amber' : 'badge-grey') +
                '">' + (dias < 0 ? 'parcial pasado' : dias + ' días') + '</span>' +
              '</div>' +
              '<div class="bar-stack" style="margin-bottom:7px">' +
                '<i class="master" style="width:' + pr.pctDom + '%"></i>' +
                '<i class="read" style="width:' + Math.max(0, pr.pct - pr.pctDom) + '%"></i>' +
              '</div>' +
              '<div class="p-small"><b>' + pr.dominadas + '</b> dominadas · ' +
              '<b>' + (pr.leidas - pr.dominadas) + '</b> leídas sin probar · ' +
              (pr.total - pr.leidas) + ' pendientes</div>' +
              '</button>';
          }).join('') + '</div>' +
          '<div class="sp-16"></div>' +
          '<button class="btn btn-outline btn-block" data-go="/materia-nueva">' +
          U.icon('plus', 18, 2.2) + 'Agregar otra materia</button>' +
          '<div class="sp-16"></div>'
    };
  });

  /* ── /materia-nueva ──────────────────────────────────────────── */
  R.add('/materia-nueva', function () {
    if (!nueva) {
      nueva = {
        nombre: '', docente: '', color: COLORES[S.get().materias.length % COLORES.length],
        parcial: U.ymd(U.addDays(S.hoy(), 21)), unidades: []
      };
    }
    return {
      bar: { titulo: 'Nueva materia', back: S.get().materias.length ? '/materias' : '/inicio' },
      body:
        '<p class="p-body" style="margin-bottom:18px">Con estos datos calculamos cuánto ' +
        'tiempo real tenés por unidad.</p>' +
        '<label class="field"><span>Nombre de la materia</span>' +
          '<input id="f-nombre" type="text" placeholder="Análisis Matemático I" ' +
          'value="' + U.esc(nueva.nombre) + '" autocomplete="off"></label>' +
        '<label class="field"><span>Docente <em class="muted">(opcional)</em></span>' +
          '<input id="f-docente" type="text" placeholder="Ing. Pérez" ' +
          'value="' + U.esc(nueva.docente) + '" autocomplete="off"></label>' +
        '<label class="field"><span>Fecha del próximo parcial</span>' +
          '<input id="f-parcial" type="date" value="' + nueva.parcial + '" ' +
          'min="' + S.hoyStr() + '">' +
          '<span class="help" id="f-dias"></span></label>' +
        '<div class="field"><span>Color</span><div class="chip-row">' +
          COLORES.map(function (c) {
            return '<button class="chip' + (nueva.color === c ? ' chip-primary' : ' chip-outline') +
              '" data-act="mat-color" data-c="' + c + '">' +
              '<i style="width:12px;height:12px;border-radius:50%;background:' + colorVar(c) +
              ';display:block"></i>' + ({ primary: 'Azul', green: 'Verde', amber: 'Ámbar',
                red: 'Rojo', grey: 'Gris' }[c]) + '</button>';
          }).join('') + '</div></div>' +
        '<div class="sp-8"></div>',
      footer:
        '<button class="btn btn-primary btn-block" data-act="mat-seguir">' +
        'Cargar las unidades' + U.icon('arrow', 18, 2.2) + '</button>',
      onMount: function (root) {
        var nom = root.querySelector('#f-nombre');
        var doc = root.querySelector('#f-docente');
        var par = root.querySelector('#f-parcial');
        var dias = root.querySelector('#f-dias');

        function refrescarDias() {
          var n = U.daysBetween(S.hoy(), U.parseYmd(par.value));
          dias.textContent = isNaN(n) ? '' :
            n <= 0 ? 'La fecha ya pasó' :
            U.fmtDate(par.value, true).replace(/^./, function (c) { return c.toUpperCase(); }) +
            ' · faltan ' + n + ' días. ' + (n < 10 ? 'Es poco: vamos a apretar el plan.' :
              'Tiempo suficiente para repartir el programa.');
        }
        refrescarDias();
        par.addEventListener('change', function () { nueva.parcial = par.value; refrescarDias(); });
        nom.addEventListener('input', function () { nueva.nombre = nom.value; });
        doc.addEventListener('input', function () { nueva.docente = doc.value; });

        A.accion('mat-color', function (el) {
          nueva.color = el.getAttribute('data-c');
          nueva.nombre = nom.value; nueva.docente = doc.value; nueva.parcial = par.value;
          R.render();
        });
        A.accion('mat-seguir', function () {
          nueva.nombre = nom.value.trim();
          nueva.docente = doc.value.trim();
          nueva.parcial = par.value;
          if (!nueva.nombre) {
            nom.closest('.field').classList.add('err');
            A.toast('Poné el nombre de la materia', { icono: 'alert' });
            nom.focus();
            return;
          }
          if (U.daysBetween(S.hoy(), U.parseYmd(nueva.parcial)) <= 0) {
            A.toast('El parcial tiene que ser una fecha futura', { icono: 'alert' });
            return;
          }
          if (!nueva.unidades.length) {
            nueva.unidades = [{ n: 1, titulo: '', dif: 'media' }];
          }
          R.go('/programa-nuevo');
        });
      }
    };
  });

  /* ── /programa-nuevo — unidades de la materia que se está creando ── */
  R.add('/programa-nuevo', function () {
    if (!nueva) { R.go('/materia-nueva'); return {}; }
    return programaVista({
      titulo: nueva.nombre || 'Nueva materia',
      unidades: nueva.unidades,
      volver: '/materia-nueva',
      ctaTexto: 'Generar mi plan de estudio',
      onGuardar: function () {
        var limpias = nueva.unidades.filter(function (u) { return u.titulo.trim(); });
        if (!limpias.length) {
          A.toast('Cargá al menos una unidad', { icono: 'alert' });
          return;
        }
        limpias.forEach(function (u, i) {
          u.n = i + 1; u.titulo = u.titulo.trim(); u.estado = 'pendiente'; u.nota = null;
        });
        var id = (nueva.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 6) || 'mat') +
          Date.now().toString(36).slice(-3);
        var m = {
          id: id, nombre: nueva.nombre, corto: nueva.nombre.split(' ')[0],
          color: nueva.color, docente: nueva.docente || 'Sin docente',
          parcial: nueva.parcial, tema: limpias[0].titulo, unidades: limpias
        };
        S.get().materias.push(m);
        nueva = null;
        R.go('/plan/' + id);
      }
    });
  });

  /* ── /materia/:id/programa — editar unidades de una existente ── */
  R.add('/materia/:id/programa', function (p) {
    var m = S.materia(p.id);
    if (!m) return { bar: { titulo: 'Materia', back: '/materias' },
      body: global.noEncontrado('Esa materia no existe.') };
    var copia = m.unidades.map(function (u) {
      return { n: u.n, titulo: u.titulo, dif: u.dif, estado: u.estado, nota: u.nota };
    });
    return programaVista({
      titulo: m.nombre,
      unidades: copia,
      volver: '/materia/' + m.id,
      ctaTexto: 'Guardar cambios',
      onGuardar: function () {
        var limpias = copia.filter(function (u) { return u.titulo.trim(); });
        if (!limpias.length) { A.toast('Dejá al menos una unidad', { icono: 'alert' }); return; }
        limpias.forEach(function (u, i) { u.n = i + 1; u.titulo = u.titulo.trim(); });
        m.unidades = limpias;
        S.emit();
        A.toast('Programa actualizado');
        R.go('/materia/' + m.id);
      }
    });
  });

  /* vista compartida de carga de unidades */
  function programaVista(cfg) {
    var lista = cfg.unidades;
    return {
      bar: { titulo: 'Unidades del programa', sub: cfg.titulo, back: cfg.volver },
      body:
        '<p class="p-body" style="margin-bottom:16px">Cargá las unidades y marcá qué tan ' +
        'difícil te resulta cada una. A las difíciles les damos más pasadas y más tiempo.</p>' +
        '<div class="stack-sm" id="unidades">' +
          lista.map(function (u, i) { return filaUnidad(u, i, lista.length); }).join('') +
        '</div>' +
        '<div class="sp-16"></div>' +
        '<div class="note note-grey">' + U.icon('bulb', 19) +
          '<div>Una unidad difícil se ve hasta 4 veces: leerla, recuperarla de memoria, ' +
          'ejercitarla y mezclarla con las demás.</div></div>' +
        '<div class="sp-16"></div>',
      footer:
        '<button class="btn btn-outline btn-block btn-sm" data-act="uni-agregar" style="margin-bottom:10px">' +
          U.icon('plus', 16, 2.2) + 'Agregar unidad</button>' +
        '<button class="btn btn-primary btn-block" data-act="uni-guardar">' +
        U.esc(cfg.ctaTexto) + U.icon('arrow', 18, 2.2) + '</button>' +
        '<div class="hint"><span id="uni-count">' + lista.length + '</span> unidades cargadas</div>',
      onMount: function (root) {
        function sincronizar() {
          root.querySelectorAll('[data-uni]').forEach(function (inp) {
            var i = +inp.getAttribute('data-uni');
            if (lista[i]) lista[i].titulo = inp.value;
          });
        }
        root.addEventListener('input', function (e) {
          if (e.target.matches('[data-uni]')) {
            var i = +e.target.getAttribute('data-uni');
            if (lista[i]) lista[i].titulo = e.target.value;
          }
        });
        A.accion('uni-dif', function (el) {
          sincronizar();
          var i = +el.getAttribute('data-i');
          lista[i].dif = el.getAttribute('data-d');
          R.render();
        });
        A.accion('uni-quitar', function (el) {
          sincronizar();
          lista.splice(+el.getAttribute('data-i'), 1);
          if (!lista.length) lista.push({ n: 1, titulo: '', dif: 'media' });
          R.render();
        });
        A.accion('uni-agregar', function () {
          sincronizar();
          lista.push({ n: lista.length + 1, titulo: '', dif: 'media' });
          R.render();
          var inputs = document.querySelectorAll('[data-uni]');
          if (inputs.length) { var ult = inputs[inputs.length - 1]; ult.focus(); ult.scrollIntoView({ block: 'center' }); }
        });
        A.accion('uni-guardar', function () { sincronizar(); cfg.onGuardar(); });
      }
    };
  }

  function filaUnidad(u, i, total) {
    return '<div class="card" style="padding:13px 14px">' +
      '<div class="row" style="margin-bottom:9px">' +
        '<span class="unit-n" style="flex:none">' + (i + 1) + '</span>' +
        '<input class="grow" data-uni="' + i + '" type="text" ' +
        'placeholder="Nombre de la unidad" value="' + U.esc(u.titulo) + '" ' +
        'style="min-height:38px;padding:8px 11px;border-radius:9px;border:1.5px solid ' +
        'var(--outline-var);background:var(--surface-low);font:var(--t-body)" autocomplete="off">' +
        (total > 1 ? '<button class="ab-btn" data-act="uni-quitar" data-i="' + i + '" ' +
          'aria-label="Quitar unidad" style="flex:none;width:34px;height:34px;color:var(--outline)">' +
          U.icon('trash', 17) + '</button>' : '') +
      '</div>' +
      '<div class="chip-row" style="padding-left:39px">' +
        Object.keys(DIF).map(function (d) {
          var on = u.dif === d;
          return '<button class="chip' + (on ? ' ' + DIF[d].c : ' chip-outline') +
            '" data-act="uni-dif" data-i="' + i + '" data-d="' + d + '">' +
            (on ? U.icon('check', 13, 3) : '') + DIF[d].t + '</button>';
        }).join('') +
      '</div></div>';
  }

  /* ── /plan/:id — generación del plan ─────────────────────────── */
  R.add('/plan/:id', function (p) {
    var m = S.materia(p.id);
    if (!m) return { bar: { titulo: 'Plan', back: '/materias' },
      body: global.noEncontrado('Esa materia no existe.') };

    var pasos = [
      'Leyendo las ' + m.unidades.length + ' unidades del programa',
      'Calculando el ritmo hasta el ' + U.fmtDay(m.parcial),
      'Asignando una técnica a cada sesión',
      'Reservando los repasos antes del parcial'
    ];

    return {
      bar: null,
      body:
        '<div class="gen" id="gen">' +
          '<div class="gen-ring"></div>' +
          '<h2 class="h-title">Armando tu plan</h2>' +
          '<p class="p-small" style="max-width:26ch">' + U.esc(m.nombre) + '</p>' +
          '<div class="gen-steps">' +
            pasos.map(function (t, i) {
              return '<div class="gen-step" data-gs="' + i + '">' +
                '<span class="gs-ico">' + U.icon('check', 13, 3) + '</span>' +
                '<span>' + U.esc(t) + '</span></div>';
            }).join('') +
          '</div>' +
        '</div>',
      onMount: function (root) {
        var i = 0;
        var t = setInterval(function () {
          var el = root.querySelector('[data-gs="' + i + '"]');
          if (el) el.classList.add('on');
          i++;
          if (i > pasos.length) {
            clearInterval(t);
            R.go('/plan-listo/' + m.id, true);
          }
        }, 520);
        this.onUnmount = function () { clearInterval(t); };
      }
    };
  });

  /* ── /plan-listo/:id — resumen antes de confirmar ────────────── */
  R.add('/plan-listo/:id', function (p) {
    var m = S.materia(p.id);
    if (!m) return { bar: { titulo: 'Plan', back: '/materias' },
      body: global.noEncontrado('Esa materia no existe.') };

    var sesiones = P.generarPlan(m, S.get().diagnostico);
    var res = P.resumirPlan(sesiones, m);
    var porTec = Object.keys(res.porTecnica).map(function (k) {
      return { t: S.TECNICAS[k], n: res.porTecnica[k] };
    }).sort(function (a, b) { return b.n - a.n; });

    return {
      bar: { titulo: 'Tu plan está listo', back: '/materias' },
      body:
        '<div class="card bar-left ' + m.color + '" style="margin-bottom:14px">' +
          '<div class="card-title">' + U.esc(m.nombre) + '</div>' +
          '<div class="card-sub">Parcial el ' + U.fmtDate(m.parcial, true) +
          ' · faltan ' + res.hastaParcial + ' días</div>' +
        '</div>' +

        '<div class="stats-row" style="margin-bottom:16px">' +
          '<div><b>' + res.sesiones + '</b><span>sesiones</span></div>' +
          '<div><b>' + Math.round(res.minutos / 60) + ' h</b><span>en total</span></div>' +
          '<div><b>' + U.mins(res.porDia) + '</b><span>por día</span></div>' +
        '</div>' +

        '<div class="note note-info" style="margin-bottom:18px">' + U.icon('brain', 19) +
          '<div><b>Cada sesión viene con su técnica</b>No es una agenda: te decimos qué ' +
          'hacer con el material en cada bloque.</div></div>' +

        '<div class="section-h"><h3>Cómo se reparte</h3></div>' +
        '<div class="stack-sm">' +
          porTec.map(function (x) {
            var pct = Math.round(x.n / res.sesiones * 100);
            return '<div class="card" style="padding:13px 14px">' +
              '<div class="row-between" style="margin-bottom:8px">' +
              '<span class="row" style="gap:9px"><span class="li-ico" style="width:32px;' +
              'height:32px">' + U.icon(x.t.icono, 17) + '</span>' +
              '<b style="font:var(--t-subtitle)">' + U.esc(x.t.nombre) + '</b></span>' +
              '<span class="p-small tnum">' + x.n + '</span></div>' +
              '<div class="bar bar-sm"><i style="width:' + pct + '%"></i></div></div>';
          }).join('') +
        '</div>' +

        '<div class="section-h"><h3>Las primeras sesiones</h3></div>' +
        '<div class="stack-sm">' +
          sesiones.slice(0, 4).map(function (s) {
            var u = S.unidad(m.id, s.unidad);
            var t = S.TECNICAS[s.tecnica];
            return '<div class="session"><span class="s-time">' + s.hora + '</span>' +
              '<span class="s-body"><span class="s-title">' +
              U.esc(u ? u.titulo : 'Unidad ' + s.unidad) + '</span>' +
              '<span class="s-sub">' + U.fmtDate(s.fecha) + ' · ' + U.mins(s.duracion) +
              ' · ' + U.esc(t.nombre) + '</span></span></div>';
          }).join('') +
        '</div>' +
        '<div class="sp-16"></div>',
      footer:
        '<button class="btn btn-primary btn-block" data-act="plan-confirmar" ' +
          'data-id="' + m.id + '">Agregar al calendario</button>' +
        '<button class="btn btn-ghost btn-block btn-sm" data-act="plan-rehacer" ' +
          'data-id="' + m.id + '">' + U.icon('refresh', 16, 2.2) + 'Generar otra distribución</button>',
      onMount: function () {
        A.accion('plan-confirmar', function (el) {
          var id = el.getAttribute('data-id');
          var mm = S.materia(id);
          var st = S.get();
          /* saco un plan previo de esta materia que siga pendiente */
          st.sesiones = st.sesiones.filter(function (s) {
            return !(s.materiaId === id && s.estado === 'pendiente');
          });
          P.generarPlan(mm, st.diagnostico).forEach(function (s) { st.sesiones.push(s); });
          S.emit();
          A.toast('Plan agregado al calendario');
          R.go('/materia/' + id);
        });
        A.accion('plan-rehacer', function () { R.render(); });
      }
    };
  });

  /* ── /materia/:id — detalle ──────────────────────────────────── */
  R.add('/materia/:id', function (p) {
    var m = S.materia(p.id);
    if (!m) return { bar: { titulo: 'Materia', back: '/materias' },
      body: global.noEncontrado('Esa materia no existe.') };

    var pr = S.progresoMateria(m.id);
    var dias = U.daysBetween(S.hoy(), U.parseYmd(m.parcial));
    var prox = S.get().sesiones.filter(function (s) {
      return s.materiaId === m.id && s.estado === 'pendiente' && s.fecha >= S.hoyStr();
    }).sort(function (a, b) {
      return a.fecha === b.fecha ? (a.hora < b.hora ? -1 : 1) : (a.fecha < b.fecha ? -1 : 1);
    });

    return {
      bar: {
        titulo: m.corto || m.nombre, sub: m.docente, back: '/materias',
        acciones: [{ icono: 'edit', to: '/materia/' + m.id + '/programa', label: 'Editar programa' }]
      },
      tab: 'perfil',
      body:
        '<div class="card bar-left ' + m.color + '">' +
          '<div class="row-between" style="margin-bottom:12px">' +
            '<div class="grow"><div class="card-title">' + U.esc(m.nombre) + '</div>' +
            '<div class="card-sub">Parcial el ' + U.fmtDate(m.parcial, true) + '</div></div>' +
            U.ring(Math.max(0, Math.min(100, Math.round((1 - dias / 45) * 100))), 52, 6,
              dias <= 7 ? 'var(--error)' : 'var(--primary)',
              '<b class="tnum" style="font:800 15px/1 var(--font)">' + Math.max(0, dias) + '</b>' +
              '<span style="font:var(--t-micro);color:var(--on-surface-var)">días</span>') +
          '</div>' +
          '<div class="duo">' +
            '<div class="d-read"><b>' + pr.leidas + '/' + pr.total + '</b><span>temas leídos</span></div>' +
            '<div class="d-master"><b>' + pr.dominadas + '/' + pr.total + '</b><span>temas dominados</span></div>' +
          '</div>' +
        '</div>' +

        (pr.leidas > pr.dominadas
          ? '<div class="note note-amber" style="margin-top:12px">' + U.icon('alert', 19) +
            '<div><b>' + (pr.leidas - pr.dominadas) + ' unidades leídas sin probar</b>' +
            'Las viste, pero todavía no comprobaste si las retenés.</div></div>'
          : '') +

        '<div class="section-h"><h3>Unidades</h3>' +
          '<button data-go="/materia/' + m.id + '/programa">Editar</button></div>' +
        '<div class="card">' +
          m.unidades.map(function (u) {
            return filaUnidadEstado(m, u);
          }).join('') +
        '</div>' +

        '<div class="section-h"><h3>Próximas sesiones</h3>' +
          (prox.length ? '<button data-go="/calendario">Ver calendario</button>' : '') + '</div>' +
        (prox.length
          ? '<div class="stack-sm">' + prox.slice(0, 4).map(function (s) {
              return sesionFila(s, m);
            }).join('') + '</div>'
          : '<div class="card-flat"><div class="p-small">No hay sesiones programadas. ' +
            'Generá un plan para esta materia.</div>' +
            '<div class="sp-12"></div>' +
            '<button class="btn btn-secondary btn-sm btn-block" data-go="/plan/' + m.id + '">' +
            'Generar plan</button></div>') +
        '<div class="sp-16"></div>' +
        '<button class="btn btn-outline btn-block btn-sm" data-go="/plan/' + m.id + '">' +
          U.icon('refresh', 16, 2.2) + 'Rehacer el plan de esta materia</button>' +
        '<div class="sp-16"></div>'
    };
  });

  function filaUnidadEstado(m, u) {
    var est = u.estado === 'dominada'
      ? { c: 'master', b: 'badge-green', t: 'Dominada', i: 'check' }
      : u.estado === 'leida'
        ? { c: 'read', b: 'badge-amber', t: 'Sin probar', i: 'eye' }
        : { c: '', b: 'badge-grey', t: 'Pendiente', i: 'clock' };
    return '<button class="unit" style="width:100%;text-align:left" ' +
      'data-go="/unidad/' + m.id + '/' + u.n + '">' +
      '<span class="unit-n ' + est.c + '">' + u.n + '</span>' +
      '<span class="unit-text"><span class="unit-title">' + U.esc(u.titulo) + '</span>' +
      '<span class="unit-sub">' + DIF[u.dif].t +
      (u.nota != null ? ' · último quiz ' + u.nota + '%' : '') + '</span></span>' +
      '<span class="badge ' + est.b + '">' + U.icon(est.i, 12, 2.4) + est.t + '</span></button>';
  }

  function sesionFila(s, m) {
    var u = S.unidad(s.materiaId, s.unidad);
    var t = S.TECNICAS[s.tecnica];
    return '<button class="session" data-go="/sesion/' + s.id + '">' +
      '<span class="s-time">' + s.hora + '</span>' +
      '<span class="s-body"><span class="s-title">' +
      U.esc(u ? u.titulo : 'Unidad ' + s.unidad) + '</span>' +
      '<span class="s-sub">' + U.fmtDate(s.fecha) + ' · ' + U.mins(s.duracion) + ' · ' +
      U.esc(t.nombre) + '</span></span>' +
      '<span class="li-end">' + U.icon('next', 18) + '</span></button>';
  }

  global.MateriaUI = { filaUnidadEstado: filaUnidadEstado, sesionFila: sesionFila, DIF: DIF,
    colorVar: colorVar };
})(window);
