export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) {
    return
  }

  // A site that points its own domain at 127.0.0.1 still sends that domain as Host.
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(getRequestHost(event))) {
    throw apiError(403, 'Unknown host')
  }

  // Another site cannot add this header without a CORS preflight, and this server answers none.
  if (getHeader(event, 'x-requested-with') !== 'whatsapp-manager') {
    throw apiError(403, 'Missing X-Requested-With header')
  }
})
