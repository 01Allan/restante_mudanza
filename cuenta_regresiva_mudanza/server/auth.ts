import type {
    FastifyInstance
    ,FastifyReply
    ,FastifyRequest
} from 'fastify'
import { config } from './config.js'

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    }
}

interface LoginBody {
    email: string
    ,password: string
}

export async function registerAuthRoutes(app: FastifyInstance) {
    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify()
        } catch {
            return reply.code(401).send({
                message: 'Unauthorized'
            })
        }
    })

    app.post('/auth/login', async (request, reply) => {
        const body = request.body as LoginBody

        if (body.email !== config.adminEmail || body.password !== config.adminPassword) {
            return reply.code(401).send({
                message: 'Invalid credentials'
            })
        }

        return {
            token: app.jwt.sign({
                email: body.email
                ,role: 'admin'
            })
            ,user: {
                email: body.email
            }
        }
    })
}
