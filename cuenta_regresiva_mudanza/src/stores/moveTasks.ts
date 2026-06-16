import {
    moveProject
    ,type MoveTaskCategory
} from '@/domain/moveConfig'

export interface MoveTask {
    id: string
    ,title: string
    ,detail: string
    ,category: MoveTaskCategory
    ,assigneeId: string | null
    ,assigneeName: string | null
    ,completed: boolean
}

export interface MoveUser {
    id: string
    ,email: string
    ,displayName: string
    ,role: 'admin' | 'member'
    ,active: boolean
    ,mustChangePassword: boolean
}

export type MoveTaskDraft = Pick<MoveTask, 'title' | 'detail' | 'category' | 'assigneeId'>

const STORAGE_KEY = 'cuenta-regresiva-mudanza:tasks'

export const moveStartDate = new Date(moveProject.startDate)
export const moveDate = new Date(moveProject.moveDate)

export function createInitialTasks(): MoveTask[] {
    return moveProject.tasks.map((task) => ({
        ...task
        ,assigneeId: null
        ,assigneeName: null
        ,completed: false
    }))
}

export function createTask(draft: MoveTaskDraft): MoveTask {
    return {
        id: getTaskId()
        ,...draft
        ,assigneeName: null
        ,completed: false
    }
}

export function updateTask(tasks: MoveTask[], id: string, draft: MoveTaskDraft) {
    return tasks.map((task) => task.id === id
        ? {
            ...task
            ,...draft
        }
        : task
    )
}

export function deleteTask(tasks: MoveTask[], id: string) {
    return tasks.filter((task) => task.id !== id)
}

export function getStoredTasks(): MoveTask[] {
    try {
        const rawTasks = localStorage.getItem(STORAGE_KEY)

        if (!rawTasks) {
            return createInitialTasks()
        }

        return JSON.parse(rawTasks) as MoveTask[]
    } catch {
        return createInitialTasks()
    }
}

export function storeTasks(tasks: MoveTask[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function getTaskId() {
    return crypto.randomUUID?.() ?? `task-${Date.now()}`
}
