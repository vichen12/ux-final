/* ══════════════════════════════════════════════════════════════
   Cuenta — inicio del happy path: splash, bienvenida, inicio de
   sesión, registro y términos. Todo simulado: no hay servidor.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store, R = global.Router, A = global.App;

  var registro = { nombre: '', apellido: '', email: '', clave: '', acepta: false };

  /* ── /splash ─────────────────────────────────────────────────── */
  R.add('/splash', function () {
    return {
      bar: null,
      body:
        '<div style="height:100%;display:grid;place-items:center;text-align:center;' +
        'background:var(--primary);padding:24px">' +
          '<div>' +
            '<div style="width:96px;height:96px;margin:0 auto 22px;border-radius:28px;' +
            'background:rgba(255,255,255,.14);display:grid;place-items:center">' +
            U.logo(72, '') + '</div>' +
            '<div style="font:800 28px/1.1 var(--font);color:#fff;letter-spacing:-.02em">' +
            'Asesor de Estudio</div>' +
            '<div style="font:var(--t-body);color:var(--on-primary-c);margin-top:8px">' +
            'Tu método, no solo tu agenda</div>' +
            '<div style="width:120px;height:4px;border-radius:4px;background:rgba(255,255,255,.2);' +
            'margin:34px auto 0;overflow:hidden"><i id="sp-bar" style="display:block;height:100%;' +
            'width:8%;background:#fff;border-radius:4px;transition:width 1.2s ease"></i></div>' +
          '</div>' +
        '</div>',
      onMount: function (root) {
        root.style.padding = '0';
        root.style.overflow = 'hidden';
        document.getElementById('phone').classList.add('azul');
        var bar = document.getElementById('sp-bar');
        requestAnimationFrame(function () { if (bar) bar.style.width = '100%'; });
        var t = setTimeout(function () {
          R.go(S.get().cuenta.sesion ? '/inicio' : '/acceso', true);
        }, 1500);
        this.onUnmount = function () {
          clearTimeout(t);
          document.getElementById('phone').classList.remove('azul');
        };
      }
    };
  });

  /* ── /acceso — elegir iniciar sesión o crear cuenta ──────────── */
  R.add('/acceso', function () {
    return {
      bar: null,
      body:
        '<div style="min-height:100%;display:flex;flex-direction:column;justify-content:center;' +
        'text-align:center;padding:20px 4px">' +
          U.logo(68, '') +
          '<h1 class="h-display" style="margin-top:20px">Te damos la bienvenida</h1>' +
          '<p class="p-body" style="max-width:28ch;margin:0 auto 30px">Armamos tu método de ' +
          'estudio y te mostramos si de verdad aprendiste, antes del parcial.</p>' +
          '<div class="stack">' +
            '<button class="btn btn-primary btn-block" data-go="/login">Iniciar sesión</button>' +
            '<button class="btn btn-outline btn-block" data-go="/registro">Crear una cuenta</button>' +
          '</div>' +
          '<div class="row" style="margin:20px 0 14px;gap:12px"><span class="divider grow" ' +
          'style="margin:0"></span><span class="p-small muted">o</span>' +
          '<span class="divider grow" style="margin:0"></span></div>' +
          '<button class="btn btn-outline btn-block" data-act="google">' + gLogo() +
          'Continuar con Google</button>' +
        '</div>',
      footer:
        '<div class="hint">Al continuar aceptás los <a data-go="/terminos" ' +
        'style="cursor:pointer;text-decoration:underline">términos y condiciones</a></div>',
      onMount: function () {
        A.accion('google', function () { entrar('google'); });
      }
    };
  });

  function gLogo() {
    /* "G" neutra, no es el logotipo de la marca */
    return '<span style="width:20px;height:20px;border-radius:50%;border:2px solid ' +
      'var(--outline);display:grid;place-items:center;font:800 11px/1 var(--font);' +
      'color:var(--on-surface-var)">G</span>';
  }

  /* ── /login ──────────────────────────────────────────────────── */
  R.add('/login', function () {
    var c = S.get().cuenta;
    return {
      bar: { titulo: 'Iniciar sesión', back: '/acceso' },
      body:
        '<p class="p-body" style="margin:6px 0 22px">Usá el correo con el que te registraste.</p>' +
        '<label class="field"><span>Correo electrónico</span>' +
          '<input id="l-email" type="email" autocomplete="email" ' +
          'placeholder="nombre@correo.com" value="' + U.esc(c.email) + '"></label>' +
        '<label class="field" style="margin-bottom:6px"><span>Contraseña</span>' +
          '<span style="position:relative;display:block">' +
          '<input id="l-clave" type="password" autocomplete="current-password" ' +
          'placeholder="Tu contraseña" value="demo1234" style="padding-right:52px">' +
          '<button type="button" class="ab-btn" data-act="ver-clave" aria-label="Mostrar contraseña" ' +
          'style="position:absolute;right:5px;top:5px;color:var(--on-surface-var)">' +
          U.icon('eye', 20) + '</button></span></label>' +
        '<div style="text-align:right;margin-bottom:22px">' +
          '<button class="btn btn-ghost btn-sm" data-act="olvide">Olvidé mi contraseña</button></div>' +
        '<div class="note note-grey">' + U.icon('help', 19) +
          '<div>Es una maqueta: cualquier correo y contraseña de 6 caracteres o más funcionan.' +
          '</div></div>',
      footer:
        '<button class="btn btn-primary btn-block" data-act="login">Iniciar sesión</button>' +
        '<div class="hint">¿No tenés cuenta? <a data-go="/registro" style="cursor:pointer;' +
        'font-weight:700;color:var(--primary)">Creá una</a></div>',
      onMount: function (root) {
        var em = root.querySelector('#l-email'), cl = root.querySelector('#l-clave');
        A.accion('ver-clave', function (el) {
          var ver = cl.type === 'password';
          cl.type = ver ? 'text' : 'password';
          el.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
          el.style.color = ver ? 'var(--primary)' : 'var(--on-surface-var)';
        });
        A.accion('olvide', function () {
          A.toast('Te enviamos un enlace para restablecerla a ' + (em.value || 'tu correo'),
            { icono: 'bell' });
        });
        A.accion('login', function () {
          var ok = true;
          [em, cl].forEach(function (i) { i.closest('.field').classList.remove('err'); });
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())) {
            em.closest('.field').classList.add('err'); ok = false;
          }
          if (cl.value.length < 6) { cl.closest('.field').classList.add('err'); ok = false; }
          if (!ok) { A.toast('Revisá el correo y la contraseña', { icono: 'alert' }); return; }
          c.email = em.value.trim();
          entrar('login');
        });
      }
    };
  });

  /* ── /registro ───────────────────────────────────────────────── */
  R.add('/registro', function () {
    return {
      bar: { titulo: 'Crear una cuenta', back: '/acceso' },
      body:
        '<div class="stepper" style="margin:4px 0 16px"><i class="done"></i><i></i><i></i></div>' +
        '<p class="p-body" style="margin-bottom:18px">Un paso y arrancamos con el diagnóstico.</p>' +
        '<div class="field-row">' +
          '<label class="field"><span>Nombre</span><input id="r-nombre" autocomplete="given-name" ' +
          'placeholder="Tomás" value="' + U.esc(registro.nombre) + '"></label>' +
          '<label class="field"><span>Apellido</span><input id="r-apellido" ' +
          'autocomplete="family-name" placeholder="Aguirre" value="' + U.esc(registro.apellido) +
          '"></label>' +
        '</div>' +
        '<label class="field"><span>Correo electrónico</span><input id="r-email" type="email" ' +
          'autocomplete="email" placeholder="nombre@correo.com" value="' + U.esc(registro.email) +
          '"></label>' +
        '<label class="field"><span>Contraseña</span><input id="r-clave" type="password" ' +
          'autocomplete="new-password" placeholder="Mínimo 6 caracteres" value="' +
          U.esc(registro.clave) + '"><span class="help">Usá al menos 6 caracteres.</span></label>' +
        '<button class="option sq' + (registro.acepta ? ' on' : '') + '" data-act="r-acepta" ' +
          'role="checkbox" aria-checked="' + registro.acepta + '" style="padding:12px">' +
          '<span class="opt-text"><span class="opt-title" style="font:var(--t-body-sm);' +
          'font-weight:600">Acepto los términos y condiciones</span>' +
          '<span class="opt-sub"><a data-go="/terminos" style="cursor:pointer;' +
          'text-decoration:underline">Leerlos</a></span></span>' +
          '<span class="opt-check" style="margin-top:2px">' + U.icon('check', 13, 3) +
          '</span></button>',
      footer:
        '<button class="btn btn-primary btn-block" data-act="registrar">Crear mi cuenta</button>' +
        '<div class="hint">¿Ya tenés cuenta? <a data-go="/login" style="cursor:pointer;' +
        'font-weight:700;color:var(--primary)">Iniciá sesión</a></div>',
      onMount: function (root) {
        var f = {
          nombre: root.querySelector('#r-nombre'), apellido: root.querySelector('#r-apellido'),
          email: root.querySelector('#r-email'), clave: root.querySelector('#r-clave')
        };
        Object.keys(f).forEach(function (k) {
          f[k].addEventListener('input', function () { registro[k] = f[k].value; });
        });
        A.accion('r-acepta', function (el, e) {
          if (e.target.closest('[data-go]')) return;
          registro.acepta = !registro.acepta;
          el.classList.toggle('on', registro.acepta);
          el.setAttribute('aria-checked', registro.acepta);
        });
        A.accion('registrar', function () {
          var ok = true;
          Object.keys(f).forEach(function (k) { f[k].closest('.field').classList.remove('err'); });
          if (!registro.nombre.trim()) { f.nombre.closest('.field').classList.add('err'); ok = false; }
          if (!registro.apellido.trim()) { f.apellido.closest('.field').classList.add('err'); ok = false; }
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(registro.email.trim())) {
            f.email.closest('.field').classList.add('err'); ok = false;
          }
          if (registro.clave.length < 6) { f.clave.closest('.field').classList.add('err'); ok = false; }
          if (!ok) { A.toast('Completá los campos marcados', { icono: 'alert' }); return; }
          if (!registro.acepta) { A.toast('Tenés que aceptar los términos', { icono: 'alert' }); return; }
          var u = S.get().usuario;
          u.nombre = registro.nombre.trim();
          u.apellido = registro.apellido.trim();
          u.iniciales = (u.nombre[0] + u.apellido[0]).toUpperCase();
          S.get().cuenta.email = registro.email.trim();
          registro = { nombre: '', apellido: '', email: '', clave: '', acepta: false };
          entrar('registro');
        });
      }
    };
  });

  /* ── /terminos ───────────────────────────────────────────────── */
  R.add('/terminos', function () {
    var p = function (t, s) {
      return '<div style="margin-bottom:16px"><b style="font:var(--t-subtitle);display:block;' +
        'margin-bottom:4px">' + t + '</b><p class="p-body">' + s + '</p></div>';
    };
    return {
      bar: { titulo: 'Términos y condiciones', back: true },
      body:
        p('1. Qué es Asesor de Estudio', 'Una herramienta que organiza tu estudio y te ayuda a ' +
          'comprobar lo que aprendiste. No reemplaza a tus docentes ni provee contenido académico.') +
        p('2. Tus datos', 'Usamos tus respuestas del diagnóstico y tu plan solo para armar tu método. ' +
          'No vendemos ni compartimos tu información.') +
        p('3. Tus preguntas', 'Las preguntas que escribís son tuyas y solo vos las ves.') +
        p('4. Uso responsable', 'La app sugiere técnicas y tiempos; las decisiones sobre tu ' +
          'cursada son siempre tuyas.') +
        '<div class="note note-grey">' + U.icon('help', 19) + '<div>Texto de ejemplo de la ' +
        'maqueta.</div></div><div class="sp-16"></div>'
    };
  });

  /* ── entrada a la app ────────────────────────────────────────── */
  function entrar(como) {
    var st = S.get();
    st.cuenta.sesion = true;
    A.toast(como === 'registro' ? 'Cuenta creada' : 'Sesión iniciada');
    R.go(st.diagnostico.hecho ? '/inicio' : '/bienvenida');
  }

  global.Cuenta = { entrar: entrar };
})(window);
