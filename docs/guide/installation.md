# Installation

## Package Manager

Install mod using your preferred package manager:

::: code-group
```bash [npm]
npm install @mode-7/mod
```

```bash [yarn]
yarn add @mode-7/mod
```

```bash [pnpm]
pnpm add @mode-7/mod
```
:::

## Requirements

mod requires:
- React 18.0.0 or higher
- React DOM 18.0.0 or higher
- A modern browser with Web Audio API support

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## TypeScript

mod is written in TypeScript and includes type definitions out of the box. No additional `@types` packages are needed.

```tsx
import type { ModStreamRef, ToneGeneratorProps } from '@mode-7/mod';
```

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 35+            |
| Firefox | 25+            |
| Safari  | 14.1+          |
| Edge    | 79+            |

::: warning iOS Safari
On iOS Safari, the Web Audio context must be initialized in response to a user gesture. Make sure to trigger audio initialization from a button click or touch event.
:::

## Development Setup

For the best development experience, we recommend:

- **VS Code** with TypeScript support
- **React DevTools** browser extension
- **ESLint** and **Prettier** for code quality

## Next Steps

Once installed, head over to [Getting Started](/guide/getting-started) to build your first audio application!
