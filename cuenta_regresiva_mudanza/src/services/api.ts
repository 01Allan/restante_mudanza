import type {
    MoveTask
    ,MoveTaskDraft
    ,MoveUser
} from '@/stores/moveTasks'

const TOKEN_KEY = 'cuenta-regresiva-mudanza:token'
const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export async function login(email: string, password: string) {
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
        throw new Error(await getResponseError(response, 'Credenciales invalidas'))
    }

    const session = await response.json() as {
        token: string
        ,mustChangePassword: boolean
    }
    localStorage.setItem(TOKEN_KEY, session.token)

    return session
}

export async function changePassword(currentPassword: string, newPassword: string) {
    await request('/auth/change-password', {
        method: 'POST'
        ,body: JSON.stringify({
            currentPassword
            ,newPassword
        })
    })
}

export async function getTasksFromApi() {
    return request<MoveTask[]>('/tasks')
}

export async function getUsersFromApi() {
    return request<MoveUser[]>('/users')
}

export async function createUserInApi(user: Pick<MoveUser, 'email' | 'displayName' | 'role'>) {
    return request<MoveUser>('/users', {
        method: 'POST'
        ,body: JSON.stringify(user)
    })
}

export async function deleteUserInApi(id: string) {
    await request<void>(`/users/${id}`, {
        method: 'DELETE'
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
    const headers = new Headers(init.headers)
    const hasJsonBody = typeof init.body === 'string' && init.body.length > 0

    if (hasJsonBody) {
        headers.set('Content-Type', 'application/json')
    }

    const token = getToken()

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${apiUrl}${path}`, {
        ...init
        ,headers
    })

    if (!response.ok) {
        throw new Error(await getResponseError(response, `API request failed: ${response.status}`))
    }

    if (response.status === 204) {
        return undefined as T
    }

    return await response.json() as T
}

async function getResponseError(response: Response, fallbackMessage: string) {
    try {
        const payload = await response.json() as {
            message?: string
        }

        return payload.message?.trim() || fallbackMessage
    } catch {
        return fallbackMessage
    }
}
