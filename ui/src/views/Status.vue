<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <div class="status-view">
    <div class="page-header">
      <h2>{{ $t("status.title") }}</h2>
    </div>

    <!-- Error notifications -->
    <NSInlineNotification
      v-if="error.getStatus"
      variant="destructive"
      :title="$t('action.get-status')"
      :description="error.getStatus"
      :show-close-button="false"
    />
    <NSInlineNotification
      v-if="error.listBackupRepositories"
      variant="destructive"
      :title="$t('action.list-backup-repositories')"
      :description="error.listBackupRepositories"
      :show-close-button="false"
    />
    <NSInlineNotification
      v-if="error.listBackups"
      variant="destructive"
      :title="$t('action.list-backups')"
      :description="error.listBackups"
      :show-close-button="false"
    />

    <!-- Info cards grid -->
    <div class="cards-grid">
      <!-- Webapp Card -->
      <NSSystemInfoCard
        :title="host || $t('status.not_configured')"
        :description="$t('status.example_webapp')"
        light
        class="info-card"
      >
        <template #actions>
          <button v-if="host" class="btn-ghost" @click="goToWebapp">
            {{ $t("status.open_webapp") }}
          </button>
          <button v-else class="btn-ghost" @click="goToSettings">
            {{ $t("status.configure") }}
          </button>
        </template>
      </NSSystemInfoCard>

      <!-- Instance Card -->
      <NSSystemInfoCard
        :title="status.instance || '-'"
        :description="$t('status.app_instance')"
        light
        class="info-card"
      />

      <!-- Installation Node Card -->
      <NSSystemInfoCard
        :title="installationNodeTitle"
        :description="$t('status.installation_node')"
        light
        class="info-card"
      />

      <!-- Backup Card -->
      <NSBackupCard
        :backups="backups"
        :loading="loading.listBackups || loading.listBackupRepositories"
        light
        class="backup-card"
        no-backup-message="No backup configured"
        @backup="handleBackup"
        @restore="handleRestore"
        @delete="handleDeleteBackup"
      />
    </div>

    <!-- Services section -->
    <div class="section-header">
      <h4>{{ $t("status.services") }}</h4>
    </div>
    <div v-if="!loading.getStatus" class="cards-grid">
      <NSEmptyState
        v-if="!status.services?.length"
        :title="$t('status.no_services')"
      />
      <NSSystemdServiceCard
        v-for="(service, index) in status.services"
        :key="index"
        :service-name="service.name"
        :status="{
          running: service.active,
          enabled: service.enabled,
          status: service.active ? 'Running' : 'Stopped',
        }"
        light
        class="service-card"
        @start="handleServiceStart"
        @stop="handleServiceStop"
        @restart="handleServiceRestart"
      />
    </div>
    <div v-else class="loading-grid">
      <div class="skeleton-card" v-for="n in 2" :key="n">
        <div class="skeleton-title"></div>
        <div class="skeleton-content"></div>
      </div>
    </div>

    <!-- Images section -->
    <div class="section-header">
      <h4>{{ $tc("status.app_images", 2) }}</h4>
    </div>
    <div class="data-table-container">
      <NSEmptyState
        v-if="!loading.getStatus && !status.images?.length"
        :title="$t('status.no_images')"
      />
      <NSDataTable
        v-else-if="status.images?.length"
        :data="status.images"
        :columns="[
          { key: 'name', label: $t('status.name') },
          { key: 'size', label: $t('status.size') },
          { key: 'created', label: $t('status.created') },
        ]"
        :loading="loading.getStatus"
        :striped="true"
      />
    </div>

    <!-- Volumes section -->
    <div class="section-header">
      <h4>{{ $tc("status.app_volumes", 2) }}</h4>
    </div>
    <div class="data-table-container">
      <NSEmptyState
        v-if="!loading.getStatus && !status.volumes?.length"
        :title="$t('status.no_volumes')"
      />
      <NSDataTable
        v-else-if="status.volumes?.length"
        :data="status.volumes"
        :columns="[
          { key: 'name', label: $t('status.name') },
          { key: 'mount', label: $t('status.mount') },
          { key: 'created', label: $t('status.created') },
        ]"
        :loading="loading.getStatus"
        :striped="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store";
import {
  NSInlineNotification,
  NSSystemInfoCard,
  NSSystemdServiceCard,
  NSBackupCard,
  NSEmptyState,
  NSDataTable,
} from "@geniusdynamics/ns8-ui-lib";
import {
  useTaskService,
  useQueryParamService,
  usePageTitleService,
} from "@geniusdynamics/ns8-ui-lib";

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const {
  createModuleTaskForApp,
  createClusterTaskForApp,
  createErrorNotificationForApp,
} = useTaskService();
const { getPage } = useQueryParamService();
const { setPageTitle } = usePageTitleService();
const { t, tc } = useI18n();

