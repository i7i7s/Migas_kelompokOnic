<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-logo" @click="$emit('tab-change', 'input')">
        <span class="logo-emoji">MIGAS</span>
        <div class="logo-text">
          <span class="logo-title">MIGAS SIMULATOR</span>
          <span class="logo-subtitle">Arus Kas & Kelayakan Lapangan</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="header-nav">
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'input' }"
          @click="$emit('tab-change', 'input')"
        >
          [01] FORM INPUT
        </button>
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'hasil', disabled: !hasResult }"
          :disabled="!hasResult"
          @click="hasResult && $emit('tab-change', 'hasil')"
        >
          [02] ANALISIS
        </button>
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'skenario' }"
          @click="$emit('tab-change', 'skenario')"
        >
          [03] SKENARIO
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
defineProps({
  activeTab: { type: String, required: true },
  hasResult: { type: Boolean, required: true },
})
defineEmits(['tab-change'])
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-primary);
  border-bottom: var(--border-thick);
  height: 70px;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.logo-emoji {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: var(--bg-primary);
  background: var(--text-primary);
  padding: 4px 8px;
  border: var(--border-thick);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--accent-primary);
}

.logo-subtitle {
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-tab {
  background: transparent;
  border: var(--border-thick);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 0;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-brutal);
}

.nav-tab:hover:not(.disabled) {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-brutal-lg);
}

.nav-tab.active {
  background: var(--accent-primary);
  color: var(--text-primary);
}

.nav-tab.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
