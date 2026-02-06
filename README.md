# Qwik Editor ⚡️

A high-performance, WYSIWYG markdown editor built with Qwik.

## Features

- **Block-based editing**: Content organized as sequential blocks (paragraphs, headings).
- **Inline Formatting**: Support for **Bold**, _Italic_, and [Links](https://example.com) with a floating toolbar.
- **Keyboard Shortcuts**: Common shortcuts like `Ctrl+B` (Bold) and `Ctrl+I` (Italic).
- **Markdown-first**: Bidirectional conversion between editor state and CommonMark.
- **High performance**: Fine-grained reactivity ensures fast keystroke response even with many blocks.
- **SSR-friendly**: Built for Qwik's resumability and server-side rendering.

## Usage

```tsx
import { component$, useSignal } from "@builder.io/qwik";
import { Editor } from "qwik-editor";

export default component$(() => {
  const markdown = useSignal("# Hello Editor\n\nStart typing here...");

  return (
    <Editor
      initialMarkdown={markdown.value}
      onChange$={(md) => {
        markdown.value = md;
      }}
      placeholder="Write something..."
    />
  );
});
```

## Tech Stack

- **Framework**: [Qwik](https://qwik.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Tooling**:
  - [Oxlint](https://oxc.rs/): Rust-based high-performance linting.
  - [Oxfmt](https://oxc.rs/): Rust-based high-performance formatting.
  - [Vite](https://vitejs.dev/): Build tool and development server.

## Project Structure

```
├── src/
│   ├── components/  # Editor and block components
│   ├── models/      # Data structures (EditorDocument, Block)
│   ├── services/    # Markdown parsing and serialization
│   └── index.ts     # Library entry point
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

## License

MIT
