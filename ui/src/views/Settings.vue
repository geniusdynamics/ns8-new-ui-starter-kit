<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <div class="settings-view">
    <div class="page-header">
      <h2>{{ $t('settings.title') }}</h2>
    </div>

    <!-- Error notification -->
    <NSInlineNotification
      v-if="error.getConfiguration"
      variant="destructive"
      :title="$t('action.get-configuration')"
      :description="error.getConfiguration"
      :show-close-button="false"
    />

    <!-- Settings form -->
    <div class="settings-card">
      <form @submit.prevent="configureModule" class="settings-form">
        <NSTextInput
          v-model="host"
          :label="$t('settings.example_fqdn')"
          placeholder="example.example.org"
          :error-message="error.host ? $t(error.host) : ''"
          :disabled="loading.getConfiguration || loading.configureModule"
          required
        />

        <NSToggle
          v-model:checked="isLetsEncryptEnabled"
          :label="$t('settings.lets_encrypt')"
          :left-text="$t('settings.disabled')"
          :right-text="$t('settings.enabled')"
          :disabled="loading.getConfiguration || loading.configureModule"
        />

        <NSToggle
          v-model:checked="isHttpToHttpsEnabled"
          :label="$t('settings.http_to_https')"
          :left-text="$t('settings.disabled')"
          :right-text="$t('settings.enabled')"
          :disabled="loading.getConfiguration || loading.configureModule"
        />

        <!-- Advanced section -->
        <div class="advanced-section">
          <button
            type="button"
            class="accordion-toggle"
            @click="toggleAccordion = !toggleAccordion"
          >
            <span>{{ $t('settings.advanced') }}</span>
            <span class="toggle-icon" :class="{ 'open': toggleAccordion }">▼</span>
          </button>
          <div v-show="toggleAccordion" class="accordion-content">
            <!-- Advanced options can be added here -->
          </div>
        </div>

        <!-- Error notification for configure -->
        <NSInlineNotification
          v-if="error.configureModule"
          variant="destructive"
          :title="$t('action.configure-module')"
          :description="error.configureModule"
          :show-close-button="false"
        />

        <!-- Submit button -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            :disabled="loading.getConfiguration || loading.configureModule"
          >
            <span v-if="loading.configureModule">{{ $t('common.processing') }}</span>
            <span v-else>{{ $t('settings.save') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/store'
import {
  NSInlineNotification,
  NSTextInput,
  NSToggle
} from '@geniusdynamics/ns8-ui-lib'
import {
  useTaskService,
  usePageTitleService
} from '@geniusdynamics/ns8-ui-lib'

const store = useAppStore()
const { createModuleTaskForApp, createErrorNotificationForApp } = useTaskService()
const { setPageTitle } = usePageTitleService()

// Form data
const host = ref('')
const isLetsEncryptEnabled = ref(false)
const isHttpToHttpsEnabled = ref(true)
const toggleAccordion = ref(false)

// Loading states
const loading = ref({
  getConfiguration: false,
  configureModule: false
})

// Error states
const error = ref({
  getConfiguration: '',
  configureModule: '',
  host: '',
  lets_encrypt: '',
  http2https: ''
})

// Validation
const validateConfigureModule = () => {
  clearErrors()
  
  let isValidationOk = true
  if (!host.value) {
    error.value.host = 'common.required'
    isValidationOk = false
  }
  return isValidationOk
}

const clearErrors = () => {
  error.value.host = ''
  error.value.lets_encrypt = ''
  error.value.http2https = ''
  error.value.configureModule = ''
}

// Methods
async function getConfiguration() {
  loading.value.getConfiguration = true
  error.value.getConfiguration = ''
  
  try {
    const taskAction = 'get-configuration'
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      extra: {
        title: 'Get Configuration',
        isNotificationHidden: true
      }
    })
    
    // For demo purposes, set sample data
    host.value = 'example.example.org'
    isLetsEncryptEnabled.value = false
    isHttpToHttpsEnabled.value = true
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err)
    error.value.getConfiguration = 'Failed to retrieve configuration'
    createErrorNotificationForApp(err, 'Failed to get configuration')
  } finally {
    loading.value.getConfiguration = false
  }
}

async function configureModule() {
  clearErrors()
  
  const isValidationOk = validateConfigureModule()
  if (!isValidationOk) {
    return
  }
  
  loading.value.configureModule = true
  error.value.configureModule = ''
  
  try {
    const taskAction = 'configure-module'
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      data: {
        host: host.value,
        lets_encrypt: isLetsEncryptEnabled.value,
        http2https: isHttpToHttpsEnabled.value
      },
      extra: {
        title: $t('settings.instance_configuration', { instance: store.instanceName }),
        description: $t('settings.configuring')
      }
    })
    
    // Reload configuration after successful configuration
    await getConfiguration()
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err)
    error.value.configureModule = 'Failed to configure module'
    createErrorNotificationForApp(err, 'Failed to configure module')
  } finally {
    loading.value.configureModule = false
  }
}

onMounted(async () => {
  setPageTitle(`${$t('settings.title')} - ${store.appName}`)
  await getConfiguration()
})
</script>

<style scoped>
.settings-view {
  width: 100%;
  max-width: 38rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
}

.settings-card {
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.advanced-section {
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
}

.accordion-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.accordion-toggle:hover {
  background-color: hsl(var(--accent));
}

.toggle-icon {
  transition: transform 0.2s;
}

.toggle-icon.open {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 1rem;
  border-top: 1px solid hsl(var(--border));
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--primary-foreground));
  background-color: hsl(var(--primary));
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: hsl(var(--primary) / 0.9);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
