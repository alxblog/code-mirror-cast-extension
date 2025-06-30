// src/components/ScrollArea.tsx
import { type ReactNode, type RefObject } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  scrollRef?: RefObject<HTMLDivElement>;
}

export function ScrollArea({ children, className = "", scrollRef }: ScrollAreaProps) {
  return (
    <div
      className={`overflow-y-scroll rounded border p-2 border-gray-700 ${className}`}
      ref={scrollRef}
    >
      {children}
    </div>
  );
}
