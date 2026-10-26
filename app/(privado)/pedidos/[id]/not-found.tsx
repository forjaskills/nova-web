import Link from 'next/link';
import estilos from '@/features/pedidos/pedidos.module.css';

export default function PedidoNoEncontrado() {
  return (
    <section className="tarjeta">
      <h1>No encontramos ese pedido</h1>
      <p className="nota">Puede que el número esté mal o que el pedido no sea tuyo.</p>
      <Link href="/pedidos" className={estilos.enlace}>← Volver</Link>
    </section>
  );
}
