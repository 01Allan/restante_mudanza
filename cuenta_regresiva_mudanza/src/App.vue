<script setup lang="ts">
import {
    ClipboardList
    ,Clock3
    ,LogIn
    ,LogOut
    ,UserPlus
} from '@lucide/vue'
import {
    computed
    ,onMounted
    ,onUnmounted
    ,ref
} from 'vue'
import AuthModal from './components/AuthModal.vue'
import CountdownCard from './components/CountdownCard.vue'
import ProgressBar from './components/ProgressBar.vue'
import TaskList from './components/TaskList.vue'
import TaskModal from './components/TaskModal.vue'
import UserModal from './components/UserModal.vue'
import { moveProject } from './domain/moveConfig'
import {
    getCountdownParts
    ,getElapsedProgress
} from './domain/moveClock'
import {
    createTask
    ,deleteTask
    ,getStoredTasks
    ,moveDate
    ,moveStartDate
    ,storeTasks
    ,updateTask
    ,type MoveTask
    ,type MoveTaskDraft
    ,type MoveUser
} from './stores/moveTasks'
import {
    clearToken
    ,createTaskInApi
    ,createUserInApi
    ,deleteTaskInApi
    ,getTasksFromApi
    ,getToken
    ,getUsersFromApi
    ,login
    ,updateTaskInApi
} from './services/api'

const activeSection = ref<'countdown' | 'tasks'>('countdown')
const now = ref(new Date())
const tasks = ref<MoveTask[]>(getStoredTasks())
const users = ref<MoveUser[]>([])
const isAuthenticated = ref(Boolean(getToken()))
const isAuthModalOpen = ref(false)
const authError = ref('')
const editingTask = ref<MoveTask | null>(null)
const isTaskModalOpen = ref(false)
const isUserModalOpen = ref(false)
let timer: number | undefined

const countdown = computed(() => getCountdownParts(moveDate, now.value))
const moveProgress = computed(() => getElapsedProgress(moveStartDate, moveDate, now.value))
const completedTasks = computed(() => tasks.value.filter((task) => task.completed).length)
const taskProgress = computed(() => tasks.value.length
    ? Math.round((completedTasks.value / tasks.value.length) * 100)
    : 0
)
const moveDateLabel = computed(() => new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'full'
    ,timeZone: 'America/Tegucigalpa'
}).format(moveDate))

async function toggleTask(id: string) {
    const current = tasks.value.find((task) => task.id === id)

    if (!current) {
        return
    }

    const updatedTask = {
        ...current
        ,completed: !current.completed
    }

    tasks.value = tasks.value.map((task) => task.id === id
        ? {
            ...updatedTask
        }
        : task
    )

    await saveRemoteTask(updatedTask)
}

function openNewTaskModal() {
    editingTask.value = null
    isTaskModalOpen.value = true
}

function openEditTaskModal(task: MoveTask) {
    editingTask.value = task
    isTaskModalOpen.value = true
}

async function saveTask(draft: MoveTaskDraft) {
    tasks.value = editingTask.value
        ? updateTask(tasks.value, editingTask.value.id, draft)
        : [
            ...tasks.value
            ,createTask(draft)
        ]
    const task = editingTask.value
        ? tasks.value.find((item) => item.id === editingTask.value?.id)
        : tasks.value.at(-1)

    if (task) {
        await saveRemoteTask(task, !editingTask.value)
    }

    closeTaskModal()
}

async function removeTask(id: string) {
    tasks.value = deleteTask(tasks.value, id)
    storeTasks(tasks.value)
    await deleteTaskInApi(id).catch(() => undefined)
}

function closeTaskModal() {
    editingTask.value = null
    isTaskModalOpen.value = false
}

function openAuth() {
    if (isAuthenticated.value) {
        clearToken()
        isAuthenticated.value = false
        users.value = []
        return
    }

    authError.value = ''
    isAuthModalOpen.value = true
}

async function loginUser(email: string, password: string) {
    try {
        await login(email, password)
        isAuthenticated.value = true
        isAuthModalOpen.value = false
        authError.value = ''
        await loadUsers()
    } catch (error) {
        authError.value = error instanceof Error
            ? error.message
            : 'No se pudo iniciar sesion'
    }
}

async function saveUser(user: Pick<MoveUser, 'email' | 'displayName' | 'role'>) {
    const savedUser = await createUserInApi(user)
    users.value = [
        ...users.value.filter((item) => item.id !== savedUser.id)
        ,savedUser
    ].sort((left, right) => left.displayName.localeCompare(right.displayName))
    isUserModalOpen.value = false
}

async function loadUsers() {
    const remoteUsers = await getUsersFromApi().catch(() => null)

    if (remoteUsers) {
        users.value = remoteUsers.filter((user) => user.active)
    }
}

