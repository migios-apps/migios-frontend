import { execFileSync } from "node:child_process"

const DEFAULT_PORT = 30250
const GRACE_MS = 3000

const resolvePorts = () => {
  const fromArgs = process.argv
    .slice(2)
    .filter((arg) => /^\d+$/.test(arg))
    .map(Number)
  if (fromArgs.length) return [...new Set(fromArgs)]
  return [DEFAULT_PORT]
}

const listenerPids = (port) => {
  try {
    const output = execFileSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
    return [
      ...new Set(
        output
          .split("\n")
          .map((entry) => entry.trim())
          .filter(Boolean)
          .map(Number)
      ),
    ]
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn("[kill-port] lsof is not available, skipping port cleanup")
      process.exit(0)
    }
    return []
  }
}

const describe = (pid) => {
  try {
    return execFileSync("ps", ["-o", "comm=", "-p", String(pid)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    return "unknown process"
  }
}

const isAlive = (pid) => {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error.code === "EPERM"
  }
}

const signal = (pid, name) => {
  try {
    process.kill(pid, name)
    return true
  } catch (error) {
    if (error.code === "ESRCH") return true
    console.warn(`[kill-port] cannot send ${name} to pid ${pid}: ${error.code}`)
    return false
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

for (const port of resolvePorts()) {
  const pids = listenerPids(port).filter(
    (pid) => pid !== process.pid && pid !== process.ppid
  )

  if (!pids.length) {
    console.log(`[kill-port] port ${port} is free`)
    continue
  }

  for (const pid of pids) {
    console.log(`[kill-port] port ${port} used by ${describe(pid)} (${pid})`)
    signal(pid, "SIGTERM")
  }

  const deadline = Date.now() + GRACE_MS
  let remaining = pids.filter(isAlive)
  while (remaining.length && Date.now() < deadline) {
    await sleep(100)
    remaining = remaining.filter(isAlive)
  }

  for (const pid of remaining) {
    console.log(`[kill-port] pid ${pid} ignored SIGTERM, sending SIGKILL`)
    signal(pid, "SIGKILL")
  }

  console.log(`[kill-port] port ${port} released`)
}
