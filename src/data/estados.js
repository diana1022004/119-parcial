// Estados del reporte según el flujo de despacho:
// Recibido → Validado → Unidad despachada → Cerrado (o Descartado)
export const ESTADOS = {
  RECIBIDO: 'Recibido',
  VALIDADO: 'Validado',
  DESPACHADO: 'Unidad despachada',
  CERRADO: 'Cerrado',
  DESCARTADO: 'Descartado',
}

// Orden de la línea de tiempo que ve el ciudadano (Descartado se muestra aparte)
export const FLUJO = [ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO]

// Color de la insignia de cada estado (independiente del color del grupo)
export const COLOR_ESTADO = {
  [ESTADOS.RECIBIDO]: '#f59e0b',
  [ESTADOS.VALIDADO]: '#3b82f6',
  [ESTADOS.DESPACHADO]: '#10b981',
  [ESTADOS.CERRADO]: '#64748b',
  [ESTADOS.DESCARTADO]: '#9ca3af',
}

// Mensaje que recibe el ciudadano en su respuesta automática
export const MENSAJE_ESTADO = {
  [ESTADOS.RECIBIDO]: 'Tu reporte llegó a la central. Un radio operador lo está revisando.',
  [ESTADOS.VALIDADO]: 'Un radio operador confirmó tu emergencia y está asignando una unidad.',
  [ESTADOS.DESPACHADO]: 'Una unidad de Bomberos va en camino. Mantente en un lugar seguro.',
  [ESTADOS.CERRADO]: 'La atención de esta emergencia terminó. Gracias por reportar.',
  [ESTADOS.DESCARTADO]: 'El reporte fue descartado (falso o duplicado). Si la emergencia sigue, llama al 119.',
}

export const UNIDADES = ['Máquina', 'Rescate', 'Ambulancia', 'HazMat']

// Un reporte "terminado" ya no necesita atención: su pin se ve apagado
export const estaTerminado = (estado) =>
  estado === ESTADOS.CERRADO || estado === ESTADOS.DESCARTADO
