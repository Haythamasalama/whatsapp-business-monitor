// Creates a QR code and short link, or changes the message of one when `code` is given.
export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const body = await readBody<Record<string, unknown>>(event)
  const message = readText(body.prefilled_message)
  const code = readText(body.code)

  failOn(qrProblems(message))

  if (code && !QR_CODE.test(code)) {
    throw apiError(400, t('business.errors.qrCode'))
  }

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes
  return orFail(await graph(account, 'POST', `${phone}/message_qrdls`, {}, code
    ? { code, prefilled_message: message }
    : { prefilled_message: message, generate_qr_image: 'PNG' }))
})
