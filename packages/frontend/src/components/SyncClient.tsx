// src/SyncClient.tsx
import { useEffect, useRef, useState } from "react";
import { type SyncData } from "@/types/index";
import { CodeViewer } from "@/components/CodeViewer";
import { FileTabs } from "@/components/FileTabs";

import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import { useDynamicFontSize } from "@/hooks/useDynamicFontSize";
import {useSyncBrowserSourceSizeWithBounds} from "@/hooks/useSyncBrowserSourceSizeWithBounds";

// function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
//   return <div className={`rounded border border-gray-600 bg-zinc-900 shadow ${className}`}>{children}</div>;
// }

// function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
//   return <div className={`p-4 ${className}`}>{children}</div>;
// }

function ScrollArea({
  children,
  className = "",
  scrollRef,
}: {
  children: React.ReactNode;
  className?: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className={`overflow-auto rounded border border-gray-700 ${className}`}
      ref={scrollRef}
    >
      {children}
    </div>
  );
}

export default function SyncClient() {
  // const [fontSize, setFontSize] = useState(14)
  const [data, setData] = useState<SyncData | null>(null);
  // const [openedFiles, setOpenedFiles] = useState<string[]>([]);
  const openedFiles = data?.openedFiles ?? [];

  const ws = useRef<WebSocket | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { updateFontSize } = useDynamicFontSize()
   useSyncBrowserSourceSizeWithBounds({
    sourceName: 'Vite.js',
    sceneName: 'Scène 2',
  });

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
      incoming.fontSize && updateFontSize(incoming.fontSize)
      setData((prev) => {
        const isSame =
          prev?.filename === incoming.filename &&
          prev?.content === incoming.content &&
          prev?.language === incoming.language &&
          prev?.cursor?.line === incoming.cursor?.line &&
          prev?.cursor?.character === incoming.cursor?.character;

        return isSame ? prev : incoming;
      });

      // ➕ Ajoute le fichier aux onglets si absent
      // setOpenedFiles((prev) =>
      //   prev.includes(incoming.filename) ? prev : [...prev, incoming.filename]
      // );
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

  return (
    <div className="p-4 h-full w-full flex flex-col bg-black text-white">
      {/* <Card className="flex-none mb-2">
        <CardContent className="text-xs text-muted-foreground font-mono">
          {data?.filename || "En attente de données..."}
        </CardContent>
      </Card> */}

      {/* <FileTabs openedFiles={openedFiles} activeFile={data?.filename} /> */}
      {openedFiles.length > 0 && (
        <FileTabs
          files={openedFiles}
          active={data?.filename}
        />
      )}

      <ScrollArea className="grow text-lg font-mono" scrollRef={scrollContainerRef}>
        <CodeViewer data={data} />
      </ScrollArea>
    </div>
  );
}
