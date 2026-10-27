export default apiHandler((): SettingsInfo => ({
  ...readSettings(),
  storage: tildePath(shownDatabaseFile()),
  update_check_forced_off: !updateCheckEnabled(),
}))
