<script setup>
useHead({ title: 'Wijnkelder' })

const { wines, load, upsertWine, deleteWine, adjustQuantity } = useWines()
onMounted(load)

const search = ref('')
const filterType = ref('')
const sortBy = ref('name')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = wines.value.filter(w => {
    const tekst = !q
      || w.name.toLowerCase().includes(q)
      || (w.region || '').toLowerCase().includes(q)
      || (w.notes || '').toLowerCase().includes(q)
    const soort = !filterType.value || w.type === filterType.value
    return tekst && soort
  })
  return [...list].sort((a, b) => {
    if (sortBy.value === 'vintage') return (b.vintage || 0) - (a.vintage || 0)
    if (sortBy.value === 'type') return a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
    if (sortBy.value === 'quantity') return b.quantity - a.quantity
    return a.name.localeCompare(b.name)
  })
})

const panelOpen = ref(false)
const editingId = ref(null)
const editingWine = computed(() =>
  editingId.value ? wines.value.find(w => w.id === editingId.value) || null : null
)

function openAdd() {
  editingId.value = null
  panelOpen.value = true
}
function openEdit(id) {
  editingId.value = id
  panelOpen.value = true
}
function closePanel() {
  panelOpen.value = false
  editingId.value = null
}
function handleSave(data) {
  upsertWine(data)
  closePanel()
}

const confirmId = ref(null)
const confirmWine = computed(() =>
  confirmId.value ? wines.value.find(w => w.id === confirmId.value) || null : null
)
function askDelete(id) { confirmId.value = id }
function cancelDelete() { confirmId.value = null }
function doDelete() {
  if (confirmId.value) deleteWine(confirmId.value)
  confirmId.value = null
}
</script>

<template>
  <div class="page">
    <section class="intro">
      <p class="eyebrow">Uw kelder</p>
      <h2 class="kop">Een rustige plek voor uw flessen</h2>
      <p class="lede">
        Houd uw collectie overzichtelijk bij — etiket per etiket, jaar per jaar, zonder ruis.
      </p>
    </section>

    <section class="controls">
      <div class="acties">
        <button class="knop knop-primair" @click="openAdd">Wijn toevoegen</button>
        <NuxtLink to="/overzicht" class="knop knop-zacht">Overzicht</NuxtLink>
      </div>
      <div class="filters">
        <input v-model="search" type="search" placeholder="Zoeken…" class="veld" aria-label="Zoeken" />
        <select v-model="filterType" class="veld" aria-label="Filter op soort">
          <option value="">Alle soorten</option>
          <option value="Red">Rood</option>
          <option value="White">Wit</option>
          <option value="Rosé">Rosé</option>
          <option value="Sparkling">Mousserend</option>
          <option value="Dessert">Dessert</option>
          <option value="Fortified">Versterkt</option>
        </select>
        <select v-model="sortBy" class="veld" aria-label="Sortering">
          <option value="name">Sorteer op naam</option>
          <option value="vintage">Sorteer op jaargang</option>
          <option value="type">Sorteer op soort</option>
          <option value="quantity">Sorteer op voorraad</option>
        </select>
      </div>
    </section>

    <ClientOnly>
      <section v-if="filtered.length" class="lijst">
        <WineCard
          v-for="wine in filtered"
          :key="wine.id"
          :wine="wine"
          :selected="editingId === wine.id"
          @edit="openEdit"
          @delete="askDelete"
          @inc="(id) => adjustQuantity(id, 1)"
          @dec="(id) => adjustQuantity(id, -1)"
        />
      </section>
      <section v-else class="leeg">
        <p class="leeg-mark" aria-hidden="true">∅</p>
        <p>
          {{ wines.length
            ? 'Geen wijnen die aan de zoekopdracht voldoen.'
            : 'Uw kelder is nog leeg — voeg uw eerste wijn toe.'
          }}
        </p>
      </section>

      <template #fallback>
        <section class="leeg">
          <p>Een ogenblik geduld…</p>
        </section>
      </template>
    </ClientOnly>

    <WineDetailPanel
      :open="panelOpen"
      :wine="editingWine"
      @close="closePanel"
      @save="handleSave"
    />

    <ConfirmDialog
      :open="!!confirmId"
      title="Wijn verwijderen?"
      :message="confirmWine ? `“${confirmWine.name}” uit de kelder verwijderen?` : ''"
      confirm-label="Verwijderen"
      cancel-label="Annuleren"
      @confirm="doDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.page {
  max-width: 72rem;
  margin: 0 auto;
  padding: 5rem 2rem 8rem;
}

.intro {
  max-width: 38rem;
  margin-bottom: 4rem;
}
.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mergelwit-gedimd);
  margin-bottom: 1.25rem;
}
.kop {
  font-family: 'Newsreader', Georgia, serif;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--mergelwit);
}
.lede {
  margin-top: 1.25rem;
  max-width: 32rem;
  color: var(--mergelwit-gedimd);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem 2rem;
  padding-bottom: 1.75rem;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--grachtengroen-gedimd);
}

.acties {
  display: flex;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.knop {
  display: inline-block;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  transition: background 250ms ease, color 250ms ease, border-color 250ms ease;
  border: 1px solid transparent;
  white-space: nowrap;
  text-align: center;
}
.knop-primair {
  background: var(--mergelwit);
  color: var(--grachtengroen-diep);
}
.knop-primair:hover { background: var(--mergelwit-warm); color: var(--grachtengroen-diep); }
.knop-zacht {
  border-color: var(--grachtengroen-gedimd);
  color: var(--mergelwit);
}
.knop-zacht:hover {
  background: var(--grachtengroen-gedimd);
  color: var(--mergelwit-warm);
}

.veld {
  background: transparent;
  border: 1px solid var(--grachtengroen-gedimd);
  color: var(--mergelwit);
  padding: 0.55rem 0.9rem;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 11rem;
  transition: border-color 200ms ease, background 200ms ease;
  font-family: inherit;
}
.veld:focus {
  outline: none;
  border-color: var(--koper);
  background: color-mix(in srgb, var(--grachtengroen-gedimd) 50%, transparent);
}
.veld::placeholder { color: var(--mergelwit-gedimd); }

select.veld {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='%23C9C2AE' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  padding-right: 2rem;
  cursor: pointer;
}

.lijst {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1.25rem;
}

.leeg {
  padding: 6rem 1rem;
  text-align: center;
  color: var(--mergelwit-gedimd);
}
.leeg-mark {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 3rem;
  color: var(--grachtengroen-gedimd);
  margin-bottom: 1rem;
}

@media (prefers-reduced-motion: no-preference) {
  .intro, .controls { animation: rustig-verschijn 500ms ease-out backwards; }
  .controls { animation-delay: 80ms; }
  .lijst > * { animation: rustig-verschijn 450ms ease-out backwards; }
  .lijst > *:nth-child(1) { animation-delay: 140ms; }
  .lijst > *:nth-child(2) { animation-delay: 190ms; }
  .lijst > *:nth-child(3) { animation-delay: 240ms; }
  .lijst > *:nth-child(4) { animation-delay: 290ms; }
  .lijst > *:nth-child(5) { animation-delay: 340ms; }
  .lijst > *:nth-child(n+6) { animation-delay: 390ms; }
}

@keyframes rustig-verschijn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .page { padding: 3rem 1.25rem 5rem; }
  .controls { flex-direction: column; align-items: stretch; }
  .acties { width: 100%; }
  .acties .knop { flex: 1; }
  .filters { width: 100%; }
  .veld { flex: 1; min-width: 0; }
}
</style>
