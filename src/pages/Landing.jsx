import { Link } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import TarjetaGrupo from '../components/TarjetaGrupo.jsx'
import EscenaLanding from '../three/EscenaLanding.jsx'
import { GRUPOS } from '../data/grupos.js'

const PASOS = [
  { n: 1, titulo: 'Cuéntanos qué pasa', texto: 'Las mismas preguntas que te haría el radio operador: qué ves, dónde y quién reporta.' },
  { n: 2, titulo: 'Envía hasta 3 fotos', texto: 'Una foto le dice al operador en segundos lo que tomaría varias preguntas por teléfono.' },
  { n: 3, titulo: 'Sigue tu reporte', texto: 'Recibes un número de radicado y ves cuando tu caso es validado y la unidad va en camino.' },
]

export default function Landing() {
  return (
    <div className="landing">
      <Encabezado>
        <a href="tel:119" className="boton boton--fantasma boton--pequeno">Llamar al 119</a>
      </Encabezado>

      <main>
        {/* Héroe: el botón de reporte queda visible sin hacer scroll.
            En móvil los botones van ANTES de la escena 3D para que no la tape. */}
        <section className="heroe">
          <div className="heroe__texto">
            <p className="heroe__etiqueta">Canal digital · Línea 119</p>
            <h1>¿Tienes una emergencia?</h1>
            <p className="heroe__bajada">
              Reporta lo que está pasando con tu ubicación y fotos. Tu reporte llega directo al
              radio operador del Benemérito Cuerpo de Bomberos Voluntarios de Cali.
            </p>
            <div className="heroe__botones">
              <Link to="/reportar" className="boton boton--primario boton--grande">
                Reportar emergencia
              </Link>
              <a href="tel:119" className="boton boton--secundario boton--grande">
                Llamar al 119
              </a>
            </div>
            <p className="heroe__nota">
              Si hay personas en riesgo inmediato, llama al 119 primero.
            </p>
          </div>
          <div className="heroe__escena">
            <EscenaLanding />
          </div>
        </section>

        <section className="seccion">
          <h2>Cómo funciona</h2>
          <ol className="pasos">
            {PASOS.map((p) => (
              <li key={p.n} className="paso">
                <span className="paso__numero">{p.n}</span>
                <div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="seccion">
          <h2>Grupos de emergencia</h2>
          <p className="seccion__bajada">
            Así clasifica Bomberos Cali cada llamada. Al reportar eliges uno; si no estás seguro,
            usa el 900 y el operador lo corrige.
          </p>
          <div className="grilla-grupos">
            {GRUPOS.map((g) => (
              <TarjetaGrupo key={g.codigo} {...g} />
            ))}
          </div>
        </section>
      </main>

      <footer className="pie">
        <p>Benemérito Cuerpo de Bomberos Voluntarios de Cali · Prototipo académico (USB Cali)</p>
        <Link to="/operador" className="pie__enlace">Acceso radio operador</Link>
      </footer>
    </div>
  )
}
