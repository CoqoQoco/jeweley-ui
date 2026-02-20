// Azure Blob Storage Configuration
// สำหรับเรียก image โดยตรงจาก Azure Blob Storage

// Azure Storage Account Configuration
const AZURE_STORAGE_ACCOUNT = 'jewelrystore' // เปลี่ยนเป็น account name จริง
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
 * ดึงรูปจาก Azure Blob Storage และแปลงเป็น Base64 dataURL
 * สำหรับใช้กับ pdfMake ที่ต้องการ Base64 เท่านั้น
 *
 * NOTE: ใช้ API backend เป็นตัวกลางเพื่อหลีก CORS issue
 *
 * @param {string} blobPath - Path ของ blob เช่น "Mold/ABC-001-Mold.png" หรือ "User/admin-1.png"
 * @param {string} imageType - ประเภทของรูป 'mold', 'plan', 'user' (default: 'mold')
 * @returns {Promise<string>} - Base64 dataURL เช่น "data:image/png;base64,..."
 */
export const getAzureBlobAsBase64 = async (blobPath, imageType = 'mold') => {
  if (!blobPath) return ''

  try {
    // Import api helper (dynamic import to avoid circular dependency)
    const { default: api } = await import('@/axios/axios-helper.js')

    // แยกชื่อไฟล์ออกจาก path
    // เช่น "Mold/ABC-001-Mold.png" -> "ABC-001-Mold.png"
    const fileName = blobPath.includes('/') ? blobPath.split('/').pop() : blobPath

    // เรียก API backend เพื่อดึงรูป (backend จะดึงจาก Azure Blob)
    let base64String = ''

    if (imageType === 'mold' || blobPath.startsWith('Mold/')) {
      // ดึงรูป Mold
      const res = await api.jewelry.get('FileExtension/GetMoldImage', {
        imageName: fileName
      })
      if (res) {
        base64String = `data:image/png;base64,${res}`
      }
    } else if (imageType === 'plan' || blobPath.startsWith('ProductionPlan/')) {
      // ดึงรูป Production Plan
      const res = await api.jewelry.get('FileExtension/GetPlanImage', {
        imageName: fileName
      })
      if (res) {
        base64String = `data:image/png;base64,${res}`
      }
    } else if (imageType === 'stock' || blobPath.startsWith('Stock/')) {
      // ดึงรูป Stock Product
      const res = await api.jewelry.get('FileExtension/GetStockProductImage', {
        imageName: fileName
      })
      if (res) {
        base64String = `data:image/png;base64,${res}`
      }
    } else if (imageType === 'user' || blobPath.startsWith('User/')) {
      // ดึงรูป User Profile
      const res = await api.jewelry.get('FileExtension/GetImage', {
        imageName: fileName,
        path: 'User/Profile' // ระบุ path สำหรับ user profile
      })
      if (res) {
        base64String = `data:image/png;base64,${res}`
      }
    } else {
      console.warn('Unknown image type for blob path:', blobPath)
      return ''
    }

    return base64String
  } catch (error) {
    console.error('Error converting Azure Blob to Base64:', error)
    return ''
  }
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
  isAzureBlobPath,
  getAzureBlobAsBase64
}
