// insight-tab-layout.finding-code.spec.js — reportParams ของ finding ที่ส่งไป config.tabFor มี findingCode เพิ่ม (params เดิมครบ) และ param ลงท้าย Thb ถูกใส่ตัวคั่นหลักพัน
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import InsightTabLayout from './insight-tab-layout.vue'
import InsightFindingList from './insight-finding-list.vue'
import { resolveFindingParams } from './insight-helpers.js'

function mountLayout(problems) {
  return mount(InsightTabLayout, {
    props: { title: 'x', problems, dataTabs: [{ value: 'a', label: 'A' }], activeSub: 'problems', i18nPrefix: 'rules' },
    global: { mocks: { $t: (key) => key }, stubs: { InsightSubTabs: true, InfoTipGeneric: true, SectionCardGeneric: true } }
  })
}

describe('InsightTabLayout finding report params', () => {
  it('adds findingCode next to the original params', () => {
    const wrapper = mountLayout([{ code: 'SAL_NO_DUE_DATE', severity: 'warning', params: { count: 3 }, reportRef: 'salDue' }])
    const finding = wrapper.findComponent(InsightFindingList).props('findings')[0]
    expect(finding.reportParams).toEqual({ count: 3, findingCode: 'SAL_NO_DUE_DATE' })
    expect(finding.reportRef).toBe('salDue')
  })

  it('works for findings without params', () => {
    const wrapper = mountLayout([{ code: 'X', severity: 'info', reportRef: 'r' }])
    expect(wrapper.findComponent(InsightFindingList).props('findings')[0].reportParams).toEqual({ findingCode: 'X' })
  })

  it('params ending in Thb get thousands separators and no decimals', () => {
    expect(resolveFindingParams({ overdueThb: 1234567.89, amountThb: 12, other: 1234 }).overdueThb).toBe('1,234,568')
    expect(resolveFindingParams({ amountThb: 12 }).amountThb).toBe('12')
    expect(resolveFindingParams({ other: 1234 }).other).toBe(1234)
  })
})
