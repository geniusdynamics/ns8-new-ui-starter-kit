<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <div class="app-side-menu-content">
    <div class="instance-name">
      <div v-if="store.instanceLabel">{{ store.instanceLabel }}</div>
      <div v-else-if="store.instanceName">{{ store.instanceName }}</div>
      <div v-else class="skeleton">Loading...</div>
    </div>

    <nav class="side-nav-items">
      <button
        class="side-nav-link"
        :class="{ 'current-page': isLinkActive('status') }"
        @click="goToAppPage('status')"
      >
        <Activity class="nav-icon" />
        <span>{{ $t('status.title') }}</span>
      </button>
      <button
        class="side-nav-link"
        :class="{ 'current-page': isLinkActive('settings') }"
        @click="goToAppPage('settings')"
      >
        <Settings class="nav-icon" />
        <span>{{ $t('settings.title') }}</span>
      </button>
      <button
        class="side-nav-link"
        :class="{ 'current-page': isLinkActive('about') }"
        @click="goToAppPage('about')"
      >
        <Info class="nav-icon" />
        <span>{{ $t('about.title') }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { Activity, Settings, Info } from 'lucide-vue-next'
import { useAppStore } from '@/store'
import { useQueryParamService } from '@geniusdynamics/ns8-ui-lib'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const store = useAppStore()
const route = useRoute()
const { getPage } = useQueryParamService()

const isLinkActive = (page: string) => {
  return route.path === `/${page}` || (page === 'status' && route.path === '/')
}

const goToAppPage = (page: string) => {
  const instanceName = store.instanceName || 'example'
  window.parent.postMessage(
    {
      type: 'changeRoute',
      payload: { page, instanceName }
    },
    '*'
  )
}
</script>

<style scoped>
.app-side-menu-content {
  padding: 1rem;
}

.instance-name {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: hsl(var(--foreground));
  border-bottom: 1px solid hsl(var(--border));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skeleton {
  color: hsl(var(--muted-foreground));
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.side-nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.side-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: hsl(var(--foreground));
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.side-nav-link:hover {
  background-color: hsl(var(--accent));
}

.side-nav-link.current-page {
  background-color: hsl(var(--accent));
  font-weight: 500;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
</style>
