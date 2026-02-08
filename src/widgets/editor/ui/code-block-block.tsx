import {
  component$,
  type PropFunction,
  type Signal,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";
import type { CodeBlockBlock as CodeBlockBlockModel } from "../../../entities/document/model/document";
import { getSelectionRange } from "../../../entities/selection/selection";
import { isHTMLElement } from "../../../entities/dom/dom";

export interface CodeBlockBlockProps {
  /** The code-block block data to render */
  block: CodeBlockBlockModel;
  /** Whether this block is currently selected */
  isSelected: boolean;
  /** Optional style override */
  style?: string | CSSProperties;
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
 * Renders a code block as a contentEditable <pre> element.
 */
export const CodeBlockBlock = component$<CodeBlockBlockProps>(
  ({
    block,
    isSelected,
    style,
    onInput$,
    onEnter$,
    onBackspaceAtStart$,
    onDeleteAtEnd$,
    onNavigate$,
    ref,
  }) => {
    const elRef = useSignal<HTMLElement>();

    useVisibleTask$(({ track }) => {
      const content = track(() => block.content);
      if (elRef.value) {
        if (elRef.value.innerText !== content) {
          elRef.value.innerText = content;
        }
      }
    });

    return (
      <pre
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
        data-block-type="code-block"
        contentEditable="true"
        style={style}
        class={isSelected ? "editor-code-block selected" : "editor-code-block"}
        onInput$={(e) => {
          const target = e.target;
          if (!isHTMLElement(target)) return;
          
          const range = getSelectionRange(target);
          if (range) {
            onInput$(target.innerText || "", range.anchorOffset, range.focusOffset);
          } else {
            onInput$(target.innerText || "", 0, 0);
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
            if (e.shiftKey) {
              // Shift+Enter to escape code block and split
              e.preventDefault();
              onEnter$(block.id, offset);
            } else {
              // Standard Enter to insert newline
              e.preventDefault();
              const text = currentTarget.textContent || "";
              const before = text.substring(0, offset);
              const after = text.substring(offset);
              const newContent = before + "\n" + after;
              
              onInput$(newContent, offset + 1, offset + 1);
            }
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
