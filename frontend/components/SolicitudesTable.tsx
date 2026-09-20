'use client';

import { useCallback, useEffect, useState } from 'react';
import { actualizarEstadoSolicitud, listarSolicitudes } from '@/lib/api';
import { EstadoSolicitud, Solicitud } from '@/lib/types';

const LIMITE_POR_PAGINA = 5;
const OPCIONES_ESTADO: EstadoSolicitud[] = ['pendiente', 'aprobada', 'rechazada'];

const ESTADOS_FILTRO: Array<{ etiqueta: string; valor: EstadoSolicitud | 'todos' }> = [
  { etiqueta: 'Todos', valor: 'todos' },
  { etiqueta: 'Pendiente', valor: 'pendiente' },
  { etiqueta: 'Aprobada', valor: 'aprobada' },
  { etiqueta: 'Rechazada', valor: 'rechazada' },
];

export default function SolicitudesTable(): JSX.Element {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | 'todos'>('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idActualizando, setIdActualizando] = useState<string | null>(null);
  const [errorPorFila, setErrorPorFila] = useState<Record<string, string>>({});

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

  const cargarSolicitudes = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await listarSolicitudes({
        page: pagina,
        limit: LIMITE_POR_PAGINA,
        estado: filtroEstado === 'todos' ? undefined : filtroEstado,
      });
      setSolicitudes(respuesta.data);
      setTotal(respuesta.total);
    } catch {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  }, [pagina, filtroEstado]);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  function cambiarFiltro(nuevoEstado: EstadoSolicitud | 'todos'): void {
    setFiltroEstado(nuevoEstado);
    setPagina(1); // al cambiar el filtro, siempre se vuelve a la primera página
  }

  async function cambiarEstadoSolicitud(
    id: string,
    nuevoEstado: EstadoSolicitud,
  ): Promise<void> {
    setIdActualizando(id);
    setErrorPorFila((anterior) => {
      const { [id]: _omitido, ...resto } = anterior;
      return resto;
    });

    try {
      const solicitudActualizada = await actualizarEstadoSolicitud(id, nuevoEstado);
      setSolicitudes((anteriores) =>
        anteriores.map((solicitud) =>
          solicitud.id === id ? solicitudActualizada : solicitud,
        ),
      );
    } catch {
      setErrorPorFila((anterior) => ({
        ...anterior,
        [id]: 'No se pudo actualizar el estado.',
      }));
    } finally {
      setIdActualizando(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Solicitudes</h1>

        <select
          value={filtroEstado}
          onChange={(evento) => cambiarFiltro(evento.target.value as EstadoSolicitud | 'todos')}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {ESTADOS_FILTRO.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Nombre</Th>
              <Th>DNI</Th>
              <Th>Monto</Th>
              <Th>Plazo</Th>
              <Th>Cuota</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Cargando solicitudes...
                </td>
              </tr>
            )}

            {!cargando && solicitudes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No hay solicitudes para este filtro.
                </td>
              </tr>
            )}

            {!cargando &&
              solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td className="px-4 py-3">{solicitud.nombre}</td>
                  <td className="px-4 py-3">{solicitud.dni}</td>
                  <td className="px-4 py-3">S/ {solicitud.monto.toFixed(2)}</td>
                  <td className="px-4 py-3">{solicitud.plazoMeses} meses</td>
                  <td className="px-4 py-3">S/ {solicitud.cuotaMensual.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={solicitud.estado}
                      disabled={idActualizando === solicitud.id}
                      onChange={(evento) =>
                        cambiarEstadoSolicitud(
                          solicitud.id,
                          evento.target.value as EstadoSolicitud,
                        )
                      }
                      className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS_ESTADO[solicitud.estado]}`}
                    >
                      {OPCIONES_ESTADO.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                    {errorPorFila[solicitud.id] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errorPorFila[solicitud.id]}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>
          Página {pagina} de {totalPaginas} · {total} solicitudes
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina <= 1}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina >= totalPaginas}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

// Mismos colores que antes tenía el badge de solo lectura; ahora estilizan
// el <select> editable para que la fila siga comunicando el estado a simple vista.
const ESTILOS_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobada: 'bg-green-100 text-green-800',
  rechazada: 'bg-red-100 text-red-800',
};
