<script setup>
useHead({ title: 'Overzicht — Wijnkelder' })

const { wines, load } = useWines()
onMounted(load)

const TYPE_LABEL = {
  Red: 'Rood',
  White: 'Wit',
  'Rosé': 'Rosé',
  Sparkling: 'Mousserend',
  Dessert: 'Dessert',
  Fortified: 'Versterkt',
}

const totals = computed(() => {
  const flessen = wines.value.reduce((s, w) => s + w.quantity, 0)
  const waarde = wines.value.reduce((s, w) => s + (w.price || 0) * w.quantity, 0)
  const laag = wines.value.filter(w => w.quantity > 0 && w.quantity <= 2).length
  const op = wines.value.filter(w => w.quantity === 0).length
  return { labels: wines.value.length, flessen, waarde, laag, op }
})

const perSoort = computed(() => {
  const map = {}
  for (const w of wines.value) {
    if (!map[w.type]) map[w.type] = { labels: 0, flessen: 0, waarde: 0 }
    map[w.type].labels++
    map[w.type].flessen += w.quantity
    map[w.type].waarde += (w.price || 0) * w.quantity
  }
  return Object.entries(map)
    .map(([type, s]) => ({ type, ...s }))
    .sort((a, b) => b.flessen - a.flessen)
})

const gesorteerd = computed(() =>
  [...wines.value].sort((a, b) =>
    a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
  )
)
</script>

<template>
  <div class="page">
    <header class="page-kop">
      <NuxtLink to="/" class="terug">← Terug naar kelder</NuxtLink>
      <p class="eyebrow">Volledig overzicht</p>
      <h1>Wat ligt er in uw kelder</h1>
      <p class="lede">Een rustig totaalbeeld van uw voorraad — per soort en per fles.</p>
    </header>

    <ClientOnly>
      <section class="samenvatting">
        <div class="cijfer">
          <dt>Labels</dt>
          <dd>{{ totals.labels }}</dd>
        </div>
        <div class="cijfer">
          <dt>Flessen</dt>
          <dd>{{ totals.flessen }}</dd>
        </div>
        <div class="cijfer">
          <dt>Soorten</dt>
          <dd>{{ perSoort.length }}</dd>
        </div>
        <div v-if="totals.waarde > 0" class="cijfer">
          <dt>Geschatte waarde</dt>
          <dd>€{{ totals.waarde.toFixed(0) }}</dd>
        </div>
        <div class="cijfer">
          <dt>Lage voorraad</dt>
          <dd>{{ totals.laag }}</dd>
        </div>
        <div class="cijfer">
          <dt>Op</dt>
          <dd>{{ totals.op }}</dd>
        </div>
      </section>

      <p v-if="totals.labels === 0" class="leeg">
        Uw kelder is leeg. Voeg eerst een wijn toe om hier een overzicht te zien.
      </p>

      <template v-else>
        <h2 class="sectie-kop">Per soort</h2>
        <div class="tabel-wrap">
          <table class="tabel">
            <thead>
              <tr>
                <th>Soort</th>
                <th>Labels</th>
                <th>Flessen</th>
                <th>Waarde</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in perSoort" :key="r.type">
                <td>{{ TYPE_LABEL[r.type] || r.type }}</td>
                <td>{{ r.labels }}</td>
                <td>{{ r.flessen }}</td>
                <td>{{ r.waarde > 0 ? `€${r.waarde.toFixed(2)}` : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 class="sectie-kop">Alle wijnen</h2>
        <div class="tabel-wrap">
          <table class="tabel">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Soort</th>
                <th>Jaar</th>
                <th>Streek</th>
                <th>Aantal</th>
                <th>Prijs</th>
                <th>Subtotaal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in gesorteerd" :key="w.id">
                <td>{{ w.name }}</td>
                <td>{{ TYPE_LABEL[w.type] || w.type }}</td>
                <td>{{ w.vintage || '—' }}</td>
                <td>{{ w.region || '—' }}</td>
                <td>{{ w.quantity }}</td>
                <td>{{ w.price ? `€${w.price.toFixed(2)}` : '—' }}</td>
                <td>{{ w.price ? `€${(w.price * w.quantity).toFixed(2)}` : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.page {
  max-width: 60rem;
  margin: 0 auto;
  padding: 5rem 2rem 8rem;
}

.page-kop { margin-bottom: 4rem; }
.terug {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--mergelwit-gedimd);
  margin-bottom: 1.75rem;
  letter-spacing: 0.02em;
}
.terug:hover { color: var(--koper); }
.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mergelwit-gedimd);
  margin-bottom: 1rem;
}
.page-kop h1 {
  font-family: 'Newsreader', Georgia, serif;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--mergelwit);
}
.lede {
  margin-top: 1rem;
  color: var(--mergelwit-gedimd);
  max-width: 32rem;
}

.samenvatting {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 2rem;
  padding: 2rem 0;
  border-top: 1px solid var(--grachtengroen-gedimd);
  border-bottom: 1px solid var(--grachtengroen-gedimd);
  margin-bottom: 3.5rem;
}
.cijfer dt {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mergelwit-gedimd);
  margin-bottom: 0.4rem;
}
.cijfer dd {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--mergelwit);
  font-variant-numeric: tabular-nums;
}

.sectie-kop {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  margin: 3.5rem 0 1.25rem;
  letter-spacing: -0.01em;
  color: var(--mergelwit);
}

.tabel-wrap { overflow-x: auto; }
.tabel {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
.tabel th, .tabel td {
  text-align: left;
  padding: 0.85rem 1rem 0.85rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--mergelwit) 14%, transparent);
  white-space: nowrap;
}
.tabel th {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mergelwit-gedimd);
  font-weight: 400;
  padding-bottom: 0.85rem;
}
.tabel tbody tr:hover {
  background: color-mix(in srgb, var(--mergelwit) 5%, transparent);
}
.tabel tbody tr:last-child td { border-bottom: none; }

.leeg {
  padding: 4rem 0;
  text-align: center;
  color: var(--mergelwit-gedimd);
  font-style: italic;
}

@media (prefers-reduced-motion: no-preference) {
  .page { animation: rustig-verschijn 500ms ease-out; }
}
@keyframes rustig-verschijn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .page { padding: 3rem 1.25rem 5rem; }
}
</style>
