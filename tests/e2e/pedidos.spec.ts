import { expect, test, type Page } from '@playwright/test';

// Contra la web encendida, con el gateway, nova-seguridad y nova-pedidos detrás (verificar.ps1 los enciende).
// Un solo inicio de sesión para todo el archivo: el gateway permite 5 por minuto y las pruebas de sesión usan 3.
test.describe.configure({ mode: 'serial' });

// La misma página para todas las pruebas del archivo, con la sesión ya iniciada.
let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('/login');
  await page.getByLabel('Usuario').fill('cliente.demo');
  await page.getByLabel('Clave').fill('NovaDemo#1');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).not.toHaveURL(/\/login/);
});

test.afterAll(async () => {
  await page.close();
});

test('el listado muestra la franja con los permisos de pedidos', async () => {
  await page.goto('/pedidos');

  await expect(page.getByTestId('conexion')).toContainText('cliente.demo');
  // Cada permiso por separado: el token no garantiza el orden de los scopes.
  await expect(page.getByTestId('conexion')).toContainText('pedidos.leer');
  await expect(page.getByTestId('conexion')).toContainText('pedidos.escribir');
});

test('abre el detalle del primero del listado', async () => {
  await page.goto('/pedidos');
  const primero = page.getByRole('table').getByRole('link').first();
  const clave = (await primero.textContent())!.trim();

  await primero.click();

  await expect(page.getByRole('heading', { name: clave })).toBeVisible();
});

test('crea uno nuevo con dos líneas y aparece en el listado', async () => {
  await page.goto('/pedidos/nuevo');
  // Lo mismo que docs/modulos/pedidos.ejemplo.json de nova-pedidos: 2 × 8.50 + 1 × 12.00 = 29.00.
  await page.getByLabel('Producto').fill('Café molido 500 g');
  await page.getByLabel('Cantidad').fill('2');
  await page.getByLabel('Precio unitario').fill('8.50');
  await page.getByRole('button', { name: 'Agregar línea' }).click();
  await page.getByLabel('Producto').nth(1).fill('Taza de cerámica');
  await page.getByLabel('Cantidad').nth(1).fill('1');
  await page.getByLabel('Precio unitario').nth(1).fill('12');
  await expect(page.getByTestId('total-estimado')).toContainText('29.00');

  await page.getByRole('button', { name: 'Guardar' }).click();

  // El detalle del nuevo: número de la secuencia, Registrado y el total que calculó el servidor.
  await expect(page).toHaveURL(/\/pedidos\/PED-\d+$/);
  const clave = page.url().split('/').pop()!;
  await expect(page.getByRole('heading', { name: clave })).toBeVisible();
  await expect(page.getByTestId('estado')).toHaveText('Registrado');
  await expect(page.getByTestId('total')).toContainText('29.00');

  await page.goto('/pedidos');
  await expect(page.getByRole('link', { name: clave })).toBeVisible();
});

test('el filtro por estado muestra solo los de ese estado', async () => {
  await page.goto('/pedidos');
  // El que se acaba de crear está en Registrado: el filtro no puede quedar vacío.
  await page.getByRole('link', { name: 'Registrado', exact: true }).click();

  await expect(page).toHaveURL(/estado=Registrado/);
  const estados = page.getByRole('table').getByTestId('estado');
  await expect(estados.first()).toBeVisible();
  for (const texto of await estados.allTextContents()) expect(texto).toBe('Registrado');
});

test('el formulario cabe en su tarjeta, en escritorio y en el teléfono', async () => {
  const original = page.viewportSize()!;
  try {
    for (const ancho of [original.width, 375]) {
      await page.setViewportSize({ width: ancho, height: original.height });
      await page.goto('/pedidos/nuevo');
      await page.getByRole('button', { name: 'Agregar línea' }).click();

      const tarjeta = page.getByTestId('formulario-pedido');
      // Nada se sale del borde: ni las líneas, ni el total, ni los botones.
      const desborde = await tarjeta.evaluate((formulario) => {
        const caja = formulario.getBoundingClientRect();
        return [...formulario.querySelectorAll('*')]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && (r.left < caja.left - 0.5 || r.right > caja.right + 0.5);
          })
          .map((e) => e.tagName.toLowerCase() + (e.textContent ? ` «${e.textContent.trim().slice(0, 30)}»` : ''));
      });
      expect(desborde, `a ${ancho}px`).toEqual([]);
      // Ni la página se puede mover de lado.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `a ${ancho}px`).toBe(true);
      await tarjeta.screenshot({ path: test.info().outputPath(`formulario-${ancho}.png`) });
    }
  } finally {
    await page.setViewportSize(original);
  }
});

test('una línea inválida muestra el mensaje del dominio', async () => {
  await page.goto('/pedidos/nuevo');
  await page.getByLabel('Producto').fill('Café');
  await page.getByLabel('Precio unitario').fill('5');
  // Cantidad 0 la rechaza el dominio (pedido.cantidad-invalida); se salta la validación del navegador a propósito.
  await page.getByLabel('Cantidad').evaluate((campo: HTMLInputElement) => {
    campo.removeAttribute('min');
  });
  await page.getByLabel('Cantidad').fill('0');

  await page.getByRole('button', { name: 'Guardar' }).click();

  // Next también pone un role="alert" vacío (el anunciador de rutas): se busca el que trae el mensaje.
  await expect(page.getByRole('alert').filter({ hasText: /cantidad/i })).toBeVisible();
  await expect(page).toHaveURL(/\/nuevo$/);
});

test('uno que no existe (o es de otro) dice que no lo encontramos', async () => {
  await page.goto('/pedidos/NO-EXISTE-0');

  await expect(page.getByRole('heading', { name: /No (lo )?encontramos/ })).toBeVisible();
});
