<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
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
  usePageTitleService,
  useUtilService,
} from "@geniusdynamics/ns8-ui-lib";

const store = useAppStore();
const router = useRouter();
const {
  createModuleTaskForApp,
  createClusterTaskForApp,
  createErrorNotificationForApp,
} = useTaskService();
const { setPageTitle } = usePageTitleService();
const { getUuid, sortByProperty } = useUtilService();
const { t } = useI18n();

// Data
const host = ref("");
const status = ref<{
  instance: string;
  services: Array<{
    name: string;
    active: boolean;
    enabled: boolean;
    failed: boolean;
  }>;
  images: Array<{ name: string; size: string; created: string }>;
  volumes: Array<{ name: string; mount: string; created: string }>;
  node: number | string | null;
  node_ui_name: string | null;
  ui_name: string | null;
}>({
  instance: "",
  services: [],
  images: [],
  volumes: [],
  node: null,
  node_ui_name: null,
  ui_name: null,
});
const backupRepositories = ref<Array<{ id: string; name: string }>>([]);
const backups = ref<
  Array<{
    id: string;
    name: string;
    repository: string;
    repoName?: string;
    date: string;
    size: string;
    enabled: boolean;
    status: "error" | "success" | "running" | "pending";
  }>
>([]);
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
  const taskAction = "get-configuration";
  const eventId = getUuid();

  store.core.$root.$once(
    `${taskAction}-aborted-${eventId}`,
    (taskResult: any, taskContext: any) => {
      console.error(`${taskContext.action} aborted`, taskResult);
      error.value.getConfiguration = "Failed to retrieve configuration";
      loading.value.getConfiguration = false;
    },
  );

  store.core.$root.$once(
    `${taskAction}-completed-${eventId}`,
    (_taskContext: any, taskResult: any) => {
      console.log(taskResult);
      const config = taskResult.output;
      host.value = config.host || "";
      loading.value.getConfiguration = false;
    },
  );

  try {
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      extra: {
        title: t("action." + taskAction),
        isNotificationHidden: true,
        eventId,
      },
    });
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    error.value.getConfiguration = "Failed to retrieve configuration";
    createErrorNotificationForApp(err, "Failed to get configuration");
    loading.value.getConfiguration = false;
  }
}

async function getStatus() {
  loading.value.getStatus = true;
  error.value.getStatus = "";
  const taskAction = "get-status";
  const eventId = getUuid();

  store.core.$root.$once(
    `${taskAction}-aborted-${eventId}`,
    (taskResult: any, taskContext: any) => {
      console.error(`${taskContext.action} aborted`, taskResult);
      error.value.getStatus = "Failed to retrieve status";
      loading.value.getStatus = false;
    },
  );

  store.core.$root.$once(
    `${taskAction}-completed-${eventId}`,
    (_taskContext: any, taskResult: any) => {
      console.log(taskResult);
      status.value = taskResult.output;
      loading.value.getStatus = false;
    },
  );

  try {
    await createModuleTaskForApp(store.instanceName, {
      action: taskAction,
      extra: {
        title: t("action." + taskAction),
        isNotificationHidden: true,
        eventId,
      },
    });
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    error.value.getStatus = "Failed to retrieve status";
    createErrorNotificationForApp(err, "Failed to get status");
    loading.value.getStatus = false;
  }
}

async function listBackupRepositories() {
  loading.value.listBackupRepositories = true;
  error.value.listBackupRepositories = "";
  const taskAction = "list-backup-repositories";
  const eventId = getUuid();

  store.core.$root.$once(
    `${taskAction}-aborted-${eventId}`,
    (taskResult: any, taskContext: any) => {
      console.error(`${taskContext.action} aborted`, taskResult);
      error.value.listBackupRepositories = "Failed to list backup repositories";
      loading.value.listBackupRepositories = false;
    },
  );

  store.core.$root.$once(
    `${taskAction}-completed-${eventId}`,
    (_taskContext: any, taskResult: any) => {
      console.log(taskResult);
      const repositories = taskResult.output.repositories.sort(
        sortByProperty("name"),
      );
      backupRepositories.value = repositories;
      loading.value.listBackupRepositories = false;
      listBackups();
    },
  );

  try {
    await createClusterTaskForApp({
      action: taskAction,
      extra: {
        title: t("action." + taskAction),
        isNotificationHidden: true,
        eventId,
      },
    });
  } catch (err) {
    console.error("Error listing backup repositories", err);
    error.value.listBackupRepositories = "Failed to list backup repositories";
    loading.value.listBackupRepositories = false;
  }
}

async function listBackups() {
  loading.value.listBackups = true;
  error.value.listBackups = "";
  const taskAction = "list-backups";
  const eventId = getUuid();

  store.core.$root.$once(
    `${taskAction}-aborted-${eventId}`,
    (taskResult: any, taskContext: any) => {
      console.error(`${taskContext.action} aborted`, taskResult);
      error.value.listBackups = "Failed to list backups";
      loading.value.listBackups = false;
    },
  );

  store.core.$root.$once(
    `${taskAction}-completed-${eventId}`,
    (_taskContext: any, taskResult: any) => {
      console.log(taskResult);

      let backupList = taskResult.output.backups;
      backupList.sort(sortByProperty("name"));

      for (const backup of backupList) {
        const repo = backupRepositories.value.find(
          (r: any) => r.id == backup.repository,
        );
        if (repo) {
          backup.repoName = repo.name;
        }
      }
      backups.value = backupList;
      loading.value.listBackups = false;
    },
  );

  try {
    await createClusterTaskForApp({
      action: taskAction,
      extra: {
        title: t("action." + taskAction),
        isNotificationHidden: true,
        eventId,
      },
    });
  } catch (err) {
    console.error("Error listing backups", err);
    error.value.listBackups = "Failed to list backups";
    loading.value.listBackups = false;
  }
}

onMounted(async () => {
  setPageTitle(`${t("status.title")} - ${store.appName}`);
  await getConfiguration();
  await getStatus();
  await listBackupRepositories();
});
</script>
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
      <h4>{{ $t("status.app_images", { n: 2 }) }}</h4>
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
      <h4>{{ $t("status.app_volumes", { n: 2 }) }}</h4>
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
  color: var(--foreground);
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
  border-top: 1px solid var(--border);
}

.section-header h4 {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--foreground);
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
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 60%;
  background-color: var(--muted);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-content {
  height: 4rem;
  background-color: var(--muted);
  border-radius: 0.25rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background-color: var(--accent);
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
