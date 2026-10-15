/* ══════════════════════════════════════════════════════════════
   router.js — navegación por hash y armado de cada pantalla
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI;

  var rutas = [];
  var historial = [];
  var actual = null;
  var montado = null;

  function add(patron, fn) {
    var nombres = [];
    var re = new RegExp('^' + patron.replace(/:([a-zA-Z]+)/g, function (_, n) {
      nombres.push(n); return '([^/]+)';
    }) + '$');
    rutas.push({ re: re, nombres: nombres, fn: fn, patron: patron });
  }

  function resolver(path) {
    for (var i = 0; i < rutas.length; i++) {
      var m = path.match(rutas[i].re);
      if (m) {
        var params = {};
        rutas[i].nombres.forEach(function (n, j) { params[n] = decodeURIComponent(m[j + 1]); });
        return { ruta: rutas[i], params: params };
      }
    }
    return null;
  }

  function path() {
    var h = location.hash.replace(/^#/, '');
    return h || '/inicio';
  }

  function go(to, reemplazar) {
    if (to === path()) { render(); return; }
    if (!reemplazar) historial.push(path());
    location.hash = to;
  }

  function back(fallback) {
    if (historial.length) {
      var prev = historial.pop();
      location.hash = prev;
    } else {
      location.hash = fallback || '/inicio';
    }
  }

  /* ── tabs inferiores ─────────────────────────────────────────── */
  var TABS = [
    { id: 'inicio', to: '/inicio', icono: 'home', texto: 'Inicio' },
    { id: 'calendario', to: '/calendario', icono: 'calendar', texto: 'Calendario' },
    { id: 'quizzes', to: '/quizzes', icono: 'cards', texto: 'Quizzes' },
    { id: 'progreso', to: '/progreso', icono: 'chart', texto: 'Progreso' },
    { id: 'perfil', to: '/perfil', icono: 'user', texto: 'Perfil' }
  ];

  function tabbar(activo) {
    var pend = global.Store.repasosHoy().length;
    return '<nav class="tabbar">' + TABS.map(function (t) {
      var on = t.id === activo;
      var badge = (t.id === 'quizzes' && pend)
        ? '<span class="tab-badge">' + (pend > 9 ? '9+' : pend) + '</span>' : '';
      return '<button class="tab' + (on ? ' on' : '') + '" data-go="' + t.to + '" ' +
        'aria-label="' + t.texto + '"' + (on ? ' aria-current="page"' : '') + '>' +
        badge + '<span class="tab-ico">' + U.icon(t.icono, 22, on ? 2.1 : 1.8) + '</span>' +
        '<span>' + t.texto + '</span></button>';
    }).join('') + '</nav>';
  }

  /* ── barra superior ──────────────────────────────────────────── */
  function appbar(b) {
    if (!b) return '';
    var cls = 'appbar' + (b.variant === 'primary' ? ' on-primary' : '') +
      (b.sep ? ' sep' : '');
    var izq = b.back
      ? '<button class="ab-back" data-back="' + (b.back === true ? '' : b.back) +
        '" aria-label="Volver">' + U.icon('back', 22, 2) + '</button>'
      : (b.logo ? '<div class="ab-logo" style="flex:none">' + U.logo(34) + '</div>' : '');
    var tit = '<div class="ab-titles"><div class="ab-title">' + U.esc(b.titulo || '') + '</div>' +
      (b.sub ? '<div class="ab-sub">' + U.esc(b.sub) + '</div>' : '') + '</div>';
    var acc = (b.acciones || []).map(function (a) {
      if (a.avatar) {
        return '<button class="ab-btn" data-go="/perfil" aria-label="Mi perfil">' +
          '<span class="avatar" style="display:grid;place-items:center;font:var(--t-caption);' +
          'background:var(--primary-fixed);color:var(--primary)">' + U.esc(a.avatar) + '</span></button>';
      }
      return '<button class="ab-btn" ' +
        (a.to ? 'data-go="' + a.to + '"' : 'data-act="' + a.act + '"') +
        ' aria-label="' + U.esc(a.label || '') + '">' + U.icon(a.icono, 21) +
        (a.dot ? '<span class="ab-dot"></span>' : '') + '</button>';
    }).join('');
    return '<header class="' + cls + '">' + izq + tit +
      (acc ? '<div class="ab-actions">' + acc + '</div>' : '') + '</header>';
  }

  /* ── navegación lateral (escritorio) ─────────────────────────── */
  function sidebar(activo) {
    var st = global.Store.get();
    var pend = global.Store.repasosHoy().length;
    var u = st.usuario || {};
    var prox = global.Store.proximaSesion ? global.Store.proximaSesion() : null;
    var hoy = prox && prox.fecha === global.Store.hoyStr();
    var mprox = prox ? global.Store.materia(prox.materiaId) : null;
    var uprox = prox ? global.Store.unidad(prox.materiaId, prox.unidad) : null;
    return '<nav class="side" aria-label="Principal">' +
      '<button class="side-brand" data-go="/inicio">' + U.logo(38) +
        '<span><b>Asesor de Estudio</b><small>tu método, no solo tu agenda</small></span></button>' +
      '<div class="side-nav">' + TABS.map(function (t) {
        var on = t.id === activo;
        var badge = (t.id === 'quizzes' && pend)
          ? '<span class="side-badge">' + (pend > 9 ? '9+' : pend) + '</span>' : '';
        return '<button class="side-item' + (on ? ' on' : '') + '" data-go="' + t.to + '"' +
          (on ? ' aria-current="page"' : '') + '>' +
          U.icon(t.icono, 21, on ? 2.2 : 1.8) + '<span>' + t.texto + '</span>' + badge + '</button>';
      }).join('') + '<span class="side-pill" aria-hidden="true"></span></div>' +
      (prox && uprox && activo !== 'inicio'
        ? '<div class="side-next">' +
            '<span class="sn-when">' + (hoy ? 'Hoy, ' + prox.hora : U.fmtDate(prox.fecha) + ', ' + prox.hora) + '</span>' +
            '<b>' + U.esc(uprox.titulo) + '</b>' +
            '<span class="sn-sub">' + U.esc(mprox ? mprox.corto || mprox.nombre : '') + ' · ' +
              U.esc(global.Store.TECNICAS[prox.tecnica].nombre) + '</span>' +
            '<button class="btn btn-sm btn-block" data-go="/sesion/' + prox.id + (hoy ? '/activa' : '') + '">' +
              U.icon('play', 15, 2.4) + (hoy ? 'Empezar sesión' : 'Ver sesión') + '</button>' +
          '</div>'
        : '') +
      '<button class="side-user" data-go="/perfil">' +
        '<span class="su-av">' + U.esc(u.iniciales || '') + '</span>' +
        '<span class="su-txt"><b>' + U.esc((u.nombre || '') + ' ' + (u.apellido || '')) + '</b>' +
        '<small>' + U.esc(u.carrera || 'Mi perfil') + '</small></span></button>' +
      '</nav>';
  }

  /* ── render ──────────────────────────────────────────────────── */
  function render() {
    var p = path();
    var hit = resolver(p);
    if (!hit) { location.hash = '/inicio'; return; }
    var PUBLICAS = ['/splash', '/acceso', '/login', '/registro', '/terminos'];
    if (!global.Store.get().cuenta.sesion && PUBLICAS.indexOf(p) < 0) {
      location.hash = '/acceso'; return;
    }

    if (montado && montado.onUnmount) { try { montado.onUnmount(); } catch (e) {} }

    var vista;
    try {
      vista = hit.ruta.fn(hit.params) || {};
    } catch (err) {
      console.error('Error al construir la pantalla', p, err);
      vista = {
        bar: { titulo: 'Algo falló', back: true },
        body: '<div class="empty"><div class="em-ico">' + U.icon('alert', 32) + '</div>' +
          '<h3>No pudimos abrir esta pantalla</h3><p>' + U.esc(err.message) + '</p>' +
          '<button class="btn btn-secondary" data-go="/inicio">Volver al inicio</button></div>'
      };
    }

    actual = { path: p, vista: vista };
    var root = document.getElementById('phone-body');
    var cuerpo =
      appbar(vista.bar) +
      '<main class="screen' + (vista.flush ? ' flush' : '') +
        (vista.fab ? ' with-fab' : '') + (vista.ancho ? ' ancho' : '') + '" id="screen">' +
      '<div class="screen-in">' + (vista.body || '') + '</div></main>' +
      (vista.footer ? '<div class="footer-cta"><div class="footer-in">' + vista.footer + '</div></div>' : '') +
      (vista.fab ? vista.fab : '');

    if (vista.tab) {
      /* pantallas principales: navegación lateral en escritorio, barra inferior en el celular */
      root.className = 'layout-shell';
      root.innerHTML = sidebar(vista.tab) +
        '<div class="main">' + cuerpo + tabbar(vista.tab) + '</div>';
    } else {
      /* flujos con foco (cuenta, diagnóstico, sesión, quiz): sin navegación, columna angosta */
      root.className = 'layout-focus' + (vista.split ? ' split' : '');
      root.innerHTML = (vista.split ? '<div class="split-art">' + vista.split + '</div>' : '') +
        '<div class="main">' + cuerpo + '</div>';
    }

    document.getElementById('screen').scrollTop = 0;
    montado = vista;
    if (vista.onMount) {
      try { vista.onMount(document.getElementById('screen')); }
      catch (e) { console.error('onMount', p, e); }
    }
    if (global.Router.onRender) {
      try { global.Router.onRender(p, vista); } catch (e) { console.error('onRender', e); }
    }
    document.title = (vista.bar && vista.bar.titulo ? vista.bar.titulo + ' · ' : '') +
      'Asesor de Estudio';
  }

  function refrescar() { if (actual) render(); }

  global.Router = {
    add: add, go: go, back: back, render: render, refrescar: refrescar,
    path: path, tabbar: tabbar,
    actual: function () { return actual; }
  };
})(window);
