export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const input = readAutomation(await readBody<Record<string, unknown>>(event))

  failOn(automationProblems(input))

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/conversational-components
  return orFail(await graph(account, 'POST', `${phone}/conversational_automation`, {
    enable_welcome_message: String(input.enable_welcome_message),
    prompts: JSON.stringify(input.prompts),
    commands: JSON.stringify(input.commands),
  }))
})
