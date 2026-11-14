// ป้ายสถานะชิ้นสินค้า
// - ระดับล็อต (ไม่มี unitId): key เดียวกับหน้าคลังสินค้า view.stock.product.*
// - ระดับชิ้น (มี unitId): key ของหน้าติดตามผูกแท็ก view.stock.stockRfidTracking.unit*
const LOT_KEYS = {
  IN_STOCK: 'view.stock.product.inStock',
  RESERVED: 'view.stock.product.reserved',
  SOLD: 'view.stock.product.sold'
}

const UNIT_KEYS = {
  IN_STOCK: 'view.stock.stockRfidTracking.unitInStock',
  RESERVED: 'view.stock.stockRfidTracking.unitReserved',
  SOLD: 'view.stock.stockRfidTracking.unitSold'
}

function hasUnit(piece) {
  return piece?.unitId !== undefined && piece?.unitId !== null
}

// สถานะ/คลังที่แสดง: มี unitId ใช้ของระดับชิ้นก่อน (ตกกลับเป็นของล็อตถ้าไม่มี)
export function pieceDisplay(piece) {
  if (!piece) return { status: '', locationCode: '', isUnit: false }
  const isUnit = hasUnit(piece)
  return {
    isUnit,
    status: (isUnit && piece.unitStatus) || piece.status || '',
    locationCode: (isUnit && piece.unitLocationCode) || piece.locationCode || ''
  }
}

export function pieceStatusLabel(piece, t) {
  const { status, isUnit } = pieceDisplay(piece)
  const key = (isUnit ? UNIT_KEYS : LOT_KEYS)[status]
  return key ? t(key) : status
}

// ชิ้นที่ระบบบันทึกว่าขายแล้ว (สถานะที่แสดงเป็น SOLD หรือแท็กผูกกับชิ้นที่ขายไปแล้ว)
export function isSoldPiece(piece) {
  return !!piece && (!!piece.soldMismatch || pieceDisplay(piece).status === 'SOLD')
}
