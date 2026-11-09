import { useState } from 'react'
import { Link } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import Campo from '../components/Campo.jsx'
import SubidaFotos from '../components/SubidaFotos.jsx'
import Confirmacion from '../components/Confirmacion.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { BARRIOS } from '../data/barrios.js'
import { comprimirImagen } from '../utilidades.js'

// Recordamos cuál fue el último reporte de este ciudadano para volver a mostrarle
// su confirmación (y el estado actualizado) si entra otra vez a /reportar.
const CLAVE_MI_REPORTE = 'linea119:miReporte'

const VACIO = {
  nombres: '', apellidos: '', telefono: '',
  grupo: '', queVe: '',
  direccion: '', barrio: '', referencia: '', edificio: '', edificioNoAplica: false,
}

// Reglas de validación: cada pregunta del interrogatorio inicial → campos obligatorios.
// Devuelve un objeto { campo: 'mensaje de error' } solo con los campos que fallan.
function validar(d) {
  const e = {}
  if (!d.nombres.trim()) e.nombres = 'Escribe tus nombres.'
  if (!d.apellidos.trim()) e.apellidos = 'Escribe tus apellidos.'
  if (!/^\d{10}$/.test(d.telefono)) e.telefono = 'El teléfono debe tener 10 dígitos, solo números.'
  if (!d.grupo) e.grupo = 'Elige el grupo de emergencia.'
  if (d.queVe.trim().length < 10) e.queVe = 'Describe lo que ves (mínimo 10 caracteres).'
  if (!d.direccion.trim()) e.direccion = 'Escribe la dirección.'
  if (!d.barrio) e.barrio = 'Elige el barrio.'
  if (!d.referencia.trim()) e.referencia = 'Escribe un punto de referencia.'
  if (!d.edificioNoAplica && !d.edificio.trim()) e.edificio = 'Escribe el nombre del edificio o marca «No aplica».'
  return e
}

function leerMiReporte() {
  try { return Number(localStorage.getItem(CLAVE_MI_REPORTE)) || null } catch { return null }
}

