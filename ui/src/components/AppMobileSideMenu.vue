<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <Transition name="slide-menu">
    <div
      v-if="isMenuShown"
      class="mobile-side-menu"
    >
      <AppSideMenuContent />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppSideMenuContent from './AppSideMenuContent.vue'

const isMenuShown = ref(false)

const toggleMobileSideMenu = () => {
  isMenuShown.value = !isMenuShown.value
}

// Listen for toggle event from parent
const handleMessage = (event: MessageEvent) => {
  if (event.data?.type === 'toggleMobileSideMenu') {
    toggleMobileSideMenu()
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.mobile-side-menu {
  width: 16rem;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: hsl(var(--background));
  border-right: 1px solid hsl(var(--border));
  z-index: 1000;
  overflow-y: auto;
}

.slide-menu-enter-active,
.slide-menu-leave-active {
  transition: all 0.3s ease;
}

.slide-menu-enter-from,
.slide-menu-leave-to {
  transform: translateX(-100%);
}

@media (min-width: 769px) {
  .mobile-side-menu {
    display: none;
  }
}
</style>
