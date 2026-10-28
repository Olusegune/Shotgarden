/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, Menu, dialog, session, shell } = require("electron")
const { execFileSync, spawn } = require("node:child_process")
const fs = require("node:fs/promises")
const http = require("node:http")
const net = require("node:net")
const path = require("node:path")

let serverProcess

function openPort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.on("error", reject)
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address()
      const port = typeof address === "object" && address ? address.port : 32109
      probe.close(() => resolve(port))
    })
  })
}

function assetPath(name) {
  return path.join(__dirname, "assets", name)
}

function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 620,
    height: 390,
    frame: false,
    resizable: false,
    movable: true,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#090a0c",
    icon: assetPath("shotgarden.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  splash.once("ready-to-show", () => splash.show())
  void splash.loadFile(path.join(__dirname, "splash.html"))
  return splash
}

function registerProjectFiles() {
  if (process.platform !== "win32" || !app.isPackaged) return
  const icon = path.join(process.resourcesPath, "shotgarden-project.ico")
  const command = `\"${process.execPath}\" \"%1\"`
  const entries = [
    ["HKCU\\Software\\Classes\\.shotgarden", "Shotgarden.Project"],
    ["HKCU\\Software\\Classes\\Shotgarden.Project", "Shotgarden Project"],
    ["HKCU\\Software\\Classes\\Shotgarden.Project\\DefaultIcon", icon],
    ["HKCU\\Software\\Classes\\Shotgarden.Project\\shell\\open\\command", command],
  ]
  for (const [key, value] of entries) {
    try {
      execFileSync("reg.exe", ["ADD", key, "/ve", "/d", value, "/f"], {
        windowsHide: true,
        stdio: "ignore",
      })
    } catch {
      // The app still works if a managed Windows device blocks file associations.
    }
  }
}

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
  const splash = createSplashWindow()
  const port = await openPort()
  const studioUrl = `http://127.0.0.1:${port}/studio`
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
    icon: assetPath("shotgarden.ico"),
    show: false,
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
  await session.defaultSession.clearCache()
  Menu.setApplicationMenu(createAppMenu(window, studioUrl))
  window.once("ready-to-show", () => {
    splash.close()
    window.show()
  })
  await window.loadURL(studioUrl)
  const projectPath = process.argv.find((argument) =>
    argument.toLowerCase().endsWith(".shotgarden")
  )
  if (projectPath) await openProject(window, projectPath)
}

function createAppMenu(window, studioUrl) {
  const go = (path) => void window.loadURL(`${studioUrl}${path}`)
  return Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        { label: "New Studio", accelerator: "Ctrl+N", click: () => go("") },
        {
          label: "Open Project…",
          accelerator: "Ctrl+O",
          click: () => void openProject(window),
        },
        {
          label: "Save Project As…",
          accelerator: "Ctrl+Shift+S",
          click: () => void saveProject(window),
        },
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

async function saveProject(window) {
  const result = await dialog.showSaveDialog(window, {
    title: "Save Shotgarden Project",
    defaultPath: "Untitled.shotgarden",
    filters: [{ name: "Shotgarden Project", extensions: ["shotgarden"] }],
  })
  if (result.canceled || !result.filePath) return

  const state = await window.webContents.executeJavaScript(`(async () => {
    const local = Object.fromEntries(Object.keys(localStorage)
      .filter((key) => key.startsWith("hf."))
      .map((key) => [key, localStorage.getItem(key)]))
    const history = await new Promise((resolve) => {
      const request = indexedDB.open("studio", 1)
      request.onerror = () => resolve([])
      request.onsuccess = () => {
        const db = request.result
        if (!db.objectStoreNames.contains("kv")) return resolve([])
        const read = db.transaction("kv", "readonly").objectStore("kv").get("history.v1")
        read.onsuccess = () => resolve(read.result ?? [])
        read.onerror = () => resolve([])
      }
    })
    return { local, history }
  })()`)

  const project = {
    format: "shotgarden-project",
    version: 1,
    savedAt: new Date().toISOString(),
    state,
  }
  await fs.writeFile(result.filePath, JSON.stringify(project, null, 2), "utf8")
}

async function openProject(window, requestedPath) {
  let projectPath = requestedPath
  if (!projectPath) {
    const result = await dialog.showOpenDialog(window, {
      title: "Open Shotgarden Project",
      properties: ["openFile"],
      filters: [{ name: "Shotgarden Project", extensions: ["shotgarden"] }],
    })
    if (result.canceled || !result.filePaths[0]) return
    projectPath = result.filePaths[0]
  }

  try {
    const project = JSON.parse(await fs.readFile(projectPath, "utf8"))
    if (project?.format !== "shotgarden-project" || project?.version !== 1)
      throw new Error("This is not a supported Shotgarden project file.")
    const state = JSON.stringify(project.state ?? {})
    await window.webContents.executeJavaScript(`(async () => {
      const state = ${state}
      for (const [key, value] of Object.entries(state.local ?? {})) {
        if (key.startsWith("hf.") && typeof value === "string") localStorage.setItem(key, value)
      }
      await new Promise((resolve, reject) => {
        const request = indexedDB.open("studio", 1)
        request.onerror = () => reject(request.error)
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains("kv")) request.result.createObjectStore("kv")
        }
        request.onsuccess = () => {
          const tx = request.result.transaction("kv", "readwrite")
          tx.objectStore("kv").put(state.history ?? [], "history.v1")
          tx.oncomplete = resolve
          tx.onerror = () => reject(tx.error)
        }
      })
    })()`)
    window.reload()
  } catch (error) {
    await dialog.showMessageBox(window, {
      type: "error",
      title: "Could not open project",
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

app.setAppUserModelId("com.shotgarden.desktop")

app.whenReady().then(() => {
  registerProjectFiles()
  return createWindow()
}).catch((error) => {
  console.error(error)
  app.quit()
})

app.on("window-all-closed", () => app.quit())
app.on("before-quit", () => serverProcess?.kill())
