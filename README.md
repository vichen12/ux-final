# Asesor de Estudio — maqueta funcional

Prototipo navegable del MVP. Proyecto final de **Diseño UX-UI**, Grupo C «Figma locos»,
Universidad Tecnológica Nacional, Facultad Regional Mendoza.

## Cómo abrirla

Doble click en **`index.html`**. Nada más: no hay que instalar ni compilar nada, y
funciona sin internet (la tipografía va incluida).

En una pantalla grande se ve dentro de un teléfono, con una columna al costado que
explica qué es. En un celular ocupa toda la pantalla.

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

## Publicarla en Vercel

Es un sitio estático: no tiene build ni dependencias.

1. En vercel.com: **Add New → Project** e importá este repositorio (`vichen12/ux-final`).
2. Root Directory: la raíz del repo, donde está `index.html`.
3. Framework Preset: **Other**. Build Command y Output Directory: dejalos vacíos.
4. En **Project Name** poné `asesor-de-estudio-grupo-c` para que la URL quede
   `https://asesor-de-estudio-grupo-c.vercel.app`, que es la que figura en la presentación.
   Si ese nombre está tomado, usá otro y cambiá el link en las diapositivas 61 y 77.
5. **Deploy**.

Alternativa sin GitHub: `npm i -g vercel` y, dentro de esta carpeta, `vercel --prod`.

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
│   ├── fonts.css           Manrope incluida (funciona sin internet)
│   ├── tokens.css          sistema de diseño: color, tipografía, formas
│   └── app.css             componentes y pantallas
├── js/
│   ├── ui.js               iconos, fechas, utilidades
│   ├── data.js             estado en memoria y datos de prueba
│   ├── planner.js          generador de plan y repaso espaciado
│   ├── router.js           navegación por hash
│   ├── app.js              avisos, hojas, diálogos, arranque
│   └── screens/            un archivo por sección (cuenta, onboarding, inicio…)
└── assets/fonts/           tipografía
```

Los tokens de color y tipografía salen del sistema de diseño del prototipo hecho en
Stitch, así que la maqueta y las pantallas del informe son el mismo producto.
