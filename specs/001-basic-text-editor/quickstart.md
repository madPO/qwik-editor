# Quickstart Guide: Basic Text Editor

**Feature**: 001-basic-text-editor  
**Date**: 2026-02-04  
**Target Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing the basic text editor feature from specification through to working code. Follow these phases in order.

---

## Prerequisites

Before starting implementation:

1. **Review key documents** (in order):
   - [ ] [spec.md](./spec.md) - Feature requirements and success criteria
   - [ ] [plan.md](./plan.md) - Technical context and constitution check
   - [ ] [research.md](./research.md) - Technology decisions and rationale
   - [ ] [data-model.md](./data-model.md) - Data structures and relationships
   - [ ] [contracts/component-api.md](./contracts/component-api.md) - Component interfaces

2. **Development environment**:
   - Node.js 18.17.0+ or 20.3.0+ or 21.0.0+
   - Qwik project initialized (already present in this repo)
   - TypeScript 5.4.5 with strict mode enabled
   - Oxlint and Oxfmt configured (already in package.json)

3. **Understanding required**:
   - Qwik component model and signals
   - TypeScript discriminated unions
   - contentEditable behavior
   - Browser Selection API basics

---

## Implementation Phases

### Phase 1: Setup Dependencies

**Estimated time**: 15 minutes

1. **Install markdown parsing libraries**:

   ```bash
   npm install mdast-util-from-markdown mdast-util-to-markdown micromark
   npm install --save-dev @types/mdast
   ```

2. **Verify TypeScript configuration**:
   - Confirm `tsconfig.json` has `strict: true`
   - Confirm `jsx: "react-jsx"` and `jsxImportSource: "@builder.io/qwik"`

3. **Run linter to establish baseline**:
   ```bash
   npm run lint
   ```

**Checkpoint**: Dependencies installed, no TypeScript errors, lint passes.

---

### Phase 2: Data Models

**Estimated time**: 30 minutes

**Goal**: Implement the data structures defined in [data-model.md](./data-model.md)

1. **Create `src/models/document.ts`**:

   ```typescript
   // Copy type definitions from data-model.md
   export type BlockType = "paragraph" | "heading";

   export interface BaseBlock {
     id: string;
     type: BlockType;
   }

   export interface ParagraphBlock extends BaseBlock {
     type: "paragraph";
     content: string;
   }

   export interface HeadingBlock extends BaseBlock {
     type: "heading";
     level: 1 | 2 | 3;
     content: string;
   }

   export type Block = ParagraphBlock | HeadingBlock;

   export interface EditorDocument {
     version: string;
     blocks: Block[];
   }

   export interface Selection {
     blockId: string;
     offset: number;
     isCollapsed: boolean;
     focus?: {
       blockId: string;
       offset: number;
     };
   }

   export interface EditorState {
     document: EditorDocument;
     selection: Selection | null;
   }
   ```

2. **Verify types compile**:
   ```bash
   npm run build.types
   ```

**Checkpoint**: `src/models/document.ts` exists, compiles without errors, exports all types.

---

### Phase 3: Markdown Service

**Estimated time**: 1 hour

**Goal**: Implement bidirectional markdown conversion.

1. **Create `src/services/markdown.ts`**:

   ```typescript
   import { fromMarkdown } from "mdast-util-from-markdown";
   import { toMarkdown } from "mdast-util-to-markdown";
   import type { Root, Paragraph, Heading, Content } from "mdast";
   import type { Block, EditorDocument } from "../models/document";

   /**
    * Parse markdown string into editor document.
    */
   export function parseMarkdown(markdown: string): EditorDocument {
     const ast = fromMarkdown(markdown);
     return {
       version: "1.0",
       blocks: convertMdastToBlocks(ast),
     };
   }

   /**
    * Serialize editor document to markdown string.
    */
   export function serializeMarkdown(doc: EditorDocument): string {
     const ast: Root = {
       type: "root",
       children: doc.blocks.map(blockToMdast),
     };
     return toMarkdown(ast);
   }

   // Helper functions to implement:
   function convertMdastToBlocks(ast: Root): Block[] {
     // Filter for paragraph and heading nodes
     // Convert to Block format with UUIDs
   }

   function blockToMdast(block: Block): Content {
     // Convert Block to mdast node
   }

   function extractText(node: any): string {
     // Extract plain text from mdast node
   }
   ```

