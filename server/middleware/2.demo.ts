import type { H3Event } from 'h3'

// In demo mode every /api call is answered here, so nothing reaches Meta and no account file is written.
export default defineEventHandler((event) => {
  if (!isDemo() || !event.path.startsWith('/api/')) {
    return
  }

  return withLocale(event, () => demoAnswer(event))
})

async function demoAnswer(event: H3Event) {
  const path = event.path.split('?')[0]
  const post = event.method === 'POST'

  if (!post && path === '/api/accounts') {
    return demoAccounts()
  }

  if (!post && path === '/api/app') {
    return { setup_required: false, user: { username: 'demo' }, instance_name: '', public_url: 'http://127.0.0.1:3211', default_locale: 'ar' }
  }

  if (!post && path === '/api/settings') {
    return { instance_name: '', public_url: 'http://127.0.0.1:3211', default_locale: 'ar', update_check: true, storage: '~/.config/whatsapp-templates/whatsapp-manager.db', update_check_forced_off: false }
  }

  if (post && ['/api/setup', '/api/settings', '/api/auth/password'].includes(path!)) {
    throw apiError(422, t('server.notInDemo'))
  }

  if (!post && path === '/api/version') {
    return { current: String(useRuntimeConfig().public.version), latest: null, autoUpdate: false, canUpdateNow: false }
  }

  // The demo has no updater to ask.
  if (post && path === '/api/version/update') {
    throw apiError(422, t('server.notInDemo'))
  }

  if (!post && path === '/api/summary') {
    return demoSummary()
  }

  if (!post && path === '/api/overview') {
    return demoOverview(getQuery(event).account)
  }

  if (event.method === 'GET' && path === '/api/templates') {
    return demoTemplates()
  }

  if (!post && path === '/api/analytics') {
    return demoAnalytics(getQuery(event).account)
  }

  if (path?.startsWith('/api/templates') && (event.method === 'DELETE' || path !== '/api/templates')) {
    const answer = await demoTemplateWrite(event, path)

    if (answer) {
      return answer
    }
  }

  if (!post && path?.startsWith('/api/reports/')) {
    return demoReport(event, path)
  }

  if (path?.startsWith('/api/business')) {
    return demoBusinessAnswer(event, path)
  }

  if (post && (path === '/api/accounts/export' || path === '/api/accounts/import')) {
    throw apiError(422, t('server.notInDemo'))
  }

  if (post && path === '/api/accounts/discover') {
    return demoDiscover()
  }

  if (post && path?.startsWith('/api/accounts')) {
    return { id: 'demo', name: 'Yasmin Store' }
  }

  if (post && path === '/api/templates') {
    const body = await readBody<Record<string, unknown>>(event)
    const problems = templateProblems(readTemplateText(body))

    if (problems.length) {
      throw apiError(422, problems.join('\n'))
    }

    return { id: String(Date.now()), status: 'PENDING', category: String(body.category ?? 'UTILITY') }
  }

  if (event.method === 'DELETE') {
    throw apiError(422, t('server.notInDemo'))
  }

  if (post) {
    return { success: true }
  }

  throw apiError(404, 'Not found')
}

function demoBusinessAnswer(event: H3Event, path: string) {
  if (event.method !== 'GET') {
    return demoBusinessWrite(event, path)
  }

  switch (path) {
    case '/api/business':
      return demoBusiness(getQuery(event).account)
    case '/api/business/activities':
      return demoActivities(getQuery(event).after)
    case '/api/business/users':
      return demoUsers()
    case '/api/business/phone':
      return demoPhoneSettings(event)
    case '/api/business/username-suggestions':
      return demoUsernameSuggestions(event)
    case '/api/business/qr-image':
      return demoQrImage(event)
  }

  throw apiError(404, 'Not found')
}

function demoReport(event: H3Event, path: string) {
  switch (path) {
    case '/api/reports/costs':
      return demoCostReport(event)
    case '/api/reports/traffic':
      return demoTrafficReport(event)
    case '/api/reports/compare':
      return demoCompare(event)
    case '/api/reports/groups':
      return demoTemplateGroups(event)
    case '/api/reports/calls':
      return demoCalls(event)
  }

  throw apiError(404, 'Not found')
}
