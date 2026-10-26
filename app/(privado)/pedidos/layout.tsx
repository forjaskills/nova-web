import { redirect } from 'next/navigation';
import { Franja } from '@/features/pedidos/Franja';
import { leerToken } from '@/features/sesion/sesion';

/** Todas las pantallas de Pedidos llevan arriba la franja «usuario · rol · permisos». */
export default async function LayoutPedidos({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = await leerToken();
  if (!token) redirect('/login');

  return (
    <>
      <Franja token={token} />
      {children}
    </>
  );
}
