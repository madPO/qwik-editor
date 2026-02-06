import {
  component$,
  type PropFunction,
  type Signal,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { ParagraphBlock as ParagraphBlockModel } from "../../../entities/document/model/document";
import { getSelectionRange } from "../../../entities/selection/selection";
import { isHTMLElement } from "../../../entities/shared/utils/dom";

export interface ParagraphBlockProps {
  /** The paragraph block data to render */
  block: ParagraphBlockModel;
  /** Whether this block is currently selected */
  isSelected: boolean;
  /** Callback fired when content changes */
  onInput$: PropFunction<(newContent: string, anchorOffset: number, focusOffset: number) => void>;
  /** Callback when user presses Enter */
  onEnter$: PropFunction<(blockId: string, offset: number) => void>;
  /** Callback when user presses Backspace at start */
  onBackspaceAtStart$: PropFunction<(blockId: string) => void>;
  /** Callback when user presses Delete at end */
  onDeleteAtEnd$: PropFunction<(blockId: string) => void>;
  /** Callback for arrow key navigation */
  onNavigate$: PropFunction<(direction: "up" | "down", blockId: string) => void>;
  /** Optional reference to the contentEditable element */
  ref?: Signal<HTMLElement | undefined> | PropFunction<(el: HTMLElement) => void>;
}

/**
 * Renders a paragraph block as a contentEditable <p> element.
 *
 * Supports inline formatting, bidirectional synchronization with the document state,
 * and keyboard navigation (Enter, Backspace, Delete, Arrows).
 * 
 * @example
 * ```tsx
 * <ParagraphBlock
 *   block={{ id: 'p1', type: 'paragraph', content: 'Hello <b>world</b>' }}
 *   isSelected={true}
 *   onInput$={(content) => updateState(content)}
 * />
 * ```
 */
export const ParagraphBlock = component$<ParagraphBlockProps>(
  ({
    block,
    isSelected,
    onInput$,
    onEnter$,
    onBackspaceAtStart$,
    onDeleteAtEnd$,
    onNavigate$,
    ref,
  }) => {
    /**
     * elRef holds the reference to the contentEditable element.
     * Justification (Principle VII): This is a non-reactive DOM reference used for
     * imperative operations (manual content syncing and selection measurement)
     * that cannot be handled purely through Qwik's reactive system without cursor jumps.
     */
    const elRef = useSignal<HTMLElement>();

    // Sync content from state to DOM only when necessary
    useVisibleTask$(({ track }) => {
      const content = track(() => block.content);
      if (elRef.value) {
        // Only update if the DOM is actually different from the state
        // This prevents cursor jumps during typing because the browser
        // already updated the DOM, so elRef.value.innerHTML === content
        if (elRef.value.innerHTML !== content) {
          elRef.value.innerHTML = content;
        }
      }
    });

    return (
      <p
        ref={(el) => {
          elRef.value = el;
          if (ref) {
            if (typeof ref === "function") {
              ref(el);
            } else {
              ref.value = el;
            }
          }
        }}
        data-block-id={block.id}
        data-block-type="paragraph"
        contentEditable="true"
        class={isSelected ? "editor-paragraph selected" : "editor-paragraph"}
        onInput$={(e) => {
          const target = e.target;
          if (!isHTMLElement(target)) return;
          
          const range = getSelectionRange(target);
          if (range) {
            onInput$(target.innerHTML || "", range.anchorOffset, range.focusOffset);
          } else {
            onInput$(target.innerHTML || "", 0, 0);
          }
        }}
        onKeyDown$={(e) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;

          const currentTarget = e.currentTarget;
          if (!isHTMLElement(currentTarget)) return;

          const range = getSelectionRange(currentTarget);
          const offset = range ? range.focusOffset : 0;
          const totalLength = currentTarget.textContent?.length || 0;

          if (e.key === "Enter") {
            e.preventDefault();
            onEnter$(block.id, offset);
          } else if (e.key === "Backspace" && offset === 0) {
            e.preventDefault();
            onBackspaceAtStart$(block.id);
          } else if (e.key === "Delete" && offset === totalLength) {
            e.preventDefault();
            onDeleteAtEnd$(block.id);
          } else if (e.key === "ArrowUp") {
            if (offset === 0) {
              e.preventDefault();
              onNavigate$("up", block.id);
            }
          } else if (e.key === "ArrowDown") {
            if (offset === totalLength) {
              e.preventDefault();
              onNavigate$("down", block.id);
            }
          }
        }}
      />
    );
  },
);
