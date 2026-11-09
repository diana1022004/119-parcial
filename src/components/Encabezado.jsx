import { Link } from 'react-router-dom'

// Barra superior con la identidad de Bomberos Cali / Línea 119.
// `children` permite poner acciones a la derecha según la pantalla.
export default function Encabezado({ children, oscuro = false }) {
  return (
    <header className={`encabezado ${oscuro ? 'encabezado--oscuro' : ''}`}>
      <Link to="/" className="marca" aria-label="Inicio Línea 119 Bomberos Cali">
        <span className="marca__escudo">119</span>
        <span className="marca__texto">
          <strong>Bomberos Cali</strong>
          <small>Línea de emergencias 119</small>
        </span>
      </Link>
      {children && <div className="encabezado__acciones">{children}</div>}
    </header>
  )
}
