<script setup lang="ts">
defineProps<{
    label: string
    ,value: number
    ,tone?: 'cyan' | 'magenta' | 'lime'
}>()
</script>

<template>
    <section class="progress" :class="tone ?? 'cyan'">
        <div class="progress__meta">
            <span>{{ label }}</span>
            <strong>{{ value }}%</strong>
        </div>
        <div class="progress__track" aria-hidden="true">
            <div class="progress__fill" :style="{ width: `${value}%` }"></div>
        </div>
    </section>
</template>

<style scoped>
.progress {
    display: grid;
    gap: 0.65rem;
}

.progress__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: #c9f7ff;
    font-size: 0.82rem;
    letter-spacing: 0;
    text-transform: uppercase;
}

.progress__meta strong {
    color: #ffffff;
    font-size: 0.95rem;
}

.progress__track {
    height: 0.8rem;
    overflow: hidden;
    border: 1px solid rgba(146, 244, 255, 0.22);
    border-radius: 999px;
    background: rgba(5, 12, 24, 0.62);
    box-shadow:
        inset 5px 5px 12px rgba(0, 0, 0, 0.44),
        inset -4px -4px 12px rgba(255, 255, 255, 0.05);
}

.progress__fill {
    height: 100%;
    min-width: 0.25rem;
    border-radius: inherit;
    transition: width 240ms ease;
}

.cyan .progress__fill {
    background: linear-gradient(90deg, #00e7ff, #78ffea);
    box-shadow: 0 0 18px rgba(0, 231, 255, 0.65);
}

.magenta .progress__fill {
    background: linear-gradient(90deg, #ff3df2, #ff9d6c);
    box-shadow: 0 0 18px rgba(255, 61, 242, 0.55);
}

.lime .progress__fill {
    background: linear-gradient(90deg, #bcff4f, #35ffb6);
    box-shadow: 0 0 18px rgba(188, 255, 79, 0.5);
}
</style>
