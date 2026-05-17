<script setup>
const { wines, load } = useWines()
onMounted(load)

const totals = computed(() => {
  const flessen = wines.value.reduce((s, w) => s + w.quantity, 0)
  const soorten = new Set(wines.value.map(w => w.type)).size
  const waarde = wines.value.reduce((s, w) => s + (w.price || 0) * w.quantity, 0)
  return { labels: wines.value.length, flessen, soorten, waarde }
})
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink to="/" class="brand">
        <span class="brand-bar" aria-hidden="true" />
        <span class="brand-name">Wijnkelder</span>
      </NuxtLink>
      <ClientOnly>
        <dl class="stats">
          <div class="stat">
            <dt>Labels</dt>
            <dd>{{ totals.labels }}</dd>
          </div>
          <div class="stat">
            <dt>Flessen</dt>
            <dd>{{ totals.flessen }}</dd>
          </div>
          <div class="stat">
            <dt>Soorten</dt>
            <dd>{{ totals.soorten }}</dd>
          </div>
          <div v-if="totals.waarde > 0" class="stat">
            <dt>Waarde</dt>
            <dd>€{{ totals.waarde.toFixed(0) }}</dd>
          </div>
        </dl>
      </ClientOnly>
    </div>
  </header>
</template>

<style scoped>
.header {
  border-bottom: 1px solid var(--grachtengroen-gedimd);
  background: var(--grachtengroen-diep);
}
.header-inner {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--mergelwit);
}
.brand:hover { color: var(--mergelwit); }
.brand-bar {
  width: 2px;
  height: 26px;
  background: var(--koper);
  display: inline-block;
}
.brand-name {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: -0.01em;
}
.stats {
  display: flex;
  gap: 2.5rem;
  margin: 0;
}
.stat dt {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mergelwit-gedimd);
}
.stat dd {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  margin-top: 0.2rem;
  color: var(--mergelwit);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .header-inner { padding: 1.25rem 1.5rem; gap: 1.25rem; }
  .stats { gap: 1.5rem; }
  .stat dd { font-size: 1.25rem; }
}
</style>
