import {
    randomBytes
    ,scrypt
    ,timingSafeEqual
} from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex')
    const key = await scryptAsync(password, salt, 64) as Buffer

    return `scrypt:${salt}:${key.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string | null) {
    if (!hash) {
        return false
    }

    const [algorithm, salt, storedKey] = hash.split(':')

    if (algorithm !== 'scrypt' || !salt || !storedKey) {
        return false
    }

    const key = await scryptAsync(password, salt, 64) as Buffer
    const stored = Buffer.from(storedKey, 'hex')

    return stored.length === key.length && timingSafeEqual(stored, key)
}

export function createTemporaryPassword() {
    return randomBytes(12).toString('base64url')
}
