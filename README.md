## Shake Happens

Shake Happens is an Expo + React Native app that tracks and visualizes real-time earthquakes using the USGS Earthquake Catalog API.

### What this project uses

- **Runtime**: Expo (React Native)
- **Language**: TypeScript
- **Package manager**: pnpm

### Requirements

- **Node.js** (LTS recommended)
- **pnpm** installed globally:

```bash
npm install -g pnpm
```

### Setup

- **Install dependencies**

```bash
pnpm install
```

- **Run the app**

```bash
pnpm start
```

### Available scripts

- **pnpm start**: Start the Expo development server.
- **pnpm android**: Run the app on an Android device or emulator.
- **pnpm ios**: Run the app on an iOS simulator (macOS only).
- **pnpm web**: Run the app in a web browser.
- **pnpm format**: Format the codebase with Prettier.
- **pnpm format:check**: Check formatting without writing changes.

### Contributing

- **Branching**
  - Create a feature branch from `main` (for example, `feature/country-selector`).
- **Code style**
  - Run `pnpm format` before opening a PR.
  - Keep React components functional and written in TypeScript.
- **Commits**
  - Use clear, descriptive commit messages (for example, `feat: add country selector`).
- **Pull requests**
  - Briefly describe the change and any UI impacts.
  - Mention any new env/config values or scripts that contributors should know about.
