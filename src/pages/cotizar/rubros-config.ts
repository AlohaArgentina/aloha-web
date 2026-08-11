import type { Campo, ElementoFila, ElementoPaso, ValoresFormulario } from "./campos";
import { valorPorDefecto } from "./campos";

export interface Paso {
  titulo: string;
  subtitulo: string;
  /** Clase de Tailwind para el espaciado vertical entre preguntas del paso. */
  espaciado: string;
  elementos: ElementoPaso[];
}

export interface RubroFormConfig {
  /** Nombre del formulario que espera Netlify Forms (debe existir su espejo en index.html). */
  formName: string;
  posthogSector: string;
  notaFinal: string;
  pasos: Paso[];
  construirPayload: (valores: ValoresFormulario) => Record<string, string>;
}

export function valoresIniciales(config: RubroFormConfig): ValoresFormulario {
  const valores: ValoresFormulario = {};
  for (const paso of config.pasos) {
    for (const elemento of paso.elementos) {
      const campos = elemento.tipo === "fila" ? elemento.campos : [elemento];
      for (const campo of campos) valores[campo.clave] = valorPorDefecto(campo);
    }
  }
  return valores;
}

const texto = (v: ValoresFormulario, clave: string): string => (v[clave] as string) ?? "";
const lista = (v: ValoresFormulario, clave: string): string => ((v[clave] as string[]) ?? []).join(", ");

// ── Paso 1: datos de contacto, compartido por los cuatro rubros ────
const campoEmpresa: Campo = { tipo: "text", clave: "empresa", etiqueta: "Nombre de la empresa *", placeholder: "Nombre de tu empresa", autoComplete: "organization" };
const filaContacto: ElementoFila = {
  tipo: "fila",
  campos: [
    { tipo: "tel", clave: "telefono", etiqueta: "Teléfono *", placeholder: "Teléfono de contacto", autoComplete: "tel" },
    { tipo: "email", clave: "email", etiqueta: "Correo electrónico *", placeholder: "correo@tuempresa.com", autoComplete: "email" },
  ],
};

const NOTA_ESTANDAR = "En menos de 48 hs te enviamos una propuesta. Sin compromiso.";

