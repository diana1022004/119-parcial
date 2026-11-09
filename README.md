# Línea 119 · Bomberos Cali — Canal digital (Parcial final Desarrollo Web 2026-2)

Prototipo web de tres pantallas para reportar emergencias al Benemérito Cuerpo de Bomberos Voluntarios de Cali: Landing, Reporte del ciudadano y Tablero del radio operador con mapa real de Cali.

Sitio desplegado: 

## Integrantes

Diana Catalina Rendón Rojas - 90703


## Qué hace cada pantalla

Landing (`/`): encabezado con identidad Línea 119, «¿Tienes una emergencia?», botón Reportar emergencia visible sin scroll, **Llamar al 119** (`tel:119`), escena 3D, «Cómo funciona», tarjetas de los 7 grupos y enlace Acceso radio operador en el pie.

Ciudadano (`/reportar`): formulario controlado organizado en las 4 preguntas del interrogatorio inicial (grupo + ¿qué ve?, teléfono de 10 dígitos, dirección + barrio + referencia + edificio con «No aplica», nombres + apellidos). El botón **Enviar reporte** está desactivado hasta que todo es válido y cada campo muestra su error al salir de él. Hasta 3 fotos con miniaturas (`URL.createObjectURL`). Al enviar: confirmación con radicado, hora, estado y línea de tiempo que cambia cuando el operador actúa.

Operador (`/operador`): mapa real con los reportes del estado global; lista con color/código, hora, barrio y estado. Al seleccionar, el mapa vuela al punto y se abre el detalle (ciudadano, emergencia, fotos, «Ver en Google Maps»). Flujo: **Llamar** (`tel:`) → **Validado** (puede corregir el grupo) o **Descartar** (falso / duplicado) → **Despachar** (solo si está Validado; Máquina, Rescate, Ambulancia o HazMat) → **Cerrar caso**.

Mapa (TODO del código base, resueltos): reportes reales en vez de `REPORTES_DEMO`; `pin--pulso` en los Recibido; nueva clase `pin--apagado` (gris, opacidad baja) en Cerrado / Descartado; popup con grupo, nombre, qué ve, ubicación y estado.

Escena 3D: camión de bomberos hecho con geometrías básicas (cajas y cilindros). `useFrame` gira las ruedas, hace rebotar el camión y hace parpadear las balizas rojo/azul con una luz que barre la escena. Interacción: al pasar el mouse el camión se agranda; con **clic** se enciende o apaga la sirena (cambian balizas, luz y velocidad de las ruedas). `OrbitControls` con autorrotación y sin zoom.

### Extra implementado (+0.5)

«Solicitar más información»: desde el detalle, el operador escribe una pregunta; al ciudadano le aparece un aviso en su pantalla de confirmación y puede responder. La respuesta vuelve al operador. Todo pasa por el estado global.

## Respuestas a las 5 preguntas de Bomberos

**1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?**
*Qué se hizo:* cada reporte guarda `lat`/`lng` y aparece como pin en un mapa real de Cali (Leaflet + OpenStreetMap), con enlace a Google Maps. En el prototipo la coordenada sale del centro del barrio elegido (el enunciado excluye las APIs del dispositivo).
*Para producción:* usar la Geolocation API del navegador (con permiso del usuario) para la coordenada GPS real, mostrar la precisión en metros y permitir al ciudadano ajustar el punto; geocodificar la dirección escrita como respaldo.

**2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?**
*Qué se hizo:* al enviar se genera un radicado (`119-AAAAMMDD-HHMMSS`), la hora y el estado; la pantalla se actualiza sola cuando el operador valida, despacha o cierra, con una línea de tiempo y la unidad asignada.
*Para producción:* backend con base de datos y actualizaciones en tiempo real (WebSockets o notificaciones push), y confirmación por SMS / WhatsApp para quien cierre la página.

**3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?**
*Qué se hizo:* el tablero cuenta pendientes y activos, la leyenda del mapa cuenta por grupo, los pines Recibido pulsan para resaltar lo que falta atender y los terminados se apagan y quedan por debajo; el operador puede descartar duplicados.
*Para producción:* filtros por grupo y estado, agrupación de pines cercanos (clustering), detección automática de posibles duplicados por cercanía y tiempo, cola compartida entre varios operadores y un servidor que escale con la carga.

**4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?**
*Qué se hizo:* el botón **Llamar** abre una llamada telefónica (`tel:`) al número del reporte; el extra «Solicitar más información» permite pedir datos por escrito sin llamar. La videollamada quedó fuera de alcance según el enunciado.
*Para producción:* videollamada con WebRTC (o un servicio como Twilio / Daily) iniciada por el operador, que llega al ciudadano como un enlace o aviso dentro de la misma página, sin instalar nada.

**5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?**
*Qué se hizo:* hasta 3 fotos con miniaturas y opción de quitar cada una, con una recomendación debajo (tomarlas desde un lugar seguro, con el sitio completo y un punto de referencia). El operador las ve en el detalle y puede ampliarlas.
*Para producción:* subir los archivos a un almacenamiento (S3, Cloud Storage), aceptar videos cortos comprimidos, conservar metadatos de hora y ubicación, y una guía visual paso a paso para tomarlos.

## Pregunta de diseño: ¿qué preguntas del protocolo se pueden omitir con foto, video o videollamada?

1. **«¿Cuál es su emergencia?» (clasificación del grupo y detalle).** Una foto muestra si hay fuego, humo, un vehículo accidentado o un cable caído; el operador confirma o corrige el grupo sin hacer varias preguntas de seguimiento sobre qué tipo de incidente es.
2. **Magnitud y condiciones del sitio (qué tan grande es, cuántos pisos, si hay humo, si se propaga).** Se ve de inmediato en la imagen y define qué unidad despachar (Máquina, Rescate, HazMat).
3. **Parte de «¿Dónde es su emergencia?» (punto de referencia y nombre del edificio).** La foto muestra fachadas, avisos y el entorno, lo que ayuda a ubicar el sitio exacto junto con la coordenada.
4. **En rescates (grupo 300), preguntas como «¿está consciente?» o «¿respira?»** se pueden evaluar en una videollamada sin depender solo de lo que describe la persona.

Lo que **no** se omite: el teléfono y el nombre (necesarios para devolver la llamada y para el registro).

## Trabajo futuro

App móvil, SMS, videollamada real, base de datos, autenticación del operador, geolocalización GPS y sincronización en tiempo real entre dispositivos.
