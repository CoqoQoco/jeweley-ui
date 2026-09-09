import api from '@/axios/axios-helper.js'
import { summarizeMaterials } from '@/services/utils/material-summary.js'

// ใบเสร็จเก็บแค่ stockNumber/productNumber ไม่มีวัตถุดิบมาด้วย ต้องดึงเพิ่มจาก StockProduct/List เอง
// search key ต้องเป็น 'stockNumber' (เอกพจน์) เท่านั้น — DTO ฝั่ง backend (jewelry.Model/Stock/Product/List/Request.cs)
// มีแค่ StockNumber string ไม่มี StockNumbers แบบ array ส่ง key ผิดจะถูกทิ้งเงียบๆ แล้วได้สินค้าทั้งคลังกลับมา
//
// backend ค้น StockNumber ด้วย .Contains() ไม่ใช่ exact match (ProductService.cs) — ขอ take เผื่อไว้แล้วกรอง
// เอาแถวที่ stockNumber ตรงเป๊ะจากผลลัพธ์เอง กันเลขที่ผลิตที่เป็น substring ของกันและกันปนกัน
async function fetchMaterialsFor(stockNumber) {
  try {
    const res = await api.jewelry.post(
      'StockProduct/List',
      { take: 20, skip: 0, sort: [], search: { stockNumber } },
      { skipLoading: true, skipError: true }
    )
    const match = (res?.data || []).find((p) => p?.stockNumber === stockNumber)
    return match?.materials || []
  } catch {
    return []
  }
}

// เติม materialSummary (ผล summarizeMaterials) ให้แต่ละ item ของใบเสร็จ — ยิงทีละ stockNumber ขนานกันด้วย
// Promise.all (POS ปกติขาย 1-3 ชิ้น) ล้มเหลวรายชิ้นไหนก็คืน materialSummary ว่างเงียบๆ ไม่ throw ให้ caller
// เพราะใบเสร็จต้องพิมพ์ออกได้เสมอแม้ไม่มีวัตถุดิบ
//
// StockProduct/List คืนต้นทุน (productPrice / material.price) มาด้วย — ฟังก์ชันนี้หยิบเฉพาะ materials ไปสรุปผ่าน
// summarizeMaterials() เท่านั้น ห้ามส่ง field อื่นของ response ออกไปนอกฟังก์ชันนี้เด็ดขาด
export async function fetchReceiptMaterials(items) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return list

  const materialsByItem = await Promise.all(
    list.map((item) => (item?.stockNumber ? fetchMaterialsFor(item.stockNumber) : Promise.resolve([])))
  )

  return list.map((item, idx) => ({
    ...item,
    materialSummary: summarizeMaterials(materialsByItem[idx])
  }))
}
