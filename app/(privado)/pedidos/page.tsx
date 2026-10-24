import { redirect } from 'next/navigation';
import { obtenerConexion } from '@/features/pedidos/conexion';
import { leerToken } from '@/features/sesion/sesion';

export default async function PaginaPedidos() {
  const token = await leerToken();
  if (!token) redirect('/login');
  const conexion = await obtenerConexion(token);

  return (
    <section className="tarjeta">
      <h1>Pedidos</h1>
      <p className="ok" data-testid="conexion">
        Conectado a nova-pedidos a través del gateway como <strong>{conexion.usuario}</strong>.
      </p>
      <dl>
        <dt>Roles</dt>
        <dd>{conexion.roles.join(', ') || 'ninguno'}</dd>
        <dt>Permisos (scopes)</dt>
        <dd>{conexion.scopes.join(', ') || 'ninguno todavía'}</dd>
      </dl>
      <p className="nota">
        Aún no hay módulos de negocio: el primero se agrega con la skill <code>nuevo-modulo</code>.
      </p>
    </section>
  );
}
