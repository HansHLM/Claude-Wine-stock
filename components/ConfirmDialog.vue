<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Bevestigen' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Bevestigen' },
  cancelLabel: { type: String, default: 'Annuleren' },
})
const emit = defineEmits(['confirm', 'cancel'])

function onKey(e) {
  if (!props.open) return
  if (e.key === 'Escape') emit('cancel')
  if (e.key === 'Enter') emit('confirm')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('cancel')">
        <div class="dialoog" role="dialog" aria-modal="true" aria-labelledby="dialoog-titel">
          <h2 id="dialoog-titel">{{ title }}</h2>
          <p>{{ message }}</p>
          <div class="acties">
            <button class="link" @click="emit('cancel')">{{ cancelLabel }}</button>
            <button class="primair" @click="emit('confirm')">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 35, 24, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 110;
  padding: 1rem;
}
.dialoog {
  background: var(--mergelwit);
  color: var(--grachtengroen-diep);
  width: 100%;
  max-width: 24rem;
  padding: 2rem 2.25rem 1.85rem;
  border-radius: 2px;
}
.dialoog h2 {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin-bottom: 0.7rem;
  color: var(--grachtengroen-diep);
}
.dialoog p {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--grachtengroen-gedimd);
  margin-bottom: 1.75rem;
}
.acties {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.25rem;
}
.link {
  color: var(--grachtengroen-gedimd);
  font-size: 0.95rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid transparent;
  transition: color 200ms ease, border-color 200ms ease;
}
.link:hover { color: var(--koper); border-color: var(--koper); }
.primair {
  background: var(--grachtengroen);
  color: var(--mergelwit-warm);
  padding: 0.65rem 1.4rem;
  border-radius: 999px;
  font-size: 0.95rem;
  transition: background 200ms ease;
}
.primair:hover { background: var(--grachtengroen-diep); }

.modal-enter-active, .modal-leave-active { transition: opacity 250ms ease-out; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .dialoog, .modal-leave-active .dialoog { transition: transform 250ms ease-out, opacity 250ms ease-out; }
.modal-enter-from .dialoog { transform: translateY(8px); opacity: 0; }
.modal-leave-to .dialoog { opacity: 0; }
</style>
