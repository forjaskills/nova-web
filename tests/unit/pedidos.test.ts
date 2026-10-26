import { describe, expect, it } from 'vitest';
import { aNumero, totalEstimado } from '@/features/pedidos/formato';
import { leerFormulario, mensajeDeError } from '@/features/pedidos/formulario';
import { ErrorApi } from '@/lib/api/cliente';

// Solo las conversiones de la web y el total «estimado». Las reglas del negocio se prueban en nova-pedidos.
function formulario(...filas: [string, string, string][]) {
  const datos = new FormData();
  for (const [producto, cantidad, precio] of filas) {
    datos.append('producto', producto);
    datos.append('cantidad', cantidad);
    datos.append('precioUnitario', precio);
  }
  return datos;
}

describe('leerFormulario', () => {
  it('arma una línea por fila, con cantidad y precio como números', () => {
    const datos = formulario(['Café molido 500 g', '2', '8.50'], ['Taza de cerámica', '1', '12']);

    expect(leerFormulario(datos)).toEqual({
      lineas: [
        { producto: 'Café molido 500 g', cantidad: 2, precioUnitario: 8.5 },
        { producto: 'Taza de cerámica', cantidad: 1, precioUnitario: 12 },
      ],
    });
  });

  it('descarta las filas vacías', () => {
    const datos = formulario(['Café', '1', '5'], ['', '', ''], ['  ', ' ', '']);

    expect(leerFormulario(datos).lineas).toHaveLength(1);
  });

  it('sin filas manda una lista vacía (la rechaza el dominio con pedido.sin-lineas)', () => {
    expect(leerFormulario(new FormData())).toEqual({ lineas: [] });
  });

  it('quita los espacios del producto y no manda total, estado ni dueño', () => {
    const linea = leerFormulario(formulario(['  Café  ', '1', '5'])).lineas[0];

    expect(linea).toEqual({ producto: 'Café', cantidad: 1, precioUnitario: 5 });
  });
});

describe('aNumero', () => {
  it('acepta coma decimal', () => {
    expect(aNumero('8,50')).toBe(8.5);
  });

  it('lo vacío o ilegible es 0 (el dominio decide si vale)', () => {
    expect(aNumero('')).toBe(0);
    expect(aNumero('abc')).toBe(0);
  });
});

describe('totalEstimado', () => {
  it('suma cantidad × precio de cada línea', () => {
    expect(totalEstimado([{ cantidad: 2, precioUnitario: 8.5 }, { cantidad: 1, precioUnitario: 12 }])).toBe(29);
  });

  it('redondea a centavos sin errores de coma flotante', () => {
    expect(totalEstimado([{ cantidad: 3, precioUnitario: 0.1 }])).toBe(0.3);
  });

  it('sin líneas es 0', () => {
    expect(totalEstimado([])).toBe(0);
  });
});

describe('mensajeDeError', () => {
  it('una regla del dominio (400) se muestra tal como la dice el servidor', () => {
    expect(mensajeDeError(new ErrorApi(400, 'Mensaje de la regla.'))).toBe('Mensaje de la regla.');
  });

  it('sin permiso (403) explica qué permiso falta', () => {
    expect(mensajeDeError(new ErrorApi(403, 'Forbidden'))).toContain('pedidos.escribir');
  });
});
