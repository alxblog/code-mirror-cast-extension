// src/SyncClient.tsx
import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";

interface SyncData {
  filename: string;
  content: string;
  language: string;
  cursor?: {
    line: number;
    character: number;
  };
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded border border-gray-600 bg-zinc-900 shadow ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function ScrollArea({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`overflow-auto rounded border border-gray-700 ${className}`} ref={scrollContainerRef}>{children}</div>;
}

const scrollContainerRef = { current: null } as React.MutableRefObject<HTMLDivElement | null>;

export default function SyncClient() {
  const [data, setData] = useState<SyncData | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetch("http://localhost:3333/latest")
      .then((res) => res.json())
      .then((json) => {
        console.log("[CLIENT] Donnée initiale /latest:", json);
        setData(json);
      });

    ws.current = new WebSocket("ws://localhost:3333");
    ws.current.onopen = () => console.log("[CLIENT] WebSocket connecté ✅");
    ws.current.onerror = (err) => console.error("[CLIENT] WebSocket erreur ❌", err);
    ws.current.onclose = () => console.warn("[CLIENT] WebSocket fermé ❗");
    ws.current.onmessage = (event) => {
      const incoming = JSON.parse(event.data);
      console.log("[CLIENT] WebSocket reçu:", incoming);
      setData(incoming);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && data?.cursor?.line !== undefined) {
      const lineEl = document.getElementById(`line-${data.cursor.line}`);
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [data]);

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const renderContent = () => {
    if (!data) return <div className="text-red-500">⏳ En attente de synchronisation...</div>;

    const lang = Prism.languages[data.language] || Prism.languages.javascript;
    const lines = data.content?.split("\n") ?? [];

    return lines.map((line, index) => {
      const raw = line || " ";
      const highlighted = Prism.highlight(raw, lang, data.language);

      const isActive = index === data.cursor?.line;
      const caretPos = data.cursor?.character ?? 0;

      let lineHtml = highlighted;
      if (isActive) {
        const raw = line.padEnd(caretPos + 1, " ");
        const before = escapeHtml(raw.slice(0, caretPos));
        const after = escapeHtml(raw.slice(caretPos));
        lineHtml =
          Prism.highlight(before, lang, data.language) +
          '<span class="bg-white text-black animate-pulse">|</span>' +
          Prism.highlight(after, lang, data.language);
      }

      return (
        <div
          key={index}
          id={`line-${index}`}
          className={`flex text-sm tab-size-[2] font-mono${isActive ? " bg-yellow-800 text-white" : " text-gray-300"
            }`}
        >
          <div><span className="select-none w-10 pr-2 text-right text-gray-500">{index + 1}</span></div>
          <div
            className="whitespace-pre px-2 grow"
            dangerouslySetInnerHTML={{ __html: lineHtml }}
          ></div>
        </div>
      );
    });
  };

  return (
    <div className="p-4 h-screen w-screen flex flex-col bg-black text-white">
      <Card className="flex-none mb-2">
        <CardContent className="text-xs text-muted-foreground">
          {data?.filename || "En attente de données..."}
        </CardContent>
      </Card>

      <ScrollArea className="grow text-lg font-mono">
        <div>{renderContent()}</div>
      </ScrollArea>
    </div>
  );
}
