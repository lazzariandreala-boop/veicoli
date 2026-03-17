<template>
  <div id="app-root">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <BottomNav v-if="showNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const showNav = computed(() =>
  !['add-vehicle', 'edit-vehicle', 'vehicle-detail'].includes(route.name)
)
</script>

<style>
#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-page);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.22s ease, opacity 0.22s ease; }
.slide-enter-from { transform: translateX(32px); opacity: 0; }
.slide-leave-to { transform: translateX(-16px); opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.28s cubic-bezier(.32,.72,0,1), opacity 0.22s ease; }
.slide-up-enter-from { transform: translateY(40px); opacity: 0; }
.slide-up-leave-to { transform: translateY(20px); opacity: 0; }
</style>
