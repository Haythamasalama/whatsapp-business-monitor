// Installs the latest release now, through the updater in compose.yaml. Signed-in users only (3.auth).
export default apiHandler(async () => {
  if (!canUpdateNow()) {
    throw apiError(422, t('server.updateUnavailable'))
  }

  await startUpdate()

  return { started: true }
})
