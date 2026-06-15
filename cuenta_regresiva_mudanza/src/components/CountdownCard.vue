<script setup lang="ts">
import type { CountdownParts } from '@/domain/moveClock'

defineProps<{
    countdown: CountdownParts
    ,moveDateLabel: string
}>()

const units = [
    {
        key: 'days'
        ,label: 'Dias'
    }
    ,{
        key: 'hours'
        ,label: 'Horas'
    }
    ,{
        key: 'minutes'
        ,label: 'Minutos'
    }
    ,{
        key: 'seconds'
        ,label: 'Segundos'
    }
] as const
</script>

<template>
    <section class="countdown" aria-label="Cuenta regresiva para la mudanza">
        <div class="countdown__status">
            <span></span>
            Cronometro activo
        </div>

        <div class="countdown__grid">
            <article
                v-for="unit in units"
                :key="unit.key"
                class="time-unit"
            >
                <strong>{{ String(countdown[unit.key]).padStart(2, '0') }}</strong>
                <span>{{ unit.label }}</span>
            </article>
        </div>

        <p>{{ moveDateLabel }}</p>
    </section>
</template>

<style scoped>
.countdown {
    display: grid;
    gap: 1.2rem;
    padding: clamp(1rem, 4vw, 2rem);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 34px;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.035)),
        rgba(7, 14, 28, 0.58);
    box-shadow:
        18px 18px 48px rgba(0, 0, 0, 0.34),
        -10px -10px 32px rgba(124, 247, 255, 0.055),
        inset 1px 1px 0 rgba(255, 255, 255, 0.14),
        inset -12px -12px 28px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(18px);
}

.countdown__status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;
    padding: 0.35rem 0.6rem;
    border: 1px solid rgba(216, 255, 98, 0.28);
    border-radius: 999px;
    color: #d8ff62;
    background: rgba(216, 255, 98, 0.08);
    font-size: 0.78rem;
    text-transform: uppercase;
}

.countdown__status span {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: #d8ff62;
    box-shadow: 0 0 16px rgba(216, 255, 98, 0.9);
    animation: pulse 1s ease-in-out infinite;
}

.countdown__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(0.75rem, 2vw, 1rem);
}

.time-unit {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    min-width: 0;
    border: 1px solid rgba(124, 247, 255, 0.18);
    border-radius: 30px;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
        rgba(4, 10, 20, 0.66);
    box-shadow:
        12px 12px 26px rgba(0, 0, 0, 0.32),
        -8px -8px 22px rgba(124, 247, 255, 0.045),
        inset 2px 2px 5px rgba(255, 255, 255, 0.08),
        inset -8px -8px 16px rgba(0, 0, 0, 0.22);
}

.time-unit strong {
    color: #ffffff;
    font-size: clamp(2.8rem, 8vw, 5.2rem);
    line-height: 0.9;
    text-shadow:
        0 0 18px rgba(124, 247, 255, 0.65),
        0 0 28px rgba(255, 59, 212, 0.28);
}

.time-unit span {
    color: #d8ff62;
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
}

.countdown p {
    margin: 0;
    color: #bdeef5;
    font-size: 0.95rem;
    line-height: 1.5;
    text-align: center;
}

@keyframes pulse {
    50% {
        opacity: 0.45;
        transform: scale(0.72);
    }
}

@media (max-width: 520px) {
    .countdown {
        border-radius: 24px;
    }

    .countdown__grid {
        grid-template-columns: repeat(2, minmax(7rem, 1fr));
    }
}
</style>
