// The link to the QR image on Meta's servers, in PNG or SVG, for the page to download.
export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const { code, format } = getQuery(event)

  if (!QR_CODE.test(String(code ?? '')) || !['PNG', 'SVG'].includes(String(format))) {
    throw apiError(400, t('business.errors.qrCode'))
  }

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes
  const response = orFail(await graph(account, 'GET', `${phone}/message_qrdls/${code}`, { fields: `qr_image_url.format(${format})` }))
  const url = response.qr_image_url ?? response.data?.[0]?.qr_image_url

  if (typeof url !== 'string' || !url.startsWith('https://')) {
    throw apiError(502, t('business.errors.qrImage'))
  }

  return { url }
})
