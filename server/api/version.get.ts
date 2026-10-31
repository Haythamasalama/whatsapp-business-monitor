// ?refresh=1 is "Check now" in the settings: it asks GitHub again instead of using the last answer.
export default apiHandler(async (event): Promise<VersionInfo> => {
  const current = String(useRuntimeConfig().public.version)
  const enabled = updateCheckEnabled() && Boolean(readSettings().update_check)
  const refresh = enabled && getQuery(event).refresh === '1'
  const latest = enabled ? await latestRelease(refresh) : null

  if (refresh && !latest) {
    throw apiError(502, t('server.updateCheckFailed'))
  }

  return {
    current,
    latest: latest && isNewer(latest.version, current) ? latest : null,
    autoUpdate: ['1', 'true'].includes(String(process.env.WHATSAPP_TEMPLATES_AUTO_UPDATE ?? '').toLowerCase()),
    canUpdateNow: canUpdateNow(),
  }
})
