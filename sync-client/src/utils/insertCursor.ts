// utils/insertCursor.ts
export function insertCursor(html: string, caretPos: number): string {
  const container = document.createElement("div");
  container.innerHTML = html;

  let currentPos = 0;
  let cursorPlaced = false;

  function walk(node: Node) {
    if (cursorPlaced) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const length = text.length;

      if (currentPos + length >= caretPos) {
        const offset = caretPos - currentPos;

        const before = text.slice(0, offset);
        const after = text.slice(offset);

        const parent = node.parentElement;

        // Création du curseur
        const cursor = document.createElement("span");
        cursor.className = "border-r border-white dark:border-black cursor-blink";
        cursor.textContent = "\u200b"; // caractère invisible pour assurer l'affichage du curseur

        // Remplacement du texte par 3 fragments : avant, curseur, après
        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(cursor);
        if (after) fragment.appendChild(document.createTextNode(after));

        parent?.replaceChild(fragment, node);

        // Ajout de la classe visuelle au token parent si présent
        if (parent?.classList.contains("token")) {
          parent.classList.add("token-active");
        }

        cursorPlaced = true;
        return;
      }

      currentPos += length;
    } else if (node.hasChildNodes()) {
      Array.from(node.childNodes).forEach(walk);
    }
  }

  walk(container);

  return container.innerHTML;
}


