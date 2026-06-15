export interface CountdownParts {
    days: number
    ,hours: number
    ,minutes: number
    ,seconds: number
}

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export function getCountdownParts(targetDate: Date, now = new Date()): CountdownParts {
    const distance = Math.max(0, targetDate.getTime() - now.getTime())

    return {
        days: Math.floor(distance / DAY)
        ,hours: Math.floor((distance % DAY) / HOUR)
        ,minutes: Math.floor((distance % HOUR) / MINUTE)
        ,seconds: Math.floor((distance % MINUTE) / SECOND)
    }
}

export function getElapsedProgress(startDate: Date, targetDate: Date, now = new Date()) {
    const total = targetDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()

    return total <= 0
        ? 100
        : Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}
