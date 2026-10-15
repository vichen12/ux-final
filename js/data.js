/* ══════════════════════════════════════════════════════════════
   data.js — estado de la maqueta y datos de prueba
   Todo vive en memoria: no hay base de datos ni servidor.
   Store.reset() vuelve a dejar la app como arranca.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var U = global.UI;

  /* ── catálogo de técnicas de estudio ────────────────────────── */
  var TECNICAS = {
    recuperacion: {
      id: 'recuperacion', nombre: 'Recuperación activa', icono: 'brain',
      corto: 'Cerrá el apunte y escribí lo que recordás.',
      detalle: 'Leés una vez, cerrás todo y tratás de reconstruir el tema de memoria. ' +
        'Recién después abrís el material y marcás lo que te faltó. Cuesta más que releer, ' +
        'y por eso funciona: el esfuerzo de traer la información es lo que la fija.',
      evidencia: 'Utilidad alta — Dunlosky et al. (2013)',
      pasos: ['Leé la unidad una vez, sin subrayar.',
        'Cerrá el material y escribí todo lo que puedas recordar.',
        'Abrí el apunte y marcá en otro color lo que te faltó.']
    },
    espaciado: {
      id: 'espaciado', nombre: 'Repaso espaciado', icono: 'repeat',
      corto: 'Volvé al tema cuando estés por olvidarlo.',
      detalle: 'En vez de estudiar un tema cinco horas seguidas, lo repasás en sesiones ' +
        'cortas separadas por días. Cada repaso en el momento justo antes de olvidarlo ' +
        'alarga cuánto te dura.',
      evidencia: 'Utilidad alta — Dunlosky et al. (2013)',
      pasos: ['Repasá la unidad al día siguiente de verla.',
        'Volvé a los 3 días, después a la semana.',
        'Si un repaso sale mal, el siguiente se acerca.']
    },
    intercalada: {
      id: 'intercalada', nombre: 'Práctica intercalada', icono: 'target',
      corto: 'Mezclá ejercicios de varias unidades.',
      detalle: 'En lugar de hacer veinte ejercicios iguales seguidos, mezclás tipos de ' +
        'problema. Te obliga a decidir qué método usar, que es justamente lo que te van a ' +
        'pedir en el parcial.',
      evidencia: 'Utilidad moderada — Dunlosky et al. (2013)',
      pasos: ['Elegí ejercicios de 2 o 3 unidades distintas.',
        'Resolvelos salteados, sin agrupar por tipo.',
        'Anotá en cuáles dudaste qué método aplicar.']
    },
    autoexplicacion: {
      id: 'autoexplicacion', nombre: 'Autoexplicación', icono: 'users',
      corto: 'Explicá el tema en voz alta, como a un compañero.',
      detalle: 'Contás el tema con tus palabras, en voz alta, conectando cada paso con el ' +
        'anterior. Donde te trabás es donde no lo entendías.',
      evidencia: 'Utilidad moderada — Dunlosky et al. (2013)',
      pasos: ['Explicá el tema en voz alta sin mirar el apunte.',
        'Cada vez que digas "porque", comprobá que sea cierto.',
        'Anotá los puntos donde te trabaste.']
    },
    lectura: {
      id: 'lectura', nombre: 'Lectura activa', icono: 'book',
      corto: 'Primera pasada: leé preguntándole al texto.',
      detalle: 'Es la puerta de entrada a una unidad nueva, no una forma de estudiar para ' +
        'el parcial. Leés una vez convirtiendo cada título en pregunta, y al terminar ' +
        'escribís las preguntas que todavía no sabés contestar.',
      evidencia: 'Solo como primera pasada; releer tiene utilidad baja',
      pasos: ['Convertí cada título en una pregunta antes de leerlo.',
        'Leé la sección buscando la respuesta.',
        'Anotá las preguntas que quedaron sin responder.']
    },
    ejercitacion: {
      id: 'ejercitacion', nombre: 'Ejercitación guiada', icono: 'edit',
      corto: 'Resolvé parciales viejos con el reloj corriendo.',
      detalle: 'Trabajás sobre ejercicios del nivel de la evaluación real y con el tiempo ' +
        'medido. Sirve para calibrar cuánto tardás, no solo si te sale.',
      evidencia: 'Práctica de recuperación aplicada',
      pasos: ['Elegí ejercicios de un parcial anterior.',
        'Resolvelos cronometrado y sin mirar la teoría.',
        'Corregí marcando el tipo de error, no solo el resultado.']
    }
  };

  /* ── definiciones del diagnóstico ───────────────────────────── */
  var DIAGNOSTICO = [
    {
      id: 'habitos', titulo: '¿Cómo estudiás hoy?',
      bajada: 'Marcá todo lo que hacés habitualmente cuando preparás un parcial.',
      multiple: true,
      opciones: [
        { v: 'releer', t: 'Releo el apunte', s: 'Lectura pasiva y repetida', i: 'book' },
        { v: 'subrayar', t: 'Subrayo', s: 'Resalto lo que me parece importante', i: 'edit' },
        { v: 'resumir', t: 'Hago resúmenes', s: 'Reescribo el material', i: 'note' },
        { v: 'ejercicios', t: 'Resuelvo ejercicios', s: 'Práctica con guías o parciales', i: 'target' },
        { v: 'videos', t: 'Veo videos del tema', s: 'Busco explicaciones afuera', i: 'play' },
        { v: 'explicar', t: 'Le explico el tema a alguien', s: 'Técnica Feynman', i: 'users' },
        { v: 'autoevaluar', t: 'Me autoevalúo con preguntas', s: 'Me pongo a prueba', i: 'brain' }
      ]
    },
    {
      id: 'certeza', titulo: '¿Cómo sabés que entendiste?',
      bajada: 'Pensá en la última vez que diste un tema por sabido.',
      multiple: false,
      opciones: [
        { v: 'lei', t: 'Porque leí todo el material', s: 'Terminé el apunte y me suena', i: 'book' },
        { v: 'ejercicios', t: 'Resolviendo ejercicios', s: 'Si me salen, lo sé', i: 'target' },
        { v: 'explico', t: 'Explicándoselo a alguien', s: 'Si lo puedo contar, lo entendí', i: 'users' },
        { v: 'nose', t: 'No lo sé hasta que rindo', s: 'Me entero en el examen', i: 'help' }
      ]
    },
    {
      id: 'momento', titulo: '¿Cuándo rendís mejor?',
      bajada: 'Vamos a poner las sesiones difíciles en tus mejores horas.',
      multiple: true,
      opciones: [
        { v: 'manana', t: 'A la mañana temprano', s: '6:00 a 10:00', i: 'sun' },
        { v: 'mediodia', t: 'Al mediodía', s: '10:00 a 14:00', i: 'coffee' },
        { v: 'tarde', t: 'A la tarde', s: '14:00 a 19:00', i: 'clock' },
        { v: 'noche', t: 'A la noche', s: '19:00 a 24:00', i: 'moon' }
      ]
    },
    {
      id: 'disponibilidad', titulo: '¿Cuánto tiempo tenés?',
      bajada: 'Decinos cuántas horas por día podés dedicarle, en promedio.',
      multiple: false,
      opciones: [
        { v: '1', t: 'Hasta 1 hora', s: 'Tengo poco margen', i: 'clock' },
        { v: '2', t: 'Entre 1 y 2 horas', s: 'Lo habitual en semana', i: 'clock' },
        { v: '3', t: 'Entre 2 y 3 horas', s: 'Puedo sostenerlo', i: 'clock' },
        { v: '4', t: 'Más de 3 horas', s: 'Estudio a tiempo completo', i: 'clock' }
      ]
    },
    {
      id: 'experiencia', titulo: '¿Te pasó estudiar y que no alcance?',
      bajada: 'Rendir mal habiendo estudiado es un problema de método, no de capacidad.',
      multiple: false,
      opciones: [
        { v: 'varias', t: 'Sí, varias veces', s: 'Me pasa seguido', i: 'alert' },
        { v: 'alguna', t: 'Alguna vez', s: 'Una o dos veces', i: 'help' },
        { v: 'no', t: 'No me pasó', s: 'Cuando estudio, me va bien', i: 'check' }
      ]
    },
    {
      id: 'abandono', titulo: '¿Probaste apps para organizarte?',
      bajada: 'Si abandonaste alguna, queremos saber por qué.',
      multiple: false,
      opciones: [
        { v: 'config', t: 'Sí, pero pedían configurar demasiado', s: 'Me cansé antes de usarla', i: 'gear' },
        { v: 'olvide', t: 'Sí, pero me olvidé de usarla', s: 'La abrí dos semanas', i: 'bell' },
        { v: 'uso', t: 'Sí, y todavía uso alguna', s: 'Me funciona a medias', i: 'check' },
        { v: 'nunca', t: 'Nunca probé ninguna', s: 'Es mi primera vez', i: 'spark' }
      ]
    }
  ];

  /* ── datos de prueba ────────────────────────────────────────── */
  function hoy() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }

  function semilla() {
    var H = hoy();
    var d = function (n) { return U.ymd(U.addDays(H, n)); };

    var materias = [
      {
        id: 'am1', nombre: 'Análisis Matemático I', corto: 'AM I', color: 'primary',
        docente: 'Ing. Pérez', parcial: d(16), tema: 'Límites y continuidad',
        unidades: [
          { n: 1, titulo: 'Números reales y funciones', dif: 'facil' },
          { n: 2, titulo: 'Límites y continuidad', dif: 'media' },
          { n: 3, titulo: 'Derivada y regla de la cadena', dif: 'dificil' },
          { n: 4, titulo: 'Aplicaciones de la derivada', dif: 'dificil' },
          { n: 5, titulo: 'Integrales indefinidas', dif: 'media' },
          { n: 6, titulo: 'Teorema fundamental del cálculo', dif: 'dificil' }
        ]
      },
      {
        id: 'alg', nombre: 'Álgebra y Geometría Analítica', corto: 'Álgebra', color: 'green',
        docente: 'Lic. Gómez', parcial: d(30), tema: 'Espacios vectoriales',
        unidades: [
          { n: 1, titulo: 'Matrices y determinantes', dif: 'media' },
          { n: 2, titulo: 'Sistemas de ecuaciones lineales', dif: 'media' },
          { n: 3, titulo: 'Vectores en R² y R³', dif: 'facil' },
          { n: 4, titulo: 'Espacios vectoriales', dif: 'dificil' },
          { n: 5, titulo: 'Transformaciones lineales', dif: 'dificil' }
        ]
      },
      {
        id: 'fis', nombre: 'Física I', corto: 'Física', color: 'amber',
        docente: 'Dr. Luján', parcial: d(37), tema: 'Cinemática',
        unidades: [
          { n: 1, titulo: 'Magnitudes y vectores', dif: 'facil' },
          { n: 2, titulo: 'Cinemática del punto', dif: 'media' },
          { n: 3, titulo: 'Dinámica y leyes de Newton', dif: 'dificil' },
          { n: 4, titulo: 'Trabajo y energía', dif: 'media' }
        ]
      }
    ];

    /* progreso simulado: unidades con quiz aprobado, vistas y pendientes */
    var estados = {
      am1: { 1: 'dominada', 2: 'dominada', 3: 'leida', 4: 'leida', 5: 'pendiente', 6: 'pendiente' },
      alg: { 1: 'dominada', 2: 'leida', 3: 'pendiente', 4: 'pendiente', 5: 'pendiente' },
      fis: { 1: 'leida', 2: 'pendiente', 3: 'pendiente', 4: 'pendiente' }
    };
    var notas = { am1: { 1: 90, 2: 75, 3: 40 }, alg: { 1: 85 }, fis: {} };

    materias.forEach(function (m) {
      m.unidades.forEach(function (u) {
        u.estado = estados[m.id][u.n] || 'pendiente';
        u.nota = notas[m.id][u.n] != null ? notas[m.id][u.n] : null;
      });
    });

    /* ── sesiones: pasadas, de hoy y próximas ── */
    var sesiones = [];
    var sid = 1;
    function S(materiaId, unidad, fecha, hora, min, tecnica, estado) {
      sesiones.push({
        id: 's' + (sid++), materiaId: materiaId, unidad: unidad, fecha: fecha,
        hora: hora, duracion: min, tecnica: tecnica, estado: estado || 'pendiente',
        preguntas: []
      });
    }
    /* semana pasada */
    S('am1', 1, d(-6), '18:00', 45, 'lectura', 'hecha');
    S('am1', 1, d(-5), '18:30', 40, 'recuperacion', 'hecha');
    S('alg', 1, d(-5), '20:00', 45, 'lectura', 'hecha');
    S('am1', 2, d(-4), '18:00', 50, 'lectura', 'hecha');
    S('fis', 1, d(-3), '19:00', 45, 'lectura', 'hecha');
    S('am1', 2, d(-3), '20:00', 40, 'recuperacion', 'hecha');
    S('alg', 1, d(-2), '18:30', 40, 'recuperacion', 'hecha');
    S('am1', 3, d(-2), '20:00', 50, 'lectura', 'hecha');
    S('am1', 3, d(-1), '18:00', 45, 'recuperacion', 'omitida');
    S('alg', 2, d(-1), '19:30', 45, 'lectura', 'hecha');
    /* hoy */
    S('am1', 4, d(0), '18:00', 45, 'lectura', 'pendiente');
    S('alg', 2, d(0), '19:30', 40, 'recuperacion', 'pendiente');
    S('fis', 2, d(0), '21:00', 45, 'lectura', 'pendiente');
    /* próximos días */
    S('am1', 3, d(1), '18:00', 40, 'ejercitacion', 'pendiente');
    S('am1', 4, d(1), '19:00', 45, 'recuperacion', 'pendiente');
    S('alg', 3, d(2), '18:30', 45, 'lectura', 'pendiente');
    S('am1', 5, d(2), '20:00', 50, 'lectura', 'pendiente');
    S('fis', 2, d(3), '19:00', 40, 'recuperacion', 'pendiente');
    S('am1', 5, d(3), '20:30', 40, 'recuperacion', 'pendiente');
    S('am1', 6, d(4), '18:00', 50, 'lectura', 'pendiente');
    S('alg', 3, d(4), '20:00', 40, 'recuperacion', 'pendiente');
    S('am1', 6, d(5), '18:30', 45, 'recuperacion', 'pendiente');
    S('am1', 1, d(6), '19:00', 30, 'intercalada', 'pendiente');
    S('am1', 2, d(7), '18:00', 40, 'ejercitacion', 'pendiente');
    S('alg', 4, d(7), '20:00', 50, 'lectura', 'pendiente');

    /* ── preguntas escritas por el estudiante ── */
    var tarjetas = [];
    var tid = 1;
    function T(materiaId, unidad, q, a, creadaN, proxN, facil, inter, aciertos) {
      tarjetas.push({
        id: 't' + (tid++), materiaId: materiaId, unidad: unidad,
        pregunta: q, respuesta: a, creada: d(creadaN), proximo: d(proxN),
        facilidad: facil || 2.5, intervalo: inter || 1, repasos: aciertos || 0, historial: []
      });
    }
    T('am1', 1, '¿Qué condición debe cumplir una función para ser continua en un punto?',
      'Que exista el límite en ese punto, que la función esté definida ahí y que ambos coincidan.', -6, 2, 2.6, 4, 2);
    T('am1', 1, '¿Qué diferencia hay entre un intervalo abierto y uno cerrado?',
      'El cerrado incluye los extremos; el abierto no.', -6, 5, 2.7, 7, 3);
    T('am1', 2, '¿Cuándo existe el límite de una función en un punto?',
      'Cuando los límites laterales existen y son iguales.', -4, 0, 2.5, 3, 1);
    T('am1', 2, '¿Qué es una indeterminación 0/0?',
      'Una expresión cuyo valor no se puede decidir sin levantar la indeterminación, ' +
      'factorizando o aplicando L\'Hôpital.', -4, 0, 2.3, 2, 1);
    T('am1', 3, '¿Cómo se aplica la regla de la cadena?',
      'La derivada de f(g(x)) es f\'(g(x)) por g\'(x): derivo la de afuera dejando la de ' +
      'adentro, y multiplico por la derivada de adentro.', -2, 0, 2.1, 1, 0);
    T('am1', 3, '¿Qué significa que una función sea derivable en un punto?',
      'Que existe el límite del cociente incremental en ese punto. Si es derivable, es continua.', -2, 0, 2.2, 1, 0);
    T('alg', 1, '¿Qué condición debe cumplir una matriz cuadrada para ser inversible?',
      'Que su determinante sea distinto de cero.', -5, 1, 2.6, 4, 2);
    T('alg', 1, '¿Qué es el rango de una matriz?',
      'La cantidad de filas linealmente independientes, o el orden del mayor menor no nulo.', -5, 3, 2.5, 5, 2);
    T('alg', 2, '¿Cuándo un sistema de ecuaciones es compatible determinado?',
      'Cuando el rango de la matriz de coeficientes es igual al de la ampliada y al número ' +
      'de incógnitas.', -1, 0, 2.5, 1, 0);
    T('fis', 1, '¿Qué diferencia hay entre magnitud escalar y vectorial?',
      'La escalar queda definida por un número y su unidad; la vectorial necesita además ' +
      'dirección y sentido.', -3, 1, 2.5, 2, 1);

    return {
      cuenta: { email: 'tomas.aguirre@gmail.com', sesion: true },
      usuario: {
        nombre: 'Tomás', apellido: 'Aguirre', iniciales: 'TA',
        carrera: 'Ingeniería en Sistemas de Información', anio: 1,
        institucion: 'UTN — Facultad Regional Mendoza',
        racha: 9, desde: d(-34)
      },
      diagnostico: {
        hecho: true,
        habitos: ['releer', 'subrayar', 'resumir'],
        certeza: 'lei',
        momento: ['tarde', 'noche'],
        disponibilidad: '2',
        experiencia: 'varias',
        abandono: 'config'
      },
      materias: materias,
      sesiones: sesiones,
      tarjetas: tarjetas,
      ajustes: {
        recordatorios: true, recordatorioHora: '17:30',
        repasoDiario: true, sonido: false, modoFoco: true
      },
      /* sesión en curso, si la hay */
      corriendo: null
    };
  }

  /* ── el store ───────────────────────────────────────────────── */
  var state = semilla();
  var oyentes = [];

  var Store = {
    TECNICAS: TECNICAS,
    DIAGNOSTICO: DIAGNOSTICO,

    get: function () { return state; },

    /* vuelve la maqueta a su estado inicial */
    reset: function () { state = semilla(); this.emit(); },

    /* arranca vacío, como un usuario nuevo */
    vaciar: function () {
      var s = semilla();
      s.materias = []; s.sesiones = []; s.tarjetas = [];
      s.diagnostico = { hecho: false };
      s.usuario.racha = 0;
      s.cuenta = { email: '', sesion: false };
      state = s; this.emit();
    },

    on: function (fn) { oyentes.push(fn); },
    emit: function () { oyentes.forEach(function (f) { f(state); }); },

    /* ── accesos ── */
    materia: function (id) {
      return state.materias.filter(function (m) { return m.id === id; })[0] || null;
    },
    unidad: function (materiaId, n) {
      var m = this.materia(materiaId);
      if (!m) return null;
      return m.unidades.filter(function (u) { return u.n === +n; })[0] || null;
    },
    sesion: function (id) {
      return state.sesiones.filter(function (s) { return s.id === id; })[0] || null;
    },
    tarjeta: function (id) {
      return state.tarjetas.filter(function (t) { return t.id === id; })[0] || null;
    },
    sesionesDe: function (fecha) {
      return state.sesiones.filter(function (s) { return s.fecha === fecha; })
        .sort(function (a, b) { return a.hora < b.hora ? -1 : 1; });
    },
    pendientesHoy: function () {
      var h = U.ymd(hoy());
      return state.sesiones.filter(function (s) {
        return s.fecha === h && s.estado === 'pendiente';
      }).sort(function (a, b) { return a.hora < b.hora ? -1 : 1; });
    },
    proximaSesion: function () {
      var h = U.ymd(hoy());
      var futuras = state.sesiones.filter(function (s) {
        return s.estado === 'pendiente' && s.fecha >= h;
      }).sort(function (a, b) {
        return a.fecha === b.fecha ? (a.hora < b.hora ? -1 : 1) : (a.fecha < b.fecha ? -1 : 1);
      });
      return futuras[0] || null;
    },
    repasosHoy: function () {
      var h = U.ymd(hoy());
      return state.tarjetas.filter(function (t) { return t.proximo <= h; });
    },
    tarjetasDe: function (materiaId, unidad) {
      return state.tarjetas.filter(function (t) {
        return t.materiaId === materiaId && (unidad == null || t.unidad === +unidad);
      });
    },

    /* ── estadísticas ── */
    progresoMateria: function (id) {
      var m = this.materia(id);
      if (!m || !m.unidades.length) return { leidas: 0, dominadas: 0, total: 0, pct: 0, pctDom: 0 };
      var dom = 0, lei = 0;
      m.unidades.forEach(function (u) {
        if (u.estado === 'dominada') { dom++; lei++; }
        else if (u.estado === 'leida') lei++;
      });
      return {
        leidas: lei, dominadas: dom, total: m.unidades.length,
        pct: Math.round(lei / m.unidades.length * 100),
        pctDom: Math.round(dom / m.unidades.length * 100)
      };
    },
    cumplimientoSemana: function () {
      var H = hoy(), ini = U.ymd(U.addDays(H, -6)), fin = U.ymd(U.addDays(H, 0));
      var en = state.sesiones.filter(function (s) { return s.fecha >= ini && s.fecha <= fin; });
      var hechas = en.filter(function (s) { return s.estado === 'hecha'; }).length;
      return { hechas: hechas, total: en.length,
        pct: en.length ? Math.round(hechas / en.length * 100) : 0 };
    },
    minutosSemana: function () {
      var H = hoy(), ini = U.ymd(U.addDays(H, -6));
      return state.sesiones.filter(function (s) {
        return s.fecha >= ini && s.estado === 'hecha';
      }).reduce(function (a, s) { return a + s.duracion; }, 0);
    },
    /* unidades que leyó pero nunca puso a prueba */
    sinProbar: function () {
      var out = [];
      state.materias.forEach(function (m) {
        m.unidades.forEach(function (u) {
          if (u.estado === 'leida') out.push({ materia: m, unidad: u });
        });
      });
      return out;
    },

    hoy: hoy,
    hoyStr: function () { return U.ymd(hoy()); }
  };

  global.Store = Store;
})(window);
