import nodemailer from 'nodemailer'
import { config } from './config.js'

export async function sendMail(options: {
    to: string[]
    ,subject: string
    ,html: string
}) {
    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
        console.log('Email skipped. SMTP is not configured.')
        console.log(options.subject)
        return
    }

    const transporter = nodemailer.createTransport({
        host: config.smtp.host
        ,port: config.smtp.port
        ,secure: config.smtp.port === 465
        ,auth: {
            user: config.smtp.user
            ,pass: config.smtp.pass
        }
    })

    await transporter.sendMail({
        from: config.smtp.from
        ,to: options.to
        ,subject: options.subject
        ,html: options.html
    })
}
