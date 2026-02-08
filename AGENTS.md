# qwik-editor Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-05

## Project Overview

**qwik-editor** is a high-performance WYSIWYG markdown editor library for Qwik with block-based editing support.

- **Version**: 0.0.1
- **License**: MIT
- **Type**: ES Module (ESM) - fully tree-shakeable
- **Package Manager**: pnpm
- **Node Version**: ^18.17.0 || ^20.3.0 || >=21.0.0

## Directory Structure

```
├── src/                    # Source code (TypeScript + TSX)
│   ├── entities/          # Domain models and utilities
│   │   ├── document/      # EditorDocument, Block types, EditorState
│   │   ├── markdown/      # Markdown parsing and serialization
│   │   └── selection/     # Selection/cursor utilities
│   └── widgets/           # UI components
│       └── editor/        # Main editor component and sub-components
└── Configuration files (package.json, tsconfig.json, vite.config.ts, etc.)
```

## Active Technologies
- TypeScript 5.4.5 (Strict Mode) (003-markdown-formatting)
- In-memory `EditorDocument` state (003-markdown-formatting)

### Framework & Language

- **@builder.io/qwik** 1.19.0 - Fine-grained reactivity framework
- **TypeScript** 5.4.5 - Strict mode enabled, ES2020 target

### Markdown Processing Pipeline

The editor uses a robust AST transformation chain for markdown handling:

- **mdast** (Markdown AST) - Document parsing/generation
  - `mdast-util-from-markdown` - Parse markdown strings to AST
  - `mdast-util-to-markdown` - Serialize AST back to markdown
- **hast** (HTML AST) - Inline content representation
  - `hast-util-to-mdast` - Convert HTML AST to Markdown AST
  - `mdast-util-to-hast` - Convert Markdown AST to HTML AST
  - `hast-util-to-html` - Serialize HTML AST to HTML strings
  - `hast-util-from-html-isomorphic` - Parse HTML to HAST (isomorphic)
- **micromark** - Low-level tokenization (used by mdast)

### Build & Development

- **Vite** 7.3.1 - Fast build tool with HMR
- **TypeScript** - Type checking and compilation
- **Oxlint** 0.16.1 - Rust-based linter (replaces eslint)
- **Oxfmt** - Rust-based formatter (replaces prettier)

## Core Architecture

### Data Model

**EditorDocument** - Immutable content structure

```typescript
{
  version: "1.0",
  blocks: Block[]  // Ordered sequence of content blocks
}
```

**Block Types**

- `ParagraphBlock` - Standard text paragraph with inline content (HTML)
- `HeadingBlock` - Heading level 1-3 with inline content (HTML)

**EditorState** - Runtime state including user interaction

```typescript
{
  document: EditorDocument,
  selection: Selection | null  // Cursor position/text selection
}
```

### Markdown Pipeline

1. **Input**: Markdown string → `parseMarkdown()`
2. **Parse**: String → mdast Root (using micromark + mdast-util-from-markdown)
3. **Filter**: Extract paragraphs and headings
4. **Convert**: mdast → HTML (via hast) for storage in blocks
5. **Output**: EditorDocument with blocks containing HTML content

**Reverse Direction** (`serializeMarkdown()`):

1. HTML content → hast (via hast-util-from-html-isomorphic)
2. hast → mdast (via hast-util-to-mdast)
3. mdast → Markdown string (via mdast-util-to-markdown)

### Editor Component Features

**Core Editing**

- Block-based content editing (paragraphs, headings H1-H3)
- Split blocks on Enter key
- Merge blocks with Backspace/Delete at boundaries
- Convert between block types (paragraph ↔ heading)
- Navigate blocks with Up/Down arrows

**Text Formatting**

- Bold (Ctrl+B / Cmd+B)
- Italic (Ctrl+I / Cmd+I)
- Floating toolbar appears on text selection
- Formatting via `document.execCommand()`

**UI Components**

- **Editor** - Main container with keyboard/mouse event handling
- **ParagraphBlock** - Editable contentEditable paragraph element
- **HeadingBlock** - Editable heading with level (1-3)
- **BlockTypeSelector** - Slash menu for changing block types
- **FloatingToolbar** - Context toolbar for inline formatting

## Public API

### Exported Components

- `Editor` - Main editor component

### Exported Types

