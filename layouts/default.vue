<template>
  <div class="site">
    <SiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <footer class="site-voet">
      <p>Wijnkelder — een rustige plek voor uw voorraad.</p>
    </footer>
  </div>
</template>

<style scoped>
.site {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.site-main { flex: 1; }

.site-voet {
  background: var(--grachtengroen-diep);
  color: var(--mergelwit-gedimd);
  padding: 2.5rem 2rem;
  text-align: center;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  border-top: 1px solid var(--grachtengroen-gedimd);
}
</style>
