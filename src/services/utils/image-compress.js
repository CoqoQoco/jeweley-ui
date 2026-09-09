// บีบอัดรูปภาพฝั่ง client ก่อนอัปโหลด (resize ด้วย canvas + JPEG quality)
// กล้องมือถือได้ไฟล์ 3-5 MB ถ้าไม่บีบจะอัปช้ามากบนเน็ตมือถือ
//
// ใช้ร่วมกันโดย:
// - views/sale/invoice-detail/modal/payment-record-modal.vue (desktop)
// - views/mobile/sale/components/payment-record-sheet.vue (mobile)

/**
 * @param {File} file
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1200]
 * @param {number} [options.maxHeight=1200]
 * @param {number} [options.quality=0.7]
 * @returns {Promise<File>}
 */
export function compressImage(file, options = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert canvas to blob with compression
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = reject
    }
    reader.onerror = reject
  })
}

export default compressImage