export default function Reportar() {
  const { reportes, agregarReporte } = useReportes()
  const [datos, setDatos] = useState(VACIO)
  const [tocados, setTocados] = useState({})
  const [fotos, setFotos] = useState([])
  const [avisoFotos, setAvisoFotos] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [miReporteId, setMiReporteId] = useState(leerMiReporte)

  const miReporte = reportes.find((r) => r.id === miReporteId)
  const errores = validar(datos)
  const esValido = Object.keys(errores).length === 0
  // El error se muestra cuando el usuario ya pasó por el campo
  const errorDe = (campo) => (tocados[campo] ? errores[campo] : undefined)

  function cambiar(e) {
    const { name, value, type, checked } = e.target
    let valor = type === 'checkbox' ? checked : value
    if (name === 'telefono') valor = value.replace(/\D/g, '').slice(0, 10)
    if (name === 'grupo') valor = value ? Number(value) : ''
    setDatos((d) => ({ ...d, [name]: valor }))
  }

  const tocar = (e) => setTocados((t) => ({ ...t, [e.target.name]: true }))

  async function enviar(e) {
    e.preventDefault()
    if (!esValido || enviando) return
    setEnviando(true)
    const barrio = BARRIOS.find((b) => b.nombre === datos.barrio)
    // Las fotos se guardan comprimidas para que sigan visibles tras recargar
    const fotosGuardadas = await Promise.all(fotos.map((f) => comprimirImagen(f.file).catch(() => null)))
    const nuevo = agregarReporte({
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      telefono: datos.telefono,
      grupo: datos.grupo,
      queVe: datos.queVe.trim(),
      direccion: datos.direccion.trim(),
      barrio: barrio.nombre,
      // Centro del barrio con un pequeño desplazamiento (±100 m) para que
      // dos reportes del mismo barrio no queden en el mismo pin del mapa.
      lat: Number((barrio.lat + (Math.random() - 0.5) * 0.002).toFixed(6)),
      lng: Number((barrio.lng + (Math.random() - 0.5) * 0.002).toFixed(6)),
      referencia: datos.referencia.trim(),
      edificio: datos.edificioNoAplica ? 'No aplica' : datos.edificio.trim(),
      fotos: fotosGuardadas.filter(Boolean),
    })
    try { localStorage.setItem(CLAVE_MI_REPORTE, String(nuevo.id)) } catch { /* sin almacenamiento */ }
    setMiReporteId(nuevo.id)
    setEnviando(false)
    window.scrollTo(0, 0)
  }

  function nuevoReporte() {
    try { localStorage.removeItem(CLAVE_MI_REPORTE) } catch { /* sin almacenamiento */ }
    setMiReporteId(null)
    setDatos(VACIO)
    setTocados({})
    setFotos([])
  }

  return (
    <div className="pagina-ciudadano">
      <Encabezado>
        <a href="tel:119" className="boton boton--fantasma boton--pequeno">Llamar al 119</a>
      </Encabezado>

      <main className="contenedor-estrecho">
        {miReporte ? (
          <Confirmacion reporte={miReporte} onNuevoReporte={nuevoReporte} />
        ) : (
          <form onSubmit={enviar} noValidate className="formulario">
            <Link to="/" className="volver">← Volver</Link>
            <h1>Reportar emergencia</h1>
            <p className="formulario__bajada">
              Responde lo que te preguntaría el radio operador. Todos los campos con * son obligatorios.
            </p>

            {/* Pregunta 1: «¿Cuál es su emergencia?» */}
            <fieldset className="bloque">
              <legend>1 · ¿Cuál es su emergencia?</legend>
              <Campo id="grupo" etiqueta="Grupo de emergencia" error={errorDe('grupo')} ancho>
                <div className="selector-grupos" role="radiogroup" aria-label="Grupo de emergencia">
                  {GRUPOS.map((g) => (
                    <label
                      key={g.codigo}
                      className={`opcion-grupo ${datos.grupo === g.codigo ? 'is-activa' : ''}`}
                      style={{ '--color': colorDeGrupo(g.codigo) }}
                    >
                      <input
                        type="radio"
                        name="grupo"
                        value={g.codigo}
                        checked={datos.grupo === g.codigo}
                        onChange={cambiar}
                        onBlur={tocar}
                      />
                      <span className="opcion-grupo__codigo">{g.codigo}</span>
                      <span className="opcion-grupo__nombre">{g.nombre}</span>
                    </label>
                  ))}
                </div>
              </Campo>
              <Campo id="queVe" etiqueta="¿Qué ve?" error={errorDe('queVe')} ancho
                ayuda="Ej.: sale humo negro del segundo piso de una casa, hay personas en la calle.">
                <textarea id="queVe" name="queVe" rows={3} value={datos.queVe}
                  onChange={cambiar} onBlur={tocar} aria-invalid={!!errorDe('queVe')} />
              </Campo>
            </fieldset>

            {/* Pregunta 2: «¿De qué número me llama?» */}
            <fieldset className="bloque">
              <legend>2 · ¿De qué número nos reporta?</legend>
              <Campo id="telefono" etiqueta="Teléfono" error={errorDe('telefono')} ayuda="10 dígitos, sin espacios.">
                <input id="telefono" name="telefono" inputMode="numeric" autoComplete="tel"
                  value={datos.telefono} onChange={cambiar} onBlur={tocar}
                  placeholder="3001234567" aria-invalid={!!errorDe('telefono')} />
              </Campo>
            </fieldset>

            {/* Pregunta 3: «¿Dónde es su emergencia?» */}
            <fieldset className="bloque">
              <legend>3 · ¿Dónde es su emergencia?</legend>
              <div className="fila-campos">
                <Campo id="direccion" etiqueta="Dirección" error={errorDe('direccion')}>
                  <input id="direccion" name="direccion" value={datos.direccion}
                    onChange={cambiar} onBlur={tocar} placeholder="Calle 5 # 38-20"
                    aria-invalid={!!errorDe('direccion')} />
                </Campo>
                <Campo id="barrio" etiqueta="Barrio" error={errorDe('barrio')}>
                  <select id="barrio" name="barrio" value={datos.barrio}
                    onChange={cambiar} onBlur={tocar} aria-invalid={!!errorDe('barrio')}>
                    <option value="">Elige un barrio…</option>
                    {BARRIOS.map((b) => (
                      <option key={b.nombre} value={b.nombre}>{b.nombre}</option>
                    ))}
                  </select>
                </Campo>
              </div>
              <Campo id="referencia" etiqueta="Punto de referencia" error={errorDe('referencia')} ancho
                ayuda="Ej.: frente al parque, al lado de la droguería.">
                <input id="referencia" name="referencia" value={datos.referencia}
                  onChange={cambiar} onBlur={tocar} aria-invalid={!!errorDe('referencia')} />
              </Campo>
              <Campo id="edificio" etiqueta="Nombre del edificio" error={errorDe('edificio')} ancho>
                <input id="edificio" name="edificio" value={datos.edificio}
                  onChange={cambiar} onBlur={tocar} disabled={datos.edificioNoAplica}
                  aria-invalid={!!errorDe('edificio')} />
                <label className="casilla">
                  <input type="checkbox" name="edificioNoAplica" checked={datos.edificioNoAplica}
                    onChange={cambiar} />
                  No aplica
                </label>
              </Campo>
            </fieldset>

            {/* Pregunta 4: «¿Cuál es su nombre?» */}
            <fieldset className="bloque">
              <legend>4 · ¿Cuál es su nombre?</legend>
              <div className="fila-campos">
                <Campo id="nombres" etiqueta="Nombres" error={errorDe('nombres')}>
                  <input id="nombres" name="nombres" autoComplete="given-name" value={datos.nombres}
                    onChange={cambiar} onBlur={tocar} aria-invalid={!!errorDe('nombres')} />
                </Campo>
                <Campo id="apellidos" etiqueta="Apellidos" error={errorDe('apellidos')}>
                  <input id="apellidos" name="apellidos" autoComplete="family-name" value={datos.apellidos}
                    onChange={cambiar} onBlur={tocar} aria-invalid={!!errorDe('apellidos')} />
                </Campo>
              </div>
            </fieldset>

            <fieldset className="bloque">
              <legend>Fotos (hasta 3)</legend>
              <SubidaFotos fotos={fotos} onCambiar={setFotos} aviso={avisoFotos} onAviso={setAvisoFotos} />
            </fieldset>

            <div className="formulario__enviar">
              {!esValido && (
                <p className="campo__ayuda">
                  Faltan {Object.keys(errores).length} campo(s) obligatorio(s) para poder enviar.
                </p>
              )}
              <button type="submit" className="boton boton--primario boton--grande" disabled={!esValido || enviando}>
                {enviando ? 'Enviando…' : 'Enviar reporte'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