- `EditorProps` - Editor component props
- `Block` | `ParagraphBlock` | `HeadingBlock`
- `EditorDocument` - Document structure
- `EditorState` - Runtime state
- `Selection` - Cursor/selection range
- `BlockType` - Union type ("paragraph" | "heading")

## Package Commands

### Development

```bash
pnpm dev              # Start SSR dev server
pnpm dev.debug        # Debug with Node inspector
pnpm start            # Start and open in browser
```

### Building

```bash
pnpm build            # Full build (Qwik optimizer)
pnpm build.lib        # Build library only (Vite lib mode)
pnpm build.types      # Generate TypeScript definitions only
```

### Code Quality

```bash
pnpm lint             # Run oxlint on src/
pnpm fmt              # Fix formatting with oxlint + oxfmt
pnpm fmt.check        # Check formatting without changes
```

### Release

```bash
pnpm release          # Publish new version (uses np)
pnpm test             # Run tests (currently placeholder)
```

## Code Style & Conventions

### TypeScript

- **Target**: ES2020
- **Module**: ES2020 (ESM)
- **JSX**: react-jsx (from @builder.io/qwik)
- **Strict Mode**: ✓ Enabled (strict: true)
- **Declaration Files**: Generated to lib-types/

### Formatting

- **Formatter**: oxfmt (Rust-based, faster than prettier)
- **Linter**: oxlint (Rust-based, stricter than ESLint)
- **Editor Config**: oxlintrc.json

### Module System

- **Tree Shaking**: Enabled (sideEffects: false)
- **Format**: ESM only (lib and CJS generated at build time)
- **External Deps**: Defined in vite.config.ts, not bundled

## Specification Documents

Active feature specifications are in `specs/`:

### 001-basic-text-editor (ACTIVE)

- **spec.md** - Feature specification and requirements
- **data-model.md** - EditorDocument, Block types, EditorState
- **plan.md** - Implementation approach and architecture
- **tasks.md** - Development tasks and checklist
- **research.md** - Technical research on markdown processing
- **quickstart.md** - Developer onboarding guide
- **contracts/component-api.md** - Editor component API contract

### 002-inline-rich-text (PLANNED)

- Support for **bold**, _italic_, ~~strikethrough~~, `code`, [links]
- Planned enhancement to basic text editor

## Development Workflow

1. **Make changes** in `src/` following TypeScript strict mode
2. **Format code**: `pnpm fmt` (runs oxlint + oxfmt)
3. **Check quality**: `pnpm lint` (oxlint check)
4. **Build locally**: `pnpm build.lib && pnpm build.types`
5. **Test in dev**: `pnpm dev` and verify functionality
6. **Commit** changes with clear message
7. **Create PR** if working on shared branch
8. **Publish**: `pnpm release` when version bump needed

## Key Dependencies Explained

### Runtime Dependencies

| Package                        | Purpose                          |
| ------------------------------ | -------------------------------- |
| mdast-util-from-markdown       | Parse markdown → AST             |
| mdast-util-to-markdown         | Serialize AST → markdown         |
| mdast-util-to-hast             | Convert markdown AST → HTML AST  |
| hast-util-to-mdast             | Convert HTML AST → markdown AST  |
| hast-util-to-html              | Serialize HTML AST → HTML string |
| hast-util-from-html-isomorphic | Parse HTML → HAST (isomorphic)   |
| micromark                      | Tokenize markdown (low-level)    |
| @types/hast                    | TypeScript types for HAST        |
| @types/mdast                   | TypeScript types for MDAST       |

### Development Dependencies

| Package             | Purpose                     |
| ------------------- | --------------------------- |
| @builder.io/qwik    | Framework + optimizer       |
| typescript          | Type checking & compilation |
| vite                | Build tool & dev server     |
| vite-tsconfig-paths | Path aliases from tsconfig  |
| oxlint              | Linting (Rust-based)        |
| np                  | Release automation          |
| @types/node         | Node.js types               |
| undici              | Fetch polyfill              |

## Important Notes

- **No Tests Yet**: Test suite is a placeholder (exit 0)
- **Single Block Type Per Line**: Paragraphs and headings only (no lists, quotes, etc.)
- **Inline Content as HTML**: Block content stored as HTML for easy formatting
- **Bidirectional Markdown**: Can parse and serialize markdown seamlessly
- **SSR-Ready**: Built with Qwik's resumability in mind
- **Tree-Shakeable**: Only import what you use; unused code is removed

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
