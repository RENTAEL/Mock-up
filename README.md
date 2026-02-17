# Mockup Server Base

A minimal static server you can use to host and preview your mockups.

## Quick start (shortcut)

Run this command to start the server and open your browser automatically:

```bash
npm run launch
```

## Windows one-file launcher

If you want a single file you can double-click on Windows, use:

```bat
start-mockup.bat
```

This starts the server and opens your default browser.

## Manual start

1. Ensure you have Node.js 18+ installed.
2. Run:

   ```bash
   npm start
   ```

3. Open: <http://localhost:3000>

## Where to put your mockup

- Place your files inside `public/`.
- `public/index.html` is served at `/`.
- Any other file in `public/` is served by path (for example `public/styles.css` -> `/styles.css`).

## Change the port

Use the `PORT` environment variable:

```bash
PORT=8080 npm run launch
```