2. **Implement helper functions** following the examples in research.md Decision 4.

3. **Test manually**:
   ```typescript
   // Add temporary test in entry.dev.tsx
   const doc = parseMarkdown("# Hello\n\nWorld");
   console.log(doc);
   const md = serializeMarkdown(doc);
   console.log(md); // Should output: "# Hello\n\nWorld\n"
   ```

**Checkpoint**: Markdown parsing and serialization works bidirectionally.

---

### Phase 4: Core Components - Part 1 (Blocks)

**Estimated time**: 2 hours

**Goal**: Implement ParagraphBlock and HeadingBlock components.

1. **Create `src/components/editor/types.ts`**:

   ```typescript
   export type {
     Block,
     BlockType,
     ParagraphBlock,
     HeadingBlock,
     EditorDocument,
     Selection,
     EditorState,
   } from "../../models/document";
   ```

2. **Create `src/components/editor/paragraph-block.tsx`**:

   ```typescript
   import { component$, type PropFunction, type Signal } from '@builder.io/qwik';
   import type { ParagraphBlock } from './types';

   export interface ParagraphBlockProps {
     block: ParagraphBlock;
     isSelected: boolean;
     onInput$: PropFunction<(newContent: string) => void>;
     ref?: Signal<HTMLElement | undefined>;
   }

   export const ParagraphBlock = component$<ParagraphBlockProps>(
     ({ block, isSelected, onInput$, ref }) => {
       return (
         <p
           ref={ref}
           data-block-id={block.id}
           data-block-type="paragraph"
           contentEditable
           suppressContentEditableWarning
           class={isSelected ? 'editor-paragraph selected' : 'editor-paragraph'}
           onInput$={(e) => {
             const target = e.target as HTMLElement;
             onInput$(target.textContent || '');
           }}
         >
           {block.content}
         </p>
       );
     }
   );
   ```

3. **Create `src/components/editor/heading-block.tsx`**:

   ```typescript
   // Similar structure to ParagraphBlock
   // Render <h1>, <h2>, or <h3> based on block.level
   ```

4. **Add basic styles** (create `src/components/editor/editor.css`):

   ```css
   .editor-paragraph {
     margin: 0.5rem 0;
     line-height: 1.6;
   }

   .editor-heading {
     margin: 1rem 0 0.5rem;
     font-weight: 600;
   }

   .editor-heading-1 {
     font-size: 2rem;
   }
   .editor-heading-2 {
     font-size: 1.5rem;
   }
   .editor-heading-3 {
     font-size: 1.25rem;
   }

   [contentEditable]:focus {
     outline: none;
   }
   ```

**Checkpoint**: Block components render correctly with contentEditable.

---

### Phase 5: Core Components - Part 2 (Editor)

**Estimated time**: 3 hours

**Goal**: Implement the root Editor component with state management.

