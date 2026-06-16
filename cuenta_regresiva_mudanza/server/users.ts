import type { FastifyInstance } from 'fastify'
import { config } from './config.js'
import { db } from './db.js'
import { sendMail } from './email.js'
import {
    createTemporaryPassword
    ,hashPassword
} from './password.js'

interface UserDraft {
    email: string
    ,displayName: string
    ,role: 'admin' | 'member'
}

const selectUsersSql = `
    select
        id
        ,email
        ,display_name as "displayName"
        ,role
        ,active
        ,must_change_password as "mustChangePassword"
    from app_users
    order by display_name asc
`

export async function registerUserRoutes(app: FastifyInstance) {
    app.get('/users', {
        preHandler: [app.authenticate]
    }, async () => {
        const result = await db.query(selectUsersSql)
        return result.rows
    })

    app.post('/users', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const draft = request.body as UserDraft

        if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
            return reply.code(400).send({
                message: 'SMTP is required to invite users'
            })
        }

        const temporaryPassword = createTemporaryPassword()
        const passwordHash = await hashPassword(temporaryPassword)
        const result = await db.query(
            `
                insert into app_users (email, display_name, role, password_hash, must_change_password, invited_at)
                values ($1, $2, $3, $4, true, now())
                on conflict (email)
                do update set
                    display_name = excluded.display_name
                    ,role = excluded.role
                    ,password_hash = excluded.password_hash
                    ,must_change_password = true
                    ,active = true
                    ,invited_at = now()
                    ,updated_at = now()
                returning
                    id
                    ,email
                    ,display_name as "displayName"
                    ,role
                    ,active
                    ,must_change_password as "mustChangePassword"
            `
            ,[
                draft.email
                ,draft.displayName
                ,draft.role
                ,passwordHash
            ]
        )
        const user = result.rows[0]

        await sendMail({
            to: [user.email]
            ,subject: 'Acceso al tablero de mudanza'
            ,html: `
                <p>Hola ${user.displayName},</p>
                <p>Te agregaron al tablero de mudanza.</p>
                <p><strong>Usuario:</strong> ${user.email}</p>
                <p><strong>Password temporal:</strong> ${temporaryPassword}</p>
                <p>Al entrar, cambia tu password.</p>
            `
        })

        return reply.code(201).send(user)
    })

    app.patch('/users/:id', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        const draft = request.body as Partial<UserDraft & { active: boolean }>
        const current = await db.query('select * from app_users where id = $1', [id])

        if (!current.rowCount) {
            return reply.code(404).send({
                message: 'User not found'
            })
        }

        const user = current.rows[0]
        const result = await db.query(
            `
                update app_users
                set
                    email = $2
                    ,display_name = $3
                    ,role = $4
                    ,active = $5
                    ,updated_at = now()
                where id = $1
                returning
                    id
                    ,email
                    ,display_name as "displayName"
                    ,role
                    ,active
                    ,must_change_password as "mustChangePassword"
            `
            ,[
                id
                ,draft.email ?? user.email
                ,draft.displayName ?? user.display_name
                ,draft.role ?? user.role
                ,draft.active ?? user.active
            ]
        )

        return result.rows[0]
    })
}
