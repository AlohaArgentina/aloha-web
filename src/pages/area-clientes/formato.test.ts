import { describe, it, expect } from "vitest";
import { formatearPeriodo } from "./formato";

describe("formatearPeriodo", () => {
  it("formatea una fecha ISO como mes y año en español, con el mes capitalizado", () => {
    expect(formatearPeriodo("2026-07-01")).toBe("Julio de 2026");
  });

  it("no se corre de mes por la conversión de zona horaria", () => {
    // Caso históricamente propenso a errores: medianoche UTC del día 1 cae
    // en el mes anterior en zonas horarias negativas si no se maneja bien.
    expect(formatearPeriodo("2026-01-01")).toBe("Enero de 2026");
    expect(formatearPeriodo("2026-12-01")).toBe("Diciembre de 2026");
  });
});
