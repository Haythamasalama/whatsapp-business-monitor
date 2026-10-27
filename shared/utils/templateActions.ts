// Template actions. Doc base: https://developers.facebook.com/documentation/business-messaging/whatsapp/
// Problems are translation keys, as in shared/utils/business.ts; failOn() translates them.

export const TEMPLATE_ID = /^\d{1,30}$/
/** Meta deletes, archives and unarchives at most 100 templates per request. */
export const TEMPLATE_BATCH_MAX = 100
/** Meta copies at most 500 templates per request. */
export const TEMPLATE_COPY_MAX = 500
/** Meta archives only approved or rejected templates. */
export const ARCHIVABLE_STATUSES = ['APPROVED', 'REJECTED']

/** Only approved templates of green or unknown quality can be copied to another account. */
export const canCopyTemplate = (template: { status: string, quality_score?: { score?: string } }) =>
  template.status === 'APPROVED' && ['GREEN', 'UNKNOWN', undefined].includes(template.quality_score?.score)

export function templateIdProblems(ids: string[], max: number): string[] {
  if (!ids.length) {
    return ['templateActions.errors.noIds']
  }

  if (ids.length > max) {
    return [max === TEMPLATE_COPY_MAX ? 'templateActions.errors.tooManyCopy' : 'templateActions.errors.tooMany']
  }

  return ids.some(id => !TEMPLATE_ID.test(id)) ? ['templateActions.errors.badId'] : []
}
