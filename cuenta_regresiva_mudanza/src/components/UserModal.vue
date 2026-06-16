<script setup lang="ts">
import {
    Save
    ,X
} from '@lucide/vue'
import { ref } from 'vue'
import type { MoveUser } from '@/stores/moveTasks'

defineProps<{
    open: boolean
}>()

const emit = defineEmits<{
    close: []
    ,save: [user: Pick<MoveUser, 'email' | 'displayName' | 'role'>]
}>()

const form = ref({
    email: ''
    ,displayName: ''
    ,role: 'member' as MoveUser['role']
})

function saveUser() {
    if (!form.value.email.trim() || !form.value.displayName.trim()) {
        return
    }

    emit('save', {
        email: form.value.email.trim()
        ,displayName: form.value.displayName.trim()
        ,role: form.value.role
    })

    form.value = {
        email: ''
        ,displayName: ''
        ,role: 'member'
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
            <form class="modal" @submit.prevent="saveUser">
                <div class="modal__header">
                    <h2>Nuevo usuario</h2>
                    <button type="button" class="icon-button" aria-label="Cerrar" @click="emit('close')">
                        <X :size="20" />
                    </button>
                </div>

                <p class="hint">
                    Se enviara un password temporal al correo y debera cambiarlo al entrar.
                </p>

                <label>
                    <span>Nombre</span>
                    <input v-model="form.displayName" type="text" required />
                </label>

                <label>
                    <span>Email</span>
                    <input v-model="form.email" type="email" required />
                </label>

                <label>
                    <span>Rol</span>
                    <select v-model="form.role">
                        <option value="member">Miembro</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>

                <button class="save-button" type="submit">
                    <Save :size="18" />
                    Guardar usuario
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
    width: min(30rem, 100%);
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
}

.hint {
    margin: 0;
    color: #b8d9df;
    line-height: 1.5;
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
select {
    width: 100%;
    min-height: 2.75rem;
    padding: 0 0.85rem;
    border: 1px solid rgba(124, 247, 255, 0.22);
    border-radius: 18px;
    color: #eafcff;
    background: rgba(5, 12, 24, 0.66);
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
