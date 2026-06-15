import type {
    MoveTask
    ,MoveTaskDraft
    ,MoveUser
} from '@/stores/moveTasks'

const TOKEN_KEY = 'cuenta-regresiva-mudanza:token'
const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export async function login(email: string, password: string) {
    if (!apiUrl) {
        localStorage.setItem(TOKEN_KEY, 'local-dev-token')
        return
    }

    const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST'
        ,headers: {
            'Content-Type': 'application/json'
        }
        ,body: JSON.stringify({
            email
            ,password
        })
    })

    if (!response.ok) {
        throw new Error('Credenciales invalidas')
    }

    const session = await response.json() as { token: string }
    localStorage.setItem(TOKEN_KEY, session.token)
}

export async function getTasksFromApi() {
    if (!apiUrl) {
        return null
    }

    return request<MoveTask[]>('/tasks')
}

export async function getUsersFromApi() {
    if (!apiUrl) {
        return null
    }

    return request<MoveUser[]>('/users')
}

export async function createUserInApi(user: Pick<MoveUser, 'email' | 'displayName' | 'role'>) {
    if (!apiUrl) {
        return {
            id: crypto.randomUUID?.() ?? `user-${Date.now()}`
            ,...user
            ,active: true
        }
    }

    return request<MoveUser>('/users', {
        method: 'POST'
        ,body: JSON.stringify(user)
    })
}

export async function createTaskInApi(draft: MoveTaskDraft) {
    return request<MoveTask>('/tasks', {
        method: 'POST'
        ,body: JSON.stringify(draft)
    })
}

export async function updateTaskInApi(task: MoveTask) {
    return request<MoveTask>(`/tasks/${task.id}`, {
        method: 'PATCH'
        ,body: JSON.stringify(task)
    })
}

export async function deleteTaskInApi(id: string) {
    await request<void>(`/tasks/${id}`, {
        method: 'DELETE'
    })
}

async function request<T>(path: string, init: RequestInit = {}) {
    if (!apiUrl) {
        throw new Error('API is not configured')
    }

    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')

    const token = getToken()

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${apiUrl}${path}`, {
        ...init
        ,headers
    })

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return await response.json() as T
}
