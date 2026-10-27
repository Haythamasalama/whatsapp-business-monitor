export default apiHandler(async (event) => {
  const account = requireAccount(event)

  return cached(account, 'templates', async () => {
    const [data, quota] = await Promise.all([
      listTemplates(account, [
        'id,name,language,status,category,parameter_format,components,quality_score,rejected_reason',
        'id,name,language,status,category,parameter_format,components',
      ]),
      templateQuota(account),
    ])

    return { data, quota }
  }, wantsFresh(event))
})
