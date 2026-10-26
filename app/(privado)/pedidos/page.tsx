import Link from 'next/link';
import { redirect } from 'next/navigation';
import { estadosPedido, listarPedidos } from '@/features/pedidos/api';
import estilos from '@/features/pedidos/pedidos.module.css';
import { TablaPedidos } from '@/features/pedidos/TablaPedidos';
import { leerToken } from '@/features/sesion/sesion';
import { ErrorApi } from '@/lib/api/cliente';

type Parametros = { pagina?: string; estado?: string };

/** La dirección del listado con su filtro y su página (sin parámetros que sobren). */
function enlace({ estado, pagina = 1 }: { estado?: string; pagina?: number }) {
  const consulta = new URLSearchParams();
  if (estado) consulta.set('estado', estado);
  if (pagina > 1) consulta.set('pagina', String(pagina));
  const texto = consulta.toString();
  return texto ? `/pedidos?${texto}` : '/pedidos';
}

export default async function PaginaPedidos({ searchParams }: { searchParams: Promise<Parametros> }) {
  const token = await leerToken();
  if (!token) redirect('/login');
  const parametros = await searchParams;
  const pagina = Math.max(1, Number.parseInt(parametros.pagina ?? '1', 10) || 1);
  const estado = parametros.estado || undefined;

  const filtros = (
    <ul className={estilos.filtros} aria-label="Filtrar por estado">
      <li>
        <Link href={enlace({})} aria-current={!estado ? 'page' : undefined}>
          Todos
        </Link>
      </li>
      {estadosPedido.map((e) => (
        <li key={e}>
          <Link href={enlace({ estado: e })} aria-current={estado?.toLowerCase() === e.toLowerCase() ? 'page' : undefined}>
            {e}
          </Link>
        </li>
      ))}
    </ul>
  );

  let resultado;
  try {
    resultado = await listarPedidos(token, { pagina, estado });
  } catch (error) {
    // Un token de antes de que existieran los permisos de Pedidos: la API responde 403.
    if (error instanceof ErrorApi && error.estado === 403) {
      return (
        <section className="tarjeta">
          <h1>Pedidos</h1>
          <p role="alert" className="error">
            Tu sesión no tiene permiso para ver esto (pedidos.leer). Si te lo acaban de dar, cierra sesión y vuelve
            a entrar.
          </p>
        </section>
      );
    }
    // Un filtro mal escrito en la dirección: la API dice cuáles valen (400 pedido.filtro-invalido).
    if (error instanceof ErrorApi && error.estado === 400) {
      return (
        <section>
          <h1>Pedidos</h1>
          {filtros}
          <p role="alert" className="error">
            {error.titulo}
          </p>
        </section>
      );
    }
    throw error;
  }

  const paginas = Math.max(1, Math.ceil(resultado.total / resultado.tamano));

  return (
    <section>
      <div className={estilos.encabezado}>
        <h1>Pedidos</h1>
        <Link href="/pedidos/nuevo" className={estilos.boton}>
          Nuevo pedido
        </Link>
      </div>

      {filtros}

      {resultado.elementos.length === 0 ? (
        <p className="tarjeta nota">
          {estado ? `No hay pedidos en estado ${estado}.` : 'Aún no hay pedidos.'}
        </p>
      ) : (
        <TablaPedidos elementos={resultado.elementos} />
      )}

      <div className={estilos.paginas}>
        <span>
          {resultado.total} en total · página {resultado.pagina} de {paginas}
        </span>
        <span>
          {pagina > 1 && <Link href={enlace({ estado, pagina: pagina - 1 })}>← Anterior</Link>}{' '}
          {pagina < paginas && <Link href={enlace({ estado, pagina: pagina + 1 })}>Siguiente →</Link>}
        </span>
      </div>
    </section>
  );
}
