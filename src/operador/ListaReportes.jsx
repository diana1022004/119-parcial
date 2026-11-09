import InsigniaEstado from '../components/InsigniaEstado.jsx'
import InsigniaGrupo from '../components/InsigniaGrupo.jsx'
import { estaTerminado } from '../data/estados.js'
import { formatearHora } from '../utilidades.js'

// Lista de reportes: color y código del grupo, hora, barrio y estado.
// Al hacer clic se selecciona (el mapa vuela al punto y se abre el detalle).
export default function ListaReportes({ reportes, seleccionadoId, onSeleccionar }) {
  if (reportes.length === 0) {
    return (
      <div className="lista-vacia">
        <p>Aún no hay reportes.</p>
        <p>Abre <strong>/reportar</strong>, envía uno y vuelve aquí.</p>
      </div>
    )
  }

  return (
    <ul className="lista-reportes">
      {reportes.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onSeleccionar(r.id)}
            className={`item-reporte ${r.id === seleccionadoId ? 'is-seleccionado' : ''} ${estaTerminado(r.estado) ? 'is-terminado' : ''}`}
          >
            <InsigniaGrupo codigo={r.grupo} />
            <span className="item-reporte__cuerpo">
              <span className="item-reporte__barrio">{r.barrio}</span>
              <span className="item-reporte__meta">
                {formatearHora(r.creado)} · {r.radicado}
                {r.solicitudInfo?.respuesta && !r.solicitudInfo.vista && ' · 💬 respuesta'}
              </span>
            </span>
            <InsigniaEstado estado={r.estado} />
          </button>
        </li>
      ))}
    </ul>
  )
}
