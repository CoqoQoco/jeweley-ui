import { describe, it, expect } from 'vitest'
import * as col from '../columns.js'
import { buildBlockColumns, buildHeaderSlotColumns, isRowSelected, resolveCellHighlight, resolveRowSelection, resolveTableSections, applyToolbarFilters, cellSlotName, headerSlotName } from './table-block-helpers.js'

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

describe('selectable with object values and client-side toolbar filters', () => {
  const node = {
    selectable: { stateKey: 'w', value: (row) => ({ code: row.code, deptKey: row.deptKey }), same: (selected, row) => selected.code === row.code && selected.deptKey === row.deptKey }
  }

  it('stores an object and highlights the row that matches it', () => {
    expect(resolveRowSelection(node, { data: { code: 'A', deptKey: 'setting' } })).toEqual({ stateKey: 'w', value: { code: 'A', deptKey: 'setting' } })
    const ctx = { state: { w: { code: 'A', deptKey: 'setting' } } }
    expect(isRowSelected(node, ctx, { code: 'A', deptKey: 'setting' })).toBe(true)
    expect(isRowSelected(node, ctx, { code: 'A', deptKey: 'trim' })).toBe(false)
    expect(isRowSelected(node, { state: { w: null } }, { code: 'A', deptKey: 'setting' })).toBe(false)
  })

  it('applies multiselect then toggle filters from state; no toolbar or no filter fn = unchanged', () => {
    const rows = [{ d: 'a', t: 'X' }, { d: 'a', t: 'Y' }, { d: 'b', t: 'X' }]
    const toolbar = {
      multiselect: { stateKey: 'dept', filter: (list, value) => (value.length ? list.filter((r) => value.includes(r.d)) : list) },
      toggle: { stateKey: 'type', filter: (list, value) => (value === 'ALL' ? list : list.filter((r) => r.t === value)) }
    }
    expect(applyToolbarFilters(toolbar, rows, { state: { dept: [], type: 'ALL' } })).toHaveLength(3)
    expect(applyToolbarFilters(toolbar, rows, { state: { dept: ['a'], type: 'ALL' } })).toHaveLength(2)
    expect(applyToolbarFilters(toolbar, rows, { state: { dept: ['a'], type: 'Y' } })).toEqual([{ d: 'a', t: 'Y' }])
    expect(applyToolbarFilters(undefined, rows, { state: {} })).toBe(rows)
    expect(applyToolbarFilters({ multiselect: { stateKey: 'x' } }, rows, { state: {} })).toBe(rows)
  })
})
