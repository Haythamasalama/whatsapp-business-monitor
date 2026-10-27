import { describe, expect, test } from 'bun:test'
import { canCopyTemplate, TEMPLATE_BATCH_MAX, TEMPLATE_COPY_MAX, templateIdProblems } from '../shared/utils/templateActions'

describe('template ids', () => {
  test('accepts numeric ids up to the limit', () => {
    expect(templateIdProblems(['123', '456'], TEMPLATE_BATCH_MAX)).toEqual([])
    expect(templateIdProblems(Array.from({ length: 500 }, (_, index) => String(index + 1)), TEMPLATE_COPY_MAX)).toEqual([])
  })
  test('refuses none, too many and ids that are not numbers', () => {
    expect(templateIdProblems([], TEMPLATE_BATCH_MAX)).toEqual(['templateActions.errors.noIds'])
    expect(templateIdProblems(Array.from({ length: 101 }, (_, index) => String(index + 1)), TEMPLATE_BATCH_MAX)).toEqual(['templateActions.errors.tooMany'])
    expect(templateIdProblems(Array.from({ length: 501 }, (_, index) => String(index + 1)), TEMPLATE_COPY_MAX)).toEqual(['templateActions.errors.tooManyCopy'])
    expect(templateIdProblems(['12', '../me'], TEMPLATE_BATCH_MAX)).toEqual(['templateActions.errors.badId'])
  })
})

describe('copying between accounts', () => {
  test('only approved templates of green or unknown quality', () => {
    expect(canCopyTemplate({ status: 'APPROVED', quality_score: { score: 'GREEN' } })).toBe(true)
    expect(canCopyTemplate({ status: 'APPROVED', quality_score: { score: 'UNKNOWN' } })).toBe(true)
    expect(canCopyTemplate({ status: 'APPROVED' })).toBe(true)
    expect(canCopyTemplate({ status: 'APPROVED', quality_score: { score: 'YELLOW' } })).toBe(false)
    expect(canCopyTemplate({ status: 'PAUSED', quality_score: { score: 'GREEN' } })).toBe(false)
  })
})
