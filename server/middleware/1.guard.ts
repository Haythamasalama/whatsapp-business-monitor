// Every name and address that always means this computer. A site that points its own domain at
// 127.0.0.1 still sends that domain as Host, so it is refused.
const LOCAL_HOST = /^(127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\])(:\d+)?$/

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) {
    return
  }

  withLocale(event, () => {
    const host = getRequestHost(event)

    if (!LOCAL_HOST.test(host)) {
      throw apiError(403, t('server.unknownHost', { host, url: `http://127.0.0.1${host.match(/:\d+$/)?.[0] ?? ''}` }))
    }

    // Another site cannot add this header without a CORS preflight, and this server answers none.
    if (getHeader(event, 'x-requested-with') !== 'whatsapp-manager') {
      throw apiError(403, t('server.missingHeader'))
    }
  })
})