export const RUBRO_CONFIGS: Record<string, RubroFormConfig> = {
  isp: {
    formName: "cotizar-isp",
    posthogSector: "ISP / Telecomunicaciones",
    notaFinal: "En menos de 48 hs te enviamos una propuesta. Sin compromiso ni costos ocultos.",
    pasos: [
      {
        titulo: "Datos de la empresa",
        subtitulo: "Empecemos con los datos básicos de contacto.",
        espaciado: "space-y-4",
        elementos: [campoEmpresa, filaContacto],
      },
      {
        titulo: "Su operación hoy",
        subtitulo: "Contanos cómo es tu operación actual.",
        espaciado: "space-y-6",
        elementos: [
          { tipo: "checkbox", clave: "servicios", etiqueta: "¿Que servicios ofrece?", subtitulo: "Seleccione los que aplique", opciones: ["Internet", "TV", "Telefonía IP", "Otro"] },
          { tipo: "radio", clave: "clientes", etiqueta: "¿Cuántos clientes tiene en servicio?", subtitulo: "Cantidad aproximada", opciones: ["Menos de 500", "500 – 2.000", "2.000 – 5.000", "Más de 5.000"] },
          { tipo: "radio", clave: "reclamos", etiqueta: "¿Cuántos reclamos recibe por mes?", subtitulo: "Todos los canales", opciones: ["Menos de 500", "500 – 2.000", "2.000 – 5.000", "Más de 5.000"] },
          { tipo: "checkbox", clave: "canales", etiqueta: "¿Por qué canales recibe contactos?", subtitulo: "Seleccione todos los que apliquen", opciones: ["Teléfono / llamada", "WhatsApp", "Email", "Chat web", "Redes sociales", "Otro"] },
          { tipo: "text", clave: "horario", etiqueta: "Horario actual de atención", placeholder: "Indicá días y horarios" },
        ],
      },
      {
        titulo: "Lo que necesita",
        subtitulo: "Ayudanos a entender qué estás buscando.",
        espaciado: "space-y-6",
        elementos: [
          {
            tipo: "checkbox", clave: "nivelSoporte", etiqueta: "¿Qué nivel de soporte técnico requiere?", subtitulo: "Seleccione una o más opciones",
            opciones: [
              "Nivel 1 (L1): atención inicial, pruebas básicas y resolución de consultas frecuentes",
              "Nivel 2 (L2): diagnóstico técnico avanzado y configuración de equipos",
              "Ambos (L1 + L2)",
              "No estoy seguro / necesito asesoramiento",
            ],
          },
          {
            tipo: "checkbox", clave: "cobertura", etiqueta: "¿Qué tipo de cobertura necesita?",
            opciones: [
              "Refuerzo por desborde de líneas propias",
              "Cobertura fuera de horario",
              "Atención completa (reemplazo total)",
              "Aún no lo tengo definido",
            ],
          },
          { tipo: "radio", clave: "usaIA", etiqueta: "¿Considera soluciones de IA en su soporte?", opciones: ["Sí", "No", "No lo sé"] },
          { tipo: "radio", clave: "plazo", etiqueta: "¿En qué plazo necesita el servicio operativo?", opciones: ["Menos de 1 mes", "1 – 3 meses", "Más de 3 meses", "Estoy evaluando"] },
          { tipo: "textarea", clave: "comentarios", etiqueta: "Comentarios adicionales", placeholder: "Cualquier detalle que nos ayude a preparar una propuesta más precisa..." },
        ],
      },
    ],
    construirPayload: (v) => ({
      rubro: "ISP / Telecomunicaciones",
      empresa: texto(v, "empresa"), telefono: texto(v, "telefono"), email: texto(v, "email"),
      clientes: texto(v, "clientes"), reclamos: texto(v, "reclamos"),
      servicios: lista(v, "servicios"),
      canales: lista(v, "canales"),
      horario_actual: texto(v, "horario"),
      nivel_soporte: lista(v, "nivelSoporte"),
      tipo_cobertura: lista(v, "cobertura"),
      usa_ia: texto(v, "usaIA"),
      plazo: texto(v, "plazo"),
      comentarios: texto(v, "comentarios"),
    }),
  },

  retail: {
    formName: "cotizar-retail",
    posthogSector: "Retail / E-commerce",
    notaFinal: NOTA_ESTANDAR,
    pasos: [
      {
        titulo: "Datos de contacto",
        subtitulo: "Empecemos con los datos básicos de tu empresa.",
        espaciado: "space-y-4",
        elementos: [campoEmpresa, filaContacto],
      },
      {
        titulo: "Tu operación",
        subtitulo: "Algunas preguntas rápidas para armar tu propuesta.",
        espaciado: "space-y-5",
        elementos: [
          { tipo: "radio", clave: "volumen", etiqueta: "¿Cuántos pedidos / consultas recibís por mes?", opciones: ["Menos de 200", "200 – 1.000", "1.000 – 5.000", "Más de 5.000"] },
          { tipo: "checkbox", clave: "canales", etiqueta: "¿Por qué canales atienden actualmente?", subtitulo: "Seleccione todos los que apliquen", opciones: ["Teléfono", "WhatsApp", "Email", "Chat web", "Redes sociales", "Marketplace", "Otro"] },
          { tipo: "checkbox", clave: "necesidad", etiqueta: "¿Qué necesitás mejorar?", opciones: ["Atención pre-venta", "Soporte post-venta", "Gestión de devoluciones", "Atención fuera de horario", "Reducir costos operativos", "Otro"] },
          { tipo: "radio", clave: "plazo", etiqueta: "¿En qué plazo necesitás el servicio?", opciones: ["Menos de 1 mes", "1 – 3 meses", "Estoy evaluando"] },
          { tipo: "textarea", clave: "comentarios", etiqueta: "Comentarios adicionales", placeholder: "Cualquier detalle que nos ayude a preparar una propuesta más precisa...", opcional: true, filas: 3 },
        ],
      },
    ],
    construirPayload: (v) => ({
      rubro: "Retail / E-commerce",
      empresa: texto(v, "empresa"), telefono: texto(v, "telefono"), email: texto(v, "email"),
      volumen_pedidos: texto(v, "volumen"),
      canales: lista(v, "canales"),
      necesidad: lista(v, "necesidad"),
      plazo: texto(v, "plazo"),
      comentarios: texto(v, "comentarios"),
    }),
  },

  tecnologia: {
    formName: "cotizar-tech",
    /* El texto que se envía en PostHog ("Tecnologia", sin tilde) difiere del
       que se envía en el campo `rubro` del formulario ("Tecnología", con
       tilde). Es así en el código original y no se unifica acá para no
       alterar la segmentación ya existente en PostHog ni el texto que ya
       recibieron leads anteriores: es una inconsistencia preexistente, no un
       error introducido por este refactor. */
    posthogSector: "Tecnologia / SaaS",
    notaFinal: NOTA_ESTANDAR,
    pasos: [
      {
        titulo: "Datos de contacto",
        subtitulo: "Empecemos con los datos básicos de tu empresa.",
        espaciado: "space-y-4",
        elementos: [campoEmpresa, filaContacto],
      },
      {
        titulo: "Tu producto y soporte",
        subtitulo: "Algunas preguntas rápidas para armar tu propuesta.",
        espaciado: "space-y-5",
        elementos: [
          { tipo: "radio", clave: "usuarios", etiqueta: "¿Cuántos usuarios activos tiene tu producto?", opciones: ["Menos de 500", "500 – 5.000", "5.000 – 20.000", "Más de 20.000"] },
          { tipo: "checkbox", clave: "soporte", etiqueta: "¿Qué canales de soporte ofrecés actualmente?", subtitulo: "Seleccione todos los que apliquen", opciones: ["Email / ticket", "Chat en vivo", "WhatsApp", "Teléfono", "Base de conocimiento", "Sin soporte aún", "Otro"] },
          { tipo: "checkbox", clave: "necesidad", etiqueta: "¿Qué necesitás mejorar?", opciones: ["Help desk nivel 1 y 2", "Onboarding de nuevos usuarios", "Soporte fuera de horario", "Reducir tiempo de respuesta", "Escalar el equipo de soporte", "Otro"] },
          { tipo: "radio", clave: "plazo", etiqueta: "¿En qué plazo necesitás el servicio?", opciones: ["Menos de 1 mes", "1 – 3 meses", "Estoy evaluando"] },
          { tipo: "textarea", clave: "comentarios", etiqueta: "Comentarios adicionales", placeholder: "Cualquier detalle que nos ayude a preparar una propuesta más precisa...", opcional: true, filas: 3 },
        ],
      },
    ],
    construirPayload: (v) => ({
      rubro: "Tecnología / SaaS",
      empresa: texto(v, "empresa"), telefono: texto(v, "telefono"), email: texto(v, "email"),
      usuarios_activos: texto(v, "usuarios"),
      canales_soporte: lista(v, "soporte"),
      necesidad: lista(v, "necesidad"),
      plazo: texto(v, "plazo"),
      comentarios: texto(v, "comentarios"),
    }),
  },

  otro: {
    formName: "cotizar-otro",
    posthogSector: "Otro",
    notaFinal: NOTA_ESTANDAR,
    pasos: [
      {
        titulo: "Datos de contacto",
        subtitulo: "Empecemos con los datos básicos de tu empresa.",
        espaciado: "space-y-4",
        elementos: [
          campoEmpresa,
          filaContacto,
          { tipo: "text", clave: "rubroDescripcion", etiqueta: "¿A qué se dedica tu empresa?", placeholder: "Describí a qué se dedica" },
        ],
      },
      {
        titulo: "Tu empresa y necesidades",
        subtitulo: "Algunas preguntas rápidas para armar tu propuesta.",
        espaciado: "space-y-5",
        elementos: [
          { tipo: "radio", clave: "tamaño", etiqueta: "¿De qué tamaño es tu empresa?", opciones: ["1 – 10 empleados", "10 – 50 empleados", "50 – 200 empleados", "Más de 200 empleados"] },
          { tipo: "checkbox", clave: "necesidad", etiqueta: "¿Qué necesitás mejorar en tu atención?", opciones: ["Reducir costos operativos", "Ampliar horario de atención", "Mejorar la calidad del servicio", "Escalar sin contratar personal fijo", "Atención multicanal", "Otro"] },
          { tipo: "radio", clave: "plazo", etiqueta: "¿En qué plazo necesitás el servicio?", opciones: ["Menos de 1 mes", "1 – 3 meses", "Estoy evaluando"] },
          { tipo: "textarea", clave: "comentarios", etiqueta: "Comentarios adicionales", placeholder: "Cualquier detalle que nos ayude a preparar una propuesta más precisa...", opcional: true, filas: 3 },
        ],
      },
    ],
    construirPayload: (v) => ({
      empresa: texto(v, "empresa"), telefono: texto(v, "telefono"), email: texto(v, "email"),
      rubro_descripcion: texto(v, "rubroDescripcion"),
      tamaño_empresa: texto(v, "tamaño"),
      necesidad: lista(v, "necesidad"),
      plazo: texto(v, "plazo"),
      comentarios: texto(v, "comentarios"),
    }),
  },
};
