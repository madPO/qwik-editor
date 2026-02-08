import {
  component$,
  type Signal,
  type PropFunction,
  useSignal,
  type CSSProperties,
} from "@builder.io/qwik";
import type { HorizontalRuleBlock as HorizontalRuleBlockModel } from "../../../entities/document/model/document";

export interface HorizontalRuleBlockProps {
  /** The horizontal-rule block data to render */
  block: HorizontalRuleBlockModel;
  /** Whether this block is currently selected */
  isSelected: boolean;
  /** Optional style override */
  style?: string | CSSProperties;
  /** Optional reference to the element */
  ref?: Signal<HTMLElement | undefined> | PropFunction<(el: HTMLElement) => void>;
}

/**
 * Renders a horizontal rule block.
 */
export const HorizontalRuleBlock = component$<HorizontalRuleBlockProps>(
  ({ block, isSelected, ref }) => {
    const elRef = useSignal<HTMLElement>();

    return (
      <div
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
        data-block-type="horizontal-rule"
        class={isSelected ? "editor-horizontal-rule selected" : "editor-horizontal-rule"}
      >
        <hr />
      </div>
    );
  },
);
