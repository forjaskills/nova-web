import { redirect } from 'next/navigation';
import { ErrorApi, llamarApi } from '@/lib/api/cliente';

// Los tipos son los DTOs que devuelve nova-pedidos (Aplicacion/Pedidos/Dtos.cs), en camelCase.
// El listado devuelve el PedidoDto completo (con sus líneas): no hay un DTO de resumen aparte.

/** Los valores de EstadoPedido, en su orden: un pedido solo avanza de uno en uno. */
export const estadosPedido = ['Registrado', 'Pagado', 'Enviado', 'Entregado'] as const;
export type EstadoPedido = (typeof estadosPedido)[number];

export type LineaPedido = { producto: string; cantidad: number; precioUnitario: number; subtotal: number };
export type Pedido = {
  numero: string;
  clienteId: string;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  lineas: LineaPedido[];
};
export type Pagina<T> = { elementos: T[]; total: number; pagina: number; tamano: number };

/** Lo que se manda para crear (CrearPedidoSolicitud): solo las líneas. El dueño, el total y el estado los pone el servidor. */
export type LineaNuevoPedido = { producto: string; cantidad: number; precioUnitario: number };
export type NuevoPedido = { lineas: LineaNuevoPedido[] };

const RUTA = '/pedidos/api/v1/pedidos';

/** Token vencido o rechazado (401): de vuelta al login. El resto de errores sube a quien llama. */
async function conSesion<T>(llamada: () => Promise<T>): Promise<T> {
  try {
    return await llamada();
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401) redirect('/login?vencida=1');
    throw error;
  }
}

/** Una página de pedidos; sin estado, todos. Un estado que no existe lo rechaza la API (400 pedido.filtro-invalido). */
export function listarPedidos(
  token: string,
  { pagina = 1, estado }: { pagina?: number; estado?: string } = {},
): Promise<Pagina<Pedido>> {
  const consulta = new URLSearchParams({ pagina: String(pagina), tamano: '20' });
  if (estado) consulta.set('estado', estado);
  return conSesion(() => llamarApi<Pagina<Pedido>>(`${RUTA}?${consulta}`, { token }));
}

/** El pedido, o null si no existe o no es tuyo (la API responde 404 en los dos casos, a propósito). */
export async function obtenerPedido(token: string, numero: string): Promise<Pedido | null> {
  try {
    return await conSesion(() => llamarApi<Pedido>(`${RUTA}/${encodeURIComponent(numero)}`, { token }));
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404) return null;
    throw error;
  }
}

export function crearPedido(token: string, nuevo: NuevoPedido): Promise<Pedido> {
  return conSesion(() => llamarApi<Pedido>(RUTA, { metodo: 'POST', cuerpo: nuevo, token }));
}
