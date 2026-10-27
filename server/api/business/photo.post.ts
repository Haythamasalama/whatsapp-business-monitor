// Meta takes a profile photo in two steps: upload it to get a handle, then set the handle on the profile.
export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  // Refused before reading, so a huge body is never held in memory.
  if (Number(getRequestHeader(event, 'content-length') ?? Number.POSITIVE_INFINITY) > PHOTO_MAX_BYTES + 64 * 1024) {
    throw apiError(413, t('business.rules.photoSize'))
  }

  const file = (await readMultipartFormData(event))?.find(entry => entry.name === 'photo')
  const type = file?.type ?? ''

  if (!file || !PHOTO_TYPES.includes(type) || !isImageOf(file.data, type)) {
    throw apiError(422, t('business.rules.photoType'))
  }

  if (file.data.byteLength > PHOTO_MAX_BYTES) {
    throw apiError(422, t('business.rules.photoSize'))
  }

  const upload = orFail(await uploadHandle(account, { name: type === 'image/png' ? 'photo.png' : 'photo.jpg', type, data: file.data }))

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles
  return orFail(await graph(account, 'POST', `${phone}/whatsapp_business_profile`, {}, {
    messaging_product: 'whatsapp',
    profile_picture_handle: upload.handle,
  }))
})
