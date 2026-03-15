<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppStore } from "@/store";
import {
  NSInlineNotification,
  NSTextInput,
  NSToggle,
} from "@geniusdynamics/ns8-ui-lib";
import {
  useTaskService,
  usePageTitleService,
} from "@geniusdynamics/ns8-ui-lib";
import { useI18n } from "vue-i18n";

const store = useAppStore();
const { createModuleTaskForApp, createErrorNotificationForApp } =
  useTaskService();
const { setPageTitle } = usePageTitleService();
const { t } = useI18n();

// Form data
const host = ref("");
const isLetsEncryptEnabled = ref(false);
const isHttpToHttpsEnabled = ref(true);
const toggleAccordion = ref(false);

// Loading states
const loading = ref({
  getConfiguration: false,
  configureModule: false,
});

// Error states
const error = ref({
  getConfiguration: "",
  configureModule: "",
  host: "",
  lets_encrypt: "",
  http2https: "",
});

// Validation
const validateConfigureModule = () => {
  clearErrors();

  let isValidationOk = true;
  if (!host.value) {
    error.value.host = "common.required";
    isValidationOk = false;
  }
  return isValidationOk;
};

const clearErrors = () => {
  error.value.host = "";
  error.value.lets_encrypt = "";
  error.value.http2https = "";
  error.value.configureModule = "";
};

// Methods
async function getConfiguration() {
  loading.value.getConfiguration = true;
  error.value.getConfiguration = "";

  const taskAction = "get-configuration";
  try {
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      extra: {
        title: "Get Configuration",
        isNotificationHidden: true,
      },
    });

    // For demo purposes, set sample data
    host.value = "example.example.org";
    isLetsEncryptEnabled.value = false;
    isHttpToHttpsEnabled.value = true;
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    error.value.getConfiguration = "Failed to retrieve configuration";
    createErrorNotificationForApp(err, "Failed to get configuration");
  } finally {
    loading.value.getConfiguration = false;
  }
}

async function configureModule() {
  clearErrors();

  const isValidationOk = validateConfigureModule();
  if (!isValidationOk) {
    return;
  }

  loading.value.configureModule = true;
  error.value.configureModule = "";

  const taskAction = "configure-module";
  try {
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      data: {
        host: host.value,
        lets_encrypt: isLetsEncryptEnabled.value,
        http2https: isHttpToHttpsEnabled.value,
      },
      extra: {
        title: t("settings.instance_configuration", {
          instance: store.instanceName,
        }),
        description: t("settings.configuring"),
      },
    });

    // Reload configuration after successful configuration
    await getConfiguration();
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    error.value.configureModule = "Failed to configure module";
    createErrorNotificationForApp(err, "Failed to configure module");
  } finally {
    loading.value.configureModule = false;
  }
}

onMounted(async () => {
  setPageTitle(`${t("settings.title")} - ${store.appName}`);
  await getConfiguration();
});
</script>
<template>
  <div class="w-full max-w-xl p-6 space-y-6">
    <!-- Page Header -->
    <div class="space-y-1">
      <h2 class="text-2xl font-semibold tracking-tight">{{ $t("settings.title") }}</h2>
    </div>

    <!-- Error notification -->
    <NSInlineNotification
      v-if="error.getConfiguration"
      variant="destructive"
      :title="$t('action.get-configuration')"
      :description="error.getConfiguration"
      :show-close-button="false"
    />

    <!-- Settings form card -->
    <div class="bg-card border rounded-lg p-6">
      <form @submit.prevent="configureModule" class="space-y-6">
        <!-- Host input -->
        <div>
          <label class="text-sm font-medium mb-2 block">
            {{ $t("settings.example_fqdn") }}
          </label>
          <NSTextInput
            v-model="host"
            placeholder="example.example.org"
            :error-message="error.host ? $t(error.host) : ''"
            :disabled="loading.getConfiguration || loading.configureModule"
            required
          />
        </div>

        <!-- Toggle switches -->
        <div class="space-y-4">
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
        </div>

        <!-- Advanced section -->
        <div class="border rounded-md">
          <button
            type="button"
            class="w-full flex justify-between items-center px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
            @click="toggleAccordion = !toggleAccordion"
          >
            <span>{{ $t("settings.advanced") }}</span>
            <span
              class="transition-transform duration-200"
              :class="{ 'rotate-180': toggleAccordion }"
            >▼</span>
          </button>
          <div
            v-show="toggleAccordion"
            class="px-4 py-3 border-t"
          >
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
        <div class="flex justify-end">
          <button
            type="submit"
            class="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="loading.getConfiguration || loading.configureModule"
          >
            <span v-if="loading.configureModule">
              {{ $t("common.processing") }}
            </span>
            <span v-else>{{ $t("settings.save") }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* All styles converted to Tailwind */
</style>
