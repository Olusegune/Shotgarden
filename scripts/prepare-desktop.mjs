import { cp, mkdir, rename, rm } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import path from "node:path"

const root = process.cwd()
const output = path.join(root, "desktop-runtime")

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await cp(path.join(root, ".next", "standalone"), output, {
  recursive: true,
  dereference: true,
})
await mkdir(path.join(output, ".next"), { recursive: true })
await cp(path.join(root, ".next", "static"), path.join(output, ".next", "static"), { recursive: true })
await cp(path.join(root, "public"), path.join(output, "public"), { recursive: true })

// Next's standalone trace can omit packages needed by Windows/Electron at runtime.
// Install the full production dependency set, then keep it outside node_modules so
// electron-builder includes it as an ordinary resource directory.
await rename(path.join(output, "node_modules"), path.join(output, "traced-modules"))
execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", [
  "install",
  "--omit=dev",
  "--ignore-scripts",
  "--no-package-lock",
  "--legacy-peer-deps",
], { cwd: output, stdio: "inherit" })
await rename(path.join(output, "node_modules"), path.join(output, "vendor"))
await rm(path.join(output, "traced-modules"), { recursive: true, force: true })

console.log(`[desktop] runtime prepared at ${output}`)
