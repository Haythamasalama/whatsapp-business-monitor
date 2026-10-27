export default apiHandler((): SettingsInfo => ({
  ...readSettings(),
  storage: tildePath(databaseFile()),
  update_check_forced_off: !updateCheckEnabled(),
}))
