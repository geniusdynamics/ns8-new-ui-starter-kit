<!--
  Copyright (C) 2023 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->
<template>
  <div id="ns8-app">
    <AppSideMenu />
    <AppMobileSideMenu />
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import AppSideMenu from "./components/AppSideMenu.vue";
import AppMobileSideMenu from "./components/AppMobileSideMenu.vue";
import { useAppStore } from "./store";
import { PageTitleService, TaskService } from "@geniusdynamics/ns8-ui-lib";
import { useRoute } from "vue-router";

const store = useAppStore();
const route = useRoute();
const { setPageTitle } = PageTitleService();
const { createModuleTaskForApp, createErrorNotificationForApp } = TaskService();

// Watch for route changes to update page title
watch(
  () => route.meta.title,
  (title) => {
    if (title) {
      setPageTitle(`${title} - ${store.appName}`);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  // Get core from parent window (if embedded in NS8)
  const core = (window as any).parent?.core;
  if (core) {
    store.setCoreInStore(core);
  }

  // Get instance name from URL hash
  const hashMatch = /#\/apps\/([a-zA-Z0-9_-]+)/.exec(
    window.parent.location?.hash || "",
  );
  if (hashMatch) {
    const instanceName = hashMatch[1];
    store.setInstanceNameInStore(instanceName);
    await getInstanceLabel(instanceName);
  }

  // Set app name from metadata
  try {
    const response = await fetch("/metadata.json");
    const metadata = await response.json();
    store.setAppNameInStore(metadata.name);
  } catch (error) {
    console.error("Failed to load metadata:", error);
    store.setAppNameInStore("example");
  }

  // Listen to change route events
  window.addEventListener("message", (event) => {
    if (event.data?.type === "changeRoute") {
      const requestedPage = event.data.payload?.page;
      if (requestedPage && requestedPage !== "status") {
        // Router will handle the navigation
      }
    }
  });

  // Configure keyboard shortcuts if core is available
  if (core?.$root) {
    core.$root.$emit("configureKeyboardShortcuts", window);
  }
});

async function getInstanceLabel(instanceName: string) {
  const taskAction = "get-name";

  try {
    const response = await createModuleTaskForApp(instanceName, {
      action: taskAction,
      extra: {
        title: "Get Name",
        isNotificationHidden: true,
      },
    });

    // In a real implementation, we'd wait for the task completion event
    // For now, just simulate the instance label
    store.setInstanceLabelInStore(instanceName);
  } catch (err) {
    console.error(`Error creating task ${taskAction}`, err);
    createErrorNotificationForApp(err, "Failed to get instance label");
  }
}
</script>

<style>
#ns8-app {
  display: flex;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  margin-left: 16rem;
  padding: 1.5rem;
  background-color: hsl(var(--background));
  min-height: 100vh;
}

@media (max-width: 768px) {
  .app-content {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>