1. **Create `src/components/editor/editor.tsx`**:

   ```typescript
   import { component$, useStore, useSignal, $, type PropFunction } from '@builder.io/qwik';
   import { parseMarkdown, serializeMarkdown } from '../../services/markdown';
   import type { EditorState, Block } from './types';
   import { ParagraphBlock } from './paragraph-block';
   import { HeadingBlock } from './heading-block';

   export interface EditorProps {
     initialMarkdown?: string;
     onChange$?: PropFunction<(markdown: string) => void>;
     onFocus$?: PropFunction<() => void>;
     onBlur$?: PropFunction<() => void>;
     class?: string;
     autoFocus?: boolean;
     placeholder?: string;
   }

   export const Editor = component$<EditorProps>(
     ({ initialMarkdown = '', onChange$, class: className, placeholder = 'Start typing...' }) => {
       // Initialize state
       const state = useStore<EditorState>({
         document: initialMarkdown
           ? parseMarkdown(initialMarkdown)
           : { version: '1.0', blocks: [{
               id: crypto.randomUUID(),
               type: 'paragraph',
               content: ''
             }] },
         selection: null
       });

       // Block update handler
       const handleBlockUpdate = $((blockId: string, newContent: string) => {
         const block = state.document.blocks.find(b => b.id === blockId);
         if (block && 'content' in block) {
           block.content = newContent;

           // Notify parent of change (debounced in production)
           if (onChange$) {
             const markdown = serializeMarkdown(state.document);
             onChange$(markdown);
           }
         }
       });

       return (
         <div class={`qwik-editor ${className || ''}`}>
           {state.document.blocks.map(block => {
             if (block.type === 'paragraph') {
               return (
                 <ParagraphBlock
                   key={block.id}
                   block={block}
                   isSelected={state.selection?.blockId === block.id}
                   onInput$={(content) => handleBlockUpdate(block.id, content)}
                 />
               );
             } else if (block.type === 'heading') {
               return (
                 <HeadingBlock
                   key={block.id}
                   block={block}
                   isSelected={state.selection?.blockId === block.id}
                   onInput$={(content) => handleBlockUpdate(block.id, content)}
                 />
               );
             }
             return null;
           })}
           {state.document.blocks.length === 0 && (
             <p class="editor-placeholder">{placeholder}</p>
           )}
         </div>
       );
     }
   );
   ```

2. **Test in development**:
   - Update `src/root.tsx` to render `<Editor>`
   - Run `npm run dev`
   - Verify typing updates blocks

**Checkpoint**: Editor renders, accepts input, updates content.

---

### Phase 6: Block Operations

**Estimated time**: 3-4 hours

**Goal**: Implement Enter, Backspace, and block navigation.

1. **Add keyboard handlers to block components**:

   ```typescript
   // In ParagraphBlock/HeadingBlock
   onKeyDown$={(e) => {
     if (e.key === 'Enter') {
       e.preventDefault();
       // Call onEnter$ prop
     }
     if (e.key === 'Backspace' && isAtStart()) {
       e.preventDefault();
       // Call onBackspaceAtStart$ prop
     }
     // ... handle arrow keys for navigation
   }}
   ```

2. **Implement block operations in Editor**:

   ```typescript
   const insertBlockAfter = $((afterId: string) => {
     const idx = state.document.blocks.findIndex((b) => b.id === afterId);
     const newBlock: Block = {
       id: crypto.randomUUID(),
       type: "paragraph",
       content: "",
     };
     state.document.blocks = [
       ...state.document.blocks.slice(0, idx + 1),
       newBlock,
       ...state.document.blocks.slice(idx + 1),
     ];
     // Focus new block
   });

   const mergeWithPrevious = $((blockId: string) => {
     // Implementation from data-model.md
   });
   ```

3. **Implement cursor restoration**:

   ```typescript
   import { useVisibleTask$ } from "@builder.io/qwik";

   useVisibleTask$(({ track }) => {
     track(() => state.selection);

     if (state.selection) {
       // Restore cursor using Selection API
       // See research.md Decision 3 for implementation
     }
   });
   ```

**Checkpoint**: Enter splits blocks, Backspace merges, arrow keys navigate.

---

### Phase 7: Block Type Selector

**Estimated time**: 2 hours

**Goal**: Implement UI for changing block types.

1. **Create `src/components/editor/block-type-selector.tsx`**:

   ```typescript
   // Implement dropdown/menu component
   // Show on keyboard shortcut (e.g., Cmd+K or /)
   // Options: Paragraph, Heading 1, Heading 2, Heading 3
   ```

2. **Add block type conversion**:

   ```typescript
   const convertBlockType = $((blockId: string, newType: BlockType, level?: 1 | 2 | 3) => {
     const idx = state.document.blocks.findIndex((b) => b.id === blockId);
     const oldBlock = state.document.blocks[idx];

     const newBlock: Block =
       newType === "heading"
         ? {
             id: oldBlock.id,
             type: "heading",
             level: level || 1,
             content: "content" in oldBlock ? oldBlock.content : "",
           }
         : {
             id: oldBlock.id,
             type: "paragraph",
             content: "content" in oldBlock ? oldBlock.content : "",
           };

     state.document.blocks[idx] = newBlock;
   });
   ```

