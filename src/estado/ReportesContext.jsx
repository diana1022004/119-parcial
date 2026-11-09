import { createContext, useContext, useEffect, useState } from 'react'
import { ESTADOS } from '../data/estados.js'

const CLAVE = 'linea119:reportes'
const ReportesContext = createContext(null)

function leerGuardados() {
  try {
    const texto = localStorage.getItem(CLAVE)
    return texto ? JSON.parse(texto) : []
  } catch {
    return []
  }
}

const ahora = () => new Date().toISOString()

// Número de radicado legible: 119-AAAAMMDD-HHMMSS
function crearRadicado(fecha) {
  const d = new Date(fecha)
  const p = (n) => String(n).padStart(2, '0')
  return `119-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

export function ReportesProvider({ children }) {
  const [reportes, setReportes] = useState(leerGuardados)

  // Cada vez que cambia la lista, se guarda.
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(reportes))
    } catch {
      // Si el navegador no deja guardar (cuota llena, modo privado), la app sigue en memoria.
    }
  }, [reportes])

  // Recibe los datos del formulario y devuelve el reporte creado (con id y radicado).
  function agregarReporte(datos) {
    const creado = ahora()
    const nuevo = {
      ...datos,
      id: Date.now(),
      radicado: crearRadicado(creado),
      creado,
      estado: ESTADOS.RECIBIDO,
      historial: [{ estado: ESTADOS.RECIBIDO, hora: creado }],
      unidad: null,
      solicitudInfo: null, // extra: el operador pide más información
    }
    setReportes((lista) => [nuevo, ...lista])
    return nuevo
  }

  // Cambio genérico de campos (ej. corregir el grupo, responder la solicitud)
  function actualizarReporte(id, cambios) {
    setReportes((lista) => lista.map((r) => (r.id === id ? { ...r, ...cambios } : r)))
  }

  // Cambio de estado: además deja la hora en el historial
  function cambiarEstado(id, estado, extra = {}) {
    setReportes((lista) =>
      lista.map((r) =>
        r.id === id
          ? { ...r, ...extra, estado, historial: [...r.historial, { estado, hora: ahora() }] }
          : r
      )
    )
  }

  function borrarTodos() {
    setReportes([])
  }

  const valor = { reportes, agregarReporte, actualizarReporte, cambiarEstado, borrarTodos }
  return <ReportesContext.Provider value={valor}>{children}</ReportesContext.Provider>
}

export function useReportes() {
  const ctx = useContext(ReportesContext)
  if (!ctx) throw new Error('useReportes debe usarse dentro de <ReportesProvider>')
  return ctx
}
