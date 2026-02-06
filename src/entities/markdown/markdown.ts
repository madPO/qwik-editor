import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { toMdast } from "hast-util-to-mdast";
import type { Root, Content, Paragraph, Heading, PhrasingContent } from "mdast";
import type {
  Block,
  EditorDocument,
} from "../document/model/document";

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

/**
 * Converts mdast Root to an array of Editor blocks.
 */
function convertMdastToBlocks(ast: Root): Block[] {
  return ast.children.map((node) => {
    const id = crypto.randomUUID();
    let content = "";

    if ("children" in node) {
      content = mdastToHtml(node.children as PhrasingContent[]);
    }

    if (node.type === "heading") {
      const level = Math.min(Math.max(node.depth, 1), 3) as 1 | 2 | 3;
      return {
        id,
        type: "heading",
        level,
        content,
      };
    }

    return {
      id,
      type: "paragraph",
      content,
    };
  });
}

/**
 * Converts an Editor block to an mdast Content node.
 */
function blockToMdast(block: Block): Content {
  const children = htmlToMdast(block.content);

  if (block.type === "heading") {
    const heading: Heading = {
      type: "heading",
      depth: block.level,
      children,
    };
    return heading;
  }

  const paragraph: Paragraph = {
    type: "paragraph",
    children,
  };
  return paragraph;
}

/**
 * Converts mdast phrasing content to HTML string.
 */
function mdastToHtml(children: PhrasingContent[]): string {
  // @ts-ignore - toHast expectation of node type
  const hast = toHast({ type: "paragraph", children } as Paragraph);
  if (hast && "children" in hast) {
    // @ts-ignore - toHtml expectation of nodes
    return toHtml(hast.children);
  }
  return "";
}

/**
 * Converts HTML string to mdast phrasing content.
 */
function htmlToMdast(html: string): PhrasingContent[] {
  const hast = fromHtmlIsomorphic(html, { fragment: true });
  const mdast = toMdast(hast);

  if (mdast.type === "root") {
    const firstChild = mdast.children[0];
    if (firstChild && firstChild.type === "paragraph") {
      return firstChild.children as PhrasingContent[];
    }
    return mdast.children as PhrasingContent[];
  }
  return [];
}
