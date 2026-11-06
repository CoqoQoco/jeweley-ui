import { describe, it, expect } from 'vitest'
import { formatBuildVersion, versionJsonPlugin, VERSION_PATTERN } from './version-json.js'

describe('formatBuildVersion', () => {
  it('แปลง UTC เป็นเวลาไทย (+7)', () => {
    expect(formatBuildVersion(new Date('2026-11-06T07:23:00Z'))).toBe('2026.11.06.1423')
  })

  it('ข้ามวันเมื่อ UTC 17:00 ขึ้นไป', () => {
    expect(formatBuildVersion(new Date('2026-12-31T17:05:00Z'))).toBe('2027.01.01.0005')
  })

  it('เติมศูนย์และตรงรูปแบบ', () => {
    const v = formatBuildVersion(new Date('2026-01-02T00:03:00Z'))
    expect(v).toBe('2026.01.02.0703')
    expect(VERSION_PATTERN.test(v)).toBe(true)
  })
})

describe('versionJsonPlugin', () => {
  it('ใช้เฉพาะตอน build และ emit version.json', () => {
    const plugin = versionJsonPlugin('2026.11.06.1423')
    expect(plugin.apply).toBe('build')
    const emitted = []
    plugin.generateBundle.call({ emitFile: (f) => emitted.push(f) })
    expect(emitted[0].fileName).toBe('version.json')
    expect(JSON.parse(emitted[0].source)).toEqual({ version: '2026.11.06.1423' })
  })
})
