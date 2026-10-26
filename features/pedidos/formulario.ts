import { ErrorApi } from '@/lib/api/cliente';
import type { LineaNuevoPedido, NuevoPedido } from './api';
import { aNumero } from './formato';

/** Lo que devuelve la acción de crear al formulario (si todo sale bien, redirige y no devuelve nada). */
export type EstadoFormulario = { error: string | null };

/**
 * Lee el formulario y arma lo que se manda a la API. Las reglas las valida el dominio en el servidor;
 * aquí solo se convierten los tipos (texto → número) y se descartan las filas vacías.
 */
export function leerFormulario(datos: FormData): NuevoPedido {
  const texto = (campo: string) => datos.getAll(campo).map((v) => (typeof v === 'string' ? v : ''));
  const productos = texto('producto');
  const cantidades = texto('cantidad');
  const precios = texto('precioUnitario');

  const lineas: LineaNuevoPedido[] = [];
  productos.forEach((producto, i) => {
    const cantidad = cantidades[i] ?? '';
    const precio = precios[i] ?? '';
    if (producto.trim() === '' && cantidad.trim() === '' && precio.trim() === '') return; // fila vacía
    lineas.push({ producto: producto.trim(), cantidad: aNumero(cantidad), precioUnitario: aNumero(precio) });
  });
  return { lineas };
}

/** El mensaje para el usuario: el del dominio si es una regla (400), uno claro para los permisos. */
export function mensajeDeError(error: ErrorApi): string {
  if (error.estado === 400) return error.titulo; // el mensaje de la regla, tal como lo dice el dominio
  if (error.estado === 403)
    return 'Tu sesión no tiene permiso para crear (pedidos.escribir). Si te lo acaban de dar, cierra sesión y vuelve a entrar.';
  if (error.estado === 0) return error.detalle ?? error.titulo;
  return 'No pudimos guardar. Intenta de nuevo en un momento.';
}
