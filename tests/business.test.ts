import { describe, expect, test } from 'bun:test'
import { automationProblems, displayNameProblems, normalizeUsers, obaProblems, profileProblems, qrProblems, usernameProblems } from '../shared/utils/business'

const profile = { about: 'Flowers', address: '', description: '', email: 'hello@example.com', websites: ['https://example.com/'], vertical: 'RETAIL' }

describe('business profile', () => {
  test('accepts a valid profile', () => expect(profileProblems(profile)).toEqual([]))
  test('refuses long about, bad email, three websites and unknown types', () => {
    expect(profileProblems({ ...profile, about: 'x'.repeat(140) })).toEqual(['business.rules.aboutTooLong'])
    expect(profileProblems({ ...profile, email: 'not-an-email' })).toEqual(['business.rules.email'])
    expect(profileProblems({ ...profile, websites: ['https://a.com', 'https://b.com', 'https://c.com'] })).toEqual(['business.rules.websites'])
    expect(profileProblems({ ...profile, websites: ['javascript:alert(1)'] })).toEqual(['business.rules.websites'])
    expect(profileProblems({ ...profile, vertical: 'CASINO' })).toEqual(['business.rules.vertical'])
  })
})

describe('chat start', () => {
  const valid = { enable_welcome_message: true, prompts: ['Track my order'], commands: [{ command_name: 'order', command_description: 'Start an order' }] }

  test('accepts valid settings', () => expect(automationProblems(valid)).toEqual([]))
  test('refuses five prompts, emoji, duplicates and spaces in a command', () => {
    expect(automationProblems({ ...valid, prompts: ['a', 'b', 'c', 'd', 'e'] })).toContain('business.rules.prompts')
    expect(automationProblems({ ...valid, prompts: ['Hi 👋'] })).toContain('business.rules.noEmoji')
    expect(automationProblems({ ...valid, commands: [valid.commands[0]!, valid.commands[0]!] })).toContain('business.rules.commandDuplicate')
    expect(automationProblems({ ...valid, commands: [{ command_name: 'two words', command_description: 'x' }] })).toContain('business.rules.commandName')
  })
})

describe('qr codes, names and usernames', () => {
  test('qr message is 1 to 140 characters', () => {
    expect(qrProblems('Hello')).toEqual([])
    expect(qrProblems(' ')).toEqual(['business.rules.qrMessage'])
    expect(qrProblems('x'.repeat(141))).toEqual(['business.rules.qrMessage'])
  })
  test('display name', () => {
    expect(displayNameProblems('Yasmin Store')).toEqual([])
    expect(displayNameProblems('')).toEqual(['business.rules.displayName'])
  })
  test('username', () => {
    expect(usernameProblems('yasmin.store')).toEqual([])
    expect(usernameProblems('_yasmin')).toEqual(['business.rules.username'])
    expect(usernameProblems('Yasmin')).toEqual(['business.rules.username'])
  })
})

describe('blocking', () => {
  test('cleans numbers and drops duplicates', () => {
    expect(normalizeUsers(['+1 (555) 010-0123', '+15550100123', ''])).toEqual({ users: ['+15550100123'], problems: [] })
  })
  test('refuses an empty list and bad numbers', () => {
    expect(normalizeUsers([]).problems).toEqual(['business.rules.usersEmpty'])
    expect(normalizeUsers(['abc']).problems).toEqual(['business.rules.userFormat'])
  })
})

describe('green badge request', () => {
  const links = Array.from({ length: 5 }, (_, index) => `https://news${index}.example.com/story`)

  test('needs a website, a country, a language and 5 to 10 links', () => {
    expect(obaProblems({ business_website_url: 'https://example.com', primary_country_of_operation: 'US', primary_language: 'en', supporting_links: links, parent_business_or_brand: '', additional_supporting_information: '' })).toEqual([])
    expect(obaProblems({ business_website_url: '', primary_country_of_operation: 'USA', primary_language: 'English', supporting_links: links.slice(0, 2), parent_business_or_brand: '', additional_supporting_information: '' }))
      .toEqual(['business.rules.obaWebsite', 'business.rules.obaCountry', 'business.rules.obaLanguage', 'business.rules.obaLinks'])
  })
})
