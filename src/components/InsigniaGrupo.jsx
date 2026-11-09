import { GRUPOS, colorDeGrupo } from '../data/grupos.js'

// Código del grupo sobre su color (el mismo color que el pin del mapa).
export default function InsigniaGrupo({ codigo, conNombre = false }) {
  const grupo = GRUPOS.find((g) => g.codigo === codigo)
  return (
    <span className="insignia-grupo">
      <span className="insignia-grupo__codigo" style={{ background: colorDeGrupo(codigo) }}>
        {codigo}
      </span>
      {conNombre && grupo && <span>{grupo.nombre}</span>}
    </span>
  )
}
