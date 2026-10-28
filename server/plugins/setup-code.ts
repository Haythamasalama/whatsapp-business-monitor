// A fresh install prints its setup code once at start, where `docker compose logs` and install.sh can find it.
export default defineNitroPlugin(() => {
  if (!isDemo() && !hasUsers()) {
    currentSetupCode()
  }
})
