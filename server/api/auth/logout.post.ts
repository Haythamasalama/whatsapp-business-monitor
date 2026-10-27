export default apiHandler((event) => {
  endSession(event)

  return { ok: true }
})
