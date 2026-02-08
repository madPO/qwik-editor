import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { toMdast } from "hast-util-to-mdast";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import type {
  Root,
  Content,
  Paragraph,
  Heading,
  PhrasingContent,
  List,
  ListItem,
  Blockquote,
  Code,
  ThematicBreak,
  BlockContent,
} from "mdast";
import type { Block, EditorDocument } from "../document/model/document";

/**
 * Parse markdown string into editor document.
 */
export function parseMarkdown(markdown: string): EditorDocument {
  const ast = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  return {
    version: "1.0",
    blocks: convertMdastToBlocks(ast),
  };
}

/**
 * Serialize editor document to markdown string.
 */
export function serializeMarkdown(doc: EditorDocument): string {
  const mdastChildren: Content[] = [];
  let currentList: { type: "list"; ordered: boolean; children: ListItem[] } | null = null;
  
  // Track nesting stack for blockquotes
  const quoteStack: Blockquote[] = [];

  for (const block of doc.blocks) {
    const quoteLevel = block.quoteLevel || 0;

    // Adjust quote stack to match desired level
    while (quoteStack.length > quoteLevel) {
      quoteStack.pop();
    }
    while (quoteStack.length < quoteLevel) {
      const newQuote: Blockquote = { type: "blockquote", children: [] };
      const target = quoteStack.length > 0 
        ? quoteStack[quoteStack.length - 1].children 
        : mdastChildren;
      
      // @ts-ignore
      target.push(newQuote);
      quoteStack.push(newQuote);
    }

    const currentParent = quoteStack.length > 0 
      ? quoteStack[quoteStack.length - 1].children 
      : mdastChildren;

    // Handle lists
    if (block.type === "list-item") {
      const isOrdered = block.format === "ordered";
      const listItem: ListItem = {
        type: "listItem",
        children: [
          {
            type: "paragraph",
            children: htmlToMdast(block.content),
          } as Paragraph,
        ],
      };

      if (currentList && currentList.ordered === isOrdered && currentParent.includes(currentList as any)) {
        currentList.children.push(listItem);
      } else {
        currentList = {
          type: "list",
          ordered: isOrdered,
          children: [listItem],
        };
        currentParent.push(currentList as List);
      }
      continue;
    }

    currentList = null;

    // Handle other blocks
    const nodes = blockToMdast(block);
    
    // If we are in a blockquote, and the block type is 'blockquote', 
    // it was likely a simple paragraph block that got converted.
    // We should just use the paragraph content to avoid double blockquotes if blockToMdast adds one.
    if (quoteStack.length > 0 && block.type === "blockquote") {
        currentParent.push({
            type: "paragraph",
            children: htmlToMdast(block.content)
        } as Paragraph);
    } else {
        currentParent.push(...nodes);
    }
  }

  const ast: Root = {
    type: "root",
    children: mdastChildren,
  };
  return toMarkdown(ast, {
    extensions: [gfmToMarkdown()],
  });
}

/**
 * Converts mdast Root to an array of Editor blocks.
 */
function convertMdastToBlocks(ast: Root): Block[] {
  const blocks: Block[] = [];

  const processNodes = (nodes: Content[], quoteLevel = 0) => {
    for (const node of nodes) {
      const id = crypto.randomUUID();

      if (node.type === "heading") {
        const level = Math.min(Math.max(node.depth, 1), 3) as 1 | 2 | 3;
        blocks.push({
          id,
          type: "heading",
          level,
          quoteLevel,
          content: mdastToHtml(node.children),
        });
        continue;
      }

      if (node.type === "list") {
        for (const item of node.children) {
          blocks.push({
            id: crypto.randomUUID(),
            type: "list-item",
            format: node.ordered ? "ordered" : "unordered",
            quoteLevel,
            content: mdastToBlockHtml(item.children),
          });
        }
        continue;
      }

      if (node.type === "blockquote") {
        processNodes(node.children, quoteLevel + 1);
        continue;
      }

      if (node.type === "code") {
        blocks.push({
          id,
          type: "code-block",
          language: node.lang || undefined,
          quoteLevel,
          content: node.value,
        });
        continue;
      }

      if (node.type === "thematicBreak") {
        blocks.push({
          id,
          type: "horizontal-rule",
          quoteLevel,
          content: "",
        });
        continue;
      }

      if (node.type === "paragraph") {
        blocks.push({
          id,
          type: quoteLevel > 0 ? "blockquote" : "paragraph",
          quoteLevel,
          content: mdastToHtml(node.children),
        });
        continue;
      }

      // Default to paragraph for unhandled types
      blocks.push({
        id,
        type: "paragraph",
        quoteLevel,
        content: "children" in node ? mdastToBlockHtml((node as any).children as Content[]) : "",
      });
    }
  };

  processNodes(ast.children);
  return blocks;
}

/**
 * Helper to convert block children to HTML.
 */
function mdastToBlockHtml(children: Content[]): string {
  // If we have a single paragraph, use its children (phrasing content)
  if (children.length === 1 && children[0].type === "paragraph") {
    return mdastToHtml(children[0].children);
  }
  // Otherwise, wrap in paragraph if it's phrasing content
  // This is a bit of a heuristic
  return mdastToHtml(children as PhrasingContent[]);
}

/**
 * Converts an Editor block to an mdast Content node.
 * Returns an array because some blocks (like lists) might be flattened in the editor.
 */
function blockToMdast(block: Block): Content[] {
  if (block.type === "heading") {
    return [
      {
        type: "heading",
        depth: block.level,
        children: htmlToMdast(block.content),
      } as Heading,
    ];
  }

  if (block.type === "list-item") {
    return [
      {
        type: "list",
        ordered: block.format === "ordered",
        children: [
          {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: htmlToMdast(block.content),
              },
            ],
          },
        ],
      } as List,
    ];
  }

  if (block.type === "blockquote") {
    return [
      {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: htmlToMdast(block.content),
          },
        ],
      } as Blockquote,
    ];
  }

  if (block.type === "code-block") {
    return [
      {
        type: "code",
        lang: block.language,
        value: block.content,
      } as Code,
    ];
  }

  if (block.type === "horizontal-rule") {
    return [
      {
        type: "thematicBreak",
      } as ThematicBreak,
    ];
  }

  return [
    {
      type: "paragraph",
      children: htmlToMdast(block.content),
    } as Paragraph,
  ];
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
