/* Definición de campos de los formularios de cotización, en datos.

   Los cuatro formularios (ISP, Retail, Tecnología, Otro) repetían casi todo
   el marcado a mano: cada pregunta se escribía por separado en cada uno. Acá
   cada pregunta se declara como un objeto (tipo, etiqueta, opciones) y
   CampoRenderizado la dibuja según su tipo. Agregar o modificar una pregunta
   es editar los datos en rubros-config.ts, no tocar JSX duplicado en cuatro
   lugares distintos. */

export const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm";
export const labelClass = "block text-sm font-medium text-foreground mb-1";
export const subClass   = "text-xs text-muted-foreground mb-2";

export type ValorCampo = string | string[];
export type ValoresFormulario = Record<string, ValorCampo>;

interface CampoTexto {
  tipo: "text" | "tel" | "email";
  clave: string;
  etiqueta: string;
  placeholder: string;
  autoComplete?: string;
}

interface CampoTextarea {
  tipo: "textarea";
  clave: string;
  etiqueta: string;
  placeholder: string;
  opcional?: boolean;
  filas?: number;
}

interface CampoOpciones {
  tipo: "radio" | "checkbox";
  clave: string;
  etiqueta: string;
  subtitulo?: string;
  opciones: string[];
}

export type Campo = CampoTexto | CampoTextarea | CampoOpciones;

/** Agrupa dos campos en una fila de dos columnas (p. ej. teléfono + email). */
export interface ElementoFila {
  tipo: "fila";
  campos: Campo[];
}

export type ElementoPaso = Campo | ElementoFila;

export function valorPorDefecto(campo: Campo): ValorCampo {
  return campo.tipo === "checkbox" ? [] : "";
}

// ── Selección múltiple, con "Otro" opcional ─────────────────────
export function CheckGroup({ options, value, onChange, otroTexto = "", onOtroTexto, labelId }: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  otroTexto?: string;
  onOtroTexto?: (t: string) => void;
  /** Id de la etiqueta que enuncia la pregunta, para que el grupo se anuncie con ella. */
  labelId?: string;
}) {
  const OTRO = "Otro";
  const hasOtro = options.includes(OTRO);
  const otroActivo = value.some(v => v === OTRO || v.startsWith("Otro: "));

  const toggle = (opt: string) => {
    if (opt === OTRO) {
      if (otroActivo) {
        onChange(value.filter(v => v !== OTRO && !v.startsWith("Otro: ")));
        onOtroTexto?.("");
      } else {
        onChange([...value, OTRO]);
      }
    } else {
      onChange(value.includes(opt) ? value.filter(x => x !== opt) : [...value, opt]);
    }
  };

  const handleTexto = (texto: string) => {
    onOtroTexto?.(texto);
    const sinOtro = value.filter(v => v !== OTRO && !v.startsWith("Otro: "));
    onChange(texto.trim() ? [...sinOtro, `Otro: ${texto}`] : [...sinOtro, OTRO]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={labelId}>
        {options.map(opt => {
          const isSelected = opt === OTRO ? otroActivo : value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              role="checkbox" aria-checked={isSelected}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${isSelected ? "bg-primary/15 border-primary/40 text-primary font-medium" : "border-border bg-background text-muted-foreground hover:border-primary/30"}`}>
              {opt}
            </button>
          );
        })}
      </div>
      {hasOtro && otroActivo && (
        <input
          type="text"
          value={otroTexto}
          onChange={e => handleTexto(e.target.value)}
          placeholder="Especificá cuál..."
          className="w-full px-4 py-2.5 rounded-lg border border-primary/40 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm"
          autoFocus
        />
      )}
    </div>
  );
}

// ── Selección única ──────────────────────────────────────────────
export function RadioGroup({ options, value, onChange, labelId }: {
  options: string[]; value: string; onChange: (v: string) => void; labelId?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={labelId}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          role="radio" aria-checked={value === opt}
          className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${value === opt ? "bg-primary/15 border-primary/40 text-primary font-medium" : "border-border bg-background text-muted-foreground hover:border-primary/30"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

/** Dibuja un campo según su tipo. El id se deriva del formulario y la clave, únicos dentro de un mismo rubro. */
export function CampoRenderizado({ campo, idBase, valores, actualizar, otroTextos, actualizarOtroTexto }: {
  campo: Campo;
  idBase: string;
  valores: ValoresFormulario;
  actualizar: (clave: string, valor: ValorCampo) => void;
  otroTextos: Record<string, string>;
  actualizarOtroTexto: (clave: string, texto: string) => void;
}) {
  const id = `${idBase}-${campo.clave}`;

  switch (campo.tipo) {
    case "text":
    case "tel":
    case "email":
      return (
        <div>
          <label htmlFor={id} className={labelClass}>{campo.etiqueta}</label>
          <input
            id={id} type={campo.tipo} value={(valores[campo.clave] as string) ?? ""}
            onChange={e => actualizar(campo.clave, e.target.value)}
            placeholder={campo.placeholder} autoComplete={campo.autoComplete}
            className={inputClass}
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          <label htmlFor={id} className={labelClass}>
            {campo.etiqueta}
            {campo.opcional && <span className="text-muted-foreground font-normal"> (opcional)</span>}
          </label>
          <textarea
            id={id} rows={campo.filas ?? 4} value={(valores[campo.clave] as string) ?? ""}
            onChange={e => actualizar(campo.clave, e.target.value)}
            placeholder={campo.placeholder} className={`${inputClass} resize-none`}
          />
        </div>
      );

    case "radio":
    case "checkbox":
      return (
        <div>
          <label id={id} className={labelClass}>{campo.etiqueta}</label>
          {campo.subtitulo && <p className={subClass}>{campo.subtitulo}</p>}
          {campo.tipo === "radio" ? (
            <RadioGroup labelId={id} options={campo.opciones}
              value={(valores[campo.clave] as string) ?? ""}
              onChange={v => actualizar(campo.clave, v)} />
          ) : (
            <CheckGroup labelId={id} options={campo.opciones}
              value={(valores[campo.clave] as string[]) ?? []}
              onChange={v => actualizar(campo.clave, v)}
              otroTexto={otroTextos[campo.clave] ?? ""}
              onOtroTexto={t => actualizarOtroTexto(campo.clave, t)} />
          )}
        </div>
      );
  }
}

/** Dibuja todos los elementos de un paso, agrupando en fila los que lo pidan. */
export function PasoCampos({ elementos, idBase, valores, actualizar, otroTextos, actualizarOtroTexto }: {
  elementos: ElementoPaso[];
  idBase: string;
  valores: ValoresFormulario;
  actualizar: (clave: string, valor: ValorCampo) => void;
  otroTextos: Record<string, string>;
  actualizarOtroTexto: (clave: string, texto: string) => void;
}) {
  const props = { idBase, valores, actualizar, otroTextos, actualizarOtroTexto };
  return (
    <>
      {elementos.map((elemento, i) => {
        if (elemento.tipo === "fila") {
          return (
            <div key={i} className="grid sm:grid-cols-2 gap-4">
              {elemento.campos.map(campo => <CampoRenderizado key={campo.clave} campo={campo} {...props} />)}
            </div>
          );
        }
        return <CampoRenderizado key={elemento.clave} campo={elemento} {...props} />;
      })}
    </>
  );
}
