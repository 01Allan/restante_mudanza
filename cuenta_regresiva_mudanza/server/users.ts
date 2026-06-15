import type { FastifyInstance } from 'fastify'
import { db } from './db.js'

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
        const result = await db.query(
            `
                insert into app_users (email, display_name, role)
                values ($1, $2, $3)
                on conflict (email)
                do update set
                    display_name = excluded.display_name
                    ,role = excluded.role
                    ,active = true
                    ,updated_at = now()
                returning
                    id
                    ,email
                    ,display_name as "displayName"
                    ,role
                    ,active
            `
            ,[
                draft.email
                ,draft.displayName
                ,draft.role
            ]
        )

        return reply.code(201).send(result.rows[0])
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
