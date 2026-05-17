<script setup>
const props = defineProps({
  wine: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'delete', 'inc', 'dec'])

const TYPE_LABEL = {
  Red: 'Rood',
  White: 'Wit',
  'Rosé': 'Rosé',
  Sparkling: 'Mousserend',
  Dessert: 'Dessert',
  Fortified: 'Versterkt',
}

const stockState = computed(() => {
  if (props.wine.quantity === 0) return 'op'
  if (props.wine.quantity <= 2) return 'laag'
  return ''
})
</script>

<template>
  <article
    class="kaart"
    :class="[stockState && `voorraad-${stockState}`, { actief: selected }]"
  >
    <header class="kaart-kop">
      <h3 class="naam">{{ wine.name }}</h3>
      <div class="acties">
        <button class="actie" @click="emit('edit', wine.id)">Bewerken</button>
        <button class="actie" @click="emit('delete', wine.id)">Verwijderen</button>
      </div>
    </header>

    <p class="meta">
      <span class="soort">{{ TYPE_LABEL[wine.type] || wine.type }}</span>
      <span v-if="wine.vintage" class="jaargang">{{ wine.vintage }}</span>
      <span v-if="wine.region" class="streek">{{ wine.region }}</span>
    </p>

    <p v-if="wine.notes" class="notitie">{{ wine.notes }}</p>

    <footer class="kaart-voet">
      <div class="aantal">
        <button class="aantal-knop" :disabled="wine.quantity === 0" aria-label="Minder" @click="emit('dec', wine.id)">−</button>
        <span class="aantal-waarde">{{ wine.quantity }}</span>
        <button class="aantal-knop" aria-label="Meer" @click="emit('inc', wine.id)">+</button>
        <span class="aantal-label">flessen</span>
      </div>
      <span v-if="wine.price" class="prijs">€{{ wine.price.toFixed(2) }}</span>
      <span v-if="stockState" class="status" :class="stockState">{{ stockState === 'op' ? 'Op' : 'Laag' }}</span>
    </footer>
  </article>
</template>

<style scoped>
.kaart {
  position: relative;
  background: var(--grachtengroen-gedimd);
  color: var(--mergelwit);
  padding: 1.5rem 1.6rem 1.25rem;
  border-radius: 2px;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: border-color 250ms ease, background 250ms ease;
}
.kaart:hover {
  background: color-mix(in srgb, var(--grachtengroen-gedimd) 85%, var(--mergelwit) 15%);
}
.kaart.actief { border-color: var(--koper); }

.kaart-kop {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.naam {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--mergelwit);
  word-break: break-word;
}

.acties {
  display: flex;
  gap: 0.85rem;
  flex-shrink: 0;
  padding-top: 0.35rem;
}
.actie {
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  color: var(--mergelwit-gedimd);
  transition: color 200ms ease;
}
.actie:hover { color: var(--koper); }

.meta {
  display: flex;
  gap: 0.6rem 1rem;
  flex-wrap: wrap;
  align-items: baseline;
  font-size: 0.875rem;
  color: var(--mergelwit-gedimd);
}
.soort {
  color: var(--mergelwit-warm);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.7rem;
}
.jaargang {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1rem;
  color: var(--koper);
}
.streek { font-style: italic; }

.notitie {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--mergelwit-gedimd);
  border-top: 1px solid color-mix(in srgb, var(--mergelwit) 12%, transparent);
  padding-top: 0.85rem;
  font-style: italic;
}

.kaart-voet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid color-mix(in srgb, var(--mergelwit) 12%, transparent);
  flex-wrap: wrap;
}

.aantal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.aantal-knop {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--mergelwit) 28%, transparent);
  color: var(--mergelwit);
  font-size: 1rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 200ms ease, border-color 200ms ease, opacity 200ms ease;
}
.aantal-knop:hover:not(:disabled) {
  background: color-mix(in srgb, var(--mergelwit) 12%, transparent);
  border-color: var(--mergelwit);
}
.aantal-knop:disabled { opacity: 0.3; cursor: not-allowed; }
.aantal-waarde {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.15rem;
  min-width: 1.4rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.aantal-label {
  font-size: 0.8rem;
  color: var(--mergelwit-gedimd);
}

.prijs {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1rem;
  color: var(--koper);
  font-variant-numeric: tabular-nums;
}

.status {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mergelwit-gedimd);
}
.status.op { color: var(--koper); }

.voorraad-op { opacity: 0.65; }
.voorraad-op .naam { color: var(--mergelwit-gedimd); }
</style>
