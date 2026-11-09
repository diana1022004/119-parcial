import { useState } from 'react'
import { Link } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import MapaOperador from '../mapa/MapaOperador.jsx'
import ListaReportes from '../operador/ListaReportes.jsx'
import DetalleReporte from '../operador/DetalleReporte.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { ESTADOS, estaTerminado } from '../data/estados.js'

export default function Operador() {
  // Reportes reales del estado global (los que envía el ciudadano desde /reportar)
  const { reportes } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  const pendientes = reportes.filter((r) => r.estado === ESTADOS.RECIBIDO).length
  const activos = reportes.filter((r) => !estaTerminado(r.estado)).length

  return (
    <div className="operador">
      <Encabezado oscuro>
        <span className="contador">Pendientes <strong>{pendientes}</strong></span>
        <span className="contador">Activos <strong>{activos}</strong></span>
        <Link to="/" className="boton boton--fantasma-oscuro boton--pequeno">Salir</Link>
      </Encabezado>

      <div className="operador__cuerpo">
        <div className="operador__mapa">
          <MapaOperador
            reportes={reportes}
            seleccionadoId={seleccionadoId}
            onSeleccionar={setSeleccionadoId}
          />
        </div>

        <aside className="operador__panel">
          {seleccionado ? (
            <DetalleReporte reporte={seleccionado} onCerrar={() => setSeleccionadoId(null)} />
          ) : (
            <>
              <h2 className="operador__titulo">Reportes · {reportes.length}</h2>
              <ListaReportes
                reportes={reportes}
                seleccionadoId={seleccionadoId}
                onSeleccionar={setSeleccionadoId}
              />
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
