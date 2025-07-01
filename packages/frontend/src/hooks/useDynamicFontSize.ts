// src/hooks/useDynamicFontSize.ts
import { useEffect } from "react";

export function useDynamicFontSize(sizePx: number = 16) {
    const updateFontSize = (sizePx: number = 14)=> {
    document.documentElement.style.fontSize = `${sizePx}px`;
    }
  
  useEffect(() => {
    console.log("TRIGG");
    
    document.documentElement.style.fontSize = `${sizePx}px`;
  }, []);

  return {updateFontSize}
}
