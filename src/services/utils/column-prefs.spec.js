import { describe, it, expect, beforeEach } from 'vitest'

import {
  buildColumnPrefsStorageKey,
  applySavedColumnOrder,
  computeReorderOffset,
  reorderColumnFields
} from './column-prefs.js'
import { storage } from '@/services/storage.js'

const COLUMNS = [
  { field: 'action', header: '' },
  { field: 'invoiceNumber', header: 'Invoice No.' },
  { field: 'customerName', header: 'Customer' },
  { field: 'status', header: 'Status' },
  { field: 'salePerson', header: 'Sale' }
]

describe('column-prefs', () => {
  describe('buildColumnPrefsStorageKey', () => {
    it('builds the localStorage key from columnPrefsKey', () => {
      expect(buildColumnPrefsStorageKey('invoice-list')).toBe('table-cols-invoice-list-dk')
    })
  })

  describe('applySavedColumnOrder', () => {
    it('returns columns unchanged when savedOrder is empty/missing', () => {
      expect(applySavedColumnOrder(COLUMNS, [])).toBe(COLUMNS)
      expect(applySavedColumnOrder(COLUMNS, null)).toBe(COLUMNS)
      expect(applySavedColumnOrder(COLUMNS, undefined)).toBe(COLUMNS)
    })

    it('reorders columns to match savedOrder', () => {
      const savedOrder = ['salePerson', 'action', 'invoiceNumber', 'customerName', 'status']
      const result = applySavedColumnOrder(COLUMNS, savedOrder)
      expect(result.map((c) => c.field)).toEqual(savedOrder)
    })

    it('skips fields from savedOrder that no longer exist in columns (renamed/removed) without throwing', () => {
      const savedOrder = ['customerName', 'deletedField', 'invoiceNumber']
      expect(() => applySavedColumnOrder(COLUMNS, savedOrder)).not.toThrow()

      const result = applySavedColumnOrder(COLUMNS, savedOrder)
      expect(result.map((c) => c.field)).not.toContain('deletedField')
    })

    it('appends columns missing from savedOrder at the end, preserving their original relative order', () => {
      const savedOrder = ['status', 'invoiceNumber']
      const result = applySavedColumnOrder(COLUMNS, savedOrder)
      expect(result.map((c) => c.field)).toEqual(['status', 'invoiceNumber', 'action', 'customerName', 'salePerson'])
    })
  })

  describe('computeReorderOffset', () => {
    it('returns 0 when there is no expander and no selection column', () => {
      expect(computeReorderOffset({ expandable: false, selectionMode: false })).toBe(0)
    })

    it('returns 1 when only selection column is present', () => {
      expect(computeReorderOffset({ expandable: false, selectionMode: true })).toBe(1)
    })

    it('returns 1 when only expander column is present', () => {
      expect(computeReorderOffset({ expandable: true, selectionMode: false })).toBe(1)
    })

    it('returns 2 when both expander and selection columns are present', () => {
      expect(computeReorderOffset({ expandable: true, selectionMode: true })).toBe(2)
    })

    it('defaults to 0 when called without args', () => {
      expect(computeReorderOffset()).toBe(0)
    })
  })

  describe('reorderColumnFields', () => {
    const order = ['action', 'invoiceNumber', 'customerName', 'status', 'salePerson']

    it('reorders fields using raw PrimeVue indices when offset is 0', () => {
      // move index 1 (invoiceNumber) to index 3
      const result = reorderColumnFields(order, 1, 3, 0)
      expect(result).toEqual(['action', 'customerName', 'status', 'invoiceNumber', 'salePerson'])
    })

    it('subtracts the offset before mapping back into our own order array (selection column present)', () => {
      // PrimeVue's own column list = [selection, ...order] so its indices are order-index + 1
      const offset = computeReorderOffset({ selectionMode: true })
      const result = reorderColumnFields(order, 2, 4, offset)
      // dragIndex 2 -> our index 1 (invoiceNumber), dropIndex 4 -> our index 3 (status)
      expect(result).toEqual(['action', 'customerName', 'status', 'invoiceNumber', 'salePerson'])
    })

    it('returns null when the drag targets the system column itself (index below our offset)', () => {
      const offset = computeReorderOffset({ selectionMode: true })
      // dragIndex 0 is the selection column, not one of our fields — invalid after offset
      expect(reorderColumnFields(order, 0, 2, offset)).toBeNull()
    })

    it('returns null when the resulting index is out of bounds', () => {
      expect(reorderColumnFields(order, 0, order.length, 0)).toBeNull()
      expect(reorderColumnFields(order, -1, 0, 0)).toBeNull()
    })

    it('does not mutate the original order array', () => {
      const original = [...order]
      reorderColumnFields(order, 0, 2, 0)
      expect(order).toEqual(original)
    })
  })

  describe('storage round-trip (real localStorage via services/storage.js)', () => {
    const key = buildColumnPrefsStorageKey('invoice-list-test')

    beforeEach(() => {
      storage.removeItem(key)
    })

    it('saves prefs then loads the same order + frozen map back', () => {
      const prefs = {
        order: ['salePerson', 'action', 'invoiceNumber'],
        frozen: { invoiceNumber: 'left' }
      }

      storage.setJSON(key, prefs)
      const loaded = storage.getJSON(key, null)

      expect(loaded).toEqual(prefs)
    })

    it('returns the fallback when nothing was saved yet', () => {
      expect(storage.getJSON(key, null)).toBeNull()
    })
  })
})
