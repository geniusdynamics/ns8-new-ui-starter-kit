<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <aside class="app-side-nav">
    <AppSideMenuContent />
  </aside>
</template>

<script setup lang="ts">
import AppSideMenuContent from './AppSideMenuContent.vue'
</script>

<style scoped>
.app-side-nav {
  width: 16rem;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: hsl(var(--background));
  border-right: 1px solid hsl(var(--border));
  z-index: 100;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .app-side-nav {
    display: none;
  }
}
</style>
