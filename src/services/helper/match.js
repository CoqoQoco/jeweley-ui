const calculateWeightDifference = (weightSend, weightReceived) => {
  // คำนวณผลต่างของน้ำหนัก
  const difference = weightReceived - weightSend

  // กำหนดค่าที่ใช้ในการหาร
  let divide = weightSend > 0 ? weightSend : 1  

  // คำนวณเปอร์เซ็นต์
  const percentage = (Math.abs(difference) / divide) * 100

  // กำหนดสถานะ (ขาด/เกิน)
  const status = difference < 0 ? 'ขาด' : 'เกิน'

  // สร้างเครื่องหมาย +/-
  const sign = difference >= 0 ? '+' : '-'

  // color
  const color = difference >= 0 ? '#038387' : '#ff4d4d'

  // Return ผลลัพธ์
  return {
    difference: `${sign}${Math.abs(difference).toFixed(2)}`,
    percentage: `${percentage.toFixed(2)}%`,
    status: status,
    style: `color: ${color};`
  }
}

export { calculateWeightDifference }
