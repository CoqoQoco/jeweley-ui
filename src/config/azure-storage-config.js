// Azure Blob Storage Configuration
// สำหรับเรียก image โดยตรงจาก Azure Blob Storage

// Azure Storage Account Configuration
const AZURE_STORAGE_ACCOUNT = 'youraccountname' // เปลี่ยนเป็น account name จริง
const AZURE_CONTAINER_NAME = 'jewelry-images'

// สร้าง base URL สำหรับ Azure Blob Storage
// Pattern: https://{account}.blob.core.windows.net/{container}/{blobPath}
const AZURE_BLOB_BASE_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}`

/**
 * สร้าง URL สำหรับดึง image จาก Azure Blob Storage
 * @param {string} blobPath - Path ของ blob เช่น "Mold/ABC-001-Mold.png"
 * @returns {string} - Full URL ของ blob
 */
export const getAzureBlobUrl = (blobPath) => {
  if (!blobPath) return ''

  // ลบ slash ที่ขึ้นต้น (ถ้ามี)
  const cleanPath = blobPath.startsWith('/') ? blobPath.substring(1) : blobPath

  return `${AZURE_BLOB_BASE_URL}/${cleanPath}`
}

/**
 * ตรวจสอบว่า path เป็น Azure Blob path หรือไม่
 * @param {string} path - Path ที่ต้องการตรวจสอบ
 * @returns {boolean}
 */
export const isAzureBlobPath = (path) => {
  if (!path) return false

  // Azure Blob path จะมี format: "FolderName/filename.ext"
  // ไม่ขึ้นต้นด้วย http:// หรือ https://
  // ไม่ขึ้นต้นด้วย data:image
  return !path.startsWith('http') &&
         !path.startsWith('data:') &&
         path.includes('/')
}

/**
 * Virtual folders ใน jewelry-images container
 */
export const AZURE_FOLDERS = {
  USER: 'User',
  STOCK: 'Stock',
  MOLD: 'Mold',
  PAYMENT: 'Payment',
  PRODUCTION_PLAN: 'ProductionPlan',
  MOLD_PLAN_DESIGN: 'MoldPlanDesign',
  MOLD_PLAN_RESIN: 'MoldPlanResin',
  MOLD_PLAN_CASTING_SILVER: 'MoldPlanCastingSilver',
  MOLD_PLAN_CASTING: 'MoldPlanCasting',
  MOLD_PLAN_CUTTING: 'MoldPlanCutting'
}

export default {
  AZURE_STORAGE_ACCOUNT,
  AZURE_CONTAINER_NAME,
  AZURE_BLOB_BASE_URL,
  AZURE_FOLDERS,
  getAzureBlobUrl,
  isAzureBlobPath
}
