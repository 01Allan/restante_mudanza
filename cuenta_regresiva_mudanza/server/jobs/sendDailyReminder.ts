import { config } from '../config.js'
import { db } from '../db.js'
import { sendMail } from '../email.js'
import { renderDailyMoveReminderEmail } from '../../src/email/dailyMoveReminder.js'

const moveDate = new Date('2026-06-27T08:00:00-06:00')
const now = new Date()
const countdown = getCountdown(moveDate, now)
const tasks = await db.query(`
    select move_tasks.completed
    from move_tasks
    join move_projects on move_projects.id = move_tasks.project_id
    where move_projects.slug = 'mudanza-2026'
`)
const recipients = await db.query(`
    select move_recipients.id, move_recipients.email, move_recipients.project_id
    from move_recipients
    join move_projects on move_projects.id = move_recipients.project_id
    where move_projects.slug = 'mudanza-2026'
    and move_recipients.active = true
`)
const emails = recipients.rows.map((recipient) => recipient.email)
const projectId = recipients.rows[0]?.project_id

if (!emails.length) {
    console.log('Email skipped. No active recipients.')
    await db.end()
    process.exit(0)
}

const subject = `Mudanza: faltan ${countdown.days} dias`

try {
    await sendMail({
        to: emails
        ,subject
        ,html: renderDailyMoveReminderEmail({
            ...countdown
            ,completedTasks: tasks.rows.filter((task) => task.completed).length
            ,totalTasks: tasks.rowCount ?? 0
            ,moveDateLabel: new Intl.DateTimeFormat('es-HN', {
                dateStyle: 'full'
                ,timeZone: 'America/Tegucigalpa'
            }).format(moveDate)
            ,appUrl: config.appUrl
        })
    })

    await saveDeliveryLogs('sent', subject)
} catch (error) {
    await saveDeliveryLogs(
        'failed'
        ,subject
        ,error instanceof Error ? error.message : 'Unknown email error'
    )
    throw error
}

await db.end()

async function saveDeliveryLogs(status: 'sent' | 'failed', subject: string, errorMessage?: string) {
    if (!projectId) {
        return
    }

    for (const recipient of recipients.rows) {
        await db.query(
            `
                insert into email_delivery_logs (project_id, recipient_id, subject, status, error_message)
                values ($1, $2, $3, $4, $5)
            `
            ,[
                projectId
                ,recipient.id
                ,subject
                ,status
                ,errorMessage ?? null
            ]
        )
    }
}

function getCountdown(targetDate: Date, currentDate: Date) {
    const second = 1000
    const minute = second * 60
    const hour = minute * 60
    const day = hour * 24
    const distance = Math.max(0, targetDate.getTime() - currentDate.getTime())

    return {
        days: Math.floor(distance / day)
        ,hours: Math.floor((distance % day) / hour)
        ,minutes: Math.floor((distance % hour) / minute)
        ,seconds: Math.floor((distance % minute) / second)
    }
}
