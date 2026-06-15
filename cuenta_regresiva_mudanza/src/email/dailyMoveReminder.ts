interface DailyMoveReminderInput {
    days: number
    ,hours: number
    ,minutes: number
    ,seconds: number
    ,completedTasks: number
    ,totalTasks: number
    ,moveDateLabel: string
    ,appUrl: string
}

const emailTheme = {
    background: '#050712'
    ,surface: '#08101d'
    ,cyan: '#7cf7ff'
    ,magenta: '#ff3bd4'
    ,lime: '#d8ff62'
    ,text: '#eafcff'
    ,muted: '#b8d9df'
}

export function renderDailyMoveReminderEmail({
    days
    ,hours
    ,minutes
    ,seconds
    ,completedTasks
    ,totalTasks
    ,moveDateLabel
    ,appUrl
}: DailyMoveReminderInput) {
    const taskPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    const units = [
        {
            label: 'Dias'
            ,value: days
        }
        ,{
            label: 'Horas'
            ,value: hours
        }
        ,{
            label: 'Minutos'
            ,value: minutes
        }
        ,{
            label: 'Segundos'
            ,value: seconds
        }
    ]

    const unitCells = units
        .map((unit) => `
            <td style="width:25%;padding:6px;">
                <div style="border:1px solid rgba(124,247,255,.32);border-radius:999px;padding:18px 8px;text-align:center;background:rgba(2,8,18,.72);">
                    <strong style="display:block;color:${emailTheme.text};font-size:30px;line-height:1;">
                        ${String(unit.value).padStart(2, '0')}
                    </strong>
                    <span style="display:block;margin-top:8px;color:${emailTheme.lime};font-size:11px;text-transform:uppercase;">
                        ${unit.label}
                    </span>
                </div>
            </td>`
        )
        .join('')

    return `<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Cuenta regresiva de mudanza</title>
    </head>
    <body style="margin:0;background:${emailTheme.background};color:${emailTheme.text};font-family:Inter,Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${emailTheme.background};padding:28px 12px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;border:1px solid rgba(124,247,255,.28);border-radius:28px;background:${emailTheme.surface};">
                        <tr>
                            <td style="padding:28px;">
                                <p style="display:inline-block;margin:0 0 16px;padding:7px 10px;border:1px solid rgba(124,247,255,.36);border-radius:999px;color:${emailTheme.cyan};text-transform:uppercase;font-size:12px;">
                                    Nuevo apartamento
                                </p>
                                <h1 style="margin:0;color:${emailTheme.text};font-size:42px;line-height:1;">
                                    Cuenta regresiva de mudanza
                                </h1>
                                <p style="margin:16px 0 22px;color:${emailTheme.muted};font-size:16px;line-height:1.65;">
                                    Fecha objetivo: ${moveDateLabel}. Checklist actual: ${completedTasks}/${totalTasks} pendientes cerrados.
                                </p>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>${unitCells}</tr>
                                </table>
                                <div style="margin:24px 0 0;height:14px;border:1px solid rgba(146,244,255,.32);border-radius:999px;background:#050c18;overflow:hidden;">
                                    <div style="height:100%;width:${taskPercent}%;background:linear-gradient(90deg,${emailTheme.lime},#35ffb6);"></div>
                                </div>
                                <a href="${appUrl}" style="display:inline-block;margin-top:26px;padding:12px 16px;border:1px solid rgba(255,59,212,.55);border-radius:999px;color:${emailTheme.text};text-decoration:none;background:rgba(255,59,212,.14);">
                                    Abrir tablero
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`
}
