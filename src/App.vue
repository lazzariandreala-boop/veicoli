<template>
  <div id="app-root">
    <SidebarNav class="desktop-only" />

    <div class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
      <BottomNav v-if="showBottomNav" class="mobile-only" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import SidebarNav from './components/SidebarNav.vue'
import { useSettingsStore } from './stores/settings'

const route = useRoute()
const settings = useSettingsStore()

const showBottomNav = computed(() =>
  !['add-vehicle', 'edit-vehicle', 'vehicle-detail'].includes(route.name)
)

onMounted(async () => {
  await settings.load()
})
</script>

<style>
#app-root {
  display: flex;
  flex-direction: row;
  min-height: 100dvh;
  background: var(--bg-page);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* Mobile: sidebar nascosta, bottom nav visibile */
.desktop-only { display: none; }
.mobile-only  { display: flex; }

@media (min-width: 1024px) {
  .desktop-only { display: flex; }
  .mobile-only  { display: none !important; }
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.22s ease, opacity 0.22s ease; }
.slide-enter-from { transform: translateX(32px); opacity: 0; }
.slide-leave-to { transform: translateX(-16px); opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.28s cubic-bezier(.32,.72,0,1), opacity 0.22s ease; }
.slide-up-enter-from { transform: translateY(40px); opacity: 0; }
.slide-up-leave-to { transform: translateY(20px); opacity: 0; }
</style>
