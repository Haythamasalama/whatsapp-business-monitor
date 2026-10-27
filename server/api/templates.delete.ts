// Deletes a template in every language (?name=), in one language (?name=&id=), or several by id (?ids=1,2).
// A deleted name can't be used again for 30 days, and a DISABLED template can't be deleted.
export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const query = getQuery(event)
  const name = String(query.name ?? '')
  const id = String(query.id ?? '')
  const ids = readTemplateIds(String(query.ids ?? '').split(','))

  if (ids.length) {
    failOn(templateIdProblems(ids, TEMPLATE_BATCH_MAX))

    // https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-management
    orFail(await graph(account, 'DELETE', `${account.waba}/message_templates`, { hsm_ids: JSON.stringify(ids) }))

    return { done: ids, failed: [] } satisfies TemplateActionResult
  }

  if (!TEMPLATE_NAME.test(name) || (id && !TEMPLATE_ID.test(id))) {
    throw apiError(400, t('templateActions.errors.badName'))
  }

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-management
  return orFail(await graph(account, 'DELETE', `${account.waba}/message_templates`, { name, hsm_id: id || undefined }))
})
