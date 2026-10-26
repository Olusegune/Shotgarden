/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, shell } = require("electron")
const { spawn } = require("node:child_process")
const http = require("node:http")
const path = require("node:path")

let serverProcess

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
    autoHideMenuBar: true,
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
  await window.loadURL(`http://127.0.0.1:${port}`)
}

app.whenReady().then(createWindow).catch((error) => {
  console.error(error)
  app.quit()
})

app.on("window-all-closed", () => app.quit())
app.on("before-quit", () => serverProcess?.kill())
