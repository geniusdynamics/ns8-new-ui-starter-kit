# NS8 UI Lib Example

This is an example application demonstrating how to use `@geniusdynamics/ns8-ui-lib` library.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Features

- Vue 3 with Composition API and TypeScript
- Vite for fast development and building
- TailwindCSS with @nethesis/vue-components
- Pinia for state management
- Vue Router for routing
- Vue I18n for internationalization

## Library Usage

### Composables

```typescript
import {
  useUtilService,
  useDateTimeService,
  useQueryParamService,
  usePageTitleService,
  useTaskService,
  useFilterService,
  useStorageService,
  useIconService,
  useLottieService
} from '@geniusdynamics/ns8-ui-lib'

// UtilService
const { getUuid, getErrorMessage } = useUtilService()

// DateTimeService
const { formatDate, formatTime } = useDateTimeService()

// QueryParamService
const { getPage, getQueryParamsForApp } = useQueryParamService()

// PageTitleService
const { setPageTitle } = usePageTitleService()
```

### Pictograms

```vue
<script setup>
import {
  GearPictogram,
  UserPictogram,
  FolderPictogram,
  ServerRackPictogram
} from '@geniusdynamics/ns8-ui-lib'
</script>

<template>
  <div>
    <GearPictogram />
    <UserPictogram />
    <FolderPictogram />
    <ServerRackPictogram />
  </div>
</template>
```

## Project Structure

```
src/
├── components/     # Vue components
├── views/         # Page components
├── router/        # Vue Router configuration
├── store/         # Pinia stores
├── i18n/          # Vue I18n configuration
├── main.ts        # Application entry point
└── App.vue        # Root component
```

## License

GPL-3.0-or-later
