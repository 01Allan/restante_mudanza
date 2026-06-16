import type {
    FastifyInstance
    ,FastifyReply
    ,FastifyRequest
} from 'fastify'
import { db } from './db.js'
import {
    hashPassword
    ,verifyPassword
} from './password.js'

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    }

    interface FastifyRequest {
        currentUser?: {
            id: string
            ,email: string
            ,role: 'admin' | 'member'
        }
    }
}

interface LoginBody {
    email: string
    ,password: string
}

interface ChangePasswordBody {
    currentPassword: string
    ,newPassword: string
}

interface JwtUser {
    id: string
    ,email: string
    ,role: 'admin' | 'member'
}

export async function registerAuthRoutes(app: FastifyInstance) {
    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = await request.jwtVerify<JwtUser>()
            request.currentUser = user
        } catch {
            return reply.code(401).send({
                message: 'Unauthorized'
            })
        }
    })

    app.post('/auth/login', async (request, reply) => {
        const body = request.body as LoginBody
        const result = await db.query(
            `
                select
                    id
                    ,email
                    ,display_name
                    ,password_hash
                    ,must_change_password
                    ,role
                    ,active
                from app_users
                where email = $1
            `
            ,[body.email]
        )
        const user = result.rows[0]
        const validPassword = await verifyPassword(body.password, user?.password_hash)

        if (!user || !user.active || !validPassword) {
            return reply.code(401).send({
                message: 'Invalid credentials'
            })
        }

        await db.query('update app_users set last_login_at = now() where id = $1', [user.id])

        return {
            token: app.jwt.sign({
                id: user.id
                ,email: user.email
                ,role: user.role
            })
            ,mustChangePassword: user.must_change_password
            ,user: {
                id: user.id
                ,email: user.email
                ,displayName: user.display_name
                ,role: user.role
            }
        }
    })

    app.post('/auth/change-password', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const body = request.body as ChangePasswordBody

        if (body.newPassword.length < 8) {
            return reply.code(400).send({
                message: 'Password must have at least 8 characters'
            })
        }

        const result = await db.query(
            'select password_hash from app_users where id = $1'
            ,[request.currentUser?.id]
        )
        const validPassword = await verifyPassword(body.currentPassword, result.rows[0]?.password_hash)

        if (!validPassword) {
            return reply.code(401).send({
                message: 'Invalid current password'
            })
        }

        await db.query(
            `
                update app_users
                set
                    password_hash = $2
                    ,must_change_password = false
                    ,updated_at = now()
                where id = $1
            `
            ,[
                request.currentUser?.id
                ,await hashPassword(body.newPassword)
            ]
        )

        return {
            ok: true
        }
    })
}
