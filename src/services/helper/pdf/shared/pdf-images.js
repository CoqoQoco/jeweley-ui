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

export async function prepareItemImages(items) {
  if (!items || !Array.isArray(items)) return

  const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

  await Promise.all(
    items.map(async (item) => {
      if (item.imageBase64) return

      const blobPath = item.imageBlobPath || item.imagePath
      if (!blobPath) return

      try {
        const base64Image = await getAzureBlobAsBase64(blobPath, 'stock')
        if (base64Image && base64Image.length > 0) {
          item.imageBase64 = base64Image
        }
      } catch (error) {
        console.error('Error loading image:', blobPath, error)
      }
    })
  )
}
