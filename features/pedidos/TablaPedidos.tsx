import Link from 'next/link';
import type { Pedido } from './api';
import { formatoFecha, formatoMoneda } from './formato';
import estilos from './pedidos.module.css';

export function TablaPedidos({ elementos }: { elementos: Pedido[] }) {
  return (
    <div className={estilos.envoltura}>
      <table className={estilos.tabla}>
        <thead>
          <tr>
            <th scope="col">Número</th>
            <th scope="col">Fecha</th>
            <th scope="col">Estado</th>
            <th scope="col" className={estilos.numero}>
              Líneas
            </th>
            <th scope="col" className={estilos.numero}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {elementos.map((p) => (
            <tr key={p.numero}>
              <td>
                <Link href={`/pedidos/${encodeURIComponent(p.numero)}`}>{p.numero}</Link>
              </td>
              <td>{formatoFecha(p.fecha)}</td>
              <td>
                <span className={estilos.estado} data-testid="estado">
                  {p.estado}
                </span>
              </td>
              <td className={estilos.numero}>{p.lineas.length}</td>
              <td className={estilos.numero}>{formatoMoneda(p.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
