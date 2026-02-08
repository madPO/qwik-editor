import {
  component$,
  useStore,
  $,
  type PropFunction,
  useStylesScoped$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { EditorState, Block } from "../../../entities/document/model/document";
import { ParagraphBlock } from "./paragraph-block";
import { HeadingBlock } from "./heading-block";
import { BlockTypeSelector } from "./block-type-selector";
import { FloatingToolbar } from "./floating-toolbar";
import {
  setSelectionRange,
  getSelectionRange,
} from "../../../entities/selection/selection";
import { isHTMLElement } from "../../../entities/dom/dom";
import { useBlockOperations } from "../lib/hooks/use-block-operations";
import { useToolbarState } from "../lib/hooks/use-toolbar-state";
import { useFormatting } from "../lib/hooks/use-formatting";
import { useHistory } from "../lib/hooks/use-history";
import { 
  DEBOUNCE_MS, 
  TOOLBAR_OFFSET_Y, 
  SELECTOR_OFFSET_Y,
  DOCUMENT_VERSION 
} from "../lib/constants/ui";
import styles from "./editor.css?inline";

export interface EditorProps {
  /** Initial content blocks to load */
  content?: Block[];
  /** Callback fired when the document content changes */
  onContentChange$?: PropFunction<(blocks: Block[]) => void>;
}

/**
 * WYSIWYG markdown editor component for Qwik.
 * Supports paragraphs and headings (H1-H3) with block-based editing.
 *
 * @example
 * ```tsx
 * <Editor
 *   content={[{ id: '1', type: 'paragraph', content: 'Hello' }]}
 *   onContentChange$={(blocks) => console.log('Updated:', blocks)}
 * />
 * ```
 */
export const Editor = component$<EditorProps>(({ content = [], onContentChange$ }) => {
  useStylesScoped$(styles);
  const containerRef = useSignal<HTMLElement>();
  
  // Initialize state
  const state = useStore<EditorState>({
    document: {
      version: DOCUMENT_VERSION,
      blocks:
        content.length > 0
          ? [...content]
          : [
              {
                id: crypto.randomUUID(),
                type: "paragraph",
                content: "",
              },
            ],
    },
    selection: null,
    history: {
      past: [],
      future: [],
    },
  });

  // Sync with props if content changes
  useVisibleTask$(({ track }) => {
    track(() => content);
    if (content.length > 0) {
      state.document.blocks = [...content];
    }
  });

  const selectorVisible = useSignal(false);
  const selectorPosition = useStore({ top: 0, left: 0 });
  const toolbarVisible = useSignal(false);
  const toolbarPosition = useStore({ top: 0, left: 0 });
  const debounceTimer = useSignal<ReturnType<typeof setTimeout> | null>(null);

  // Track block count to identify new blocks
  const blockCount = useSignal(state.document.blocks.length);

  /**
   * blockRefs stores DOM elements for each block to manage focus and selection.
   * Justification (Principle VII): These are non-reactive references to DOM nodes.
   */
  const blockRefs = useStore<Record<string, HTMLElement>>({});

  const { takeSnapshot, undo, redo } = useHistory(state);

  // Hooks for separated logic
  const { 
    handleBlockUpdate, 
    convertBlockType, 
    splitBlock, 
    mergeWithPrevious, 
    mergeWithNext, 
    navigate 
  } = useBlockOperations(state, onContentChange$, debounceTimer, DEBOUNCE_MS, takeSnapshot);

  const { showToolbar, hideToolbar } = useToolbarState(
    toolbarVisible,
    toolbarPosition,
    containerRef,
    TOOLBAR_OFFSET_Y
  );

  const { applyFormat } = useFormatting(state, blockRefs, handleBlockUpdate);

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
      }
    });
  });

  useVisibleTask$(({ track }) => {
    const selection = track(() => state.selection);
    const blocks = track(() => state.document.blocks);

    if (selection && selection.blockId) {
      requestAnimationFrame(() => {
        const blockEl = blockRefs[selection.blockId];
        if (blockEl) {
          const currentRange = getSelectionRange(blockEl);
          if (
            !currentRange ||
            currentRange.anchorOffset !== selection.anchorOffset ||
            currentRange.focusOffset !== selection.focusOffset
          ) {
            if (document.activeElement !== blockEl) {
              blockEl.focus();
            }
            setSelectionRange(blockEl, selection.anchorOffset, selection.focusOffset);
          }
        }
      });
    }

    if (blocks.length > 0 && !selection && blockCount.value === 0) {
      state.selection = {
        blockId: blocks[0].id,
        anchorOffset: 0,
        focusOffset: 0,
        isCollapsed: true,
      };
    }
    blockCount.value = blocks.length;
  });

  const handleKeyDown = $((e: KeyboardEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    hideToolbar();

    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        applyFormat("bold");
        return;
      } else if (e.key === "i") {
        e.preventDefault();
        applyFormat("italic");
        return;
      } else if (e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
        return;
      } else if (e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }
    }

    if (e.key === "/") {
      const rect = range.getBoundingClientRect();
      const container = containerRef.value;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        selectorPosition.top = rect.bottom - containerRect.top + SELECTOR_OFFSET_Y;
        selectorPosition.left = rect.left - containerRect.left;
        selectorVisible.value = true;
      }
    }
  });

  const handleMouseUp = $((e: MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const target = e.target;
    if (!isHTMLElement(target)) return;
    
    const blockEl = target.closest("[data-block-id]");
    if (!isHTMLElement(blockEl)) return;
    
    const blockId = blockEl.dataset.blockId;
    if (blockId) {
      const range = getSelectionRange(blockEl);
      if (range) {
        state.selection = {
          blockId,
          anchorOffset: range.anchorOffset,
          focusOffset: range.focusOffset,
          isCollapsed: selection.isCollapsed,
        };
      }
    }

    if (selection.isCollapsed) {
      hideToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    showToolbar(range.getBoundingClientRect());
  });

  const handleFocus = $((e: FocusEvent) => {
    const target = e.target;
    if (!isHTMLElement(target)) return;
    
    const blockId = target.dataset.blockId;
    if (blockId) {
      if (!state.selection || state.selection.blockId !== blockId) {
        const range = getSelectionRange(target);
        if (range) {
          state.selection = {
            blockId,
            anchorOffset: range.anchorOffset,
            focusOffset: range.focusOffset,
            isCollapsed: true,
          };
        }
      }
    }
  });

  return (
    <div
      ref={containerRef}
      class="qwik-editor"
      role="textbox"
      aria-multiline="true"
      aria-label="Markdown editor"
      style={{ position: "relative" }}
      onKeyDown$={handleKeyDown}
      onMouseUp$={handleMouseUp}
      onFocusIn$={handleFocus}
    >
      <FloatingToolbar
        visible={toolbarVisible.value}
        position={toolbarPosition}
        onFormat$={applyFormat}
      />
      <BlockTypeSelector
        visible={selectorVisible.value}
        position={selectorPosition}
        currentBlock={state.document.blocks.find((b) => b.id === state.selection?.blockId) || null}
        onTypeChange$={(type, level) => {
          if (state.selection?.blockId) {
            convertBlockType(state.selection.blockId, type, level);
          }
        }}
        onClose$={$(() => (selectorVisible.value = false))}
      />
      {state.document.blocks.map((block) => {
        const isSelected = state.selection?.blockId === block.id;
        const onInput$ = $((content: string, anchor: number, focus: number) =>
          handleBlockUpdate(block.id, content, anchor, focus));
        const onEnter$ = $((id: string, offset: number) => splitBlock(id, offset));
        const onBackspaceAtStart$ = $((id: string) => mergeWithPrevious(id));
        const onDeleteAtEnd$ = $((id: string) => mergeWithNext(id));
        const onNavigate$ = $((dir: "up" | "down", id: string) => navigate(dir, id));
        const setRef = $((el: HTMLElement) => {
          blockRefs[block.id] = el;
        });

        switch (block.type) {
          case "paragraph":
            return (
              <ParagraphBlock
                key={block.id}
                block={block}
                isSelected={isSelected}
                onInput$={onInput$}
                onEnter$={onEnter$}
                onBackspaceAtStart$={onBackspaceAtStart$}
                onDeleteAtEnd$={onDeleteAtEnd$}
                onNavigate$={onNavigate$}
                ref={setRef}
              />
            );
          case "heading":
            return (
              <HeadingBlock
                key={block.id}
                block={block}
                isSelected={isSelected}
                onInput$={onInput$}
                onEnter$={onEnter$}
                onBackspaceAtStart$={onBackspaceAtStart$}
                onDeleteAtEnd$={onDeleteAtEnd$}
                onNavigate$={onNavigate$}
                ref={setRef}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
});
