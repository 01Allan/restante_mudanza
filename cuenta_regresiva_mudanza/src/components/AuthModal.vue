<script setup lang="ts">
import {
    LogIn
    ,X
} from '@lucide/vue'
import { ref } from 'vue'

defineProps<{
    open: boolean
    ,error: string
}>()

const emit = defineEmits<{
    close: []
    ,login: [email: string, password: string]
}>()

const email = ref('admin@mudanza.local')
const password = ref('mudanza')

function submit() {
    emit('login', email.value, password.value)
}
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
            <form class="modal" @submit.prevent="submit">
                <div class="modal__header">
                    <h2>Entrar</h2>
                    <button type="button" class="icon-button" aria-label="Cerrar" @click="emit('close')">
                        <X :size="20" />
                    </button>
                </div>

                <label>
                    <span>Email</span>
                    <input v-model="email" type="email" autocomplete="username" required />
                </label>

                <label>
                    <span>Password</span>
                    <input v-model="password" type="password" autocomplete="current-password" required />
                </label>

                <p v-if="error" class="error">{{ error }}</p>

                <button class="save-button" type="submit">
                    <LogIn :size="18" />
                    Entrar
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
    width: min(28rem, 100%);
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

label {
    display: grid;
    gap: 0.45rem;
}

label span {
    color: #9df6ff;
    font-size: 0.78rem;
    text-transform: uppercase;
}

input {
    width: 100%;
    min-height: 2.75rem;
    padding: 0 0.85rem;
    border: 1px solid rgba(124, 247, 255, 0.22);
    border-radius: 18px;
    color: #eafcff;
    background: rgba(5, 12, 24, 0.66);
}

.error {
    margin: 0;
    color: #ff9abc;
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
