// owner-role-i18n.spec.js — ทุก ownerRole ที่ ActionDefinitions ฝั่ง API ใช้ ต้องมี key ทั้ง th และ en
// (กันชิปเจ้าของงานโชว์ key ดิบ) — อ่านค่าจาก ProductionInsightRuleEngine.cs ตรงๆ ถ้าเจอไฟล์ใน monorepo
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import th from './th.js'
import en from './en.js'

const KNOWN_ROLES = ['deptHead', 'planner', 'productionManager', 'goldControl', 'purchasing']

const ENGINE_PATH = resolve(import.meta.dirname, '../../../../../jewelry-api/Jewelry.Api/Jewelry.Service/Production/Insight/ProductionInsightRuleEngine.cs')

function rolesFromEngine() {
  if (!existsSync(ENGINE_PATH)) return []
  const source = readFileSync(ENGINE_PATH, 'utf8')
  const block = source.split('ActionDefinitions =')[1]?.split('};')[0] || ''
  return [...new Set([...block.matchAll(/\("ACT_\w+",\s*"(\w+)"/g)].map((m) => m[1]))]
}

const roles = [...new Set([...KNOWN_ROLES, ...rolesFromEngine()])]

describe('ownerRole i18n coverage', () => {
  roles.forEach((role) => {
    it(`${role} has th and en label`, () => {
      expect(th.ownerRole[role], `th.ownerRole.${role}`).toBeTruthy()
      expect(en.ownerRole[role], `en.ownerRole.${role}`).toBeTruthy()
    })
  })
})
