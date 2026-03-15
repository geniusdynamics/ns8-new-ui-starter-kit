//
// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later
//
import { createI18n } from 'vue-i18n'

export async function loadLanguage(lang: string) {
  try {
    const response = await fetch(`/i18n/${lang}/translation.json`)
    if (!response.ok) {
      throw new Error(`Failed to load ${lang} translations`)
    }
    const messages = await response.json()
    return messages
  } catch (error) {
    console.warn(
      `Cannot import ${lang} language messages, falling back to English.`,
      error
    )

    // fallback to english
    if (lang !== 'en') {
      return loadLanguage('en')
    }
    return {}
  }
}

// Initialize with empty messages, will be loaded dynamically
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {}
  }
})

export default i18n
