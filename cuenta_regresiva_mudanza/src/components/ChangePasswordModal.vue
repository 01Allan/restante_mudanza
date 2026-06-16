<script setup lang="ts">
import {
    Eye
    ,EyeOff
    ,Save
} from '@lucide/vue'
import { ref } from 'vue'

defineProps<{
    open: boolean
    ,error: string
}>()

const emit = defineEmits<{
    save: [currentPassword: string, newPassword: string]
}>()

const currentPassword = ref('')
const newPassword = ref('')
const showCurrent = ref(false)
const showNew = ref(false)

function submit() {
    emit('save', currentPassword.value, newPassword.value)
}
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="modal-backdrop">
            <form class="modal" @submit.prevent="submit">
                <h2>Cambia tu password</h2>
                <p>Entraste con un password temporal. Define uno nuevo para continuar.</p>

                <label>
                    <span>Password temporal</span>
                    <div class="password-field">
                        <input
                            v-model="currentPassword"
                            :type="showCurrent ? 'text' : 'password'"
                            required
                        />
                        <button type="button" @click="showCurrent = !showCurrent">
                            <EyeOff v-if="showCurrent" :size="18" />
                            <Eye v-else :size="18" />
                        </button>
                    </div>
                </label>

                <label>
                    <span>Nuevo password</span>
                    <div class="password-field">
                        <input
                            v-model="newPassword"
                            :type="showNew ? 'text' : 'password'"
                            minlength="8"
                            required
                        />
                        <button type="button" @click="showNew = !showNew">
                            <EyeOff v-if="showNew" :size="18" />
                            <Eye v-else :size="18" />
                        </button>
                    </div>
                </label>

                <p v-if="error" class="error">{{ error }}</p>

                <button class="save-button" type="submit">
                    <Save :size="18" />
                    Guardar password
                </button>
            </form>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 11;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(2, 6, 14, 0.78);
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
        rgba(7, 14, 28, 0.9);
}

h2,
p {
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

.password-field {
    display: grid;
    grid-template-columns: 1fr 2.75rem;
    gap: 0.5rem;
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

.password-field button,
.save-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(124, 247, 255, 0.28);
    color: #eafcff;
    background: rgba(124, 247, 255, 0.08);
    cursor: pointer;
}

.password-field button {
    border-radius: 18px;
}

.save-button {
    gap: 0.5rem;
    min-height: 2.8rem;
    border-radius: 999px;
}

.error {
    color: #ff9abc;
}
</style>
