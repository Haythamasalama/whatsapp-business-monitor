// Every name and address that always means this computer, plus the names set in
// WHATSAPP_TEMPLATES_HOSTS (a Herd or other local proxy, e.g. whatsapp.test). A site that points
// its own domain at 127.0.0.1 still sends that domain as Host, so it is refused.
const LOCAL_HOST = /^(127\.0\.0\.1|0\.0\.0\.0|\[::1\]|localhost|[a-z0-9-]+\.localhost)$/

const extraHosts = () => String(process.env.WHATSAPP_TEMPLATES_HOSTS ?? '')
  .split(',')
  .map(host => host.trim().toLowerCase())
  .filter(Boolean)

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) {
    return
  }

  withLocale(event, () => {
    const host = getRequestHost(event)
    const name = host.toLowerCase().replace(/:\d+$/, '')

    if (!LOCAL_HOST.test(name) && !extraHosts().includes(name)) {
      const port = host.match(/:\d+$/)?.[0] ?? (process.env.NITRO_PORT ? `:${process.env.NITRO_PORT}` : '')

      throw apiError(403, t('server.unknownHost', { host, url: `http://127.0.0.1${port}` }))
    }

    // Another site cannot add this header without a CORS preflight, and this server answers none.
    if (getHeader(event, 'x-requested-with') !== 'whatsapp-manager') {
      throw apiError(403, t('server.missingHeader'))
    }
  })
})
