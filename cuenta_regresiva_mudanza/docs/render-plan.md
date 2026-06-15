# Plan de despliegue en Render

## Frontend Vue

- Tipo de servicio: Static Site.
- Root directory si el repo contiene la carpeta padre: `restante_mudanza/cuenta_regresiva_mudanza`.
- Build command: `pnpm install --frozen-lockfile && pnpm build`.
- Publish directory: `dist`.

Render tambien acepta el flujo de conectar GitHub y desplegar de nuevo en cada push.

## PostgreSQL

Una app estatica no debe hablar directo con PostgreSQL porque expondria credenciales en el navegador.
La ruta segura es:

1. Crear Render Postgres.
2. Crear un Web Service pequeno con Node/Express o Fastify.
3. Guardar `DATABASE_URL` en las variables de entorno del Web Service.
4. Exponer endpoints como `GET /tasks` y `PATCH /tasks/:id`.
5. Cambiar el frontend para consumir `VITE_API_URL`.

El esquema inicial esta en `db/schema.sql`.

## Correo diario

Usar un Cron Job de Render con horario UTC. Para Honduras, 08:00 AM equivale a 14:00 UTC.

- Schedule: `0 14 * * *`
- Command sugerido: `node server/jobs/sendDailyReminder.js`

El job debe:

1. Leer tareas desde PostgreSQL.
2. Calcular dias restantes hasta `2026-06-27T08:00:00-06:00`.
3. Renderizar la plantilla HTML de `src/email/dailyMoveReminder.ts`.
4. Enviar a los correos activos de `move_recipients` usando Resend, SendGrid, Mailgun o SMTP.
