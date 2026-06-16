import { config } from './config.js'
import { db } from './db.js'
import { hashPassword } from './password.js'

export async function bootstrapAdmin() {
    const passwordHash = await hashPassword(config.adminPassword)

    await db.query(
        `
            insert into app_users (email, display_name, password_hash, must_change_password, role, active)
            values ($1, $2, $3, false, 'admin', true)
            on conflict (email)
            do update set
                password_hash = coalesce(app_users.password_hash, excluded.password_hash)
                ,must_change_password = case
                    when app_users.password_hash is null then false
                    else app_users.must_change_password
                end
                ,role = 'admin'
                ,active = true
                ,updated_at = now()
        `
        ,[
            config.adminEmail
            ,'Admin Mudanza'
            ,passwordHash
        ]
    )
}
