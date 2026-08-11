import { describe, it, expect } from "vitest";
import { extraerIdDrive, urlPreviewDrive, urlDescargaDrive } from "./googleDrive";

describe("googleDrive", () => {
  describe("extraerIdDrive", () => {
    it("extrae el ID del formato estándar de 'Compartir' (/file/d/ID/view)", () => {
      expect(extraerIdDrive("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing"))
        .toBe("1AbCdEfGhIjKlMnOpQr");
    });

    it("extrae el ID del formato ?id=", () => {
      expect(extraerIdDrive("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQr"))
        .toBe("1AbCdEfGhIjKlMnOpQr");
    });

    it("devuelve null si la URL no tiene un ID de Drive reconocible", () => {
      expect(extraerIdDrive("https://ejemplo.com/no-es-drive")).toBeNull();
    });

    it("devuelve null si el texto ni siquiera es una URL válida", () => {
      expect(extraerIdDrive("esto no es una url")).toBeNull();
    });
  });

  describe("urlPreviewDrive", () => {
    it("arma la URL de previsualización embebible", () => {
      expect(urlPreviewDrive("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing"))
        .toBe("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/preview");
    });

    it("devuelve null si no se pudo extraer el ID", () => {
      expect(urlPreviewDrive("https://ejemplo.com/no-es-drive")).toBeNull();
    });
  });

  describe("urlDescargaDrive", () => {
    it("arma la URL de descarga directa", () => {
      expect(urlDescargaDrive("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing"))
        .toBe("https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQr");
    });

    it("devuelve null si no se pudo extraer el ID", () => {
      expect(urlDescargaDrive("https://ejemplo.com/no-es-drive")).toBeNull();
    });
  });
});
