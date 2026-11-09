import L from 'leaflet'

export function crearIcono(color, { seleccionado = false, clases = '' } = {}) {
  const tam = seleccionado ? 34 : 26
  return L.divIcon({
    className: '', // quita el estilo por defecto de Leaflet
    html: `<div class="pin ${seleccionado ? 'pin--seleccionado' : ''} ${clases}" style="--color:${color}; width:${tam}px; height:${tam}px"></div>`,
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam], // la punta del pin queda sobre la coordenada
    popupAnchor: [0, -tam],
  })
}
