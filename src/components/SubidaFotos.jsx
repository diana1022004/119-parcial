import { useEffect, useRef } from 'react'

export const MAX_FOTOS = 3

// Selector de hasta 3 fotos con miniaturas.
// fotos: [{ file, url }]  — url viene de URL.createObjectURL (solo previsualización)
export default function SubidaFotos({ fotos, onCambiar, aviso, onAviso }) {
  const input = useRef()

  function alElegir(e) {
    const elegidas = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'))
    const espacio = MAX_FOTOS - fotos.length
    const nuevas = elegidas.slice(0, espacio).map((file) => ({ file, url: URL.createObjectURL(file) }))
    onAviso(elegidas.length > espacio ? `Solo se permiten ${MAX_FOTOS} fotos; se agregaron las primeras.` : '')
    onCambiar([...fotos, ...nuevas])
    e.target.value = '' // permite volver a elegir la misma foto
  }

  function quitar(url) {
    URL.revokeObjectURL(url)
    onCambiar(fotos.filter((f) => f.url !== url))
    onAviso('')
  }

  // Al salir de la pantalla se liberan las URLs de previsualización
  const fotosRef = useRef(fotos)
  fotosRef.current = fotos
  useEffect(() => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])

  return (
    <div className="fotos">
      <div className="fotos__grilla">
        {fotos.map((f, i) => (
          <figure key={f.url} className="fotos__miniatura">
            <img src={f.url} alt={`Foto ${i + 1} del reporte`} />
            <button type="button" onClick={() => quitar(f.url)} aria-label={`Quitar foto ${i + 1}`}>×</button>
          </figure>
        ))}
        {fotos.length < MAX_FOTOS && (
          <button type="button" className="fotos__agregar" onClick={() => input.current.click()}>
            <span aria-hidden="true">＋</span>
            Agregar foto
            <small>{fotos.length}/{MAX_FOTOS}</small>
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/*"
        onChange={alElegir}
        hidden
      />
      {aviso && <p className="campo__mensaje">{aviso}</p>}
      <p className="campo__ayuda">
        Opcional. Toma la foto desde un lugar seguro, con el sitio completo y algún punto de referencia visible.
      </p>
    </div>
  )
}