async function saveRemoteTask(task: MoveTask, isNew = false) {
    storeTasks(tasks.value)

    try {
        const savedTask = isNew
            ? await createTaskInApi(task)
            : await updateTaskInApi(task)

        tasks.value = tasks.value.map((item) => item.id === task.id
            ? savedTask
            : item
        )
        storeTasks(tasks.value)
    } catch {
        storeTasks(tasks.value)
    }
}

onMounted(() => {
    if (isAuthenticated.value) {
        loadUsers()
    }

    getTasksFromApi()
        .then((remoteTasks) => {
            if (remoteTasks) {
                tasks.value = remoteTasks
                storeTasks(remoteTasks)
            }
        })
        .catch(() => undefined)

    timer = window.setInterval(() => {
        now.value = new Date()
    }, 1000)
})

onUnmounted(() => {
    if (timer) {
        window.clearInterval(timer)
    }
})
</script>

<template>
    <main class="app-shell">
        <section v-if="activeSection === 'countdown'" class="screen" aria-labelledby="page-title">
            <section class="hero">
                <div class="hero__copy glass-surface">
                    <span class="eyebrow">{{ moveProject.eyebrow }}</span>
                    <h1 id="page-title">{{ moveProject.title }}</h1>
                    <p>{{ moveProject.description }}</p>
                </div>

                <CountdownCard :countdown="countdown" :move-date-label="moveDateLabel" />
            </section>

            <section class="dashboard" aria-label="Resumen de la mudanza">
                <article class="panel">
                    <span class="panel__label">Avance temporal</span>
                    <strong>{{ moveProgress }}%</strong>
                    <ProgressBar label="Ruta al 27 de junio" :value="moveProgress" tone="cyan" />
                </article>

                <article class="panel">
                    <span class="panel__label">Pendientes cerrados</span>
                    <strong>{{ completedTasks }}/{{ tasks.length }}</strong>
                    <ProgressBar label="Checklist" :value="taskProgress" tone="lime" />
                </article>

                <article class="panel panel--magenta">
                    <span class="panel__label">Correo diario</span>
                    <strong>{{ moveProject.dailyEmailTime }}</strong>
                    <p>Resumen automatico para ambos cuando conectemos el backend.</p>
                </article>
            </section>
        </section>

        <section v-else class="screen task-screen" aria-label="Pendientes">
            <header class="task-toolbar glass-surface">
                <div>
                    <span>{{ isAuthenticated ? 'Sesion activa' : 'Modo lectura' }}</span>
                    <p>{{ isAuthenticated ? 'Puedes administrar pendientes.' : 'Inicia sesion para agregar o editar.' }}</p>
                </div>

                <button type="button" @click="openAuth">
                    <LogOut v-if="isAuthenticated" :size="18" />
                    <LogIn v-else :size="18" />
                    {{ isAuthenticated ? 'Salir' : 'Entrar' }}
                </button>

                <button v-if="isAuthenticated" type="button" @click="isUserModalOpen = true">
                    <UserPlus :size="18" />
                    Usuario
                </button>
            </header>

            <TaskList
                :tasks="tasks"
                :category-labels="moveProject.categories"
                :can-manage="isAuthenticated"
                @add="openNewTaskModal"
                @delete="removeTask"
                @edit="openEditTaskModal"
                @toggle="toggleTask"
            />
        </section>

        <TaskModal
            :open="isTaskModalOpen"
            :task="editingTask"
            :category-labels="moveProject.categories"
            :users="users"
            @close="closeTaskModal"
            @save="saveTask"
        />

        <UserModal
            :open="isUserModalOpen"
            @close="isUserModalOpen = false"
            @save="saveUser"
        />

        <AuthModal
            :open="isAuthModalOpen"
            :error="authError"
            @close="isAuthModalOpen = false"
            @login="loginUser"
        />

        <nav class="bottom-nav" aria-label="Navegacion principal">
            <button
                type="button"
                :class="{ active: activeSection === 'countdown' }"
                @click="activeSection = 'countdown'"
            >
                <Clock3 :size="20" />
                <span>Cronometro</span>
            </button>

            <button
                type="button"
                :class="{ active: activeSection === 'tasks' }"
                @click="activeSection = 'tasks'"
            >
                <ClipboardList :size="20" />
                <span>Pendientes</span>
            </button>
        </nav>
    </main>
</template>

<style scoped>
:global(*) {
    box-sizing: border-box;
}

:global(html) {
    color-scheme: dark;
    background: #050712;
}

