// Cómo se muestran los datos de Pedidos. Un solo lugar: la moneda y la zona horaria no se repiten por la web.
const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const fecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'America/Lima' });

export function formatoMoneda(valor: number): string {
  return moneda.format(valor);
}

export function formatoFecha(iso: string): string {
  return fecha.format(new Date(iso));
}

/** Texto del formulario → número. Acepta coma decimal; lo vacío o ilegible es 0 (el dominio dirá si vale). */
export function aNumero(texto: string): number {
  const valor = Number(texto.trim().replace(',', '.'));
  return texto.trim() === '' || !Number.isFinite(valor) ? 0 : valor;
}

/**
 * El total «estimado» mientras se escribe: suma de cantidad × precio, redondeado a 2 decimales.
 * Solo se muestra: el total que vale lo calcula el pedido en el servidor y nunca se manda a la API.
 */
export function totalEstimado(lineas: { cantidad: number; precioUnitario: number }[]): number {
  const centavos = lineas.reduce((suma, l) => suma + Math.round(l.cantidad * l.precioUnitario * 100), 0);
  return centavos / 100;
}
