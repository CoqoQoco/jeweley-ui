import { formatDate } from '@/services/utils/dayjs.js'
import { initPdfMake } from '@/services/utils/pdf-make.js'

export class PrePlanOrderFormPdfBuilder {
  constructor(prePlan, items) {
    this.prePlan = prePlan
    this.items = items
    this.images = { mold: {}, product: {} }
  }

  async prepareImages() {
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    this.images = { mold: {}, product: {} }
    await Promise.all(
      this.items.map(async (item) => {
        if (item.moldCode) {
          const moldBlob = `Mold/${item.moldCode}-Mold.png`
          this.images.mold[item.moldCode] = await getAzureBlobAsBase64(moldBlob, 'mold').catch(
            () => null,
          )
        }
        if (item.productImageBlobPath) {
          this.images.product[item.productImageBlobPath] = await getAzureBlobAsBase64(
            item.productImageBlobPath,
            'preplan',
          ).catch(() => null)
        }
      }),
    )
  }

  getHeaderContent() {
    return {
      margin: [0, 0, 0, 8],
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          text: 'ใบสั่งผลิต ( ORDER FORM )',
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        {
          width: '*',
          text: this.prePlan.goldTypeLabel || this.prePlan.goldType || '',
          fontSize: 24,
          bold: true,
          color: '#921313',
          alignment: 'right',
        },
      ],
    }
  }

  buildCheckbox(checked) {
    const ops = [{ type: 'rect', x: 0, y: 2, w: 10, h: 10, lineWidth: 0.7, lineColor: '#000000' }]
    if (checked) {
      ops.push({ type: 'rect', x: 2, y: 4, w: 6, h: 6, color: '#000000' })
    }
    return { canvas: ops }
  }

  getTopFieldsContent() {
    const p = this.prePlan
    const isDomestic = p.jobLocation === 'Domestic'
    const isNewDesign = p.jobType === 'NewDesign'
    const orderNo = p.documentNo || 'DRAFT'
    const jobTypeLabel = isNewDesign ? 'งานแบบใหม่' : 'งานแก้แบบ'

    return {
      margin: [0, 0, 0, 8],
      table: {
        widths: ['*', '*'],
        body: [
          [
            {
              border: [false, false, false, false],
              stack: [
                { text: `ผู้ออกใบสั่ง: ${p.createBy || '-'}`, fontSize: 11 },
                { text: `ผู้สั่งผลิตงานขาย: ${p.salesBy || '-'}`, fontSize: 11 },
                { text: `ผู้อนุมัติ: ${p.approvedBy || '-'}`, fontSize: 11 },
                { text: 'ลายเซ็น: ____________________', fontSize: 10, margin: [0, 4, 0, 0] },
              ],
            },
            {
              border: [false, false, false, false],
              stack: [
                {
                  columns: [
                    { width: 14, stack: [this.buildCheckbox(isDomestic)] },
                    { width: 'auto', text: 'งานในประเทศ', fontSize: 11, margin: [2, 1, 10, 0] },
                    { width: 14, stack: [this.buildCheckbox(!isDomestic)] },
                    { width: 'auto', text: 'งานต่างประเทศ', fontSize: 11, margin: [2, 1, 0, 0] },
                  ],
                  columnGap: 0,
                },
                { text: `วันที่สั่ง: ${p.orderDate ? formatDate(p.orderDate) : '-'}`, fontSize: 11 },
                { text: `วันที่ส่ง: ${p.deliveryDate ? formatDate(p.deliveryDate) : '-'}`, fontSize: 11 },
              ],
            },
          ],
          [
            {
              border: [false, false, false, false],
              colSpan: 2,
              columns: [
                {
                  width: 'auto',
                  text: [
                    { text: 'ประเภทงาน: ', fontSize: 11 },
                    { text: jobTypeLabel, fontSize: 11, bold: true },
                  ],
                },
                { width: '*', text: '' },
                {
                  width: 'auto',
                  text: `ORDER NO: ${orderNo}`,
                  fontSize: 11,
                  bold: true,
                },
              ],
            },
            {},
          ],
        ],
      },
      layout: {
        defaultBorder: false,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
    }
  }

  buildMaterialRows(materials) {
    const headerRow = [
      { text: 'Gem', style: 'tableHeader' },
      { text: 'Gem Shape', style: 'tableHeader' },
      { text: 'Gem Size', style: 'tableHeader' },
      { text: 'Diamond Size', style: 'tableHeader' },
      { text: 'Gold', style: 'tableHeader' },
      { text: 'Gold Qty', style: 'tableHeader' },
    ]
    const rows = [headerRow]

    const codeOf = (v) => {
      if (v == null || v === '') return '-'
      if (typeof v === 'object') return v.code || v.description || '-'
      return String(v)
    }

    for (const m of materials) {
      rows.push([
        codeOf(m.gem),
        codeOf(m.gemShape),
        m.gemSize || '-',
        m.diamondSize || '-',
        codeOf(m.gold),
        m.goldQty != null ? String(m.goldQty) : '-',
      ])
    }

    return rows
  }

  buildGoldUsageSummary(materials) {
    const totals = {}
    for (const m of (materials || [])) {
      const code = m.gold && typeof m.gold === 'object'
        ? (m.gold.code || m.gold.description || '')
        : (m.gold || '')
      const key = String(code).trim()
      if (!key) continue
      const qty = Number(m.goldQty)
      if (!Number.isFinite(qty)) continue
      totals[key] = (totals[key] || 0) + qty
    }
    const keys = Object.keys(totals).sort()
    if (keys.length === 0) return '-'
    return keys.map((k) => `${k}: ${totals[k]}`).join(' / ')
  }

  getItemBlock(item) {
    const moldImage = item.moldCode ? this.images.mold[item.moldCode] : null
    const productImage = item.productImageBlobPath
      ? this.images.product[item.productImageBlobPath]
      : null
    const materialRows = this.buildMaterialRows(item.materials || [])
    const qtyText = `จำนวนที่สั่ง: ${item.productQty || '-'} ${item.productQtyUnit || ''}`
    const detailText = item.productDetail ? `รายละเอียดสินค้า: ${item.productDetail}` : 'รายละเอียดสินค้า: -'

    const moldImageNode = moldImage
      ? { image: moldImage, width: 70, height: 70, alignment: 'center' }
      : {
          canvas: [{ type: 'rect', x: 0, y: 0, w: 70, h: 70, lineWidth: 0.5, lineColor: '#cccccc' }],
        }

    const productImageNode = productImage
      ? { image: productImage, width: 70, height: 70, alignment: 'center' }
      : {
          canvas: [{ type: 'rect', x: 0, y: 0, w: 70, h: 70, lineWidth: 0.5, lineColor: '#cccccc' }],
        }

    const moldImageCell = {
      margin: [4, 4, 4, 4],
      stack: [
        moldImageNode,
        {
          text: item.moldCode || '-',
          alignment: 'center',
          bold: true,
          fontSize: 9,
          margin: [0, 3, 0, 0],
        },
      ],
    }

    const productImageCell = {
      margin: [4, 4, 4, 4],
      stack: [productImageNode],
    }

    const moldDetailQtyCell = {
      colSpan: 2,
      margin: [6, 4, 6, 4],
      columns: [
        {
          width: '*',
          text: `${item.moldDetail || '-'}`,
          fontSize: 10,
          bold: true,
          color: '#444444',
        },
        {
          width: 'auto',
          text: qtyText,
          fontSize: 10,
          bold: true,
          margin: [10, 0, 0, 0],
        },
      ],
    }

    const bowlCell = {
      colSpan: 2,
      margin: [6, 4, 6, 4],
      columns: [
        { width: '*', text: 'WG เบ้าที่: ___', fontSize: 10 },
        { width: '*', text: 'YG เบ้าที่: ___', fontSize: 10 },
      ],
    }

    const productDetailCell = {
      margin: [6, 4, 6, 4],
      text: detailText,
      fontSize: 10,
    }

    const materialTable = {
      rowSpan: 2,
      stack: [
        {
          table: {
            headerRows: 1,
            widths: [35, 45, '*', 55, 35, 35],
            body: materialRows,
            dontBreakRows: true,
          },
          layout: {
            hLineWidth: (i) => (i === 0 || i === 1 ? 0.5 : 0.3),
            vLineWidth: () => 0.3,
            hLineColor: () => '#aaaaaa',
            vLineColor: () => '#aaaaaa',
            fillColor: (rowIndex) => (rowIndex === 0 ? '#f2f2f2' : null),
            paddingLeft: () => 3,
            paddingRight: () => 3,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
          fontSize: 10,
        },
      ],
    }

    const goldUsageCell = {
      colSpan: 3,
      margin: [6, 4, 6, 4],
      text: [
        { text: 'สรุปการใช้ทอง: ', fontSize: 10, bold: true },
        { text: this.buildGoldUsageSummary(item.materials || []), fontSize: 10 },
      ],
    }

    return {
      stack: [
        {
          margin: [0, 0, 0, 0],
          table: {
            widths: [80, 80, '*'],
            body: [
              [moldImageCell, productImageCell, materialTable],
              [moldDetailQtyCell, {}, {}],
              [goldUsageCell, {}, {}],
              [bowlCell, {}, productDetailCell],
            ],
            dontBreakRows: false,
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#888888',
            vLineColor: () => '#888888',
          },
        },
      ],
      unbreakable: true,
      margin: [0, 0, 0, 8],
    }
  }

  getDocDefinition() {
    const contentBlocks = []
    contentBlocks.push(this.getHeaderContent())
    contentBlocks.push(this.getTopFieldsContent())

    this.items.forEach((item) => {
      contentBlocks.push(this.getItemBlock(item))
    })

    return {
      pageSize: 'A4',
      pageMargins: [15, 15, 15, 15],
      content: contentBlocks,
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 11,
      },
      styles: {
        tableHeader: {
          fillColor: '#f2f2f2',
          bold: true,
          alignment: 'center',
          fontSize: 10,
        },
        title: { fontSize: 9, color: '#666666' },
        desc: { fontSize: 11, bold: true },
      },
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
