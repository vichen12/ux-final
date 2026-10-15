/* ══════════════════════════════════════════════════════════════
   planner.js — lo que hace a esta app distinta de una agenda:
   reparte el programa en sesiones con técnica asignada, y
   programa los repasos según cómo le fue al estudiante.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI, S = global.Store;

  /* ── cuántas pasadas y cuánto dura cada unidad ──────────────── */
  var PERFIL = {
    facil:   { pasadas: 2, min: 40 },
    media:   { pasadas: 3, min: 45 },
    dificil: { pasadas: 4, min: 50 }
  };

  /* la técnica cambia según la pasada: primero entender, después
     recuperar, después aplicar, y al final mezclar */
  var SECUENCIA = ['lectura', 'recuperacion', 'ejercitacion', 'intercalada'];

  function tecnicaDe(pasada) {
    return SECUENCIA[Math.min(pasada, SECUENCIA.length - 1)];
  }

  /* ── franjas horarias según el diagnóstico ──────────────────── */
  var FRANJAS = {
    manana:   ['07:00', '08:30'],
    mediodia: ['11:00', '12:30'],
    tarde:    ['15:00', '16:30', '18:00'],
    noche:    ['19:00', '20:30', '21:30']
  };

  function horariosPreferidos(diag) {
    var prefs = (diag && diag.momento && diag.momento.length) ? diag.momento : ['tarde', 'noche'];
    var out = [];
    ['manana', 'mediodia', 'tarde', 'noche'].forEach(function (f) {
      if (prefs.indexOf(f) >= 0) out = out.concat(FRANJAS[f]);
    });
    return out.length ? out : FRANJAS.tarde.concat(FRANJAS.noche);
  }

  function minutosPorDia(diag) {
    var m = { '1': 60, '2': 120, '3': 180, '4': 240 };
    return m[(diag && diag.disponibilidad) || '2'] || 120;
  }

  /* ──────────────────────────────────────────────────────────────
     generarPlan — devuelve las sesiones de una materia, repartidas
     entre mañana y el día anterior al parcial.
     ────────────────────────────────────────────────────────────── */
  function generarPlan(materia, diag, opciones) {
    opciones = opciones || {};
    var hoy = S.hoy();
    var finParcial = U.parseYmd(materia.parcial);
    var dias = U.daysBetween(hoy, finParcial) - 1;   // el día previo se reserva
    if (dias < 1) dias = 1;

    var horas = horariosPreferidos(diag);
    var tope = minutosPorDia(diag);
    var evitarFinde = opciones.evitarFinde !== false;

    /* 1· armo la cola de bloques que hay que colocar */
    var cola = [];
    materia.unidades.forEach(function (u) {
      var p = PERFIL[u.dif] || PERFIL.media;
      for (var i = 0; i < p.pasadas; i++) {
        cola.push({
          unidad: u.n, pasada: i, duracion: p.min,
          tecnica: tecnicaDe(i),
          /* la primera pasada de cada unidad debe ir en orden;
             las siguientes pueden espaciarse */
          orden: u.n * 100 + i
        });
      }
    });
    cola.sort(function (a, b) {
      /* intercalo: primero todas las lecturas en orden de unidad,
         después las pasadas siguientes */
      if (a.pasada !== b.pasada) return a.pasada - b.pasada;
      return a.unidad - b.unidad;
    });

    /* 2· listo los días hábiles disponibles */
    var ranuras = [];
    for (var d = 1; d <= dias; d++) {
      var fecha = U.addDays(hoy, d);
      var dow = fecha.getDay();
      if (evitarFinde && dow === 0) continue;           // domingo libre
      var cupo = tope, usados = 0;
      ranuras.push({ fecha: U.ymd(fecha), cupo: cupo, usados: usados, puestas: 0 });
    }
    if (!ranuras.length) {
      ranuras.push({ fecha: U.ymd(U.addDays(hoy, 1)), cupo: tope, usados: 0, puestas: 0 });
    }

    /* 3· reparto respetando el cupo diario y dejando aire entre
          pasadas de la misma unidad (repaso espaciado) */
    var sesiones = [];
    var ultimaDeUnidad = {};
    var sid = 1;

    cola.forEach(function (bloque) {
      var colocada = false;
      for (var i = 0; i < ranuras.length && !colocada; i++) {
        var r = ranuras[i];
        if (r.usados + bloque.duracion > r.cupo) continue;
        if (r.puestas >= horas.length) continue;

        /* separación mínima respecto de la pasada anterior de la misma unidad */
        var minSep = bloque.pasada === 0 ? 0 : (bloque.pasada === 1 ? 1 : 3);
        var prev = ultimaDeUnidad[bloque.unidad];
        if (prev && U.daysBetween(prev, r.fecha) < minSep) continue;

        sesiones.push({
          id: 'g' + materia.id + (sid++),
          materiaId: materia.id,
          unidad: bloque.unidad,
          fecha: r.fecha,
          hora: horas[r.puestas],
          duracion: bloque.duracion,
          tecnica: bloque.tecnica,
          estado: 'pendiente',
          preguntas: []
        });
        r.usados += bloque.duracion;
        r.puestas++;
        ultimaDeUnidad[bloque.unidad] = r.fecha;
        colocada = true;
      }
      /* si no entró en ningún día, la amontono en el último disponible */
      if (!colocada) {
        var ult = ranuras[ranuras.length - 1];
        sesiones.push({
          id: 'g' + materia.id + (sid++),
          materiaId: materia.id, unidad: bloque.unidad, fecha: ult.fecha,
          hora: horas[Math.min(ult.puestas, horas.length - 1)],
          duracion: bloque.duracion, tecnica: bloque.tecnica,
          estado: 'pendiente', preguntas: []
        });
        ult.puestas++;
      }
    });

    sesiones.sort(function (a, b) {
      return a.fecha === b.fecha ? (a.hora < b.hora ? -1 : 1) : (a.fecha < b.fecha ? -1 : 1);
    });
    return sesiones;
  }

  /* resumen legible del plan, para mostrar antes de confirmarlo */
  function resumirPlan(sesiones, materia) {
    var minutos = sesiones.reduce(function (a, s) { return a + s.duracion; }, 0);
    var dias = {};
    sesiones.forEach(function (s) { dias[s.fecha] = true; });
    var nDias = Object.keys(dias).length;
    var porTecnica = {};
    sesiones.forEach(function (s) { porTecnica[s.tecnica] = (porTecnica[s.tecnica] || 0) + 1; });
    return {
      sesiones: sesiones.length,
      minutos: minutos,
      dias: nDias,
      porDia: nDias ? Math.round(minutos / nDias) : 0,
      hastaParcial: U.daysBetween(S.hoy(), U.parseYmd(materia.parcial)),
      porTecnica: porTecnica
    };
  }

  /* ──────────────────────────────────────────────────────────────
     repaso espaciado — variante simplificada de SM-2.
     calidad: 2 = me acordaba, 1 = a medias, 0 = en blanco
     ────────────────────────────────────────────────────────────── */
  function calificar(tarjeta, calidad) {
    var f = tarjeta.facilidad || 2.5;
    var i = tarjeta.intervalo || 1;

    if (calidad >= 2) {
      f = Math.min(3.1, f + 0.12);
      i = tarjeta.repasos === 0 ? 2 : Math.round(i * f);
      tarjeta.repasos = (tarjeta.repasos || 0) + 1;
    } else if (calidad === 1) {
      f = Math.max(1.4, f - 0.16);
      i = Math.max(1, Math.round(i * 0.6));
    } else {
      f = Math.max(1.3, f - 0.3);
      i = 1;
      tarjeta.repasos = 0;
    }
    i = Math.min(i, 60);

    tarjeta.facilidad = Math.round(f * 100) / 100;
    tarjeta.intervalo = i;
    tarjeta.proximo = U.ymd(U.addDays(S.hoy(), i));
    tarjeta.historial = tarjeta.historial || [];
    tarjeta.historial.push({ fecha: S.hoyStr(), calidad: calidad });
    return tarjeta;
  }

  /* nota de la unidad a partir de cómo salieron sus preguntas */
  function notaUnidad(materiaId, unidad) {
    var ts = S.tarjetasDe(materiaId, unidad).filter(function (t) {
      return t.historial && t.historial.length;
    });
    if (!ts.length) return null;
    var suma = 0;
    ts.forEach(function (t) {
      var ult = t.historial[t.historial.length - 1];
      suma += ult.calidad === 2 ? 100 : ult.calidad === 1 ? 55 : 15;
    });
    return Math.round(suma / ts.length);
  }

  /* ──────────────────────────────────────────────────────────────
     el ajuste que la app sugiere y el estudiante confirma
     ────────────────────────────────────────────────────────────── */
  function sugerirAjuste(materiaId, unidad, nota) {
    if (nota == null || nota >= 70) return null;
    var m = S.materia(materiaId);
    if (!m) return null;

    var grave = nota < 45;
    var cuando = U.addDays(S.hoy(), grave ? 1 : 2);
    /* busco un hueco: primer día sin más de dos sesiones */
    for (var i = 0; i < 6; i++) {
      var f = U.ymd(U.addDays(cuando, i));
      if (S.sesionesDe(f).length < 3) { cuando = U.parseYmd(f); break; }
    }
    var u = S.unidad(materiaId, unidad);
    return {
      materiaId: materiaId,
      unidad: unidad,
      nota: nota,
      grave: grave,
      titulo: u ? u.titulo : 'Unidad ' + unidad,
      fecha: U.ymd(cuando),
      hora: grave ? '18:30' : '19:00',
      duracion: grave ? 40 : 30,
      tecnica: grave ? 'recuperacion' : 'intercalada',
      motivo: grave
        ? 'En esta unidad respondiste bien menos de la mitad. Conviene volver antes de seguir avanzando.'
        : 'Te falta afirmar esta unidad. Un repaso corto alcanza para dejarla cerrada.'
    };
  }

  /* aplica el ajuste: agrega la sesión al plan */
  function aplicarAjuste(ajuste) {
    var st = S.get();
    st.sesiones.push({
      id: 'a' + Date.now(),
      materiaId: ajuste.materiaId, unidad: ajuste.unidad, fecha: ajuste.fecha,
      hora: ajuste.hora, duracion: ajuste.duracion, tecnica: ajuste.tecnica,
      estado: 'pendiente', preguntas: [], ajuste: true
    });
    S.emit();
  }

  /* reprogramar una sesión que no se pudo hacer */
  function reprogramar(sesionId, nuevaFecha, nuevaHora) {
    var s = S.sesion(sesionId);
    if (!s) return false;
    s.fecha = nuevaFecha;
    if (nuevaHora) s.hora = nuevaHora;
    s.estado = 'pendiente';
    s.reprogramada = true;
    S.emit();
    return true;
  }

  /* marcar la sesión como hecha y mover el estado de la unidad */
  function completarSesion(sesionId, preguntas) {
    var s = S.sesion(sesionId);
    if (!s) return null;
    s.estado = 'hecha';
    s.completadaEl = S.hoyStr();
    s.preguntas = preguntas || [];

    /* las preguntas que escribió pasan a ser tarjetas de repaso */
    var st = S.get();
    (preguntas || []).forEach(function (p, i) {
      if (!p.pregunta || !p.pregunta.trim()) return;
      st.tarjetas.push({
        id: 't' + Date.now() + i,
        materiaId: s.materiaId, unidad: s.unidad,
        pregunta: p.pregunta.trim(),
        respuesta: (p.respuesta || '').trim(),
        creada: S.hoyStr(),
        proximo: U.ymd(U.addDays(S.hoy(), 1)),
        facilidad: 2.5, intervalo: 1, repasos: 0, historial: []
      });
    });

    /* la unidad pasa a "leída" salvo que ya estuviera dominada */
    var u = S.unidad(s.materiaId, s.unidad);
    if (u && u.estado === 'pendiente') u.estado = 'leida';

    S.emit();
    return s;
  }

  /* después de un quiz: si la nota alcanza, la unidad queda dominada */
  function cerrarQuiz(materiaId, unidad) {
    var nota = notaUnidad(materiaId, unidad);
    var u = S.unidad(materiaId, unidad);
    if (u) {
      u.nota = nota;
      if (nota != null && nota >= 70) u.estado = 'dominada';
      else if (u.estado === 'pendiente') u.estado = 'leida';
    }
    S.emit();
    return { nota: nota, ajuste: sugerirAjuste(materiaId, unidad, nota) };
  }

  global.Planner = {
    PERFIL: PERFIL,
    generarPlan: generarPlan,
    resumirPlan: resumirPlan,
    tecnicaDe: tecnicaDe,
    horariosPreferidos: horariosPreferidos,
    minutosPorDia: minutosPorDia,
    calificar: calificar,
    notaUnidad: notaUnidad,
    sugerirAjuste: sugerirAjuste,
    aplicarAjuste: aplicarAjuste,
    reprogramar: reprogramar,
    completarSesion: completarSesion,
    cerrarQuiz: cerrarQuiz
  };
})(window);
