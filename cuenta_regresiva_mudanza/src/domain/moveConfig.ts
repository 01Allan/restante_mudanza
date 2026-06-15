export type MoveTaskCategory = 'currentApartment' | 'newApartment' | 'logistics'

export interface MoveTaskDefinition {
    id: string
    ,title: string
    ,detail: string
    ,category: MoveTaskCategory
}

export const moveProject = {
    title: 'Cuenta regresiva de mudanza'
    ,eyebrow: 'Nuevo apartamento'
    ,description: 'Tiempo que nos hace falta para mudarnos a un lugar mejor.'
    ,startDate: '2026-06-14T00:00:00-06:00'
    ,moveDate: '2026-06-27T08:00:00-06:00'
    ,dailyEmailTime: '08:00 AM'
    ,categories: {
        currentApartment: 'Apartamento actual'
        ,newApartment: 'Nuevo apartamento'
        ,logistics: 'Logistica'
    } satisfies Record<MoveTaskCategory, string>
    ,tasks: [] as MoveTaskDefinition[]
}
