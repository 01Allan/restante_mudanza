import 'dotenv/config'

export const config = {
    port: Number(process.env.PORT ?? 3000)
    ,databaseUrl: requiredEnv('DATABASE_URL')
    ,jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me'
    ,adminEmail: process.env.ADMIN_EMAIL ?? 'admin@mudanza.local'
    ,adminPassword: process.env.ADMIN_PASSWORD ?? 'mudanza'
    ,appUrl: process.env.APP_URL ?? 'http://localhost:5173'
    ,corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
    ,smtp: {
        host: process.env.SMTP_HOST
        ,port: Number(process.env.SMTP_PORT ?? 587)
        ,user: process.env.SMTP_USER
        ,pass: process.env.SMTP_PASS
        ,from: process.env.MAIL_FROM ?? 'Mudanza <no-reply@mudanza.local>'
    }
}

function requiredEnv(key: string) {
    const value = process.env[key]

    if (!value) {
        throw new Error(`${key} is required`)
    }

    return value
}
