'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { crearPedidoAccion } from './acciones';
import { aNumero, formatoMoneda, totalEstimado } from './formato';
import type { EstadoFormulario } from './formulario';
import estilos from './pedidos.module.css';

const inicial: EstadoFormulario = { error: null };

type Fila = { clave: number; producto: string; cantidad: string; precioUnitario: string };

export function FormularioPedido() {
  const [estado, enviar, enviando] = useActionState(crearPedidoAccion, inicial);
  const siguiente = useRef(1);
  const [filas, setFilas] = useState<Fila[]>([{ clave: 0, producto: '', cantidad: '1', precioUnitario: '' }]);

  const agregar = () =>
    setFilas((actuales) => [...actuales, { clave: siguiente.current++, producto: '', cantidad: '1', precioUnitario: '' }]);
  const quitar = (clave: number) => setFilas((actuales) => actuales.filter((f) => f.clave !== clave));
  const cambiar = (clave: number, campo: keyof Omit<Fila, 'clave'>, valor: string) =>
    setFilas((actuales) => actuales.map((f) => (f.clave === clave ? { ...f, [campo]: valor } : f)));

  const estimado = totalEstimado(
    filas.map((f) => ({ cantidad: aNumero(f.cantidad), precioUnitario: aNumero(f.precioUnitario) })),
  );

  return (
    // No usa .formulario (global): esa es angosta, para el login, y las líneas no caben en ella.
    <form action={enviar} className={`tarjeta ${estilos.formulario}`} data-testid="formulario-pedido">
      {/* Los límites (required, min, maxLength) ayudan al usuario; la regla la sigue validando el dominio. */}
      <fieldset className={estilos.lineas}>
        <legend>Líneas del pedido</legend>
        {filas.map((fila, i) => (
          <div key={fila.clave} className={estilos.linea}>
            <label>
              Producto
              <input
                name="producto"
                required
                maxLength={100}
                value={fila.producto}
                onChange={(e) => cambiar(fila.clave, 'producto', e.target.value)}
              />
            </label>
            <label>
              Cantidad
              <input
                name="cantidad"
                type="number"
                required
                min={1}
                step={1}
                value={fila.cantidad}
                onChange={(e) => cambiar(fila.clave, 'cantidad', e.target.value)}
              />
            </label>
            <label>
              Precio unitario
              <input
                name="precioUnitario"
                type="number"
                required
                min={0}
                step={0.01}
                value={fila.precioUnitario}
                onChange={(e) => cambiar(fila.clave, 'precioUnitario', e.target.value)}
              />
            </label>
            <button
              type="button"
              className="secundario"
              onClick={() => quitar(fila.clave)}
              disabled={filas.length === 1}
              aria-label={`Quitar línea ${i + 1}`}
            >
              Quitar
            </button>
          </div>
        ))}
      </fieldset>

      <button type="button" className={`secundario ${estilos.agregar}`} onClick={agregar}>
        Agregar línea
      </button>

      <p className={estilos.estimado} data-testid="total-estimado">
        Total estimado: <strong>{formatoMoneda(estimado)}</strong>{' '}
        <span className="nota">(el total final lo calcula Nova al guardar)</span>
      </p>

      {estado.error && (
        <p role="alert" className="error">
          {estado.error}
        </p>
      )}

      <div className={estilos.acciones}>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar'}
        </button>
        <Link href="/pedidos" className={estilos.enlace}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
