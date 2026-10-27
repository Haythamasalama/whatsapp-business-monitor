// Unpauses a template Meta paused. Quality pauses end on their own after 3 hours, then 6; the third pause
// disables the template. Templates paused by pacing stay paused until someone unpauses them.
export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const id = getRouterParam(event, 'id') ?? ''

  if (!TEMPLATE_ID.test(id)) {
    throw apiError(404, 'Not found')
  }

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-pausing
  return orFail(await graph(account, 'POST', `${id}/unpause`))
})
