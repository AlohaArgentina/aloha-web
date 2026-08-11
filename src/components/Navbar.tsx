import { useState, useEffect } from "react";
import { usePostHog } from "@posthog/react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Servicios",            href: "/#servicios" },
  { label: "Nosotros",             href: "/#nosotros" },
  { label: "Tecnología",           href: "/#tecnologia" },
  { label: "AlohaAgent",           href: "/#alohaagent" },
  { label: "Casos de Éxito",       href: "/#clientes" },
  { label: "Contacto",             href: "/#contacto" },
  { label: "Trabajá con Nosotros", href: "/empleos" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav id="main_nav" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-secondary/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto flex items-center justify-between py-4">
        <a href="/" className="flex items-center">
          <img src="/favicon.svg" alt="Logo Aloha" className="h-7 w-7 object-contain" />
          <span className="ml-4 text-lg font-bold" style={{ fontFamily: "RidleyGrotesk-Bold", color: "#839ca6" }}>
            ALOHA ARGENTINA
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden xl:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}
              className="text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors whitespace-nowrap">
              {item.label}
            </a>
          ))}
          {/* Acceso al futuro portal de clientes: enlace liviano, no compite en peso visual con el CTA */}
          <a href="/area-clientes"
            onClick={() => posthog.capture("area_clientes_clicked", { location: "desktop_nav" })}
            className="text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors whitespace-nowrap"
          >
            Área Clientes
          </a>
          {/* CTA principal */}
          <a href="/request"
            onClick={() => posthog.capture("cta_clicked", { location: "desktop_nav" })}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-accent-foreground shadow-md
              bg-accent hover:bg-accent/90 whitespace-nowrap
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary
              transition-colors"
          >
            Hablemos de tu operación
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="xl:hidden text-primary-foreground" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-secondary/95 backdrop-blur-md border-t border-primary-foreground/10"
          >
            <div className="container mx-auto py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className="text-sm font-medium text-primary-foreground/80 hover:text-accent transition-colors py-2">
                  {item.label}
                </a>
              ))}
              <a href="/area-clientes" onClick={() => { setOpen(false); posthog.capture("area_clientes_clicked", { location: "mobile_nav" }); }}
                className="text-sm font-semibold text-center px-5 py-2.5 rounded-lg mt-2
                  border border-primary-foreground/30 text-primary-foreground/90 hover:border-accent hover:text-accent transition-colors"
              >
                Área Clientes
              </a>
              <a href="/request" onClick={() => { setOpen(false); posthog.capture("cta_clicked", { location: "mobile_nav" }); }}
                className="text-sm font-semibold text-center text-accent-foreground px-5 py-2.5 rounded-lg
                  bg-accent hover:bg-accent/90 transition-colors"
              >
                Hablemos de tu operación
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;