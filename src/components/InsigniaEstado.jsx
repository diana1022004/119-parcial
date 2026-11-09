import { COLOR_ESTADO } from '../data/estados.js'

// Pastilla con el estado del reporte. Se usa en la lista del operador,
// en el detalle y en la confirmación del ciudadano.
export default function InsigniaEstado({ estado }) {
  return (
    <span className="insignia" style={{ '--color': COLOR_ESTADO[estado] ?? '#64748b' }}>
      {estado}
    </span>
  )
}
