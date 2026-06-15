<script setup lang="ts">
import {
    Check
    ,Pencil
    ,Plus
    ,Trash2
} from '@lucide/vue'
import type { MoveTaskCategory } from '@/domain/moveConfig'
import type { MoveTask } from '@/stores/moveTasks'

defineProps<{
    tasks: MoveTask[]
    ,categoryLabels: Record<MoveTaskCategory, string>
    ,canManage: boolean
}>()

const emit = defineEmits<{
    add: []
    ,delete: [id: string]
    ,edit: [task: MoveTask]
    ,toggle: [id: string]
}>()
</script>

<template>
    <section class="tasks" aria-labelledby="task-title">
        <div class="tasks__header">
            <div>
                <span>Checklist</span>
                <h2 id="task-title">Pendientes antes de salir</h2>
            </div>

            <button
                v-if="canManage"
                class="icon-action icon-action--primary"
                type="button"
                aria-label="Agregar pendiente"
                @click="emit('add')"
            >
                <Plus :size="20" />
            </button>
        </div>

        <ul class="tasks__list">
            <li
                v-for="task in tasks"
                :key="task.id"
                class="task"
                :class="{ done: task.completed }"
            >
                <button
                    class="task__check"
                    type="button"
                    :disabled="!canManage"
                    :aria-pressed="task.completed"
                    :aria-label="`Marcar ${task.title}`"
                    @click="emit('toggle', task.id)"
                >
                    <span>
                        <Check v-if="task.completed" :size="18" :stroke-width="3" />
                    </span>
                </button>

                <div class="task__body">
                    <div class="task__topline">
                        <h3>{{ task.title }}</h3>
                        <small>{{ categoryLabels[task.category] }}</small>
                    </div>
                    <span class="task__assignee">
                        Responsable: {{ task.assigneeName ?? 'Sin asignar' }}
                    </span>
                    <p>{{ task.detail }}</p>
                </div>

                <div v-if="canManage" class="task__actions">
                    <button
                        class="icon-action"
                        type="button"
                        :aria-label="`Editar ${task.title}`"
                        @click="emit('edit', task)"
                    >
                        <Pencil :size="17" />
                    </button>

                    <button
                        class="icon-action icon-action--danger"
                        type="button"
                        :aria-label="`Eliminar ${task.title}`"
                        @click="emit('delete', task.id)"
                    >
                        <Trash2 :size="17" />
                    </button>
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.tasks {
    display: grid;
    gap: 1rem;
}

.tasks__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.tasks__header span {
    color: #ff86dd;
    font-size: 0.78rem;
    text-transform: uppercase;
}

.tasks__header h2 {
    margin: 0.25rem 0 0;
    color: #ffffff;
    font-size: clamp(1.5rem, 4vw, 2.25rem);
}

.tasks__list {
    display: grid;
    gap: 0.85rem;
    padding: 0;
    margin: 0;
    list-style: none;
}

.task {
    display: grid;
    grid-template-columns: 2.6rem 1fr auto;
    gap: 0.9rem;
    align-items: start;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 24px;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03)),
        rgba(8, 15, 29, 0.64);
    box-shadow:
        10px 10px 28px rgba(0, 0, 0, 0.26),
        -8px -8px 20px rgba(124, 247, 255, 0.04),
        inset 1px 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(14px);
}

.task.done {
    border-color: rgba(216, 255, 98, 0.34);
}

.task__check,
.icon-action {
    display: grid;
    place-items: center;
    border: 1px solid rgba(124, 247, 255, 0.38);
    border-radius: 50%;
    color: #eafcff;
    background: rgba(124, 247, 255, 0.08);
    box-shadow:
        inset 4px 4px 10px rgba(0, 0, 0, 0.34),
        inset -3px -3px 8px rgba(255, 255, 255, 0.08);
    cursor: pointer;
}

.task__check:disabled {
    cursor: default;
    opacity: 0.62;
}

.task__check {
    width: 2.6rem;
    height: 2.6rem;
    color: #07101f;
}

.task__check span {
    display: grid;
    place-items: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    color: #07101f;
    background: #d8ff62;
    font-weight: 900;
    opacity: 0;
}

.done .task__check span {
    opacity: 1;
}

.task__body {
    min-width: 0;
}

.task__topline {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.45rem 0.8rem;
}

.task h3 {
    margin: 0;
    color: #ffffff;
    font-size: 1rem;
}

.task small {
    color: #d8ff62;
    font-size: 0.72rem;
    text-transform: uppercase;
}

.task__assignee {
    display: block;
    margin-top: 0.4rem;
    color: #9df6ff;
    font-size: 0.78rem;
}

.task p {
    margin: 0.35rem 0 0;
    color: #b8d9df;
    font-size: 0.92rem;
    line-height: 1.55;
}

.task__actions {
    display: flex;
    gap: 0.45rem;
}

.icon-action {
    width: 2.35rem;
    height: 2.35rem;
}

.icon-action--primary {
    width: 2.75rem;
    height: 2.75rem;
    color: #07101f;
    background: #d8ff62;
}

.icon-action--danger {
    border-color: rgba(255, 86, 140, 0.4);
    color: #ff9abc;
}

.done h3,
.done p {
    text-decoration: line-through;
    text-decoration-color: rgba(216, 255, 98, 0.8);
}

@media (max-width: 620px) {
    .task {
        grid-template-columns: 2.6rem 1fr;
    }

    .task__actions {
        grid-column: 2;
    }
}
</style>
