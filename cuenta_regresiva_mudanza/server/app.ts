import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import Fastify from 'fastify'
import { config } from './config.js'
import { migrate } from './db.js'
import { registerAuthRoutes } from './auth.js'
import { registerTaskRoutes } from './tasks.js'
import { registerUserRoutes } from './users.js'
import { registerStaticRoutes } from './static.js'

export async function createApp() {
    const app = Fastify({
        logger: true
    })

    await app.register(cors, {
        origin: config.corsOrigins
    })
    await app.register(jwt, {
        secret: config.jwtSecret
    })
    await migrate()

    app.get('/health', async () => ({
        ok: true
    }))

    await registerAuthRoutes(app)
    await registerUserRoutes(app)
    await registerTaskRoutes(app)
    await registerStaticRoutes(app)

    return app
}