:global(body) {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
    color: #eafcff;
    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        sans-serif;
    background:
        radial-gradient(circle at 50% -10%, rgba(124, 247, 255, 0.16), transparent 34rem),
        radial-gradient(circle at 100% 24%, rgba(255, 59, 212, 0.13), transparent 28rem),
        linear-gradient(135deg, #050712 0%, #0a1222 54%, #120817 100%);
}

:global(button),
:global(input),
:global(textarea),
:global(select) {
    font: inherit;
}

.app-shell {
    display: grid;
    gap: clamp(1.4rem, 4vw, 2.5rem);
    width: min(1160px, calc(100% - 2rem));
    margin: 0 auto;
    padding: clamp(1rem, 4vw, 2.5rem) 0 7rem;
}

.screen {
    display: grid;
    gap: clamp(1.4rem, 4vw, 2.5rem);
}

.hero {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr);
    gap: clamp(1rem, 4vw, 2rem);
    align-items: center;
    min-height: calc(100vh - 7rem);
}

.glass-surface,
.panel {
    border: 1px solid rgba(255, 255, 255, 0.16);
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.035)),
        rgba(7, 14, 28, 0.58);
    box-shadow:
        18px 18px 48px rgba(0, 0, 0, 0.34),
        -10px -10px 32px rgba(124, 247, 255, 0.055),
        inset 1px 1px 0 rgba(255, 255, 255, 0.14),
        inset -10px -10px 24px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(18px);
}

.hero__copy {
    display: grid;
    align-content: center;
    gap: 1rem;
    min-width: 0;
    padding: clamp(1.1rem, 4vw, 2rem);
    border-radius: 34px;
}

.eyebrow,
.panel__label {
    width: fit-content;
    padding: 0.35rem 0.6rem;
    border: 1px solid rgba(124, 247, 255, 0.34);
    border-radius: 999px;
    color: #9df6ff;
    background: rgba(124, 247, 255, 0.08);
    font-size: 0.78rem;
    text-transform: uppercase;
}

h1 {
    max-width: 11ch;
    margin: 0;
    color: #ffffff;
    font-size: clamp(3.1rem, 8vw, 6.2rem);
    line-height: 0.94;
    text-wrap: balance;
    text-shadow:
        0 0 20px rgba(124, 247, 255, 0.36),
        0 0 38px rgba(255, 59, 212, 0.2);
}

.hero__copy p {
    max-width: 40rem;
    margin: 0;
    color: #bdd9df;
    font-size: clamp(1rem, 2vw, 1.16rem);
    line-height: 1.75;
}

.dashboard {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
}

.panel {
    display: grid;
    align-content: start;
    gap: 0.85rem;
    min-height: 10rem;
    padding: 1rem;
    border-radius: 26px;
}

.panel strong {
    color: #ffffff;
    font-size: 2rem;
    line-height: 1;
}

.panel p {
    margin: 0;
    color: #b8d9df;
    line-height: 1.55;
}

.panel--magenta {
    border-color: rgba(255, 59, 212, 0.28);
}

.task-screen {
    align-content: start;
    min-height: calc(100vh - 9rem);
}

.task-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border-radius: 28px;
}

.task-toolbar span {
    color: #9df6ff;
    font-size: 0.78rem;
    text-transform: uppercase;
}

.task-toolbar p {
    margin: 0.25rem 0 0;
    color: #b8d9df;
    line-height: 1.45;
}

.task-toolbar button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.4rem;
    padding: 0 1rem;
    border: 1px solid rgba(124, 247, 255, 0.3);
    border-radius: 999px;
    color: #eafcff;
    background: rgba(124, 247, 255, 0.08);
    cursor: pointer;
}

.bottom-nav {
    position: fixed;
    left: 50%;
    bottom: max(1rem, env(safe-area-inset-bottom));
    z-index: 9;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
    width: min(24rem, calc(100% - 2rem));
    padding: 0.45rem;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.045)),
        rgba(7, 14, 28, 0.72);
    box-shadow:
        18px 18px 48px rgba(0, 0, 0, 0.38),
        inset 1px 1px 0 rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(22px);
    transform: translateX(-50%);
}

.bottom-nav button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 3rem;
    border: 0;
    border-radius: 999px;
    color: #b8d9df;
    background: transparent;
    cursor: pointer;
}

.bottom-nav button.active {
    color: #07101f;
    background: #d8ff62;
    box-shadow:
        0 0 24px rgba(216, 255, 98, 0.34),
        inset 1px 1px 0 rgba(255, 255, 255, 0.48);
}

.bottom-nav span {
    font-size: 0.84rem;
    font-weight: 800;
}

@media (max-width: 860px) {
    .hero,
    .dashboard {
        grid-template-columns: 1fr;
    }

    .hero {
        min-height: auto;
    }

    h1 {
        max-width: 12ch;
    }
}

@media (max-width: 520px) {
    .app-shell {
        width: min(100% - 1rem, 1160px);
    }

    .task-toolbar {
        align-items: flex-start;
        flex-direction: column;
    }

    .task-toolbar button {
        width: 100%;
    }
}
</style>
