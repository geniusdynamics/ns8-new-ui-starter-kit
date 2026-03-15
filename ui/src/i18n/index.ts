//
// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later
//
import { createI18n } from "vue-i18n";
import en from "../../public/i18n/en/translation.json";
import it from "../../public/i18n/it/translation.json";
import es from "../../public/i18n/es/translation.json";
import de from "../../public/i18n/de/translation.json";
import pt from "../../public/i18n/pt/translation.json";
import pt_BR from "../../public/i18n/pt_BR/translation.json";

const messages: Record<
  string,
  typeof en | typeof it | typeof es | typeof de | typeof pt | typeof pt_BR
> = {
  en,
  it,
  es,
  de,
  pt,
  pt_BR,
};
export async function loadLanguage(lang: string) {
  if (messages[lang]) {
    return messages[lang];
  }

  // fallback to english
  if (lang !== "en") {
    return messages.en;
  }
  return {};
}

// Initialize with empty messages, will be loaded dynamically
const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: {},
  },
});

export default i18n;
