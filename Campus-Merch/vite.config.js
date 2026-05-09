import dns from 'node:dns/promises'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 与 Vite 的 .env 加载顺序一致（后者覆盖前者），只解析文件、不含 process.env。
 * 避免系统/Cursor 里已有的 VITE_API_PROXY_TARGET 盖掉 .env.development。
 */
function mergeEnvFiles(mode, cwd) {
  const names = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]
  const merged = {}
  for (const name of names) {
    const full = path.join(cwd, name)
    if (!fs.existsSync(full)) continue
    const text = fs.readFileSync(full, 'utf-8').replace(/^\uFEFF/, '')
    for (let line of text.split(/\r?\n/)) {
      line = line.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      merged[key] = val
    }
  }
  return merged
}

/** 本地未写端口时 HTTP 默认为 80，易被拒 → 浏览器 502 */
function normalizeProxyTarget(raw) {
  const fallback = 'http://127.0.0.1:8080'
  const s = String(raw ?? '').trim()
  if (!s) return fallback
  try {
    const u = new URL(s)
    const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
    if (local && !u.port) {
      u.port = '8080'
    }
    return u.origin
  } catch {
    return fallback
  }
}

function isNatappHost(hostname) {
  return hostname.endsWith('.natappfree.cc') || hostname.endsWith('.natapp.cn')
}

function isLoopbackAddress(addr) {
  return (
    addr === '127.0.0.1' ||
    addr === '0.0.0.0' ||
    addr === '::1' ||
    addr === '0:0:0:0:0:0:0:1'
  )
}

/**
 * Natapp 免费域名在本机常被解析为 127.0.0.1，此时走 HTTP 默认 80 无服务 → ECONNREFUSED → 502。
 * 若解析到公网 IP 则仍用隧道域名；若回环则改连本机 Laravel（可配 VITE_API_PROXY_LOCAL_FALLBACK）。
 */
async function resolveEffectiveProxyTarget(candidate, fileEnv, env) {
  const normalized = normalizeProxyTarget(candidate)
  let u
  try {
    u = new URL(normalized)
  } catch {
    return normalized
  }
  if (!isNatappHost(u.hostname)) return normalized

  let address
  try {
    ;({ address } = await dns.lookup(u.hostname))
  } catch {
    return normalized
  }

  if (!isLoopbackAddress(address)) return normalized

  const rawFb = (
    fileEnv.VITE_API_PROXY_LOCAL_FALLBACK ||
    env.VITE_API_PROXY_LOCAL_FALLBACK ||
    'http://127.0.0.1:8000'
  ).trim()
  const fallback = normalizeProxyTarget(rawFb)
  // eslint-disable-next-line no-console
  console.warn(
    `[vite] ${u.hostname} 在本机解析为 ${address}，隧道域名走 80 会失败；已改用本机后端 ${fallback}（可在 .env 设置 VITE_API_PROXY_LOCAL_FALLBACK，或换在本机解析为公网 IP 的隧道域名）`,
  )
  return fallback
}

/** 在 Vite 默认 502 之前写入 JSON，便于 Network「响应」里看到原因 */
function attachProxyErrorBody(proxy, effectiveTarget) {
  proxy.on('error', (err, _req, res) => {
    if (!res || res.writableEnded || res.headersSent) return
    const body = {
      error: 'Vite dev proxy could not reach the upstream server',
      hint: 'Open this response in the Network tab → Response / Preview.',
      upstream: effectiveTarget,
      code: err.code,
      message: err.message,
    }
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(`${JSON.stringify(body, null, 2)}\n`)
  })
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const cwd = process.cwd()
  const env = loadEnv(mode, cwd, 'VITE_')
  const fileEnv = mergeEnvFiles(mode, cwd)
  const candidate = fileEnv.VITE_API_PROXY_TARGET ?? env.VITE_API_PROXY_TARGET
  const effectiveTarget = await resolveEffectiveProxyTarget(candidate, fileEnv, env)

  // eslint-disable-next-line no-console
  console.log(`[vite] API proxy → ${effectiveTarget}  (/api, /images, /storage)`)

  const proxyCommon = {
    target: effectiveTarget,
    changeOrigin: true,
    configure(proxy) {
      attachProxyErrorBody(proxy, effectiveTarget)
    },
  }

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': { ...proxyCommon },
        '/images': { ...proxyCommon },
        // Laravel storage 软链：cover_url 常为 /storage/...
        '/storage': { ...proxyCommon },
      },
    },
  }
})
