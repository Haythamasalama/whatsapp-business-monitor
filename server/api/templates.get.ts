const MAX_PAGES = 20

export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const templates: MetaTemplate[] = []
  let after: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const response = orFail(await graphFields(account, `${account.waba}/message_templates`, [
      'id,name,language,status,category,parameter_format,components,quality_score,rejected_reason',
      'id,name,language,status,category,parameter_format,components',
    ], { limit: 100, after }))

    templates.push(...(response.data ?? []))
    after = response.paging?.cursors?.after

    if (!response.paging?.next) {
      break
    }
  }

  return { data: templates }
})
