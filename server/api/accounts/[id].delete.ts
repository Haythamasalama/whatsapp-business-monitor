import { unlinkSync } from 'node:fs'

export default apiHandler((event) => {
  const id = String(getRouterParam(event, 'id') ?? '')
  const file = accountFiles()[id]

  if (!file) {
    throw apiError(404, t('server.accountMissing'))
  }

  unlinkSync(file)

  return { id }
})
