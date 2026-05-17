<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  wine: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save'])

const form = reactive({
  id: '',
  name: '',
  type: '',
  vintage: '',
  region: '',
  quantity: '',
  price: '',
  notes: '',
})
const errors = reactive({ name: false, type: false, quantity: false })

watch(() => props.open, (open) => {
  if (!open) return
  if (props.wine) {
    form.id = props.wine.id
    form.name = props.wine.name
    form.type = props.wine.type
    form.vintage = props.wine.vintage ?? ''
    form.region = props.wine.region ?? ''
    form.quantity = props.wine.quantity
    form.price = props.wine.price ?? ''
    form.notes = props.wine.notes ?? ''
  } else {
    Object.assign(form, { id: '', name: '', type: '', vintage: '', region: '', quantity: '', price: '', notes: '' })
  }
  errors.name = errors.type = errors.quantity = false
  nextTick(() => {
    const el = document.getElementById('paneel-naam')
    if (el) el.focus()
  })
})

function onKey(e) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function submit() {
  errors.name = !String(form.name).trim()
  errors.type = !form.type
  errors.quantity = form.quantity === '' || Number(form.quantity) < 1
  if (errors.name || errors.type || errors.quantity) return

  emit('save', {
    id: form.id || undefined,
    name: String(form.name).trim(),
    type: form.type,
    vintage: form.vintage !== '' ? Number(form.vintage) : null,
    region: String(form.region).trim() || null,
    quantity: Number(form.quantity),
    price: form.price !== '' ? Number(form.price) : null,
    notes: String(form.notes).trim() || null,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="paneel-overlay">
      <div v-if="open" class="overlay" @click.self="emit('close')" />
    </Transition>
    <Transition name="paneel">
      <aside
        v-if="open"
        class="paneel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paneel-titel"
      >
        <div class="paneel-inner">
          <header class="paneel-kop">
            <p class="eyebrow">{{ wine ? 'Bewerken' : 'Toevoegen' }}</p>
            <h2 id="paneel-titel">{{ wine ? wine.name : 'Nieuwe wijn' }}</h2>
            <button class="sluiten" @click="emit('close')">Sluiten</button>
          </header>

          <form class="formulier" novalidate @submit.prevent="submit">
            <label class="veld">
              <span class="veld-label">Naam</span>
              <input
                id="paneel-naam"
                v-model="form.name"
                type="text"
                placeholder="Château Margaux"
                :class="{ fout: errors.name }"
              />
            </label>

            <label class="veld">
              <span class="veld-label">Soort</span>
              <select v-model="form.type" :class="{ fout: errors.type }">
                <option value="">Kies een soort…</option>
                <option value="Red">Rood</option>
                <option value="White">Wit</option>
                <option value="Rosé">Rosé</option>
                <option value="Sparkling">Mousserend</option>
                <option value="Dessert">Dessert</option>
                <option value="Fortified">Versterkt</option>
              </select>
            </label>

            <div class="rij">
              <label class="veld">
                <span class="veld-label">Jaargang</span>
                <input v-model="form.vintage" type="number" min="1800" max="2099" placeholder="2019" />
              </label>
              <label class="veld">
                <span class="veld-label">Aantal flessen</span>
                <input
                  v-model="form.quantity"
                  type="number"
                  min="1"
                  placeholder="6"
                  :class="{ fout: errors.quantity }"
                />
              </label>
            </div>

            <label class="veld">
              <span class="veld-label">Streek / producent</span>
              <input v-model="form.region" type="text" placeholder="Bordeaux, Frankrijk" />
            </label>

            <label class="veld">
              <span class="veld-label">Prijs per fles (€)</span>
              <input v-model="form.price" type="number" min="0" step="0.01" placeholder="25.00" />
            </label>

            <label class="veld">
              <span class="veld-label">Notities</span>
              <textarea v-model="form.notes" rows="4" placeholder="Smaak, gerechten, drinkvenster…" />
            </label>

            <div class="paneel-voet">
              <button type="button" class="link" @click="emit('close')">Annuleren</button>
              <button type="submit" class="primair">{{ wine ? 'Opslaan' : 'Toevoegen' }}</button>
            </div>
          </form>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 35, 24, 0.55);
  z-index: 90;
}

.paneel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(30rem, 100vw);
  background: var(--mergelwit-warm);
  color: var(--grachtengroen-diep);
  z-index: 100;
  overflow-y: auto;
}

.paneel-inner {
  padding: 2rem 2.25rem 3rem;
  min-height: 100%;
}

.paneel-kop {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 0.5rem 1rem;
  padding-bottom: 1.25rem;
  margin-bottom: 1.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--grachtengroen-diep) 14%, transparent);
}
.eyebrow {
  grid-column: 1 / -1;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--grachtengroen-gedimd);
}
.paneel-kop h2 {
  font-family: 'Newsreader', Georgia, serif;
  font-size: clamp(1.75rem, 4vw, 2.1rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--grachtengroen-diep);
  word-break: break-word;
}
.sluiten {
  font-size: 0.85rem;
  color: var(--grachtengroen-gedimd);
  align-self: end;
  padding: 0.25rem 0;
  border-bottom: 1px solid transparent;
  transition: color 200ms ease, border-color 200ms ease;
}
.sluiten:hover {
  color: var(--koper);
  border-color: var(--koper);
}

.formulier {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.veld {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.veld-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--grachtengroen-gedimd);
}

.paneel input,
.paneel select,
.paneel textarea {
  background: transparent;
  border: none;
  border-bottom: 1px solid color-mix(in srgb, var(--grachtengroen-diep) 20%, transparent);
  padding: 0.5rem 0;
  font-size: 1rem;
  color: var(--grachtengroen-diep);
  width: 100%;
  font-family: inherit;
  transition: border-color 200ms ease;
}
.paneel input:focus,
.paneel select:focus,
.paneel textarea:focus {
  outline: none;
  border-color: var(--koper);
}
.paneel input::placeholder,
.paneel textarea::placeholder {
  color: color-mix(in srgb, var(--grachtengroen-diep) 35%, transparent);
}
.paneel textarea { resize: vertical; }
.fout { border-color: var(--koper) !important; }

.paneel select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='%231F3B2D' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 center;
  padding-right: 1.5rem;
}

.rij {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.paneel-voet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid color-mix(in srgb, var(--grachtengroen-diep) 14%, transparent);
}
.link {
  font-size: 0.95rem;
  color: var(--grachtengroen-gedimd);
  padding: 0.4rem 0;
}
.link:hover { color: var(--koper); }
.primair {
  background: var(--grachtengroen);
  color: var(--mergelwit-warm);
  padding: 0.7rem 1.6rem;
  border-radius: 999px;
  font-size: 0.95rem;
  transition: background 200ms ease;
}
.primair:hover { background: var(--grachtengroen-diep); }

.paneel-enter-active,
.paneel-leave-active {
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}
.paneel-enter-from,
.paneel-leave-to {
  transform: translateX(2rem);
  opacity: 0;
}

.paneel-overlay-enter-active,
.paneel-overlay-leave-active {
  transition: opacity 300ms ease-out;
}
.paneel-overlay-enter-from,
.paneel-overlay-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .paneel-inner { padding: 1.5rem 1.5rem 2.5rem; }
  .rij { grid-template-columns: 1fr; gap: 1.1rem; }
}
</style>
