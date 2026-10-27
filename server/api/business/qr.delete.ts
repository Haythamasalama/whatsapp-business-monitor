export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const code = String(getQuery(event).code ?? '')

  if (!QR_CODE.test(code)) {
    throw apiError(400, t('business.errors.qrCode'))
  }

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes
  return orFail(await graph(account, 'DELETE', `${phone}/message_qrdls/${code}`))
})
