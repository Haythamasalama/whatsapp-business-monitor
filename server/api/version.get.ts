export default apiHandler(async (): Promise<VersionInfo> => {
  const current = String(useRuntimeConfig().public.version)
  const latest = updateCheckEnabled() && readSettings().update_check ? await latestRelease() : null

  return {
    current,
    latest: latest && isNewer(latest.version, current) ? latest : null,
    autoUpdate: ['1', 'true'].includes(String(process.env.WHATSAPP_TEMPLATES_AUTO_UPDATE ?? '').toLowerCase()),
  }
})
