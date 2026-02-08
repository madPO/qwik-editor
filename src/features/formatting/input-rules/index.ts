import { $ } from "@builder.io/qwik";
import type { BlockType } from "../../../entities/document/model/document";

export interface InputRule {
  /** Regex trigger for the rule */
  match: RegExp;
  /** The resulting block type */
  type: BlockType;
  /** Optional level (for headings) */
  level?: 1 | 2 | 3;
  /** Optional list format */
  format?: "ordered" | "unordered";
}

export const ALL_RULES: InputRule[] = [
  // Lists
  { match: /^\* $/, type: "list-item", format: "unordered" },
  { match: /^- $/, type: "list-item", format: "unordered" },
  { match: /^1\. $/, type: "list-item", format: "ordered" },
  // Blocks
  { match: /^# $/, type: "heading", level: 1 },
  { match: /^## $/, type: "heading", level: 2 },
  { match: /^### $/, type: "heading", level: 3 },
  { match: /^> $/, type: "blockquote" },
  { match: /^```$/, type: "code-block" },
  // Separators
  { match: /^---$/, type: "horizontal-rule" },
  { match: /^\*\*\*$/, type: "horizontal-rule" },
  { match: /^___$/, type: "horizontal-rule" },
];

export function useInputRules(
  convertBlockType: (blockId: string, type: BlockType, level?: 1 | 2 | 3, format?: "ordered" | "unordered") => void
) {
  const checkRules = $((blockId: string, text: string) => {
    for (const rule of ALL_RULES) {
      if (rule.match.test(text)) {
        convertBlockType(blockId, rule.type, rule.level, rule.format);
        return true;
      }
    }
    return false;
  });

  return {
    checkRules,
  };
}
