'use server';

import { redirect } from 'next/navigation';
import { ErrorApi } from '@/lib/api/cliente';
import { leerToken } from '@/features/sesion/sesion';
import { crearPedido } from './api';
import { leerFormulario, mensajeDeError, type EstadoFormulario } from './formulario';

/** Crea en nova-pedidos (a través del gateway) y lleva al detalle. Corre en el servidor: el token no sale de aquí. */
export async function crearPedidoAccion(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const token = await leerToken();
  if (!token) redirect('/login');

  let numero: string;
  try {
    numero = (await crearPedido(token, leerFormulario(datos))).numero;
  } catch (error) {
    if (error instanceof ErrorApi) return { error: mensajeDeError(error) };
    throw error;
  }
  redirect(`/pedidos/${encodeURIComponent(numero)}`);
}
