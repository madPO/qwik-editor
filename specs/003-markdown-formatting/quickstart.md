# Quickstart: Markdown Formatting

**Branch**: `003-markdown-formatting`

## Prerequisites

- Node.js 18+
- pnpm

## Installation

```bash
pnpm install
```

## Running the Demo

1. Start the development server:
   ```bash
   pnpm dev
   ```
2. Open `http://localhost:5173/` in your browser.
3. You will see the editor with the new formatting capabilities.

## Testing Features

### Input Rules (Shortcuts)

- **Lists**: Type `* ` or `- ` (bullet) or `1. ` (number) at the start of a line.
- **Headings**: Type `# `, `## `, or `### ` at the start.
- **Blockquote**: Type `> ` at the start.
- **Code Block**: Type ``` `` ``` (triple backtick) at the start.
- **Divider**: Type `---` on a new line.

### Inline Formatting

1. Select some text.
2. Use the floating toolbar to apply **Bold**, *Italic*, ~~Strikethrough~~, or `Code`.
3. Press `Ctrl+B`, `Ctrl+I` for shortcuts.

## Key Files

- `src/entities/document/model/document.ts`: New block type definitions.
- `src/features/formatting/`: Input rules and formatting logic.
- `src/widgets/editor/ui/`: UI components for blocks (ListItem, Blockquote, etc.).
