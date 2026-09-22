import { describe, it, expect, vi } from 'vitest'

import {
  GALLERY_MAX_PER_SCOPE,
  buildGalleryPositionMap,
  classifyGalleryPosition,
  calcFreeSlots,
  runUploadQueue,
  moveIdToIndex,
  moveIdToFront,
  swapIds
} from './gallery-helpers.js'

describe('gallery-helpers', () => {
  describe('buildGalleryPositionMap', () => {
    it('places SKU images before MOLD images, sorted by sortOrder', () => {
      const sku = [
        { id: 's2', sortOrder: 1 },
        { id: 's1', sortOrder: 0 }
      ]
      const mold = [
        { id: 'm2', sortOrder: 1 },
        { id: 'm1', sortOrder: 0 }
      ]
      const map = buildGalleryPositionMap(sku, mold)
      expect(map).toEqual({ s1: 0, s2: 1, m1: 2, m2: 3 })
    })

    it('returns empty map when both scopes are empty', () => {
      expect(buildGalleryPositionMap([], [])).toEqual({})
    })

    it('defaults missing sortOrder to 0 without throwing', () => {
      const sku = [{ id: 's1' }]
      expect(buildGalleryPositionMap(sku, [])).toEqual({ s1: 0 })
    })
  })

  describe('classifyGalleryPosition', () => {
    it('classifies position 0 as primary', () => {
      expect(classifyGalleryPosition(0)).toBe('primary')
    })

    it('classifies position 1-3 as number', () => {
      expect(classifyGalleryPosition(1)).toBe('number')
      expect(classifyGalleryPosition(3)).toBe('number')
    })

    it('classifies position >= 4 or undefined as hidden', () => {
      expect(classifyGalleryPosition(4)).toBe('hidden')
      expect(classifyGalleryPosition(undefined)).toBe('hidden')
    })
  })

  describe('calcFreeSlots', () => {
    it('subtracts existing + pending from max (default 4)', () => {
      expect(calcFreeSlots({ existingCount: 1, pendingCount: 1 })).toBe(2)
    })

    it('never goes below 0', () => {
      expect(calcFreeSlots({ existingCount: 3, pendingCount: 3 })).toBe(0)
    })

    it('defaults to GALLERY_MAX_PER_SCOPE when no args given', () => {
      expect(calcFreeSlots()).toBe(GALLERY_MAX_PER_SCOPE)
    })
  })

  describe('runUploadQueue', () => {
    it('processes queued items sequentially and marks them done', async () => {
      const items = [
        { key: 'a', status: 'queued', progress: 0 },
        { key: 'b', status: 'queued', progress: 0 }
      ]
      const order = []
      const uploadFn = vi.fn(async (item) => {
        order.push(item.key)
      })

      await runUploadQueue(items, uploadFn)

      expect(order).toEqual(['a', 'b'])
      expect(items.every((i) => i.status === 'done')).toBe(true)
      expect(uploadFn).toHaveBeenCalledTimes(2)
    })

    it('marks a failing item as error and continues with the rest', async () => {
      const items = [
        { key: 'a', status: 'queued', progress: 0 },
        { key: 'b', status: 'queued', progress: 0 }
      ]
      const uploadFn = vi.fn(async (item) => {
        if (item.key === 'a') throw new Error('boom')
      })

      await runUploadQueue(items, uploadFn, { onError: () => 'upload failed' })

      expect(items[0].status).toBe('error')
      expect(items[0].errorMessage).toBe('upload failed')
      expect(items[1].status).toBe('done')
    })

    it('ignores items that are not queued', async () => {
      const items = [{ key: 'a', status: 'done', progress: 100 }]
      const uploadFn = vi.fn()

      await runUploadQueue(items, uploadFn)

      expect(uploadFn).not.toHaveBeenCalled()
    })
  })

  describe('moveIdToIndex', () => {
    it('moves an id from one index to another without mutating the input', () => {
      const ids = ['a', 'b', 'c', 'd']
      const result = moveIdToIndex(ids, 3, 1)
      expect(result).toEqual(['a', 'd', 'b', 'c'])
      expect(ids).toEqual(['a', 'b', 'c', 'd'])
    })
  })

  describe('moveIdToFront', () => {
    it('moves the id at index to the front', () => {
      expect(moveIdToFront(['a', 'b', 'c'], 2)).toEqual(['c', 'a', 'b'])
    })
  })

  describe('swapIds', () => {
    it('swaps two indexes without mutating the input', () => {
      const ids = ['a', 'b', 'c']
      const result = swapIds(ids, 0, 1)
      expect(result).toEqual(['b', 'a', 'c'])
      expect(ids).toEqual(['a', 'b', 'c'])
    })
  })
})
