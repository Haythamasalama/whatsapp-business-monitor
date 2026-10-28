import { describe, expect, test } from 'bun:test'
import { compareProblems, freeServiceLeft, parseTier, readReportQuery, reportWindow } from '../shared/utils/reports'

describe('report query', () => {
  test('accepts the periods, granularities and filters Meta takes', () => {
    expect(readReportQuery({}).problems).toEqual([])
    expect(readReportQuery({ days: '365', granularity: 'MONTHLY', phone: '15550100100', country: 'sa' })).toEqual({
      query: { days: 365, granularity: 'MONTHLY', phone: '15550100100', country: 'SA' },
      problems: [],
    })
    expect(readReportQuery({ days: '7', granularity: 'HALF_HOUR' }).problems).toEqual([])
  })
  test('refuses anything else', () => {
    expect(readReportQuery({ days: '400' }).problems).toEqual(['reports.errors.badPeriod'])
    expect(readReportQuery({ granularity: 'WEEKLY' }).problems).toEqual(['reports.errors.badGranularity'])
    expect(readReportQuery({ days: '30', granularity: 'HALF_HOUR' }).problems).toEqual(['reports.errors.halfHourTooLong'])
    expect(readReportQuery({ phone: '+1 555' }).problems).toEqual(['reports.errors.badPhone'])
    expect(readReportQuery({ country: 'SAU' }).problems).toEqual(['reports.errors.badCountry'])
    expect(readReportQuery({ country: '"])' }).problems).toEqual(['reports.errors.badCountry'])
  })
  test('the window ends now and goes back the asked days', () => {
    expect(reportWindow(7, 1_000_000_000_000)).toEqual({ start: 1_000_000_000 - 7 * 86_400, end: 1_000_000_000 })
  })
})

describe('template comparison', () => {
  test('two different numeric ids over a window Meta allows', () => {
    expect(compareProblems('1', '2', 30)).toEqual([])
    expect(compareProblems('1', '1', 30)).toEqual(['reports.errors.sameTemplate'])
    expect(compareProblems('1', 'x', 30)).toEqual(['reports.errors.badTemplate'])
    expect(compareProblems('1', '2', 45)).toEqual(['reports.errors.badWindow'])
  })
})

describe('pricing helpers', () => {
  test('reads volume tiers', () => {
    expect(parseTier('0:750000')).toEqual({ lower: 0, upper: 750_000 })
    expect(parseTier('0:MAX')).toEqual({ lower: 0, upper: null })
    expect(parseTier('nonsense')).toBeNull()
  })
  test('counts what is left of the 1,000 free service messages', () => {
    expect(freeServiceLeft(0)).toBe(1000)
    expect(freeServiceLeft(640)).toBe(360)
    expect(freeServiceLeft(1500)).toBe(0)
  })
})
