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
  <div class="about-view">
    <div class="page-header">
      <h2>{{ $t("about.title") }}</h2>
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
    <div class="about-card">
      <div class="about-content">
        <!-- Logo and name -->
        <div class="logo-section">
          <div class="app-logo">
            <img
              :src="app?.logo || '/assets/module_default_logo.png'"
              :alt="(app?.name || 'Example') + ' logo'"
            />
          </div>
          <div class="app-name">
            <h3>{{ app?.name || "Example" }}</h3>
          </div>
        </div>

        <!-- Description -->
        <p class="description">
          {{ getApplicationDescription() }}
        </p>

        <!-- Info grid -->
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">{{ $t("common.instance") }}</span>
            <span class="info-value">{{ store.instanceName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t("common.version") }}</span>
            <span class="info-value">
              <span v-if="loading.version" class="skeleton-small"></span>
              <span v-else>{{ version }}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t("common.categories") }}</span>
            <span class="info-value">{{ getApplicationCategories() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t("common.documentation") }}</span>
            <a
              :href="app?.docs?.documentation_url"
              target="_blank"
              class="info-link"
            >
              {{ app?.docs?.documentation_url }}
            </a>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t("common.bugs") }}</span>
            <a :href="app?.docs?.bug_url" target="_blank" class="info-link">
              {{ app?.docs?.bug_url }}
            </a>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t("common.source_code") }}</span>
            <a :href="app?.docs?.code_url" target="_blank" class="info-link">
              {{ app?.docs?.code_url }}
            </a>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t("common.source_package") }}</span>
            <span class="info-value">{{ app?.source }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t("common.authors") }}</span>
            <div class="info-value">
              <ul v-if="app?.authors?.length > 1" class="authors-list">
                <li v-for="(author, index) in app.authors" :key="index">
                  {{ author.name }}
                  <a
                    v-if="author.email"
                    :href="'mailto:' + author.email"
                    class="email-link"
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
                  class="email-link"
                >
                  {{ app.authors[0].email }}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  width: 100%;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--foreground);
  margin: 0;
}

.about-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.app-logo {
  width: 4rem;
  height: 4rem;
  flex-shrink: 0;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-name h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--foreground);
  margin: 0;
}

.description {
  color: var(--muted-foreground);
  line-height: 1.6;
  margin: 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.info-label {
  font-weight: 500;
  color: var(--foreground);
  min-width: 120px;
  flex-shrink: 0;
}

.info-value {
  color: var(--muted-foreground);
  flex: 1;
}

.info-link {
  color: var(--primary);
  text-decoration: none;
  word-break: break-all;
}

.info-link:hover {
  text-decoration: underline;
}

.authors-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.authors-list li {
  margin-bottom: 0.5rem;
}

.email-link {
  color: var(--primary);
  text-decoration: none;
  margin-left: 0.5rem;
}

.email-link:hover {
  text-decoration: underline;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
