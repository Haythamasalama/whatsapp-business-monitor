// Read before signing in, so it only holds what the setup and sign-in pages need.
export default apiHandler((event): AppInfo => {
  const settings = readSettings()
  const user = currentUser(event)

  return {
    setup_required: !hasUsers(),
    setup_code_required: !hasUsers() && setupCodeNeeded(event),
    user: user ? { username: user.username } : null,
    instance_name: settings.instance_name,
    public_url: user ? settings.public_url : '',
    default_locale: settings.default_locale,
  }
})
