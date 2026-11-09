import { useState } from 'react'
import InsigniaEstado from './InsigniaEstado.jsx'
import InsigniaGrupo from './InsigniaGrupo.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { ESTADOS, FLUJO, MENSAJE_ESTADO } from '../data/estados.js'
import { formatearHora, formatearFechaHora } from '../utilidades.js'

// Respuesta automática al ciudadano: radicado, hora y estado.
// Lee el reporte del estado global, así que cuando el operador lo actualiza
// esta pantalla cambia sola.
export default function Confirmacion({ reporte, onNuevoReporte }) {
  const descartado = reporte.estado === ESTADOS.DESCARTADO
  const indiceActual = FLUJO.indexOf(reporte.estado)
  const horaDe = (estado) => reporte.historial.find((h) => h.estado === estado)?.hora

  return (
    <section className="confirmacion" aria-live="polite">
      <div className="confirmacion__cabeza">
        <span className="confirmacion__check" aria-hidden="true">✓</span>
        <div>
          <h1>Reporte recibido</h1>
          <p>Esta es la respuesta automática de la Línea 119. No cierres esta página.</p>
        </div>
      </div>

      <dl className="confirmacion__datos">
        <div><dt>Radicado</dt><dd className="radicado">{reporte.radicado}</dd></div>
        <div><dt>Hora</dt><dd>{formatearFechaHora(reporte.creado)}</dd></div>
        <div><dt>Estado</dt><dd><InsigniaEstado estado={reporte.estado} /></dd></div>
        <div><dt>Grupo</dt><dd><InsigniaGrupo codigo={reporte.grupo} conNombre /></dd></div>
      </dl>

      <p className={`confirmacion__mensaje ${descartado ? 'confirmacion__mensaje--alerta' : ''}`}>
        {MENSAJE_ESTADO[reporte.estado]}
        {reporte.estado === ESTADOS.DESPACHADO && reporte.unidad && (
          <> Unidad asignada: <strong>{reporte.unidad}</strong>.</>
        )}
      </p>

      {reporte.solicitudInfo && <AvisoSolicitud reporte={reporte} />}

      {!descartado && (
        <ol className="linea-tiempo">
          {FLUJO.map((estado, i) => {
            const hecho = i <= indiceActual
            return (
              <li key={estado} className={`linea-tiempo__paso ${hecho ? 'is-hecho' : ''} ${i === indiceActual ? 'is-actual' : ''}`}>
                <span className="linea-tiempo__punto" />
                <span className="linea-tiempo__nombre">{estado}</span>
                <span className="linea-tiempo__hora">{horaDe(estado) ? formatearHora(horaDe(estado)) : '—'}</span>
              </li>
            )
          })}
        </ol>
      )}

      <div className="confirmacion__acciones">
        <a href="tel:119" className="boton boton--secundario">Llamar al 119</a>
        <button type="button" className="boton boton--fantasma" onClick={onNuevoReporte}>
          Hacer otro reporte
        </button>
      </div>
    </section>
  )
}

// EXTRA: el operador pidió más información; el ciudadano la ve aquí y responde.
function AvisoSolicitud({ reporte }) {
  const { actualizarReporte } = useReportes()
  const [texto, setTexto] = useState('')
  const { mensaje, hora, respuesta } = reporte.solicitudInfo

  function responder(e) {
    e.preventDefault()
    if (!texto.trim()) return
    actualizarReporte(reporte.id, {
      solicitudInfo: { ...reporte.solicitudInfo, respuesta: texto.trim(), horaRespuesta: new Date().toISOString() },
    })
    setTexto('')
  }

  return (
    <div className="aviso-info" role="alert">
      <p className="aviso-info__titulo">
        El radio operador necesita más información · {formatearHora(hora)}
      </p>
      <p className="aviso-info__mensaje">«{mensaje}»</p>
      {respuesta ? (
        <p className="aviso-info__respuesta">Tu respuesta: {respuesta}</p>
      ) : (
        <form onSubmit={responder} className="aviso-info__form">
          <label htmlFor="respuesta-info" className="sr-only">Tu respuesta</label>
          <input
            id="respuesta-info"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu respuesta"
          />
          <button type="submit" className="boton boton--primario" disabled={!texto.trim()}>Responder</button>
        </form>
      )}
    </div>
  )
}
