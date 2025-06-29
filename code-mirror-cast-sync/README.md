# code-mirror-cast-sync README

This is the README for your extension "code-mirror-cast-sync". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

# 🪞 code-mirror-sync

Extension VS Code pour synchroniser en temps réel l'affichage d'un fichier avec un client web distant. Pratique pour partager visuellement du code pendant une démo ou un stream.

---

## 🚀 Fonctionnalités

* Envoie automatiquement le contenu, le nom du fichier, la langue et la position du curseur toutes les 300 ms
* Affichage dans un navigateur avec coloration syntaxique (Prism.js) et caret visible
* Suivi automatique de la ligne de curseur

---

## ⚙️ Prérequis

* Node.js
* VS Code
* PNPM recommandé

---

## 🛠️ Installation (développement)

1. Cloner ce dépôt
2. Ouvrir dans VS Code : `code sync-extension`
3. Lancer en mode développement (`F5`) pour ouvrir une fenêtre Extension Development Host

---

## 🌐 Serveur de synchronisation (sync-server)

Le serveur est une app Express + WebSocket qui :

* Reçoit les mises à jour via `/update` (POST JSON)
* Diffuse les données via WebSocket aux clients connectés
* Sert l’interface web construite avec Vite

### Lancer le serveur :

```bash
pnpm install
pnpm run dev
```

Accessible sur : [http://localhost:3333](http://localhost:3333)

---

## 📦 Empaqueter l’extension

1. Installer `vsce` :

```bash
pnpm add -g vsce
```

2. Générer le fichier `.vsix` :

```bash
vsce package
```

3. Installer localement :

```bash
code --install-extension code-mirror-sync-x.y.z.vsix
```

---

## 🔧 Configuration possible (à venir)

* Activer / désactiver la synchro
* Choix de l’intervalle
* Filtres de fichiers

---

## 🧪 Statut

Version bêta fonctionnelle. Des optimisations à venir :

* Meilleure gestion des types MIME
* Thème clair/sombre côté client
* Option d’anonymisation du code (masquer contenu)

---

## 📄 Licence

MIT

---

## 👤 Auteur

Alexandre Aussourd

---

## 🤝 Contributions

Issues et PR bienvenues !

