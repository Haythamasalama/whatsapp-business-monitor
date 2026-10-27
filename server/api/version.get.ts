export default apiHandler(async (): Promise<VersionInfo> => {
  const current = String(useRuntimeConfig().public.version)
  const latest = updateCheckEnabled() ? await latestRelease() : null

  return { current, latest: latest && isNewer(latest.version, current) ? latest : null }
})
