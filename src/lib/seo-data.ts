/* Metadatos SEO por ruta, en un único lugar.

   Los usan tanto el componente <Seo> (en el navegador) como el script de
   prerenderizado (al construir el sitio), de modo que el HTML estático y el
   que ve el visitante siempre coincidan. */

export const SITE_URL = "https://aloha.net.ar";

export interface SeoData {
  title: string;
  description: string;
}

export const SEO_BY_PATH: Record<string, SeoData> = {
  "/": {
    title: "Aloha Argentina | Atención al Cliente y Soporte Técnico",
    description:
      "Servicios de atención al cliente y soporte técnico externo para ISPs, telecomunicaciones, retail y tecnología. Desde 2016.",
  },
  "/request": {
    title: "Cotizá tu servicio de atención al cliente | Aloha Argentina",
    description:
      "Contanos sobre tu operación y en menos de 48 hs te enviamos una propuesta de atención al cliente y soporte técnico externo adaptada a tu empresa. Sin costo ni compromiso.",
  },
  "/empleos": {
    title: "Trabajá con nosotros | Aloha Argentina",
    description:
      "Sumate al equipo de Aloha Argentina. Buscamos personas con empatía y ganas de crecer para atención al cliente y soporte técnico. Enviá tu CV y postulate.",
  },
  "/privacidad": {
    title: "Política de Privacidad | Aloha Argentina",
    description:
      "Cómo Aloha Argentina recopila, utiliza, almacena y protege tus datos personales, en cumplimiento con la Ley N° 25.326 de Protección de Datos Personales.",
  },
  "/terminos": {
    title: "Términos y Condiciones | Aloha Argentina",
    description:
      "Términos y condiciones de uso del sitio web y los servicios de atención al cliente y soporte técnico de Aloha Argentina.",
  },
  "/eliminacion-datos": {
    title: "Eliminación de Datos | Aloha Argentina",
    description:
      "Cómo solicitar la eliminación de tus datos personales almacenados por Aloha Argentina: procedimiento, plazos y qué información se elimina.",
  },
};

/** Rutas que se prerenderizan al construir el sitio. */
export const PRERENDER_PATHS = Object.keys(SEO_BY_PATH);

const NOT_FOUND: SeoData = {
  title: "Página no encontrada | Aloha Argentina",
  description: "La página que buscás no existe o fue movida.",
};

export function getSeo(path: string): SeoData {
  return SEO_BY_PATH[path] ?? NOT_FOUND;
}
