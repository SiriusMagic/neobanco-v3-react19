// Recorre la app en un navegador real: carga datos de ejemplo y visita cada página.
import { expect, test } from "@playwright/test";

const PAGES = {
  "/": "Bienvenido a tu Centro Financiero",
  "/caja-fuerte": "Mis Fondos",
  "/tarjetas": "Tarjetas Activas",
  "/misiones": "Misiones",
  "/metas": "Metas",
  "/subscripcion": "Subscripciones",
  "/prestamos": "Préstamos",
  "/seguros": "Seguros",
  "/perfil": "Perfil y Ajustes",
};

test("todas las páginas cargan sin errores", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto("./");
  await page.getByRole("button", { name: "Cargar datos de ejemplo" }).click();
  for (const [route, title] of Object.entries(PAGES)) {
    await page.goto(`./#${route}`);
    await expect(page.getByText(title).first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});
