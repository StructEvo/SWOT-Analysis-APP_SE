# SWOT Analysis App

A lightweight, browser-based **SWOT Analysis** tool that lets you capture and organise Strengths, Weaknesses, Opportunities, and Threats for any project or strategy.

## Features

- **Four quadrants** – Strengths, Weaknesses, Opportunities, and Threats, each colour-coded for quick recognition.
- **Add items** – type in the input box and press **Enter** or click **+**.
- **Edit items inline** – click any item text to edit it directly; press **Enter** or click away to save.
- **Delete items** – click the **×** button on any item.
- **Analysis title** – give your analysis a name using the title field in the header.
- **Auto-save** – all data is automatically persisted to the browser's `localStorage`; your work survives page reloads.
- **Clear all** – reset every quadrant with one click (with a confirmation prompt).
- **Print / Save PDF** – use the browser's native print dialog to create a clean PDF export.
- **Responsive** – works on desktop, tablet, and mobile screens.

## Usage

No build step or server required. Just open `index.html` in any modern web browser:

```
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it with any static file server:

```bash
npx serve .
# – or –
python3 -m http.server
```

## Project structure

```
├── index.html    # App markup
├── style.css     # Styles & responsive layout
├── app.js        # State management, DOM rendering, event wiring
├── app.test.js   # Jest unit tests
└── package.json  # Dev dependencies (Jest)
```

## Running tests

```bash
npm install
npm test
```

All 11 unit tests should pass.
