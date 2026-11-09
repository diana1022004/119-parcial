// Envoltura de un campo de formulario: etiqueta, control y mensaje de error.
// El control (input, select, textarea) llega como children.
export default function Campo({ id, etiqueta, error, ayuda, children, ancho = false }) {
  return (
    <div className={`campo ${error ? 'campo--error' : ''} ${ancho ? 'campo--ancho' : ''}`}>
      <label htmlFor={id}>
        {etiqueta} <span className="campo__obligatorio" aria-hidden="true">*</span>
      </label>
      {children}
      {error ? (
        <p className="campo__mensaje" id={`${id}-error`} role="alert">{error}</p>
      ) : (
        ayuda && <p className="campo__ayuda">{ayuda}</p>
      )}
    </div>
  )
}
