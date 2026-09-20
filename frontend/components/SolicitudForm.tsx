'use client';

import { FormEvent, useState } from 'react';
import { ApiError, crearSolicitud } from '@/lib/api';
import { CrearSolicitudInput, PLAZOS_PERMITIDOS, PlazoMeses, Solicitud } from '@/lib/types';

const VALORES_INICIALES: CrearSolicitudInput = {
  nombre: '',
  dni: '',
  telefono: '',
  correo: '',
  monto: 1000,
  plazoMeses: 12,
};

type ErroresPorCampo = Partial<Record<keyof CrearSolicitudInput, string>>;

export default function SolicitudForm(): JSX.Element {
  const [valores, setValores] = useState<CrearSolicitudInput>(VALORES_INICIALES);
  const [enviando, setEnviando] = useState(false);
  const [erroresPorCampo, setErroresPorCampo] = useState<ErroresPorCampo>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [solicitudCreada, setSolicitudCreada] = useState<Solicitud | null>(null);

  function actualizarCampo<K extends keyof CrearSolicitudInput>(
    campo: K,
    valor: CrearSolicitudInput[K],
  ): void {
    setValores((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setEnviando(true);
    setErroresPorCampo({});
    setErrorGeneral(null);
    setSolicitudCreada(null);

    try {
      const solicitud = await crearSolicitud(valores);
      setSolicitudCreada(solicitud);
      setValores(VALORES_INICIALES);
    } catch (error) {
      if (error instanceof ApiError && error.errores) {
        const mapaErrores: ErroresPorCampo = {};
        for (const errorDeCampo of error.errores) {
          const campo = errorDeCampo.campo as keyof CrearSolicitudInput;
          mapaErrores[campo] = errorDeCampo.mensaje;
        }
        setErroresPorCampo(mapaErrores);
      } else if (error instanceof ApiError) {
        setErrorGeneral(error.message);
      } else {
        setErrorGeneral('No se pudo conectar con el servidor. Intenta nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Solicitud de financiamiento</h1>
      <p className="text-slate-500 mb-6 text-sm">
        Completa tus datos para calcular tu cuota mensual.
      </p>

      {solicitudCreada && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">¡Solicitud enviada con éxito!</p>
          <p className="text-sm text-green-700 mt-1">
            Tu cuota mensual calculada es{' '}
            <span className="font-bold">S/ {solicitudCreada.cuotaMensual.toFixed(2)}</span>{' '}
            durante {solicitudCreada.plazoMeses} meses.
          </p>
        </div>
      )}

      {errorGeneral && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorGeneral}
        </div>
      )}

      <form onSubmit={manejarEnvio} className="space-y-4" noValidate>
        <CampoTexto
          etiqueta="Nombre completo"
          valor={valores.nombre}
          onChange={(valor) => actualizarCampo('nombre', valor)}
          error={erroresPorCampo.nombre}
        />
        <CampoTexto
          etiqueta="DNI"
          valor={valores.dni}
          onChange={(valor) => actualizarCampo('dni', valor)}
          error={erroresPorCampo.dni}
          maxLength={8}
        />
        <CampoTexto
          etiqueta="Teléfono"
          valor={valores.telefono}
          onChange={(valor) => actualizarCampo('telefono', valor)}
          error={erroresPorCampo.telefono}
          maxLength={9}
        />
        <CampoTexto
          etiqueta="Correo electrónico"
          tipo="email"
          valor={valores.correo}
          onChange={(valor) => actualizarCampo('correo', valor)}
          error={erroresPorCampo.correo}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Monto solicitado (S/)
          </label>
          <input
            type="number"
            min={1000}
            max={10000}
            step={50}
            value={valores.monto}
            onChange={(evento) => actualizarCampo('monto', Number(evento.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          {erroresPorCampo.monto && (
            <p className="mt-1 text-xs text-red-600">{erroresPorCampo.monto}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Plazo (meses)
          </label>
          <select
            value={valores.plazoMeses}
            onChange={(evento) =>
              actualizarCampo('plazoMeses', Number(evento.target.value) as PlazoMeses)
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {PLAZOS_PERMITIDOS.map((plazo) => (
              <option key={plazo} value={plazo}>
                {plazo} meses
              </option>
            ))}
          </select>
          {erroresPorCampo.plazoMeses && (
            <p className="mt-1 text-xs text-red-600">{erroresPorCampo.plazoMeses}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
}

interface CampoTextoProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  error?: string;
  tipo?: string;
  maxLength?: number;
}

function CampoTexto({ etiqueta, valor, onChange, error, tipo = 'text', maxLength }: CampoTextoProps): JSX.Element {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{etiqueta}</label>
      <input
        type={tipo}
        value={valor}
        maxLength={maxLength}
        onChange={(evento) => onChange(evento.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
