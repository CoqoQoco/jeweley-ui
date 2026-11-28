import { describe, it, expect } from 'vitest'
import InvoiceListView from './index-view.vue'

describe('invoice list index-view', () => {
  it('clear resets the form and re-runs the search with an empty filter', () => {
    const ctx = { form: { invoiceNumber: 'A' }, search: { invoiceNumber: 'A', stockNumber: 'X' } }
    InvoiceListView.methods.onClearFilter.call(ctx)
    expect(ctx.form.invoiceNumber).toBeNull()
    expect(ctx.search.invoiceNumber).toBeNull()
    expect(ctx.search.stockNumber).toBeNull()
  })

  it('search stores a copy of the submitted form', () => {
    const ctx = { search: {} }
    const data = { invoiceNumber: 'B' }
    InvoiceListView.methods.onSearchFilter.call(ctx, data)
    expect(ctx.search).toEqual(data)
    expect(ctx.search).not.toBe(data)
  })
})
