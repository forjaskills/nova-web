import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { estadosPedido, obtenerPedido } from '@/features/pedidos/api';
import { formatoFecha, formatoMoneda } from '@/features/pedidos/formato';
import estilos from '@/features/pedidos/pedidos.module.css';
import { leerToken } from '@/features/sesion/sesion';

export default async function PaginaPedido({ params }: { params: Promise<{ id: string }> }) {
  const token = await leerToken();
  if (!token) redirect('/login');
  const { id } = await params;
  const pedido = await obtenerPedido(token, id);
  if (!pedido) notFound();

  const actual = estadosPedido.indexOf(pedido.estado);

  return (
    <section>
      <div className={estilos.encabezado}>
        <h1>{pedido.numero}</h1>
        <Link href="/pedidos" className={estilos.enlace}>← Volver</Link>
      </div>

      <dl className="tarjeta">
        <dt>Fecha</dt>
        <dd>{formatoFecha(pedido.fecha)}</dd>
        <dt>Estado</dt>
        <dd>
          <span className={estilos.estado} data-testid="estado">
            {pedido.estado}
          </span>
        </dd>
        <dt>Total</dt>
        <dd data-testid="total">{formatoMoneda(pedido.total)}</dd>
      </dl>

      <ol className={estilos.pasos} aria-label="Recorrido del pedido">
        {estadosPedido.map((e, i) => (
          <li
            key={e}
            className={i <= actual ? estilos.pasoHecho : undefined}
            aria-current={i === actual ? 'step' : undefined}
          >
            {e}
          </li>
        ))}
      </ol>

      <div className={estilos.envoltura}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col" className={estilos.numero}>
                Cantidad
              </th>
              <th scope="col" className={estilos.numero}>
                Precio unitario
              </th>
              <th scope="col" className={estilos.numero}>
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {pedido.lineas.map((l, i) => (
              <tr key={i}>
                <td>{l.producto}</td>
                <td className={estilos.numero}>{l.cantidad}</td>
                <td className={estilos.numero}>{formatoMoneda(l.precioUnitario)}</td>
                <td className={estilos.numero}>{formatoMoneda(l.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total</td>
              <td className={estilos.numero}>{formatoMoneda(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
