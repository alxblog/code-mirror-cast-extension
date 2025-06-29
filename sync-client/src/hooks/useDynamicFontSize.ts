// src/hooks/useDynamicFontSize.ts
import { useEffect, useState } from "react";

export function useDynamicFontSize(sizePx: number = 14) {
    const [fontSize, setFontSize] = useState(sizePx)
    const updateFontSize = (sizePx: number = 14)=> {
    document.documentElement.style.fontSize = `${sizePx}px`;

    }
  
  useEffect(() => {
    console.log("TRIGG");
    
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [sizePx]);

  return {updateFontSize}
}
