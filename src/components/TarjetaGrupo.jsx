// Tarjeta de un grupo de emergencia (landing). Recibe el grupo por props.
export default function TarjetaGrupo({ codigo, nombre, color, ejemplos }) {
  return (
    <article className="tarjeta-grupo" style={{ '--color': color }}>
      <span className="tarjeta-grupo__codigo">{codigo}</span>
      <h3>{nombre}</h3>
      <p>{ejemplos}</p>
    </article>
  )
}
