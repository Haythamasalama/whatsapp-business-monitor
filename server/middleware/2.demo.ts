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

  if (!post && path === '/api/summary') {
    return demoSummary()
  }

  if (!post && path === '/api/overview') {
    return demoOverview(getQuery(event).account)
  }

  if (!post && path === '/api/templates') {
    return demoTemplates()
  }

  if (!post && path === '/api/analytics') {
    return demoAnalytics(getQuery(event).account)
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

  if (post) {
    return { success: true }
  }

  throw apiError(404, 'Not found')
}