**Checkpoint**: Block type can be changed while preserving content.

---

### Phase 8: Public API & Documentation

**Estimated time**: 1 hour

**Goal**: Finalize exports and add JSDoc.

1. **Update `src/index.ts`**:

   ```typescript
   export { Editor } from "./components/editor/editor";
   export type { EditorProps } from "./components/editor/editor";
   export type {
     Block,
     BlockType,
     ParagraphBlock,
     HeadingBlock,
     EditorDocument,
     EditorState,
   } from "./models/document";
   export const VERSION = "0.0.1";
   ```

2. **Add JSDoc to all exports**:

   ````typescript
   /**
    * WYSIWYG markdown editor component for Qwik.
    * Supports paragraphs and headings (H1-H3) with block-based editing.
    *
    * @example
    * ```tsx
    * <Editor
    *   initialMarkdown="# Hello\n\nWorld"
    *   onChange$={(md) => console.log('Updated:', md)}
    * />
    * ```
    */
   export const Editor: Component<EditorProps>;
   ````

3. **Update `README.md`** at repository root with usage examples.

**Checkpoint**: Library exports are documented and easy to consume.

---

### Phase 9: Polish & Accessibility

**Estimated time**: 2 hours

**Goal**: Meet accessibility requirements and performance targets.

1. **Add ARIA attributes**:

   ```typescript
   <div
     role="textbox"
     aria-multiline="true"
     aria-label="Markdown editor"
   >
   ```

2. **Test keyboard navigation**:
   - [ ] Tab moves focus into/out of editor
   - [ ] Arrow keys navigate between blocks
   - [ ] Enter creates new blocks
   - [ ] Backspace merges blocks

3. **Add focus management**:

   ```typescript
   // Ensure cursor is visible after operations
   // Restore focus after block type changes
   ```

4. **Performance optimization**:
   - [ ] Debounce onChange$ callback (300ms)
   - [ ] Debounce markdown serialization
   - [ ] Test with 100+ blocks

5. **Color contrast check**:
   - Use browser DevTools to verify WCAG AA compliance

**Checkpoint**: Editor is accessible, performant, polished.

---

### Phase 10: Integration Testing

**Estimated time**: 1-2 hours

**Goal**: Verify all functional requirements and success criteria.

Create a test document in `src/root.tsx`:

```typescript
import { component$, useSignal } from '@builder.io/qwik';
import { Editor } from './index';

export default component$(() => {
  const markdown = useSignal('# Test Document\n\nParagraph text.');

  return (
    <div>
      <h1>Editor Test</h1>
      <Editor
        initialMarkdown={markdown.value}
        onChange$={(md) => {
          console.log('Changed:', md);
          markdown.value = md;
        }}
      />
      <h2>Markdown Output</h2>
      <pre>{markdown.value}</pre>
    </div>
  );
});
```

**Manual test scenarios**:

1. **FR-001**: Load editor, verify it's editable immediately
2. **FR-002**: Create paragraph, convert to H1, H2, H3
3. **FR-003**: Type 1000+ characters in a single block
4. **FR-004**: Fill screen with content, verify auto-resize
5. **FR-005**: Convert block type, verify content preserved
6. **FR-006**: Use block type selector to change types
7. **FR-007**: Verify H1 > H2 > H3 visual hierarchy
8. **FR-008**: Press Enter, verify new block created
9. **FR-009**: Use arrow keys to navigate, click to select
10. **FR-010**: Backspace at block start, verify merge
11. **FR-011**: Start with empty editor, type to create paragraph
12. **FR-012**: Resize browser window, verify editor adjusts

**Success criteria validation**:

- **SC-001**: Measure time from page load to first keystroke
- **SC-002**: Time block type conversion (should be instant)
- **SC-003**: Create 100 blocks, verify no lag
- **SC-004**: Have non-technical user change block types
- **SC-005**: Observe resize timing after content changes
- **SC-006**: Type continuously, check for input lag