// Data
const host = ref("");
const status = ref({
  instance: "",
  services: [],
  images: [],
  volumes: [],
  node: null,
  node_ui_name: null,
});
const backupRepositories = ref([]);
const backups = ref([]);
const loading = ref({
  getStatus: false,
  listBackupRepositories: false,
  listBackups: false,
  getConfiguration: false,
});
const error = ref({
  getStatus: "",
  listBackupRepositories: "",
  listBackups: "",
  getConfiguration: "",
});

// Computed
const installationNodeTitle = computed(() => {
  if (status.value?.node) {
    if (status.value.node_ui_name) {
      return status.value.node_ui_name;
    } else {
      return `${t("status.node")} ${status.value.node}`;
    }
  }
  return "-";
});

const goToWebapp = () => {
  window.open(`https://${host.value}`, "_blank");
};

const goToSettings = () => {
  router.push("/settings");
};

const handleBackup = (backupId: string) => {
  console.log("Backup:", backupId);
};

const handleRestore = (backupId: string) => {
  console.log("Restore:", backupId);
};

const handleDeleteBackup = (backupId: string) => {
  console.log("Delete backup:", backupId);
};

const handleServiceStart = (serviceName: string) => {
  console.log("Start service:", serviceName);
};

const handleServiceStop = (serviceName: string) => {
  console.log("Stop service:", serviceName);
};

const handleServiceRestart = (serviceName: string) => {
  console.log("Restart service:", serviceName);
};

// Methods
async function getConfiguration() {
  loading.value.getConfiguration = true;
  error.value.getConfiguration = "";

  try {
    const taskAction = "get-configuration";
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      extra: {
        title: "Get Configuration",
        isNotificationHidden: true,
      },
    });

    // For demo purposes, set a sample host
    host.value = "example.example.org";
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    error.value.getConfiguration = "Failed to retrieve configuration";
    createErrorNotificationForApp(err, "Failed to get configuration");
  } finally {
    loading.value.getConfiguration = false;
  }
}

async function getStatus() {
  loading.value.getStatus = true;
  error.value.getStatus = "";

  try {
    const taskAction = "get-status";
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      extra: {
        title: "Get Status",
        isNotificationHidden: true,
      },
    });

    // For demo purposes, set sample data
    status.value = {
      instance: store.instanceName,
      services: [
        { name: "example-app", active: true, enabled: true },
        { name: "example-db", active: true, enabled: true },
      ],
      images: [
        { name: "example:latest", size: "150 MB", created: "2024-01-15" },
        { name: "postgres:14", size: "350 MB", created: "2024-01-10" },
      ],
      volumes: [
        {
          name: "example-data",
          mount: "/var/lib/example",
          created: "2024-01-15",
        },
      ],
      node: 1,
      node_ui_name: "Node 1",
    };
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    error.value.getStatus = "Failed to retrieve status";
    createErrorNotificationForApp(err, "Failed to get status");
  } finally {
    loading.value.getStatus = false;
  }
}

async function listBackupRepositories() {
  loading.value.listBackupRepositories = true;
  error.value.listBackupRepositories = "";

  try {
    await createClusterTaskForApp({
      action: "list-backup-repositories",
      extra: {
        title: "List Backup Repositories",
        isNotificationHidden: true,
      },
    });
  } catch (err) {
    console.error("Error listing backup repositories", err);
    error.value.listBackupRepositories = "Failed to list backup repositories";
  } finally {
    loading.value.listBackupRepositories = false;
  }
}

async function listBackups() {
  loading.value.listBackups = true;
  error.value.listBackups = "";

  try {
    await createClusterTaskForApp({
      action: "list-backups",
      extra: {
        title: "List Backups",
        isNotificationHidden: true,
      },
    });

    // For demo purposes, set sample backup data
    backups.value = [
      {
        id: "backup-1",
        name: "Daily Backup",
        date: "2024-01-15 02:00",
        size: "2.3 GB",
        enabled: true,
        status: "success",
      },
    ];
  } catch (err) {
    console.error("Error listing backups", err);
    error.value.listBackups = "Failed to list backups";
  } finally {
    loading.value.listBackups = false;
  }
}

onMounted(async () => {
  setPageTitle(`${t("status.title")} - ${store.appName}`);
  await getConfiguration();
  await getStatus();
  await listBackupRepositories();
  await listBackups();
});
</script>

<style scoped>
.status-view {
  width: 100%;
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-card,
.backup-card,
.service-card {
  min-height: 150px;
}

.section-header {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
}

.section-header h4 {
  font-size: 1.125rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin: 0;
}

.data-table-container {
  margin-bottom: 1.5rem;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.skeleton-card {
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 60%;
  background-color: hsl(var(--muted));
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-content {
  height: 4rem;
  background-color: hsl(var(--muted));
  border-radius: 0.25rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--primary));
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background-color: hsl(var(--accent));
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
