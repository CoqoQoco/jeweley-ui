import { describe, it, expect } from 'vitest'
import { buildSaleSummaryGroups, buildProductTypeLabelMap } from './sale-summary-data.js'

const gold = (weight) => ({ type: 'Gold', weight })
const diamond = (weight) => ({ type: 'Diamond', weight })
const gem = (weight) => ({ type: 'Gem', weight })

describe('buildSaleSummaryGroups', () => {
  describe('การจัดกลุ่ม', () => {
    it('จัดกลุ่มตาม productTypeName และแปลงเป็นตัวพิมพ์ใหญ่', () => {
      const { groups } = buildSaleSummaryGroups([
        { productTypeName: ' ring ', qty: 1, appraisalPrice: 100 },
        { productTypeName: 'RING', qty: 2, appraisalPrice: 200 },
        { productTypeName: 'Earring', qty: 1, appraisalPrice: 50 }
      ])

      expect(groups.map((g) => g.label)).toEqual(['EARRING', 'RING'])
      expect(groups.find((g) => g.label === 'RING').qty).toBe(3)
    })

    it('ไม่มี productTypeName → parse จาก description และข้าม token ทอง', () => {
      const { groups } = buildSaleSummaryGroups([
        { description: '18K EARRING Diamond', qty: 1, appraisalPrice: 100 }
      ])

      expect(groups).toHaveLength(1)
      expect(groups[0].label).toBe('EARRING')
      expect(groups[0].label).not.toBe('RING')
    })

    it('description ไม่มี token ทองนำหน้า → ใช้ token แรกเป็นประเภท', () => {
      const { groups } = buildSaleSummaryGroups([
        { description: 'bracelet white gold', qty: 1, appraisalPrice: 100 }
      ])

      expect(groups[0].label).toBe('BRACELET')
    })

    it('ไม่มีทั้ง productTypeName และ description → OTHER', () => {
      const { groups } = buildSaleSummaryGroups([
        { qty: 1, appraisalPrice: 100 },
        { productTypeName: '   ', description: '  ', qty: 1, appraisalPrice: 100 }
      ])

      expect(groups).toHaveLength(1)
      expect(groups[0].label).toBe('OTHER')
      expect(groups[0].qty).toBe(2)
    })

    it('groupByGoldType = true → label เป็น "ประเภทสินค้า - ประเภททอง"', () => {
      const { groups } = buildSaleSummaryGroups(
        [
          { productTypeName: 'RING', description: '18K RING Diamond', qty: 1, appraisalPrice: 100 },
          { productTypeName: 'RING', description: '9K RING Diamond', qty: 1, appraisalPrice: 100 },
          { productTypeName: 'RING', description: 'RING Diamond', qty: 1, appraisalPrice: 100 }
        ],
        { groupByGoldType: true }
      )

      expect(groups.map((g) => g.label)).toEqual(['RING - 18K', 'RING - 9K', 'RING - N/A'])
    })

    it('default = ไม่แยกตามประเภททอง', () => {
      const { groups } = buildSaleSummaryGroups([
        { description: '18K RING Diamond', qty: 1, appraisalPrice: 100 },
        { description: '9K RING Diamond', qty: 1, appraisalPrice: 100 }
      ])

      expect(groups).toHaveLength(1)
      expect(groups[0].label).toBe('RING')
    })
  })

  describe('ชื่อประเภทจาก master (productTypeLabels)', () => {
    const labels = { RIN: 'Ring', EAR: 'Earring' }

    it('master ชนะ productTypeName ที่เป็นภาษาไทย', () => {
      const { groups } = buildSaleSummaryGroups(
        [
          {
            productType: 'RIN',
            productTypeName: 'แหวน',
            description: '18K RING Diamond',
            qty: 1,
            appraisalPrice: 100
          }
        ],
        { productTypeLabels: labels }
      )

      expect(groups[0].label).toBe('RING')
    })

    it('รองรับ Map เป็น productTypeLabels', () => {
      const { groups } = buildSaleSummaryGroups(
        [{ productType: 'EAR', productTypeName: 'ต่างหู', qty: 1, appraisalPrice: 100 }],
        { productTypeLabels: new Map([['EAR', 'Earring']]) }
      )

      expect(groups[0].label).toBe('EARRING')
    })

    it('ไม่มี code ใน map → ใช้ productTypeName', () => {
      const { groups } = buildSaleSummaryGroups(
        [{ productType: 'BRA', productTypeName: 'Bracelet', qty: 1, appraisalPrice: 100 }],
        { productTypeLabels: labels }
      )

      expect(groups[0].label).toBe('BRACELET')
    })

    it('ไม่มีทั้ง code ใน map และ productTypeName → parse จาก description', () => {
      const { groups } = buildSaleSummaryGroups(
        [{ productType: 'BRA', description: '18K EARRING Diamond', qty: 1, appraisalPrice: 100 }],
        { productTypeLabels: labels }
      )

      expect(groups[0].label).toBe('EARRING')
    })

    it('productTypeLabels ว่าง/ไม่ส่ง → ทำงานเหมือนเดิม (ใช้ productTypeName)', () => {
      const items = [{ productType: 'RIN', productTypeName: 'แหวน', qty: 1, appraisalPrice: 100 }]

      expect(buildSaleSummaryGroups(items).groups[0].label).toBe('แหวน')
      expect(buildSaleSummaryGroups(items, { productTypeLabels: {} }).groups[0].label).toBe('แหวน')
      expect(buildSaleSummaryGroups(items, { productTypeLabels: null }).groups[0].label).toBe('แหวน')
    })

    it('ไม่หลุดไปหยิบ key จาก prototype ของ object', () => {
      const { groups } = buildSaleSummaryGroups(
        [{ productType: 'constructor', description: '18K RING Diamond', qty: 1, appraisalPrice: 100 }],
        { productTypeLabels: {} }
      )

      expect(groups[0].label).toBe('RING')
    })

    it('รวมกลุ่มเดียวกันเมื่อ master ให้ชื่อเดียวกันแต่ productTypeName ต่างกัน', () => {
      const { groups } = buildSaleSummaryGroups(
        [
          { productType: 'RIN', productTypeName: 'แหวน', qty: 1, appraisalPrice: 100 },
          { productType: 'RIN', productTypeName: 'RING', qty: 2, appraisalPrice: 100 }
        ],
        { productTypeLabels: labels }
      )

      expect(groups).toHaveLength(1)
      expect(groups[0].label).toBe('RING')
      expect(groups[0].qty).toBe(3)
    })
  })

  describe('buildProductTypeLabelMap', () => {
    it('สร้าง map code -> nameEn และข้ามแถวที่ข้อมูลไม่ครบ', () => {
      const map = buildProductTypeLabelMap([
        { code: 'RIN', nameEn: 'Ring', nameTh: 'แหวน' },
        { code: ' EAR ', nameEn: ' Earring ', nameTh: 'ต่างหู' },
        { code: 'BRA', nameEn: '', nameTh: 'สร้อยข้อมือ' },
        { code: '', nameEn: 'Necklace' },
        null
      ])

      expect(map).toEqual({ RIN: 'Ring', EAR: 'Earring' })
    })

    it('input ไม่ใช่ array → map ว่าง', () => {
      expect(buildProductTypeLabelMap(null)).toEqual({})
      expect(buildProductTypeLabelMap(undefined)).toEqual({})
    })
  })

  describe('น้ำหนักและยอดเงิน', () => {
    it('น้ำหนักไม่คูณ qty แต่ยอดเงินคูณ qty', () => {
      const { groups, totals } = buildSaleSummaryGroups([
        {
          productTypeName: 'RING',
          qty: 3,
          appraisalPrice: 100,
          materials: [gold(2), diamond(1), gem(0.5)]
        }
      ])

      expect(groups[0].goldWeight).toBe(2)
      expect(groups[0].diamondWeight).toBe(1)
      expect(groups[0].stoneWeight).toBe(0.5)
      expect(groups[0].amount).toBe(300)
      expect(totals.goldWeight).toBe(2)
      expect(totals.amount).toBe(300)
    })

    it('netWeight = (diamond + stone) / 5 + gold', () => {
      const { groups } = buildSaleSummaryGroups([
        {
          productTypeName: 'RING',
          qty: 1,
          appraisalPrice: 0,
          materials: [gold(4), diamond(3), gem(2)]
        }
      ])

      // (3 + 2) / 5 + 4 = 5
      expect(groups[0].netWeight).toBe(5)
    })

    it('รวมน้ำหนัก material ชนิดเดียวกันหลายรายการในสินค้าเดียว', () => {
      const { groups } = buildSaleSummaryGroups([
        {
          productTypeName: 'RING',
          qty: 1,
          appraisalPrice: 0,
          materials: [gold(1), gold(2), diamond(0.25), diamond(0.75)]
        }
      ])

      expect(groups[0].goldWeight).toBe(3)
      expect(groups[0].diamondWeight).toBe(1)
    })

    it('หัก discountPercent และหารด้วย divisor', () => {
      const { groups } = buildSaleSummaryGroups(
        [{ productTypeName: 'RING', qty: 2, appraisalPrice: 3300, discountPercent: 10 }],
        { divisor: 33 }
      )

      // 3300 * 0.9 / 33 * 2 = 180
      expect(groups[0].amount).toBeCloseTo(180, 6)
    })

    it('divisor = 0 หรือไม่ส่ง → ใช้ 1', () => {
      const items = [{ productTypeName: 'RING', qty: 1, appraisalPrice: 500 }]

      expect(buildSaleSummaryGroups(items).groups[0].amount).toBe(500)
      expect(buildSaleSummaryGroups(items, { divisor: 0 }).groups[0].amount).toBe(500)
    })

    it('materials ว่าง / ไม่ใช่ array / ไม่มี → น้ำหนักเป็น 0', () => {
      const { groups, totals } = buildSaleSummaryGroups([
        { productTypeName: 'RING', qty: 1, appraisalPrice: 100 },
        { productTypeName: 'RING', qty: 1, appraisalPrice: 100, materials: [] },
        { productTypeName: 'RING', qty: 1, appraisalPrice: 100, materials: null },
        { productTypeName: 'RING', qty: 1, appraisalPrice: 100, materials: 'x' }
      ])

      expect(groups[0].goldWeight).toBe(0)
      expect(groups[0].diamondWeight).toBe(0)
      expect(groups[0].stoneWeight).toBe(0)
      expect(groups[0].netWeight).toBe(0)
      expect(totals.amount).toBe(400)
    })

    it('ค่าที่ไม่ใช่ตัวเลข → ถือเป็น 0', () => {
      const { groups } = buildSaleSummaryGroups([
        {
          productTypeName: 'RING',
          qty: null,
          appraisalPrice: 'abc',
          materials: [{ type: 'Gold', weight: 'x' }]
        }
      ])

      expect(groups[0].qty).toBe(0)
      expect(groups[0].amount).toBe(0)
      expect(groups[0].goldWeight).toBe(0)
    })
  })

  describe('totals', () => {
    it('รวมทุกกลุ่มเข้าด้วยกัน', () => {
      const { totals } = buildSaleSummaryGroups([
        { productTypeName: 'RING', qty: 1, appraisalPrice: 100, materials: [gold(2)] },
        { productTypeName: 'EARRING', qty: 2, appraisalPrice: 50, materials: [gold(1), gem(5)] }
      ])

      expect(totals.qty).toBe(3)
      expect(totals.goldWeight).toBe(3)
      expect(totals.stoneWeight).toBe(5)
      expect(totals.netWeight).toBe(4)
      expect(totals.amount).toBe(200)
    })

    it('items ว่าง / ไม่ใช่ array → groups ว่างและ totals เป็น 0', () => {
      expect(buildSaleSummaryGroups([]).groups).toEqual([])
      expect(buildSaleSummaryGroups(null).totals).toEqual({
        qty: 0,
        netWeight: 0,
        goldWeight: 0,
        stoneWeight: 0,
        diamondWeight: 0,
        amount: 0
      })
    })
  })
})
