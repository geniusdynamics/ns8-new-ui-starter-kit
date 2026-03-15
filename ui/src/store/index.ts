//
// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later
//
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const appName = ref('')
  const instanceName = ref('')
  const instanceLabel = ref('')
  const core = ref<any>(null)

  // Getters
  const getAppName = computed(() => appName.value)
  const getInstanceName = computed(() => instanceName.value)
  const getInstanceLabel = computed(() => instanceLabel.value)
  const getCore = computed(() => core.value)

  // Actions (mutations-like)
  function setInstanceName(name: string) {
    instanceName.value = name
  }

  function setInstanceLabel(label: string) {
    instanceLabel.value = label
  }

  function setCore(coreValue: any) {
    core.value = coreValue
  }

  function setAppName(name: string) {
    appName.value = name
  }

  // Vuex-like action names for compatibility
  function setInstanceNameInStore(name: string) {
    setInstanceName(name)
  }

  function setInstanceLabelInStore(label: string) {
    setInstanceLabel(label)
  }

  function setCoreInStore(coreValue: any) {
    setCore(coreValue)
  }

  function setAppNameInStore(name: string) {
    setAppName(name)
  }

  return {
    // State
    appName,
    instanceName,
    instanceLabel,
    core,
    // Getters
    getAppName,
    getInstanceName,
    getInstanceLabel,
    getCore,
    // Actions
    setInstanceName,
    setInstanceLabel,
    setCore,
    setAppName,
    setInstanceNameInStore,
    setInstanceLabelInStore,
    setCoreInStore,
    setAppNameInStore
  }
})
