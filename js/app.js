/* ══════════════════════════════════════════════════════════════
   app.js — shell, capas superpuestas y arranque
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router;

  var acciones = {};   // acciones globales por nombre
  var overlayTimer = null;

  function phone() { return document.getElementById('phone'); }

  /* ── aviso efímero ───────────────────────────────────────────── */
  function toast(msg, opts) {
    opts = opts || {};
    var viejo = document.getElementById('toast');
    if (viejo) viejo.remove();
    clearTimeout(overlayTimer);
    var el = document.createElement('div');
    el.className = 'toast';
    el.id = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = U.icon(opts.icono || 'check', 18, 2.3) +
      '<span class="grow">' + U.esc(msg) + '</span>' +
      (opts.accion ? '<button class="t-action" data-act="' + opts.accion.act + '">' +
        U.esc(opts.accion.texto) + '</button>' : '');
    phone().appendChild(el);
    overlayTimer = setTimeout(function () {
      if (el.parentNode) el.remove();
    }, opts.ms || 2800);
  }

  /* ── hoja inferior ───────────────────────────────────────────── */
  function sheet(html, onMount) {
    cerrarOverlay();
    var sc = document.createElement('div');
    sc.className = 'scrim';
    sc.id = 'overlay';
    sc.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' +
      '<div class="sheet-grab"></div>' + html + '</div>';
    sc.addEventListener('click', function (e) {
      if (e.target === sc) cerrarOverlay();
    });
    phone().appendChild(sc);
    if (onMount) onMount(sc);
    return sc;
  }

  /* ── diálogo centrado ────────────────────────────────────────── */
  function dialog(o) {
    cerrarOverlay();
    var sc = document.createElement('div');
    sc.className = 'scrim center';
    sc.id = 'overlay';
    sc.innerHTML = '<div class="dialog" role="dialog" aria-modal="true">' +
      '<h3>' + U.esc(o.titulo) + '</h3>' +
      '<p>' + (o.html || U.esc(o.texto || '')) + '</p>' +
      '<div class="btn-row">' +
      '<button class="btn btn-outline btn-sm" data-cerrar>' + U.esc(o.cancelar || 'Cancelar') + '</button>' +
      '<button class="btn ' + (o.peligro ? 'btn-danger' : 'btn-primary') + ' btn-sm" id="dlg-ok">' +
      U.esc(o.aceptar || 'Aceptar') + '</button></div></div>';
    sc.addEventListener('click', function (e) { if (e.target === sc) cerrarOverlay(); });
    phone().appendChild(sc);
    sc.querySelector('#dlg-ok').addEventListener('click', function () {
      cerrarOverlay();
      if (o.onOk) o.onOk();
    });
    return sc;
  }

  function cerrarOverlay() {
    var o = document.getElementById('overlay');
    if (o) o.remove();
  }

  /* ── delegación de eventos ───────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var cerrar = e.target.closest('[data-cerrar]');
    if (cerrar) { cerrarOverlay(); return; }

    var go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      cerrarOverlay();
      R.go(go.getAttribute('data-go'));
      return;
    }
    var bk = e.target.closest('[data-back]');
    if (bk) {
      e.preventDefault();
      cerrarOverlay();
      var fb = bk.getAttribute('data-back');
      R.back(fb || '/inicio');
      return;
    }
    var act = e.target.closest('[data-act]');
    if (act) {
      var nombre = act.getAttribute('data-act');
      if (acciones[nombre]) {
        e.preventDefault();
        acciones[nombre](act, e);
      }
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarOverlay();
  });

  /* ── acciones globales ───────────────────────────────────────── */
  acciones['reiniciar-demo'] = function () {
    dialog({
      titulo: 'Reiniciar la demostración',
      texto: 'Vuelve a los datos de prueba iniciales: el plan, las sesiones hechas y las ' +
        'preguntas guardadas se restauran como al abrir la app.',
      aceptar: 'Reiniciar',
      onOk: function () {
        S.reset();
        R.go('/inicio');
        R.refrescar();
        toast('Demostración reiniciada');
      }
    });
  };

  acciones['empezar-vacio'] = function () {
    dialog({
      titulo: 'Empezar de cero',
      texto: 'Borra las materias y el plan de prueba para recorrer la app como un ' +
        'estudiante nuevo, desde el diagnóstico inicial.',
      aceptar: 'Empezar',
      onOk: function () {
        S.vaciar();
        R.go('/splash');
        R.refrescar();
      }
    });
  };

  acciones['cerrar-overlay'] = cerrarOverlay;

  acciones['no-implementado'] = function (el) {
    toast(el.getAttribute('data-msg') || 'Esto no forma parte de la maqueta', { icono: 'help' });
  };

  /* ── reloj de la barra de estado ─────────────────────────────── */
  function reloj() {
    var el = document.getElementById('sb-time');
    if (!el) return;
    var d = new Date();
    el.textContent = d.getHours() + ':' + U.pad(d.getMinutes());
  }

  /* ── arranque ────────────────────────────────────────────────── */
  function iniciar() {
    window.addEventListener('hashchange', R.render);
    S.on(function () { /* el estado cambió; las pantallas piden refresco al navegar */ });
    reloj();
    setInterval(reloj, 20000);
    R.render();
  }

  global.App = {
    toast: toast, sheet: sheet, dialog: dialog, cerrarOverlay: cerrarOverlay,
    acciones: acciones, iniciar: iniciar,
    /* registra una acción puntual de pantalla */
    accion: function (nombre, fn) { acciones[nombre] = fn; }
  };
})(window);
