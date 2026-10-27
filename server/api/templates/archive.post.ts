// Archives or unarchives templates. Only APPROVED or REJECTED ones can be archived; Meta archives a template
// unused for 12 months on its own and deletes it 28 days later unless it is unarchived.
export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const body = await readBody<Record<string, unknown>>(event)
  const unarchive = body.action === 'unarchive'
  const ids = readTemplateIds(body.ids)

  failOn(templateIdProblems(ids, TEMPLATE_BATCH_MAX))

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-archival
  const response = orFail(await graph(account, 'POST', `${account.waba}/message_templates/${unarchive ? 'unarchive' : 'archive'}`, {}, { hsm_ids: ids }))

  return {
    done: ((unarchive ? response.unarchived_templates : response.archived_templates) ?? []).map(String),
    failed: failedTemplates(response.failed_templates),
  } satisfies TemplateActionResult
})
