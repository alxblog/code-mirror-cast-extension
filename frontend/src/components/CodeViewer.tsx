// components/CodeViewer.tsx

import { useMemo } from "react";
import Prism from "prismjs";
import { type SyncData } from "../types";
import { insertCursor } from "@/utils/insertCursor";

interface CodeViewerProps {
  data: SyncData | null;
}

// export function insertCursor(html: string, caretPos: number): string {
//   let currentPos = 0;
//   const tagRegex = /<[^>]*>/g;
//   let result = '';
//   let lastIndex = 0;

//   for (const match of html.matchAll(tagRegex)) {
//     const [tag] = match;
//     const index = match.index!;
//     const textChunk = html.slice(lastIndex, index);
    
//     if (currentPos + textChunk.length >= caretPos) {
//       const offset = caretPos - currentPos;
//       result += textChunk.slice(0, offset) +
//         '<span class="border-r border-white dark:border-black cursor-blink"></span>' +
//         textChunk.slice(offset);
//       result += tag + html.slice(index + tag.length);
//       return result;
//     }

//     result += textChunk + tag;
//     currentPos += textChunk.length;
//     lastIndex = index + tag.length;
//   }

//   // Curseur à la fin
//   result += html.slice(lastIndex);
//   result += '<span class="border-r border-white dark:border-black cursor-blink"></span>';
//   return result;
// }

export function CodeViewer({ data }: CodeViewerProps) {
  const renderedContent = useMemo(() => {
    if (!data) return <div className="text-red-500">⏳ En attente de synchronisation...</div>;

    if (data.isSensitive) {
    return (
      <div className="text-yellow-500 font-mono">
        🔒 Ce fichier est marqué comme sensible. Son contenu n’est pas affiché.
      </div>
    );
  }

    const lang = Prism.languages[data.language] || Prism.languages.javascript;
    const lines = data.content?.split("\n") ?? [];

    return lines.map((line, index) => {
      const raw = line || " ";
      const isActive = index === data.cursor?.line;
      const caretPos = data.cursor?.character ?? 0;

      let lineHtml = Prism.highlight(raw, lang, data.language);

      if (isActive) {
        const padded = raw.padEnd(caretPos + 1, " ");
        // const before = padded.slice(0, caretPos);
        // const after = padded.slice(caretPos);
        // lineHtml =
        //   Prism.highlight(before, lang, data.language) +
        //   '<span class="border-r border-white dark:border-black cursor-blink "></span>' +
        //   Prism.highlight(after, lang, data.language);
        const highlightedLine = Prism.highlight(padded, lang, data.language);
        lineHtml = isActive
          ? insertCursor(highlightedLine, caretPos)
          : highlightedLine;
      }

      return (
        <div
          key={index}
          id={`line-${index}`}
          className={`flex text-sm tab-size-[2] font-mono${
            isActive ? " bg-yellow-800 text-white" : " text-gray-300"
          }`}
        >
          <span className="flex-none select-none w-10 pr-2 text-right text-gray-500">{index + 1}</span>
          <div
            className="whitespace-pre-wrap px-2 grow"
            dangerouslySetInnerHTML={{ __html: lineHtml }}
          ></div>
        </div>
      );
    });
  }, [data]);

  return <div>{renderedContent}</div>;
}
