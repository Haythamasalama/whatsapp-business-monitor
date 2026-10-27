// Only setup and sign-in are open; every other /api call needs a session. Demo mode answers before this.
const OPEN = ['/api/app', '/api/setup', '/api/auth/login', '/api/auth/logout']

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0]!

  if (!path.startsWith('/api/') || OPEN.includes(path)) {
    return
  }

  withLocale(event, () => requireUser(event))
})
