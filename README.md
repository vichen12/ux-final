# Asesor de Estudio — maqueta funcional

Prototipo navegable del MVP. Proyecto final de **Diseño UX-UI**, Grupo C «Figma locos»,
Universidad Tecnológica Nacional, Facultad Regional Mendoza.

Integrantes: Alvarez, Joaquín · Dallape, Vincenzo · Flores, Martín · Lovos, David ·
Ortiz, Renzo · Podesta, Isidro · Saini, Alejo.

## Cómo abrirla

Doble click en **`index.html`**. Nada más: no hay que instalar ni compilar nada, y
funciona sin internet (la tipografía va incluida).

Es responsive, siguiendo Material 3 adaptable: en el celular la navegación va en una barra
inferior; en una pantalla de 900 px o más pasa a un panel lateral y el contenido se ordena
en columnas. El botón **Recorrido** (abajo) salta a cualquier pantalla del happy path y
permite reiniciar los datos o recorrer la app desde cero.

Librerías incluidas en `js/vendor/` (funcionan sin internet): **GSAP** para las
transiciones y los números animados, **Chart.js** para los gráficos de Progreso y
**canvas-confetti** para los logros (plan listo, sesión terminada, unidad dominada).
Todo el movimiento se desactiva si el sistema pide reducir animaciones.

## Qué es y qué no es

Es una maqueta funcional: **todas las pantallas andan** y la lógica del producto está
programada de verdad. Los datos son de prueba y viven en memoria: **no hay servidor ni
base de datos**. Al recargar la página vuelve al estado inicial.

### Lo que funciona de verdad

| | |
|---|---|
| **Diagnóstico** | 6 pasos. Las respuestas cambian el plan que se genera después. |
| **Generador de plan** | Reparte las unidades entre hoy y el parcial según tu disponibilidad diaria, las franjas horarias que elegiste y la dificultad de cada unidad. |
| **Asignación de técnica** | Cada pasada sobre una unidad usa una técnica distinta: lectura activa, recuperación activa, ejercitación, práctica intercalada. |
| **Cronómetro** | Cuenta real, con pausa y la guía metodológica en pasos. |
| **Preguntas propias** | Las que escribís al cerrar una sesión se convierten en tarjetas de repaso. |
| **Repaso espaciado** | Variante simplificada de SM-2: según cómo califiques, el próximo repaso se acerca o se aleja. |
| **Leído vs. dominado** | Una unidad pasa a *dominada* recién cuando respondés bien el 70 % de sus preguntas. |
| **Ajuste del cronograma** | Si un quiz sale mal, la app propone un repaso extra y vos lo aceptás o no. |

### Lo que no hace

No trae contenido académico, no genera preguntas ni resúmenes automáticos, no se
conecta al campus ni a Google Calendar, y no guarda nada entre sesiones.

## Presentación

La presentación final está en [`presentacion/GrupoC_AsesorDeEstudio_2026.pptx`](presentacion/GrupoC_AsesorDeEstudio_2026.pptx). No se publica en Vercel (está en `.vercelignore`).

## Publicada en Vercel

El proyecto `ux-final` de Vercel está conectado a este repositorio: cada `git push` a
`main` publica la versión nueva sola.

**Link:** https://ux-final-lemon.vercel.app

## Las pantallas

**Cuenta** — splash · acceso · iniciar sesión · registrarse · términos · cerrar sesión

**Onboarding** — bienvenida · diagnóstico (6 pasos) · perfil de estudio resultante

**Materias** — lista · alta de materia · carga del programa con dificultad por unidad ·
generación del plan · resumen del plan antes de confirmarlo · detalle de materia

**Plan** — inicio · calendario semanal · detalle de sesión · reprogramación

**Sesión** — cronómetro con guía en pasos · cierre con redacción de preguntas · resumen final

**Quizzes** — repasos del día · pregunta · respuesta y autocalificación · resultado ·
ajuste sugerido

**Progreso** — leído contra dominado por materia · ayuda de estados · constancia de las dos
últimas semanas · detalle de unidad

**Perfil** — perfil y estadísticas · biblioteca de técnicas · ficha de cada técnica ·
mi diagnóstico · ajustes · acerca de · avisos

## Para mostrarla

- **Reiniciar datos**: botón en la columna lateral o en Ajustes. Vuelve al estado inicial.
- **Recorrer desde cero**: borra las materias y arranca en el diagnóstico, como un
  usuario nuevo.
- **Adelantar el reloj**: dentro de una sesión activa hay un botón que salta el
  cronómetro al final, para no esperar 45 minutos en la defensa.

## Estructura

```
asesor-de-estudio/
├── index.html              armazón de la app
├── css/
│   ├── fonts.css           Manrope, Bricolage Grotesque y Caveat incluidas
│   ├── tokens.css          sistema de diseño: color, tipografía, formas
│   ├── app.css             componentes y pantallas
│   └── shell.css           armado responsive: panel lateral / barra inferior
├── js/
│   ├── ui.js               iconos, fechas, utilidades
│   ├── data.js             estado en memoria y datos de prueba
│   ├── planner.js          generador de plan y repaso espaciado
│   ├── router.js           navegación por hash
│   ├── app.js              avisos, hojas, diálogos, arranque
│   ├── anim.js             movimiento (GSAP), gráficos (Chart.js), confetti, recorrido
│   ├── vendor/             GSAP, Chart.js y canvas-confetti
│   └── screens/            un archivo por sección (cuenta, onboarding, inicio…)
└── assets/fonts/           tipografía
```

Los tokens de color y tipografía salen del sistema de diseño del prototipo hecho en
Stitch, así que la maqueta y las pantallas del informe son el mismo producto.
