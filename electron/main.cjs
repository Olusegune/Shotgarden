/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, Menu, dialog, shell } = require("electron")
const { spawn } = require("node:child_process")
const http = require("node:http")
const path = require("node:path")

let serverProcess
const studioUrl = "http://127.0.0.1:32109/studio"

function waitForServer(url, attempts = 100) {
  return new Promise((resolve, reject) => {
    const check = (remaining) => {
      const request = http.get(url, (response) => {
        response.resume()
        resolve()
      })
      request.on("error", () => {
        if (remaining <= 0) return reject(new Error("Shotgarden server did not start"))
        setTimeout(() => check(remaining - 1), 150)
      })
      request.setTimeout(1000, () => request.destroy())
    }
    check(attempts)
  })
}

async function createWindow() {
  const port = 32109
  const runtime = app.isPackaged
    ? path.join(process.resourcesPath, "desktop-runtime")
    : path.join(__dirname, "..", "desktop-runtime")
  const server = path.join(runtime, "server.js")

  serverProcess = spawn(process.execPath, [server], {
    cwd: runtime,
    windowsHide: true,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
      APP_URL: `http://127.0.0.1:${port}`,
      NODE_PATH: path.join(runtime, "vendor"),
    },
    stdio: "ignore",
  })

  await waitForServer(`http://127.0.0.1:${port}`)

  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#0c0d0f",
    title: "Shotgarden",
    autoHideMenuBar: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: "deny" }
  })
  Menu.setApplicationMenu(createAppMenu(window))
  await window.loadURL(studioUrl)
}

function createAppMenu(window) {
  const go = (path) => void window.loadURL(`${studioUrl}${path}`)
  return Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        { label: "New Studio", accelerator: "Ctrl+N", click: () => go("") },
        { type: "separator" },
        { role: "close", label: "Close Window" },
        { role: "quit", label: "Exit Shotgarden" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" }, { role: "redo" }, { type: "separator" },
        { role: "cut" }, { role: "copy" }, { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" }, { role: "forceReload" }, { type: "separator" },
        { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" },
        { type: "separator" }, { role: "togglefullscreen" },
      ],
    },
    {
      label: "Generate",
      submenu: [
        { label: "Image Studio", accelerator: "Ctrl+1", click: () => go("?surface=image") },
        { label: "Video Studio", accelerator: "Ctrl+2", click: () => go("?surface=video") },
        { type: "separator" },
        {
          label: "Focus Prompt",
          accelerator: "Ctrl+L",
          click: () => void window.webContents.executeJavaScript(
            "document.querySelector('textarea')?.focus()"
          ),
        },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Shotgarden on GitHub",
          click: () => void shell.openExternal("https://github.com/Olusegune/Shotgarden"),
        },
        { type: "separator" },
        {
          label: "About Shotgarden",
          click: () => void dialog.showMessageBox(window, {
            type: "info",
            title: "About Shotgarden",
            message: "Shotgarden",
            detail: "A local-first AI image and video studio for Windows.",
            buttons: ["OK"],
          }),
        },
      ],
    },
  ])
}

app.whenReady().then(createWindow).catch((error) => {
  console.error(error)
  app.quit()
})

app.on("window-all-closed", () => app.quit())
app.on("before-quit", () => serverProcess?.kill())
