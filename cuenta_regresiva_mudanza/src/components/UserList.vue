<script setup lang="ts">
import {
    Shield
    ,Trash2
    ,User
} from '@lucide/vue'
import type { MoveUser } from '@/stores/moveTasks'

defineProps<{
    users: MoveUser[]
}>()

const emit = defineEmits<{
    delete: [id: string]
}>()
</script>

<template>
    <section class="users" aria-labelledby="users-title">
        <div class="users__header">
            <span>Usuarios</span>
            <h2 id="users-title">Equipo del tablero</h2>
        </div>

        <ul class="users__list">
            <li v-for="user in users" :key="user.id" class="user-card">
                <div class="user-card__icon">
                    <Shield v-if="user.role === 'admin'" :size="18" />
                    <User v-else :size="18" />
                </div>

                <div class="user-card__body">
                    <strong>{{ user.displayName }}</strong>
                    <span>{{ user.email }}</span>
                    <small>{{ user.role === 'admin' ? 'Admin' : 'Miembro' }}</small>
                </div>

                <button
                    class="user-card__delete"
                    type="button"
                    :aria-label="`Borrar ${user.displayName}`"
                    :title="`Borrar ${user.displayName}`"
                    @click="emit('delete', user.id)"
                >
                    <Trash2 :size="17" />
                </button>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.users {
    display: grid;
    gap: 1rem;
}

.users__header {
    display: grid;
    gap: 0.25rem;
}

.users__header span {
    color: #ff86dd;
    font-size: 0.78rem;
    text-transform: uppercase;
}

.users__header h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.25rem;
}

.users__list {
    display: grid;
    gap: 0.75rem;
    padding: 0;
    margin: 0;
    list-style: none;
}

.user-card {
    display: grid;
    grid-template-columns: 2.5rem 1fr auto;
    gap: 0.85rem;
    align-items: center;
    padding: 0.9rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 22px;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03)),
        rgba(8, 15, 29, 0.64);
    box-shadow:
        10px 10px 28px rgba(0, 0, 0, 0.26),
        -8px -8px 20px rgba(124, 247, 255, 0.04),
        inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

.user-card__icon,
.user-card__delete {
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid rgba(124, 247, 255, 0.3);
    border-radius: 50%;
    color: #9df6ff;
    background: rgba(124, 247, 255, 0.08);
}

.user-card__delete {
    color: #ff9abc;
    cursor: pointer;
}

.user-card__body {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
}

.user-card__body strong {
    color: #ffffff;
}

.user-card__body span,
.user-card__body small {
    color: #b8d9df;
}
</style>
