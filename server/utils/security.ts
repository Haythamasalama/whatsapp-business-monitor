import { randomInt, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

/** The Host header without its port, lower case; "[::1]:3210" → "[::1]". */
export function requestHostname(event: H3Event): string {
  const host = String(getRequestHeader(event, 'host') ?? '').trim().toLowerCase()

  return host.startsWith('[') ? host.slice(0, host.indexOf(']') + 1) : host.split(':')[0]!
}

const LOCAL_NAMES = ['localhost', '127.0.0.1', '[::1]']

export const isLocalName = (hostname: string) => LOCAL_NAMES.includes(hostname) || hostname.endsWith('.localhost')

/** An IP literal can't be rebound to another address, so only DNS names need an allowlist. */
const isIpLiteral = (hostname: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || /^\[[0-9a-f:.]+\]$/.test(hostname)

/**
 * Stops DNS rebinding: a page on evil.example that resolves to this machine is same-origin with it and can add
 * any header. A DNS name must be localhost, the public address from the settings, or listed in
 * WHATSAPP_MANAGER_ALLOWED_HOSTS. Before the first user exists every name passes, so setup works behind a proxy;
 * setup itself then asks for the setup code.
 */
export function hostAllowed(event: H3Event): boolean {
  const hostname = requestHostname(event)

  if (!hostname || isLocalName(hostname) || isIpLiteral(hostname) || !hasUsers()) {
    return true
  }

  const allowed = String(process.env.WHATSAPP_MANAGER_ALLOWED_HOSTS ?? '').split(',').map(name => name.trim().toLowerCase()).filter(Boolean)

  try {
    allowed.push(new URL(readSettings().public_url).hostname.toLowerCase())
  }
  catch {
    // No public address saved yet.
  }

  return allowed.includes(hostname)
}

const trustProxy = () => ['1', 'true'].includes(String(process.env.WHATSAPP_MANAGER_TRUST_PROXY ?? '').toLowerCase())

/**
 * The address the request came from. X-Forwarded-For is only read when WHATSAPP_MANAGER_TRUST_PROXY is on, and
 * then its last entry: the one the proxy added, which the client can't choose.
 */
export function clientAddress(event: H3Event): string {
  const socket = event.node.req.socket?.remoteAddress ?? 'unknown'

  if (!trustProxy()) {
    return socket
  }

  const forwarded = String(getRequestHeader(event, 'x-forwarded-for') ?? '').split(',').map(part => part.trim()).filter(Boolean)

  return forwarded.at(-1) ?? socket
}

const isLoopback = (address: string) => address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'

let setupCode: string | null = null

/** A one-time code printed to the server's log, so only whoever can read the log can claim a new install. */
export function currentSetupCode(): string {
  if (!setupCode) {
    setupCode = Array.from({ length: 8 }, () => randomInt(10)).join('')
    console.info(`[setup] Setup code: ${setupCode}`)
  }

  return setupCode
}

/**
 * The setup code is skipped only for someone on this very machine opening it by a local name, which is how
 * `bun run dev` and a plain local install are used. Anything else, including Docker and a reverse proxy, needs it.
 */
export function setupCodeNeeded(event: H3Event): boolean {
  return !(isLoopback(event.node.req.socket?.remoteAddress ?? '') && isLocalName(requestHostname(event)) && !getRequestHeader(event, 'x-forwarded-for'))
}

export function setupCodeMatches(code: string): boolean {
  const expected = Buffer.from(currentSetupCode())
  const given = Buffer.from(code.replace(/\s/g, ''))

  return given.length === expected.length && timingSafeEqual(given, expected)
}
