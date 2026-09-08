import { getCompanyLogoUrl } from '@/config/company-info.js'

export async function loadImageAsBase64(path) {
  try {
    const response = await fetch(path)
    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error loading image:', error)
    return null
  }
}

export async function loadCompanyLogo() {
  const logoPath = getCompanyLogoUrl()
  return loadImageAsBase64(logoPath)
}

// legacy bulk upload เขียน blob ชื่อไฟล์ตัวพิมพ์ใหญ่ปนกันไว้เยอะ (Azure blob name case-sensitive)
// สร้างรายชื่อไฟล์ที่เป็นไปได้ไว้ไล่ลองทีละตัวเมื่อชื่อจาก DB ยิงพลาด
export function stockImageNameVariants(blobPath) {
  if (!blobPath) return []

  const fileName = blobPath.includes('/') ? blobPath.split('/').pop() : blobPath
  const lastDot = fileName.lastIndexOf('.')
  const base = lastDot > -1 ? fileName.slice(0, lastDot) : fileName

  const candidates = [fileName, `${base.toUpperCase()}.JPG`, `${base}.JPG`, `${base}.jpg`, `${base}.png`]

  return [...new Set(candidates)]
}

export async function prepareItemImages(items) {
  if (!items || !Array.isArray(items)) return

  const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

  await Promise.all(
    items.map(async (item) => {
      if (item.imageBase64) return

      const blobPath = item.imageBlobPath || item.imagePath
      if (!blobPath) return

      try {
        const variants = stockImageNameVariants(blobPath)
        for (const variant of variants) {
          const base64Image = await getAzureBlobAsBase64(variant, 'stock')
          if (base64Image && base64Image.length > 0) {
            item.imageBase64 = base64Image
            break
          }
        }
      } catch (error) {
        console.error('Error loading image:', blobPath, error)
      }
    })
  )
}
