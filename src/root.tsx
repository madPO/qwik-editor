import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { Editor } from "./widgets/editor/ui/editor";
import { parseMarkdown, serializeMarkdown } from "./entities/markdown/markdown";
import { runMarkdownTests } from "./entities/markdown/__tests__/markdown.test";

export default component$(() => {
  const initialMarkdown = "# Hello Editor\n\nStart typing here...";
  const document = parseMarkdown(initialMarkdown);
  const blocks = useSignal(document.blocks);

  useVisibleTask$(() => {
    runMarkdownTests();
  });

  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>Qwik Editor Test</title>
      </head>
      <body>
        <div
          style={{
            padding: "2rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1>Qwik Editor Test</h1>
          <Editor
            content={blocks.value}
            onContentChange$={$((newBlocks) => {
              blocks.value = [...newBlocks];
            })}
          />

          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              backgroundColor: "#f9f9f9",
              border: "1px solid #eee",
            }}
          >
            <h3>Raw Markdown Output:</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {serializeMarkdown({
                version: "1.0",
                blocks: blocks.value,
              })}
            </pre>
          </div>
        </div>
      </body>
    </>
  );
});
