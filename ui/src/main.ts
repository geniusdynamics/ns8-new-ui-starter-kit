//
// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later
//
import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import router from "./router";
import App from "./App.vue";
import i18n, { loadLanguage } from "./i18n";
import "./style.css";

import "@geniusdynamics/ns8-ui-lib/dist/ns8-ui-lib.css";
// Configure axios defaults
axios.defaults.timeout = 10000;

async function initApp() {
  // Get browser language
  const navigatorLang = navigator.language.substring(0, 2);

  // Load language messages
  const messages = await loadLanguage(navigatorLang);

  // Set locale and messages
  i18n.global.setLocaleMessage(navigatorLang, messages);
  i18n.global.locale = navigatorLang as any;

  const app = createApp(App);

  // Use plugins
  app.use(createPinia());
  app.use(router);
  app.use(i18n);

  // Provide axios globally
  app.provide("axios", axios);

  // Mount app
  app.mount("#app");
}

initApp().catch(console.error);
