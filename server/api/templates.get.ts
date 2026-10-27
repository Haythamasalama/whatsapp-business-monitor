export default apiHandler(async (event) => {
  const data = await listTemplates(requireAccount(event), [
    'id,name,language,status,category,parameter_format,components,quality_score,rejected_reason',
    'id,name,language,status,category,parameter_format,components',
  ])

  return { data }
})
