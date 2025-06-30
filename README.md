# Code Mirror Cast Sync

🚀 **Code Mirror Cast Sync** is a VS Code extension that **broadcasts the active file's content in real time** to a mirror server, with a web interface to preview the updates instantly.

---

## ✨ Features

- 🔄 Live broadcast of the currently active file via WebSocket.
- 📺 Web-based interface for real-time content mirroring.
- 🖥️ Smart status bar to start/stop the sync server and display current port.
- ⚙️ Customizable settings: font size, file exclusion patterns.

---

## 🛠 Usage

### Start the Sync Server

> Command Palette (`Ctrl+Shift+P` / `⇧⌘P`) →  
> **`CodeMirrorCast: Start Code Sync`**

### Stop the Server

> Command Palette →  
> **`CodeMirrorCast: Stop Code Sync`**

### Open the Web Interface

> Command Palette →  
> **`CodeMirrorCast: Open Web Interface`**  
> (Opens in the default browser)

---

## ⚙️ Settings

Available via `.vscode/settings.json` or the VS Code settings UI:

| Key                          | Type     | Default     | Description                                                     |
|-----------------------------|----------|-------------|-----------------------------------------------------------------|
| `codeMirrorCast.fontSize`   | `number` | `16`        | Font size used in the preview interface (in pixels).           |
| `codeMirrorCast.excludeFiles` | `string[]` | `["\.env(\..+)?$", "\.key$", "\.pem$", "secrets?"]` | Regex patterns to **exclude certain files** from syncing.       |

---

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-user/code-mirror-cast-extension.git
   cd code-mirror-cast-extension
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Compile:
   ```bash
   pnpm run compile
   ```

4. Launch in VS Code Extension Development Host:
   ```bash
   pnpm exec vscode-test
   ```

---

## 🔧 Development

### Start the Frontend (Web Preview Interface)

```bash
pnpm --filter frontend run dev
```

### Launch the Extension with Status Bar and Server

Use the `Run Extension` configuration from the *Run & Debug* panel (`.vscode/launch.json` required).

---

## 📄 License

MIT — free to use and modify.

---

## 🙌 Credits

Powered by a lightweight architecture combining `VS Code Extension + WebSocket + Vite.js`.  

---

## 🚧 Work in Progress

This project is still under active development. Expect changes, improvements, and possibly breaking modifications in future updates.

---

## 📝 TODO

- [ ] Add a setting to customize the **server port**.
- [ ] Add a boolean setting to **automatically start the server** when the extension activates.
- [ ] Add a boolean setting to **automatically open the web interface** when the server starts.
- [ ] Add server-side events to **update the status bar** in real time.
- [ ] Implement a **ping/heartbeat mechanism** between the frontend and the server.
- [ ] Support multiple themes with selection available in the extension settings.
- [ ] Open a quick access window when clicking the status bar icon to:  
  1. Start/stop the server  
  2. Change the frontend font size (`fontSize`)  







