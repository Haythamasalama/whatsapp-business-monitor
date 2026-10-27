// Copies templates from the open account to another saved account of the same business. Meta copies only
// APPROVED templates of GREEN or UNKNOWN quality, and answers which ones it copied and why others failed.
export default apiHandler(async (event) => {
  const source = requireAccount(event)
  const body = await readBody<Record<string, unknown>>(event)
  const ids = readTemplateIds(body.ids)

  failOn(templateIdProblems(ids, TEMPLATE_COPY_MAX))

  const target = loadAccount(String(body.to ?? ''))

  if (!target.token || !target.waba) {
    throw apiError(400, t('server.accountIncomplete'))
  }

  if (target.waba === source.waba) {
    throw apiError(422, t('templateActions.errors.sameAccount'))
  }

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-migration
  const response = orFail(await graph(target, 'POST', `${target.waba}/migrate_message_templates`, {}, {
    source_waba_id: source.waba,
    template_ids: ids,
  }))

  return {
    done: (response.migrated_templates ?? []).map(String),
    failed: failedTemplates(response.failed_templates),
  } satisfies TemplateActionResult
})
