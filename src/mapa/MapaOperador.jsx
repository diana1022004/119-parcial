import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'
import { GRUPOS, colorDeGrupo, nombreDeGrupo } from '../data/grupos.js'
import { ESTADOS, estaTerminado } from '../data/estados.js'
import InsigniaEstado from '../components/InsigniaEstado.jsx'

const CENTRO_CALI = [3.437, -76.522]

// Mapa REAL de Cali (OpenStreetMap a través de Leaflet). No necesita API key.
export default function MapaOperador({ reportes = [], seleccionadoId = null, onSeleccionar }) {
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  return (
    <MapContainer center={CENTRO_CALI} zoom={13} style={{ width: '100%', height: '100%' }}>
      {/* Dos estilos de mapa: el operador los cambia con el control de la esquina */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Calles (OpenStreetMap)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Oscuro (centro de control)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {reportes.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={crearIcono(colorDeGrupo(r.grupo), {
            seleccionado: r.id === seleccionadoId,
            clases: clasesDelPin(r.estado),
          })}
          // Los terminados quedan debajo de los activos
          zIndexOffset={estaTerminado(r.estado) ? -1000 : 0}
          eventHandlers={{ click: () => onSeleccionar?.(r.id) }}
        >
          <Popup>
            <div className="popup">
              <strong style={{ color: colorDeGrupo(r.grupo) }}>
                {r.grupo} · {nombreDeGrupo(r.grupo)}
              </strong>
              <span className="popup__nombre">{r.nombres} {r.apellidos}</span>
              <span className="popup__queve">«{r.queVe}»</span>
              <span>{r.barrio} · {r.direccion}</span>
              <InsigniaEstado estado={r.estado} />
            </div>
          </Popup>
        </Marker>
      ))}

      <IrAlSeleccionado reporte={seleccionado} />
      <Leyenda reportes={reportes} />
    </MapContainer>
  )
}

// Recibido → pulso (necesita atención); Cerrado / Descartado → apagado
function clasesDelPin(estado) {
  if (estado === ESTADOS.RECIBIDO) return 'pin--pulso'
  if (estaTerminado(estado)) return 'pin--apagado'
  return ''
}

// Cuando se selecciona un reporte (desde la lista o el mapa), el mapa vuela hasta él.
function IrAlSeleccionado({ reporte }) {
  const map = useMap()
  // Depende del id (no del objeto) para no volar otra vez cada vez que cambia el estado
  const id = reporte?.id
  useEffect(() => {
    if (reporte) map.flyTo([reporte.lat, reporte.lng], 16, { duration: 0.8 })
  }, [id, map]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// Leyenda fija en la esquina inferior izquierda: color y conteo por grupo.
function Leyenda({ reportes }) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leyenda">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>REPORTES · {reportes.length}</div>
        <div className="leyenda__estados">
          <span><i className="leyenda__muestra leyenda__muestra--pulso" /> Recibido</span>
          <span><i className="leyenda__muestra leyenda__muestra--apagado" /> Cerrado / Descartado</span>
        </div>
        {GRUPOS.map((g) => {
          const n = reportes.filter((r) => r.grupo === g.codigo).length
          return (
            <div key={g.codigo} className="leyenda__fila" style={{ opacity: n ? 1 : 0.45 }}>
              <span className="leyenda__punto" style={{ background: g.color }} />
              <span style={{ width: 28, color: '#94a3b8' }}>{g.codigo}</span>
              <span style={{ flex: 1 }}>{g.nombre}</span>
              <strong>{n}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}
