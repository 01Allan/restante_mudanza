import type { FastifyInstance } from 'fastify'
import { db } from './db.js'

type MoveTaskCategory = 'currentApartment' | 'newApartment' | 'logistics'

interface TaskDraft {
    title: string
    ,detail: string
    ,category: MoveTaskCategory
    ,assigneeId: string | null
}

const selectTasksSql = `
    select
        move_tasks.id
        ,move_tasks.title
        ,move_tasks.detail
        ,task_categories.code as category
        ,move_tasks.assignee_id as "assigneeId"
        ,assignee.display_name as "assigneeName"
        ,move_tasks.completed
    from move_tasks
    join task_categories on task_categories.id = move_tasks.category_id
    join move_projects on move_projects.id = move_tasks.project_id
    left join app_users assignee on assignee.id = move_tasks.assignee_id
    where move_projects.slug = 'mudanza-2026'
    order by move_tasks.sort_order asc, move_tasks.created_at asc
`

export async function registerTaskRoutes(app: FastifyInstance) {
    app.get('/tasks', async () => {
        const result = await db.query(selectTasksSql)
        return result.rows
    })

    app.post('/tasks', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const draft = request.body as TaskDraft
        const result = await db.query(
            `
                with project as (
                    select id
                    from move_projects
                    where slug = 'mudanza-2026'
                )
                ,category as (
                    select task_categories.id
                    from task_categories
                    join project on project.id = task_categories.project_id
                    where task_categories.code = $3
                )
                ,inserted as (
                    insert into move_tasks (project_id, category_id, title, detail, assignee_id, sort_order, created_by, updated_by)
                    select
                        project.id
                        ,category.id
                        ,$1
                        ,$2
                        ,$4
                        ,(
                            select coalesce(max(sort_order), 0) + 10
                            from move_tasks
                            where project_id = project.id
                        )
                        ,$5
                        ,$5
                    from project, category
                    returning id, title, detail, completed, category_id, assignee_id
                )
                select
                    inserted.id
                    ,inserted.title
                    ,inserted.detail
                    ,task_categories.code as category
                    ,inserted.assignee_id as "assigneeId"
                    ,app_users.display_name as "assigneeName"
                    ,inserted.completed
                from inserted
                join task_categories on task_categories.id = inserted.category_id
                left join app_users on app_users.id = inserted.assignee_id
            `
            ,[
                draft.title
                ,draft.detail ?? ''
                ,draft.category
                ,draft.assigneeId ?? null
                ,request.currentUser?.id
            ]
        )

        return reply.code(201).send(result.rows[0])
    })

    app.patch('/tasks/:id', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        const draft = request.body as Partial<TaskDraft & { completed: boolean }>
        const current = await db.query(
            `
                select
                    move_tasks.*
                    ,task_categories.code as category
                from move_tasks
                join task_categories on task_categories.id = move_tasks.category_id
                where move_tasks.id = $1
            `
            ,[id]
        )

        if (!current.rowCount) {
            return reply.code(404).send({
                message: 'Task not found'
            })
        }

        const task = current.rows[0]
        const result = await db.query(
            `
                with category as (
                    select task_categories.id
                    from task_categories
                    join move_tasks on move_tasks.project_id = task_categories.project_id
                    where move_tasks.id = $1
                    and task_categories.code = $4
                )
                ,updated as (
                update move_tasks
                set
                    title = $2
                    ,detail = $3
                    ,category_id = (select id from category)
                    ,completed = $5
                    ,assignee_id = $6
                    ,updated_by = $7
                    ,completed_by = case when $5 then $7 else null end
                    ,completed_at = case when $5 then coalesce(completed_at, now()) else null end
                    ,updated_at = now()
                where id = $1
                returning id, title, detail, completed, category_id, assignee_id
                )
                select
                    updated.id
                    ,updated.title
                    ,updated.detail
                    ,task_categories.code as category
                    ,updated.assignee_id as "assigneeId"
                    ,app_users.display_name as "assigneeName"
                    ,updated.completed
                from updated
                join task_categories on task_categories.id = updated.category_id
                left join app_users on app_users.id = updated.assignee_id
            `
            ,[
                id
                ,draft.title ?? task.title
                ,draft.detail ?? task.detail
                ,draft.category ?? task.category
                ,draft.completed ?? task.completed
                ,'assigneeId' in draft ? draft.assigneeId : task.assignee_id
                ,request.currentUser?.id
            ]
        )

        return result.rows[0]
    })

    app.delete('/tasks/:id', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        await db.query('delete from move_tasks where id = $1', [id])
        return reply.code(204).send()
    })
}
