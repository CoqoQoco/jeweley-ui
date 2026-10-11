import { describe, it, expect } from 'vitest'
import * as col from '../columns.js'
import { buildBlockColumns, buildHeaderSlotColumns, isRowSelected, resolveCellHighlight, resolveRowSelection, resolveTableSections, cellSlotName, headerSlotName } from './table-block-helpers.js'

const t = (key) => key

describe('table-block helpers', () => {
  it('builds table columns and header-slot columns from the library', () => {
    const columns = [col.mold(), col.workers()]
    expect(buildBlockColumns(columns, t).map((c) => c.field)).toEqual(['mold', 'workers'])
    expect(buildHeaderSlotColumns(columns).map((c) => c.field)).toEqual(['workers'])
  })

  it('selection: row selected when state matches the dataKey value', () => {
    const node = { selectable: { stateKey: 'dept' }, dataKey: 'key' }
    expect(isRowSelected(node, { state: { dept: 'trim' } }, { key: 'trim' })).toBe(true)
    expect(isRowSelected(node, { state: { dept: 'trim' } }, { key: 'setting' })).toBe(false)
    expect(isRowSelected(node, { state: { dept: null } }, { key: 'trim' })).toBe(false)
    expect(isRowSelected({}, { state: {} }, { key: 'trim' })).toBe(false)
  })

  it('row click resolves to a state change only for selectable tables', () => {
    expect(resolveRowSelection({ selectable: { stateKey: 'dept' }, dataKey: 'key' }, { data: { key: 'trim' } })).toEqual({ stateKey: 'dept', value: 'trim' })
    expect(resolveRowSelection({ selectable: { stateKey: 'dept' } }, { data: {} })).toBeNull()
    expect(resolveRowSelection({}, { data: { key: 'x' } })).toBeNull()
  })

  it('highlight(row, col, ctx) returns a class name or the default emphasis class', () => {
    expect(resolveCellHighlight({}, {}, {}, {})).toBe('')
    expect(resolveCellHighlight({ highlight: () => true }, {}, {}, {})).toBe('insight-table__cell--emphasis')
    expect(resolveCellHighlight({ highlight: () => 'custom' }, {}, {}, {})).toBe('custom')
    expect(resolveCellHighlight({ highlight: () => false }, {}, {}, {})).toBe('')
  })

  it('sections default to one table from rows/columns and keep text sections', () => {
    const rows = () => []
    expect(resolveTableSections({ rows, columns: [], dataKey: 'key' })).toEqual([{ kind: 'table', rows, columns: [], dataKey: 'key' }])
    const sections = resolveTableSections({ sections: [{ rows, columns: [] }, { kind: 'text', text: () => 'x' }] })
    expect(sections.map((s) => s.kind)).toEqual(['table', 'text'])
  })

  it('slot names follow the DataTableWithPaging convention', () => {
    expect(cellSlotName({ field: 'wo' })).toBe('woTemplate')
    expect(headerSlotName({ field: 'wo' })).toBe('header-wo')
  })
})
