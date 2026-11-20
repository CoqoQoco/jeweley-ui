import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import GrReportExpand from './gr-report-expand.vue'

const baseRow = {
  stockNumber: 'DK20H015',
  receiptNumber: 'GR1',
  productNumber: 'P-001',
  productNameTh: 'แหวน',
  productNameEn: 'Ring',
  status: 'IN_STOCK',
  location: 'A1',
  mold: 'M1',
  productionType: 'YG',
  vendor: 'V1',
  poNumber: 'PO9',
  createBy: 'tester',
  remark: 'note',
  imagePath: 'img/p.jpg',
  qty: 2,
  productPrice: 1234.5,
  goldWeight: 3.5,
  diamondQty: 4,
  diamondWeight: 0.5,
  rubyQty: 1,
  rubyWeight: 0.1,
  sapphireQty: 2,
  sapphireWeight: 0.2,
  emeraldQty: 0,
  emeraldWeight: 0,
  otherQty: 1,
  otherWeight: 0.05,
  materials: [{ type: 'Diamond', typeCode: 'VS', qty: 4, weight: 0.5, price: 100 }]
}

const stubs = {
  SectionCardGeneric: { props: ['title'], template: '<section><h4>{{ title }}</h4><slot /></section>' },
  imagePreview: { template: '<img class="img-stub" />' },
  materialTable: { props: ['items', 'variant'], template: '<div class="mat-stub">{{ items.length }}|{{ variant }}</div>' }
}

function factory(row, mode = 'production') {
  return mount(GrReportExpand, {
    props: { row, mode },
    global: {
      stubs,
      mocks: {
        $t: (key, params) => (params ? `${key}:${params.count}` : key),
        $router: { resolve: vi.fn(() => ({ href: '/stock-product-detail/DK20H015' })) }
      }
    }
  })
}

describe('gr-report-expand', () => {
  it('renders product, materials (full variant) and summary', () => {
    const w = factory(baseRow)
    expect(w.text()).toContain('P-001')
    expect(w.find('.img-stub').exists()).toBe(true)
    expect(w.find('.mat-stub').text()).toBe('1|full')
    expect(w.text()).toContain('expandMaterialsTitle:1')
    expect(w.text()).toContain('3.50 view.receiptStock.product.reportGr.expandGram')
    expect(w.text()).toContain('view.stock.product.inStock')
    expect(w.text()).toContain('4 · 0.500')
    expect(w.text()).toContain('4 · 0.350')
    expect(w.text()).toContain('1,234.50')
    expect(w.find('a.detail-link').attributes('href')).toBe('/stock-product-detail/DK20H015')
  })

  it('shows vendor/PO only in outsource mode', () => {
    expect(factory(baseRow, 'outsource').text()).toContain('V1 / PO9')
    expect(factory(baseRow, 'production').text()).not.toContain('V1 / PO9')
  })

  it('falls back to raw status when unknown', () => {
    expect(factory({ ...baseRow, status: 'WEIRD' }).text()).toContain('WEIRD')
  })

  it('handles empty materials and missing image', () => {
    const w = factory({ ...baseRow, materials: null, imagePath: '' })
    expect(w.find('.mat-stub').text()).toBe('0|full')
    expect(w.find('.img-stub').exists()).toBe(false)
    expect(w.find('.image-empty').exists()).toBe(true)
  })
})
