import { useEffect, useState } from 'react'
import InsigniaEstado from '../components/InsigniaEstado.jsx'
import InsigniaGrupo from '../components/InsigniaGrupo.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { GRUPOS } from '../data/grupos.js'
import { ESTADOS, UNIDADES } from '../data/estados.js'
import { enlaceGoogleMaps, formatearHora } from '../utilidades.js'

// Detalle del reporte seleccionado + acciones del operador:
// Llamar → Validar (puede corregir el grupo) o Descartar → Despachar unidad → Cerrar.
export default function DetalleReporte({ reporte, onCerrar }) {
  const { cambiarEstado } = useReportes()
  const [grupo, setGrupo] = useState(reporte.grupo)
  const [unidad, setUnidad] = useState('')
  const [fotoAmpliada, setFotoAmpliada] = useState(null)

  // Si el operador cambia de reporte, se reinician los controles
  useEffect(() => {
    setGrupo(reporte.grupo)
    setUnidad('')
    setFotoAmpliada(null)
  }, [reporte.id, reporte.grupo])

  const { estado } = reporte
  const puedeValidar = estado === ESTADOS.RECIBIDO
  const puedeDespachar = estado === ESTADOS.VALIDADO // regla clave: solo casos validados
  const puedeCerrar = estado === ESTADOS.DESPACHADO

  return (
    <article className="detalle">
      <header className="detalle__cabeza">
        <div>
          <p className="detalle__radicado">{reporte.radicado} · {formatearHora(reporte.creado)}</p>
          <h3><InsigniaGrupo codigo={reporte.grupo} conNombre /></h3>
        </div>
        <button type="button" className="detalle__cerrar" onClick={onCerrar} aria-label="Cerrar detalle">×</button>
      </header>

      <InsigniaEstado estado={estado} />
      {reporte.unidad && <span className="detalle__unidad">Unidad: {reporte.unidad}</span>}

      <section className="detalle__seccion">
        <h4>¿Qué ve?</h4>
        <p>{reporte.queVe}</p>
      </section>

      <section className="detalle__seccion">
        <h4>Ubicación</h4>
        <dl className="detalle__dl">
          <dt>Dirección</dt><dd>{reporte.direccion}</dd>
          <dt>Barrio</dt><dd>{reporte.barrio}</dd>
          <dt>Referencia</dt><dd>{reporte.referencia}</dd>
          <dt>Edificio</dt><dd>{reporte.edificio}</dd>
        </dl>
        <a className="enlace" href={enlaceGoogleMaps(reporte.lat, reporte.lng)} target="_blank" rel="noreferrer">
          Ver en Google Maps ↗
        </a>
      </section>

      <section className="detalle__seccion">
        <h4>Ciudadano</h4>
        <dl className="detalle__dl">
          <dt>Nombre</dt><dd>{reporte.nombres} {reporte.apellidos}</dd>
          <dt>Teléfono</dt><dd>{reporte.telefono}</dd>
        </dl>
      </section>

      {reporte.fotos?.length > 0 && (
        <section className="detalle__seccion">
          <h4>Fotos ({reporte.fotos.length})</h4>
          <div className="detalle__fotos">
            {reporte.fotos.map((src, i) => (
              <button key={i} type="button" onClick={() => setFotoAmpliada(src)} aria-label={`Ampliar foto ${i + 1}`}>
                <img src={src} alt={`Foto ${i + 1} del reporte`} />
              </button>
            ))}
          </div>
          {fotoAmpliada && (
            <button type="button" className="foto-ampliada" onClick={() => setFotoAmpliada(null)} aria-label="Cerrar foto">
              <img src={fotoAmpliada} alt="Foto ampliada" />
            </button>
          )}
        </section>
      )}

      {/* ---- Acciones ---- */}
      <section className="detalle__seccion acciones">
        <h4>1 · Contactar y validar</h4>
        <a href={`tel:${reporte.telefono}`} className="boton boton--secundario boton--bloque">
           Llamar al {reporte.telefono}
        </a>

        {puedeValidar && (
          <>
            <label className="etiqueta-operador" htmlFor="grupo-validar">Grupo (corregir si hace falta)</label>
            <select id="grupo-validar" value={grupo} onChange={(e) => setGrupo(Number(e.target.value))}>
              {GRUPOS.map((g) => <option key={g.codigo} value={g.codigo}>{g.codigo} · {g.nombre}</option>)}
            </select>
            <div className="acciones__fila">
              <button type="button" className="boton boton--azul"
                onClick={() => cambiarEstado(reporte.id, ESTADOS.VALIDADO, { grupo })}>
                Validado
              </button>
              <button type="button" className="boton boton--fantasma-oscuro"
                onClick={() => cambiarEstado(reporte.id, ESTADOS.DESCARTADO, { motivo: 'Falso' })}>
                Descartar: falso
              </button>
              <button type="button" className="boton boton--fantasma-oscuro"
                onClick={() => cambiarEstado(reporte.id, ESTADOS.DESCARTADO, { motivo: 'Duplicado' })}>
                Descartar: duplicado
              </button>
            </div>
          </>
        )}
        {estado === ESTADOS.DESCARTADO && (
          <p className="nota-operador">Descartado ({reporte.motivo ?? 'sin motivo'}).</p>
        )}

        <h4>2 · Despachar</h4>
        <select
          aria-label="Unidad a despachar"
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
          disabled={!puedeDespachar}
        >
          <option value="">Elige la unidad…</option>
          {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <button
          type="button"
          className="boton boton--verde boton--bloque"
          disabled={!puedeDespachar || !unidad}
          onClick={() => cambiarEstado(reporte.id, ESTADOS.DESPACHADO, { unidad })}
        >
          Despachar unidad
        </button>
        {puedeValidar && <p className="nota-operador">Primero valida el caso para poder despachar.</p>}

        <button
          type="button"
          className="boton boton--fantasma-oscuro boton--bloque"
          disabled={!puedeCerrar}
          onClick={() => cambiarEstado(reporte.id, ESTADOS.CERRADO)}
        >
          Cerrar caso
        </button>
      </section>

      <SolicitarInformacion reporte={reporte} />
    </article>
  )
}

// EXTRA: «Solicitar más información». El mensaje aparece en la pantalla del ciudadano
// y su respuesta vuelve aquí (todo por el estado global).
function SolicitarInformacion({ reporte }) {
  const { actualizarReporte } = useReportes()
  const [mensaje, setMensaje] = useState('')
  const solicitud = reporte.solicitudInfo
  const terminado = reporte.estado === ESTADOS.CERRADO || reporte.estado === ESTADOS.DESCARTADO

  // Al abrir un reporte con respuesta nueva, se marca como vista
  useEffect(() => {
    if (solicitud?.respuesta && !solicitud.vista) {
      actualizarReporte(reporte.id, { solicitudInfo: { ...solicitud, vista: true } })
    }
  }, [reporte.id, solicitud]) // eslint-disable-line react-hooks/exhaustive-deps

  function enviar(e) {
    e.preventDefault()
    if (!mensaje.trim()) return
    actualizarReporte(reporte.id, {
      solicitudInfo: { mensaje: mensaje.trim(), hora: new Date().toISOString(), respuesta: null },
    })
    setMensaje('')
  }

  return (
    <section className="detalle__seccion solicitud">
      <h4>Solicitar más información <span className="etiqueta-extra">extra</span></h4>
      {solicitud && (
        <div className="solicitud__hilo">
          <p><strong>Tú ({formatearHora(solicitud.hora)}):</strong> {solicitud.mensaje}</p>
          <p>
            <strong>Ciudadano:</strong>{' '}
            {solicitud.respuesta ?? <em>esperando respuesta…</em>}
          </p>
        </div>
      )}
      {!terminado && (
        <form onSubmit={enviar} className="solicitud__form">
          <input
            aria-label="Mensaje para el ciudadano"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Ej.: ¿Hay personas atrapadas?"
          />
          <button type="submit" className="boton boton--azul" disabled={!mensaje.trim()}>
            {solicitud ? 'Nueva solicitud' : 'Enviar'}
          </button>
        </form>
      )}
    </section>
  )
}
