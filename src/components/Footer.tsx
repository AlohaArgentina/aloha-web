import { Link } from "react-router-dom";
import metaTechProvider from "@/assets/meta-tech-provider.webp";

const Footer = () => {
  return (
    <footer className="hero-gradient text-primary-foreground py-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <a href="/" className="flex items-center">
              <img
                src="/favicon.svg"
                alt="Logo Aloha"
                className="h-7 w-7 object-contain"
              />
              <span className="ml-4 text-lg font-bold" style={{ fontFamily: 'RidleyGrotesk-Bold', color: '#839ca6' }}>ALOHA ARGENTINA</span>
            </a>
            <p className="text-primary-foreground/60 text-sm mt-1">Aloha Argentina SAS</p>
          </div>
          <div className="flex items-center gap-2">
            <img
              src={metaTechProvider}
              alt="Meta"
              className="h-6 w-auto object-contain"
            />
            <span className="text-primary-foreground/70 text-xs font-medium tracking-wide">Tech Provider</span>
          </div>
          <div id="footer_nav" className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/60">
            <a href="/#servicios" className="hover:text-accent transition-colors">Servicios</a>
            <a href="/#nosotros" className="hover:text-accent transition-colors">Nosotros</a>
            <a href="/#tecnologia" className="hover:text-accent transition-colors">Tecnología</a>
            <a href="/#alohaagent" className="hover:text-accent transition-colors">AlohaAgent</a>
            <a href="/#clientes" className="hover:text-accent transition-colors">Casos de Éxito</a>
            <a href="/#contacto" className="hover:text-accent transition-colors">Contacto</a>
            <a href="/empleos" className="hover:text-accent transition-colors">Trabajá con Nosotros</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-primary-foreground/10 text-center text-primary-foreground/40 text-sm">
          <p>© {new Date().getFullYear()} Aloha Argentina SAS. Todos los derechos reservados.</p>
          <div className="mt-3 flex justify-center gap-4">
            <Link to="/privacidad" className="hover:text-accent transition-colors underline underline-offset-2">Política de Privacidad</Link>
            <span>|</span>
            <Link to="/terminos" className="hover:text-accent transition-colors underline underline-offset-2">Términos y Condiciones</Link>
            <span>|</span>
            <Link to="/eliminacion-datos" className="hover:text-accent transition-colors underline underline-offset-2">Eliminación de Datos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;