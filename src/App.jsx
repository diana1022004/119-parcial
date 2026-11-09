import { Routes, Route, Link } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Reportar from './pages/Reportar.jsx'
import Operador from './pages/Operador.jsx'

// Las tres pantallas del parcial. El estado compartido (ReportesProvider)
// envuelve todas las rutas desde main.jsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/reportar" element={<Reportar />} />
      <Route path="/operador" element={<Operador />} />
      <Route
        path="*"
        element={
          <main className="pagina-simple">
            <h1>Página no encontrada</h1>
            <Link to="/" className="boton boton--primario">Volver al inicio</Link>
          </main>
        }
      />
    </Routes>
  )
}
