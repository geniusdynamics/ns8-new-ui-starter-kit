<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppStore } from "@/store";
import { NSInlineNotification } from "@geniusdynamics/ns8-ui-lib";
import {
  usePageTitleService,
  useTaskService,
} from "@geniusdynamics/ns8-ui-lib";
import { useI18n } from "vue-i18n";
import metadata from "./../../public/metadata.json";

const store = useAppStore();
const { setPageTitle } = usePageTitleService();
const { createClusterTaskForApp, createErrorNotificationForApp } =
  useTaskService();
const { t } = useI18n();

// Data
const app = ref<any>(metadata);
const version = ref("");
const loading = ref({
  version: true,
});
const error = ref({
  version: "",
});

// Methods
const getApplicationDescription = () => {
  if (app.value?.description) {
    return typeof app.value.description === "string"
      ? app.value.description
      : app.value.description.en || "";
  }
  return "";
};

const getApplicationCategories = () => {
  if (app.value?.categories?.length) {
    return app.value.categories.join(", ");
  }
  return "-";
};

const listInstalledModules = async () => {
  loading.value.version = true;
  error.value.version = "";

  const taskAction = "list-installed-modules";
  try {
    await createClusterTaskForApp({
      action: taskAction,
      extra: {
        title: "List Installed Modules",
        isNotificationHidden: true,
      },
    });

    // For demo purposes, set a sample version
    version.value = "1.0.0";
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    error.value.version = "Failed to retrieve version";
    createErrorNotificationForApp(err, "Failed to get version");
  } finally {
    loading.value.version = false;
  }
};

onMounted(async () => {
  setPageTitle(`${t("about.title")} - ${store.appName}`);
  await listInstalledModules();
});
</script>

<template>
  <div class="w-full p-6 space-y-6">
    <!-- Page Header -->
    <div class="space-y-1">
      <h2 class="text-2xl font-semibold tracking-tight">{{ $t("about.title") }}</h2>
    </div>

    <!-- Error notification -->
    <NSInlineNotification
      v-if="error.version"
      variant="destructive"
      :title="$t('error.cannot_retrieve_installed_modules')"
      :description="error.version"
      :show-close-button="false"
    />

    <!-- About card -->
    <div class="bg-card border rounded-lg p-6 space-y-6">
      <!-- Logo and name -->
      <div class="flex items-center gap-4 pb-4 border-b">
        <div class="w-16 h-16 flex-shrink-0">
          <img
            :src="app?.logo || '/assets/module_default_logo.png'"
            :alt="(app?.name || 'Example') + ' logo'"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 class="text-xl font-semibold">{{ app?.name || "Example" }}</h3>
        </div>
      </div>

      <!-- Description -->
      <p class="text-muted-foreground leading-relaxed">
        {{ getApplicationDescription() }}
      </p>

      <!-- Info grid -->
      <div class="space-y-3">
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.instance") }}
          </span>
          <span class="text-muted-foreground">{{ store.instanceName }}</span>
        </div>
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.version") }}
          </span>
          <span class="text-muted-foreground">
            <span v-if="loading.version" class="h-4 w-16 bg-muted rounded animate-pulse inline-block"></span>
            <span v-else>{{ version }}</span>
          </span>
        </div>
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.categories") }}
          </span>
          <span class="text-muted-foreground">{{ getApplicationCategories() }}</span>
        </div>
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.documentation") }}
          </span>
          <a
            :href="app?.docs?.documentation_url"
            target="_blank"
            class="text-primary hover:underline break-all"
          >
            {{ app?.docs?.documentation_url }}
          </a>
        </div>
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.bugs") }}
          </span>
          <a
            :href="app?.docs?.bug_url"
            target="_blank"
            class="text-primary hover:underline break-all"
          >
            {{ app?.docs?.bug_url }}
          </a>
        </div>
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.source_code") }}
          </span>
          <a
            :href="app?.docs?.code_url"
            target="_blank"
            class="text-primary hover:underline break-all"
          >
            {{ app?.docs?.code_url }}
          </a>
        </div>
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.source_package") }}
          </span>
          <span class="text-muted-foreground">{{ app?.source }}</span>
        </div>
        <div class="flex items-baseline gap-4">
          <span class="text-sm font-medium min-w-[120px]">
            {{ $t("common.authors") }}
          </span>
          <div class="text-muted-foreground">
            <ul v-if="app?.authors?.length > 1" class="list-none space-y-1 p-0 m-0">
              <li v-for="(author, index) in app.authors" :key="index">
                {{ author.name }}
                <a
                  v-if="author.email"
                  :href="'mailto:' + author.email"
                  class="text-primary hover:underline ml-2"
                >
                  {{ author.email }}
                </a>
              </li>
            </ul>
            <span v-else-if="app?.authors?.length === 1">
              {{ app.authors[0].name }}
              <a
                v-if="app.authors[0].email"
                :href="'mailto:' + app.authors[0].email"
                class="text-primary hover:underline ml-2"
              >
                {{ app.authors[0].email }}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles converted to Tailwind */
</style>
