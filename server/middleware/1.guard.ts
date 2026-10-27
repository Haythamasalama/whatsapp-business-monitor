export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) {
    return
  }

  // Another site cannot add this header without a CORS preflight, and this server answers none,
  // so a page elsewhere can never call the API with this browser's session.
  if (getHeader(event, 'x-requested-with') !== 'whatsapp-manager') {
    withLocale(event, () => {
      throw apiError(403, t('server.missingHeader'))
    })
  }
})
