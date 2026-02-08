import {
  component$,
  type PropFunction,
  type Signal,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";
import type { BlockquoteBlock as BlockquoteBlockModel } from "../../../entities/document/model/document";
import { getSelectionRange } from "../../../entities/selection/selection";
import { isHTMLElement } from "../../../entities/dom/dom";

export interface BlockquoteBlockProps {
  /** The blockquote block data to render */
  block: BlockquoteBlockModel;
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
 * Renders a blockquote block as a contentEditable <blockquote> element.
 */
export const BlockquoteBlock = component$<BlockquoteBlockProps>(
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
        if (elRef.value.innerHTML !== content) {
          elRef.value.innerHTML = content;
        }
      }
    });

    return (
      <blockquote
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
        data-block-type="blockquote"
        contentEditable="true"
        style={style}
        class={isSelected ? "editor-blockquote selected" : "editor-blockquote"}
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