**Checkpoint**: All FRs work, all SCs met.

---

## Constitution Re-Check

After implementation, verify compliance:

### I. Component-First Architecture

- [x] Editor is self-contained Qwik component
- [x] Blocks are isolated components
- [x] Props use TypeScript interfaces
- [x] No side effects on import

### II. TypeScript Safety

- [x] Strict mode enabled
- [x] No `any` types (or documented)
- [x] All exports typed

### III. WYSIWYG Integrity

- [x] Visual matches markdown output
- [x] No content loss on type conversion

### IV. Markdown Standard Compliance

- [x] Paragraphs and headings follow CommonMark
- [x] Deviations documented

### V. Accessibility First

- [x] Keyboard navigation works
- [x] ARIA labels present
- [x] Semantic HTML used
- [x] Color contrast meets WCAG AA

### VI. Server Rendering Support

- [x] No DOM access during init
- [x] Uses Qwik lifecycle hooks correctly
- [x] Hydration works without flicker

### VII. Data-Transformation-Action

- [x] Data flow is explicit
- [x] Transformations are pure
- [x] Actions isolated in event handlers

### VIII. Low Coupling, High Cohesion

- [x] Components depend on interfaces
- [x] No circular dependencies
- [x] Clear module boundaries

---

## Common Pitfalls

1. **Cursor position lost after block type change**
   - Solution: Use `queueMicrotask` to restore after DOM update
   - See research.md Decision 3 for implementation

2. **Infinite re-render loop**
   - Cause: Updating state during render
   - Solution: Use event handlers ($) for state mutations

3. **Selection API not working in SSR**
   - Cause: Accessing `window.getSelection()` during server render
   - Solution: Wrap in `useVisibleTask$` (client-only)

4. **contentEditable cursor jumps**
   - Cause: React-style reconciliation
   - Solution: Qwik's fine-grained reactivity avoids this, but preserve `key` prop

5. **Markdown serialization includes extra newlines**
   - Cause: mdast-util-to-markdown defaults
   - Solution: This is expected, markdown needs blank lines between blocks

---

## Debugging Tips

1. **Component not updating**:
   - Check: Is state wrapped in `useStore` or `useSignal`?
   - Check: Are you mutating state directly (good) or creating new objects (unnecessary)?

2. **Cursor not restoring**:
   - Add: `console.log(state.selection)` to see if virtual state is updating
   - Check: Is `useVisibleTask$` running on client?

3. **Block type selector not showing**:
   - Check: Is `visible` prop true?
   - Check: Is component rendered in DOM (use DevTools)?

4. **Performance issues**:
   - Profile: Use Chrome DevTools Performance tab
   - Check: Are you debouncing onChange$ callback?
   - Check: Are you calling serializeMarkdown on every keystroke?

---

## Definition of Done

The feature is complete when:

- [x] All functional requirements (FR-001 to FR-012) implemented
- [x] All success criteria (SC-001 to SC-006) validated
- [x] All constitution principles pass re-check
- [x] Public API documented with JSDoc
- [x] Code passes `npm run lint`
- [x] Code passes `npm run fmt.check`
- [x] Manual testing completed
- [x] README.md updated with usage instructions

---

## Next Steps

After completing implementation:

1. **Create tasks** using `/speckit.tasks` command
2. **Implement feature** following this quickstart
3. **Test feature** against specification
4. **Commit changes** with meaningful message
5. **Prepare for next feature** (e.g., rich text formatting, lists, etc.)

---

## Support Resources

- **Qwik Documentation**: https://qwik.dev/docs/
- **mdast Specification**: https://github.com/syntax-tree/mdast
- **unified Ecosystem**: https://unifiedjs.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

**Questions?** Refer to:

- [spec.md](./spec.md) for requirements clarification
- [research.md](./research.md) for technical decisions
- [data-model.md](./data-model.md) for data structure questions
- [contracts/component-api.md](./contracts/component-api.md) for API details
