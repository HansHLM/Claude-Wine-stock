const STORAGE_KEY = 'wine_cellar_v1'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function seedData() {
  return [
    { id: uid(), name: 'Château Margaux', type: 'Red', vintage: 2015, region: 'Bordeaux, Frankrijk', quantity: 3, price: 120, notes: 'Elegante, complexe tannines. Heerlijk bij gerijpt rundvlees.' },
    { id: uid(), name: 'Cloudy Bay Sauvignon Blanc', type: 'White', vintage: 2022, region: 'Marlborough, Nieuw-Zeeland', quantity: 6, price: 22, notes: null },
    { id: uid(), name: 'Moët & Chandon Impérial', type: 'Sparkling', vintage: null, region: 'Champagne, Frankrijk', quantity: 2, price: 45, notes: 'Voor feestelijke momenten.' },
    { id: uid(), name: 'Whispering Angel', type: 'Rosé', vintage: 2023, region: 'Provence, Frankrijk', quantity: 4, price: 28, notes: null },
    { id: uid(), name: 'Penfolds Grange', type: 'Red', vintage: 2018, region: 'Barossa Valley, Australië', quantity: 1, price: 380, notes: 'Iconische Australische Shiraz. Niet openen vóór 2028.' },
  ]
}

export const useWines = () => {
  const wines = useState('wines', () => [])
  const loaded = useState('wines-loaded', () => false)

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wines.value))
  }

  function load() {
    if (!import.meta.client || loaded.value) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        wines.value = JSON.parse(raw) || []
      } else {
        wines.value = seedData()
        persist()
      }
    } catch {
      wines.value = []
    }
    loaded.value = true
  }

  function upsertWine(data) {
    if (data.id) {
      const idx = wines.value.findIndex(w => w.id === data.id)
      if (idx !== -1) wines.value[idx] = { ...data }
    } else {
      wines.value.push({ ...data, id: uid() })
    }
    persist()
  }

  function deleteWine(id) {
    wines.value = wines.value.filter(w => w.id !== id)
    persist()
  }

  function adjustQuantity(id, delta) {
    const wine = wines.value.find(w => w.id === id)
    if (!wine) return
    wine.quantity = Math.max(0, wine.quantity + delta)
    persist()
  }

  return { wines, load, upsertWine, deleteWine, adjustQuantity }
}
