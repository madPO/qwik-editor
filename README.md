# Qwik Editor ⚡️

A high-performance, WYSIWYG markdown editor built with Qwik.

## Tech Stack

- **Framework**: [Qwik](https://qwik.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Tooling**:
  - [Oxlint](https://oxc.rs/): Rust-based high-performance linting.
  - [Oxfmt](https://oxc.rs/): Rust-based high-performance formatting.
  - [Vite](https://vitejs.dev/): Build tool and development server.

## Project Structure

```
├── public/          # Static assets
└── src/
    ├── components/  # Reusable Qwik components
    └── index.ts     # Library entry point (exports public APIs)
```

## Development

### Setup

```bash
pnpm install
```

### Development Mode

Runs Vite's development server with SSR enabled.

```bash
pnpm dev
```

### Production Build

Generates the library in `./lib` and TypeScript definitions in `./lib-types`.

```bash
pnpm build
```
