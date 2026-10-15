/* ══════════════════════════════════════════════════════════════
   anim.js — movimiento, gráficos y celebraciones
   GSAP para las transiciones entre pantallas y los números,
   Chart.js para los gráficos y canvas-confetti para los logros.
   Todo respeta «reducir movimiento» del sistema operativo.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var R = global.Router, S = global.Store;
  var gsap = global.gsap;
  var quieto = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ultimaRuta = null;
  var ultimaPill = null;

  /* ── recorrido de la demostración ────────────────────────────── */
  var TOUR = [
    ['Acceso', '/acceso', 'cuenta'],
    ['Registrarse', '/registro', 'cuenta'],
    ['Diagnóstico', '/diag/0', 'onboarding'],
    ['Perfil de estudio', '/diag-resultado', 'onboarding'],
    ['Nueva materia', '/materia-nueva', 'materias'],
    ['Unidades del programa', '/materia/am1/programa', 'materias'],
    ['HOME · Inicio', '/inicio', 'principal'],
    ['Calendario', '/calendario', 'principal'],
    ['Sesión activa', 'sesion-activa', 'estudiar'],
    ['Escribir preguntas', 'sesion-preguntas', 'estudiar'],
    ['Quiz de repaso', '/quiz/am1/3', 'repasar'],
    ['Progreso', '/progreso', 'principal'],
  ];

  function sesionDeHoy() {
    var s = (S.pendientesHoy && S.pendientesHoy()[0]) || S.proximaSesion();
    return s ? s.id : null;
  }
  function destino(t) {
    if (t === 'sesion-activa' || t === 'sesion-preguntas') {
      var id = sesionDeHoy();
      if (!id) return '/calendario';
      return '/sesion/' + id + (t === 'sesion-activa' ? '/activa' : '/preguntas');
    }
    return t;
  }
  function pintarTour() {
    var ol = document.getElementById('tour');
    if (!ol) return;
    var p = R.path();
    ol.innerHTML = TOUR.map(function (t, i) {
      var to = destino(t[1]);
      var on = p === to || (t[1] === 'sesion-activa' && /\/activa$/.test(p)) ||
        (t[1] === 'sesion-preguntas' && /\/preguntas$/.test(p));
      return '<li><button class="' + (on ? 'on' : '') + '" data-tour="' + i + '">' + t[0] +
        '<small>' + t[2] + '</small></button></li>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var fab = e.target.closest('#demo-fab');
    var panel = document.getElementById('demo-panel');
    if (fab) {
      var abierto = !panel.hidden;
      panel.hidden = abierto;
      fab.setAttribute('aria-expanded', String(!abierto));
      if (!abierto) {
        pintarTour();
        if (!quieto) gsap.from(panel, { y: 16, opacity: 0, duration: .28, ease: 'power3.out' });
      }
      return;
    }
    if (e.target.closest('[data-demo-close]')) { panel.hidden = true; return; }
    var t = e.target.closest('[data-tour]');
    if (t) {
      var paso = TOUR[+t.getAttribute('data-tour')];
      var st = S.get();
      /* las pantallas internas necesitan una cuenta abierta */
      if (paso[2] !== 'cuenta' && !st.cuenta.sesion) st.cuenta.sesion = true;
      R.go(destino(paso[1]));
      return;
    }
    if (panel && !panel.hidden && !e.target.closest('#demo-panel') && e.target.closest('[data-act="empezar-vacio"],[data-act="reiniciar-demo"]') === null) {
      /* un clic afuera cierra el panel */
      if (!e.target.closest('.scrim')) panel.hidden = true;
    }
  });

  /* ── números que cuentan hasta su valor ─────────────────────── */
  function contar(root) {
    root.querySelectorAll('[data-count]').forEach(function (el) {
      var fin = parseFloat(el.getAttribute('data-count'));
      if (isNaN(fin)) return;
      var suf = el.getAttribute('data-suf') || '';
      var o = { v: 0 };
      gsap.to(o, { v: fin, duration: 1.1, ease: 'power2.out', onUpdate: function () {
        el.textContent = Math.round(o.v) + suf;
      } });
    });
  }

  /* ── la píldora del menú lateral se desliza hasta el destino ── */
  function moverPill() {
    var nav = document.querySelector('.side-nav');
    if (!nav) { ultimaPill = null; return; }
    var pill = nav.querySelector('.side-pill');
    var on = nav.querySelector('.side-item.on');
    if (!pill || !on) { if (pill) pill.style.opacity = 0; return; }
    var y = on.offsetTop, h = on.offsetHeight;
    pill.style.height = h + 'px';
    if (ultimaPill === null || quieto) {
      gsap.set(pill, { y: y, opacity: 1 });
    } else {
      gsap.fromTo(pill, { y: ultimaPill }, { y: y, opacity: 1, duration: .42, ease: 'power3.out' });
    }
    ultimaPill = y;
  }

  /* ── confetti para los logros ────────────────────────────────── */
  function festejar() {
    if (quieto || !global.confetti) return;
    var colores = ['#0037b0', '#2450d6', '#ffe14a', '#057a4e', '#a8ebc8', '#ffffff'];
    global.confetti({ particleCount: 90, spread: 75, startVelocity: 42, origin: { x: 0.5, y: 0.35 }, colors: colores, scalar: .95, disableForReducedMotion: true });
    setTimeout(function () {
      global.confetti({ particleCount: 45, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: colores, disableForReducedMotion: true });
      global.confetti({ particleCount: 45, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: colores, disableForReducedMotion: true });
    }, 220);
  }

  /* ── gráficos ────────────────────────────────────────────────── */
  var graficos = [];
  function limpiarGraficos() {
    graficos.forEach(function (g) { try { g.destroy(); } catch (e) {} });
    graficos = [];
  }
  function grafico(canvas, cfg) {
    if (!global.Chart || !canvas) return null;
    var css = getComputedStyle(document.documentElement);
    global.Chart.defaults.font.family = css.getPropertyValue('--font').trim() || 'Manrope';
    global.Chart.defaults.font.weight = 600;
    global.Chart.defaults.color = '#767c97';
    if (quieto) { cfg.options = cfg.options || {}; cfg.options.animation = false; }
    graficos = graficos.filter(function (g) {
      if (document.body.contains(g.canvas)) return true;
      try { g.destroy(); } catch (e) {} return false;
    });
    var g = new global.Chart(canvas, cfg);
    graficos.push(g);
    return g;
  }

  /* ── después de dibujar cada pantalla ───────────────────────── */
  R.onRender = function (p, vista) {
    var root = document.getElementById('phone-body');
    var nueva = p !== ultimaRuta;
    document.body.setAttribute('data-layout', vista && vista.tab ? 'shell' : 'focus');
    ultimaRuta = p;
    moverPill();
    if (!document.getElementById('demo-panel').hidden) pintarTour();
    if (!gsap || quieto || !nueva) return;

    var hijos = root.querySelectorAll('.screen-in > *, .home-col > *');
    var lista = Array.prototype.filter.call(hijos, function (el) {
      return !el.classList.contains('home-grid') && el.offsetParent !== null;
    }).slice(0, 14);
    gsap.fromTo(lista, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .045, ease: 'power3.out', clearProps: 'transform,opacity' });

    var appbar = root.querySelector('.appbar');
    if (appbar) gsap.fromTo(appbar, { opacity: 0 }, { opacity: 1, duration: .35, ease: 'power1.out', clearProps: 'opacity' });

    /* barras de progreso que se llenan */
    root.querySelectorAll('.bar i, .bar-stack i').forEach(function (b) {
      var w = b.style.width;
      if (!w || w === '0%') return;
      gsap.fromTo(b, { width: 0 }, { width: w, duration: .9, delay: .2, ease: 'power3.out' });
    });
    /* anillos que se completan (salvo el cronómetro, que se mueve solo) */
    if (!/\/activa$/.test(p)) {
      root.querySelectorAll('.ring circle:nth-child(2)').forEach(function (c) {
        var fin = parseFloat(c.getAttribute('stroke-dashoffset'));
        var tot = parseFloat(c.getAttribute('stroke-dasharray'));
        if (isNaN(fin) || isNaN(tot)) return;
        gsap.fromTo(c, { attr: { 'stroke-dashoffset': tot } }, { attr: { 'stroke-dashoffset': fin }, duration: 1.1, delay: .15, ease: 'power3.out' });
      });
    }
    contar(root);

    /* las bandas del héroe y del splash entran con un poco más de presencia */
    var hero = root.querySelector('.hero');
    if (hero) gsap.fromTo(hero, { scale: .97 }, { scale: 1, duration: .6, ease: 'back.out(1.6)', clearProps: 'transform' });

    if (vista && vista.celebrar) setTimeout(festejar, 260);
  };

  /* al dejar una pantalla se destruyen sus gráficos */
  global.addEventListener('hashchange', limpiarGraficos, true);

  global.Anim = { festejar: festejar, grafico: grafico, quieto: quieto };
})(window);
