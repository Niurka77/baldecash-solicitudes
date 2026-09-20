# BaldeCash — Módulo de Solicitudes de Financiamiento

API y página web para que un estudiante envíe una solicitud de financiamiento y el equipo de BaldeCash las revise.

## Stack

- **Backend:** NestJS (TypeScript) + Prisma ORM + SQLite
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS

El enunciado acepta PostgreSQL, MySQL o SQLite por igual. Elegí SQLite para que el proyecto corra sin levantar ningún servidor de base de datos aparte: la "base de datos" es un solo archivo local que Prisma versiona con migraciones.

## Cómo levantar el proyecto

Requisito: Node.js 20+ (no hace falta instalar ninguna base de datos).

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev   # crea el archivo dev.db y las tablas
npm run prisma:seed      # carga 3 solicitudes de ejemplo
npm run start:dev        # API en http://localhost:3001
```

**Frontend** (en otra terminal):
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # web en http://localhost:3000
```

Abre `http://localhost:3000` para el formulario y `http://localhost:3000/solicitudes` para el listado.

## Variables de entorno

**backend/.env**

| Variable | Descripción | Default |
|---|---|---|
| `DATABASE_URL` | Ruta del archivo SQLite | `file:./dev.db` |
| `PORT` | Puerto de la API | `3001` |
| `TASA_INTERES_ANUAL` | Tasa anual para el cálculo de cuota (fracción decimal) | `0.24` si no se define |

**frontend/.env**

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:3001` |

## Endpoints

- `POST /solicitudes` — crea una solicitud, calcula la cuota y la persiste. `201` con el registro creado, o `422` con detalle por campo si algo no valida.
- `GET /solicitudes?page=1&limit=10&estado=pendiente` — lista paginada; `estado` es opcional. Responde `{ data, total, page, limit }`.
- `PATCH /solicitudes/:id/estado` — actualiza el estado de una solicitud (`pendiente | aprobada | rechazada`). Se consume desde el listado del frontend: cada fila tiene un selector que llama a este endpoint y refresca esa fila con la respuesta.

## Decisiones y cómo está organizada la app

- **SQLite** en vez de un motor con servidor: el enunciado los acepta por igual y así se evita instalar/configurar una base de datos para levantar el proyecto.
- **`estado` como texto validado por código, no como enum nativo**: SQLite (a través de Prisma) no soporta enums en el esquema. Se usa un único enum de TypeScript (`estado-solicitud.enum.ts`) como fuente de verdad, compartido por los DTOs de entrada y el tipo de salida. Así la restricción de valores válidos sigue siendo estricta, pero se aplica en la capa de aplicación y no en la base.
- **Fórmula de cuota como función pura** (amortización francesa) separada del servicio en `calculo-cuota.util.ts`: se testea con Jest sin levantar Nest ni la base, y la reutiliza el `seed`, evitando duplicar la fórmula en dos lugares.
- **Tasa de interés leída de `TASA_INTERES_ANUAL` vía `ConfigService`**, con `0.24` como valor seguro por defecto: se puede cambiar desde el `.env` sin tocar código.
- **Puerta única de errores (`AllExceptionsFilter` + `exceptionFactory` en el `ValidationPipe`)**: los errores de validación se aplana a `{ campo, mensaje }` y cualquier excepción no controlada responde `500` genérico, registrando la traza real solo en el logger del servidor, nunca al cliente.
- **`id` como UUID** en vez de autoincremental: no expone el total de solicitudes a través del identificador y es lo razonable para un recurso creado desde un formulario público.

## Qué dejé fuera y qué haría con más tiempo

- No hay autenticación ni autorización sobre `PATCH /solicitudes/:id/estado`; en producción ese endpoint debería estar restringido al equipo interno de BaldeCash.
- No hay rate limiting sobre `POST /solicitudes` para frenar spam de solicitudes.
- El formulario no valida mientras el usuario escribe (solo al enviar).
- No hay logging estructurado ni métricas; el `Logger` de Nest por consola es suficiente para el alcance de esta prueba.
- No hay tests end-to-end del flujo completo (solo unitarios del cálculo de cuota, que es el punto más sensible del negocio).
- Para un entorno real con varios usuarios concurrentes, migraría de SQLite a PostgreSQL: es un cambio de una línea en `schema.prisma` (`provider = "postgresql"`) más una migración nueva, porque la lógica de negocio no depende del motor.

## Uso de Inteligencia Artificial

Se usó Claude (Anthropic) como copiloto de código en esta prueba para el andamiaje inicial, el filtro de excepciones y parte de los tests. Las decisiones de arquitectura (fórmula como función pura, `PrismaService` como provider, forma de la respuesta de error, elección de SQLite) se definieron de forma explícita y se verificaron manualmente antes de dar el proyecto por terminado.
