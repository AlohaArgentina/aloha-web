import "@testing-library/jest-dom";

/* jsdom no implementa IntersectionObserver, que framer-motion usa para las
   animaciones `whileInView`. Sin este stub, cualquier componente con esas
   animaciones falla al montarse en los tests. */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});

/* jsdom tampoco implementa ResizeObserver, que usa el banner de cookies para
   avisarle a la burbuja de WhatsApp cuánto espacio ocupa y no quedar tapada. */
class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverStub,
});
Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverStub,
});

/* jsdom tampoco implementa canvas. Los fondos animados de partículas piden un
   contexto 2D al montarse; devolver null hace que esos efectos se salteen
   limpiamente en los tests, que es justo lo que hace el componente si no hay
   contexto disponible. */
HTMLCanvasElement.prototype.getContext = () => null;

/* En los tests declaramos "prefers-reduced-motion: reduce": las animaciones de
   entrada y salida se resuelven de inmediato y los fondos de partículas se
   saltean, igual que para una persona que pidió menos movimiento. */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
