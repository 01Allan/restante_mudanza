<script setup lang="ts">
import {
    Save
    ,X
} from '@lucide/vue'
import {
    computed
    ,ref
    ,watch
} from 'vue'
import type { MoveTaskCategory } from '@/domain/moveConfig'
import type {
    MoveTask
    ,MoveTaskDraft
    ,MoveUser
} from '@/stores/moveTasks'

const props = defineProps<{
    open: boolean
    ,task: MoveTask | null
    ,categoryLabels: Record<MoveTaskCategory, string>
    ,users: MoveUser[]
}>()

const emit = defineEmits<{
    close: []
    ,save: [draft: MoveTaskDraft]
}>()

const form = ref<MoveTaskDraft>(getEmptyDraft())
const title = computed(() => props.task ? 'Editar pendiente' : 'Nuevo pendiente')
const categories = computed(() =>
    Object.entries(props.categoryLabels) as [MoveTaskCategory, string][]
)

watch(
    () => [props.open, props.task] as const
    ,() => {
        form.value = props.task
            ? {
                title: props.task.title
                ,detail: props.task.detail
                ,category: props.task.category
                ,assigneeId: props.task.assigneeId
            }
            : getEmptyDraft()
    }
)

function saveTask() {
    if (!form.value.title.trim()) {
        return
    }

    emit('save', {
        ...form.value
        ,title: form.value.title.trim()
        ,detail: form.value.detail.trim()
    })
}

function getEmptyDraft(): MoveTaskDraft {
    return {
        title: ''
        ,detail: ''
        ,category: 'currentApartment'
        ,assigneeId: null
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
            <form class="modal" @submit.prevent="saveTask">
                <div class="modal__header">
                    <h2>{{ title }}</h2>
                    <button type="button" class="icon-button" aria-label="Cerrar" @click="emit('close')">
                        <X :size="20" />
                    </button>
                </div>

                <label>
                    <span>Titulo</span>
                    <input v-model="form.title" type="text" required />
                </label>

                <label>
                    <span>Detalle</span>
                    <textarea v-model="form.detail" rows="4"></textarea>
                </label>

                <label>
                    <span>Categoria</span>
                    <select v-model="form.category">
                        <option
                            v-for="[value, label] in categories"
                            :key="value"
                            :value="value"
                        >
                            {{ label }}
                        </option>
                    </select>
                </label>

                <label>
                    <span>Responsable</span>
                    <select v-model="form.assigneeId">
                        <option :value="null">Sin responsable</option>
                        <option
                            v-for="user in users"
                            :key="user.id"
                            :value="user.id"
                        >
                            {{ user.displayName }}
                        </option>
                    </select>
                </label>

                <button class="save-button" type="submit">
                    <Save :size="18" />
                    Guardar
                </button>
            </form>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(2, 6, 14, 0.68);
    backdrop-filter: blur(12px);
}

.modal {
    display: grid;
    gap: 1rem;
    width: min(34rem, 100%);
    padding: 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 28px;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.035)),
        rgba(7, 14, 28, 0.86);
    box-shadow:
        18px 18px 48px rgba(0, 0, 0, 0.4),
        inset 1px 1px 0 rgba(255, 255, 255, 0.14);
}

.modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.modal h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.4rem;
}

label {
    display: grid;
    gap: 0.45rem;
}

label span {
    color: #9df6ff;
    font-size: 0.78rem;
    text-transform: uppercase;
}

input,
textarea,
select {
    width: 100%;
    border: 1px solid rgba(124, 247, 255, 0.22);
    border-radius: 18px;
    color: #eafcff;
    background: rgba(5, 12, 24, 0.66);
    box-shadow:
        inset 5px 5px 12px rgba(0, 0, 0, 0.35),
        inset -4px -4px 12px rgba(255, 255, 255, 0.04);
}

input,
select {
    min-height: 2.75rem;
    padding: 0 0.85rem;
}

textarea {
    resize: vertical;
    padding: 0.75rem 0.85rem;
}

.icon-button,
.save-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(124, 247, 255, 0.28);
    color: #eafcff;
    background: rgba(124, 247, 255, 0.08);
    cursor: pointer;
}

.icon-button {
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 50%;
}

.save-button {
    gap: 0.5rem;
    min-height: 2.8rem;
    border-radius: 999px;
}
</style>
