import { FormularioPedido } from '@/features/pedidos/FormularioPedido';
import estilos from '@/features/pedidos/pedidos.module.css';

export default function PaginaNuevoPedido() {
  return (
    <section>
      <div className={estilos.encabezado}>
        <h1>Nuevo pedido</h1>
      </div>
      <FormularioPedido />
    </section>
  );
}
