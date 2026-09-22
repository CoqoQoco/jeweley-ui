// imageCompressor.js

/**
 * บีบอัดรูปภาพให้มีขนาดไม่เกิน 300 KB แต่คงความคมชัดสูงสุด
 * @param {File} file - ไฟล์รูปภาพที่ต้องการบีบอัด
 * @returns {Promise<File>} - ไฟล์รูปภาพที่ถูกบีบอัดแล้ว
 */
const compressOptimalImage = async (file) => {
  // ตรวจสอบว่าเป็นรูปภาพหรือไม่
  if (!file.type.match(/image.*/)) return file

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      const image = new Image()
      image.onload = () => {
        // เริ่มด้วยคุณภาพและขนาดสูง
        let quality = 0.9
        let maxDimension = 1500 // ขนาดเริ่มต้นที่ใหญ่พอสำหรับภาพคมชัด
        let currentWidth = image.width
        let currentHeight = image.height

        // รักษาสัดส่วนภาพ
        if (currentWidth > currentHeight) {
          if (currentWidth > maxDimension) {
            currentHeight = Math.round((currentHeight * maxDimension) / currentWidth)
            currentWidth = maxDimension
          }
        } else {
          if (currentHeight > maxDimension) {
            currentWidth = Math.round((currentWidth * maxDimension) / currentHeight)
            currentHeight = maxDimension
          }
        }

        // สร้าง canvas และวาดภาพ
        const canvas = document.createElement('canvas')
        canvas.width = currentWidth
        canvas.height = currentHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, currentWidth, currentHeight)

        // ฟังก์ชันสำหรับทดลองบีบอัดด้วยคุณภาพต่างๆ
        const tryCompression = (attemptQuality) => {
          canvas.toBlob(
            (blob) => {
              // ตรวจสอบขนาดไฟล์
              if (blob.size <= 307200) {
                // 300 KB = 307,200 bytes
                // ได้ขนาดที่ต้องการแล้ว สร้าง File object
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: new Date().getTime()
                })
                resolve(compressedFile)
              } else if (attemptQuality > 0.5) {
                // ยังใหญ่เกินไป ลดคุณภาพลงอีก
                tryCompression(attemptQuality - 0.1)
              } else {
                // ถ้าคุณภาพต่ำมากแล้วยังใหญ่เกินไป ลดขนาดภาพลง
                maxDimension = Math.round(maxDimension * 0.8)

                // คำนวณขนาดใหม่
                if (image.width > image.height) {
                  currentHeight = Math.round((image.height * maxDimension) / image.width)
                  currentWidth = maxDimension
                } else {
                  currentWidth = Math.round((image.width * maxDimension) / image.height)
                  currentHeight = maxDimension
                }

                // วาดภาพใหม่ด้วยขนาดที่เล็กลง
                canvas.width = currentWidth
                canvas.height = currentHeight
                ctx.drawImage(image, 0, 0, currentWidth, currentHeight)

                // ลองบีบอัดอีกครั้งด้วยคุณภาพสูง
                tryCompression(0.9)
              }
            },
            'image/jpeg',
            attemptQuality
          )
        }

        // เริ่มกระบวนการบีบอัด
        tryCompression(quality)
      }
      image.src = readerEvent.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * บีบอัดรูปภาพหลายไฟล์
 * @param {FileList|File[]} files - ไฟล์รูปภาพหลายไฟล์ที่ต้องการบีบอัด
 * @returns {Promise<File[]>} - อาร์เรย์ของไฟล์รูปภาพที่ถูกบีบอัดแล้ว
 */
const compressMultipleImages = async (files) => {
  const fileArray = Array.from(files)
  return Promise.all(fileArray.map((file) => compressOptimalImage(file)))
}

/**
 * บีบอัดรูปภาพให้มีขนาดไม่เกินที่กำหนด
 * @param {File} file - ไฟล์รูปภาพที่ต้องการบีบอัด
 * @param {number} maxSizeKB - ขนาดสูงสุดในหน่วย KB (เช่น 300 สำหรับ 300KB)
 * @param {number} initialQuality - คุณภาพเริ่มต้น (0.1-1.0)
 * @returns {Promise<File>} - ไฟล์รูปภาพที่ถูกบีบอัดแล้ว
 */
const compressImageToMaxSize = async (file, maxSizeKB = 300, initialQuality = 0.9) => {
  if (!file.type.match(/image.*/)) return file

  const maxSizeBytes = maxSizeKB * 1024

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const image = new Image()
      image.onload = () => {
        let quality = initialQuality
        let width = image.width
        let height = image.height

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, width, height)

        const compress = (currentQuality) => {
          canvas.toBlob(
            (blob) => {
              if (blob.size <= maxSizeBytes || currentQuality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: new Date().getTime()
                })
                resolve(compressedFile)
              } else {
                compress(currentQuality - 0.1)
              }
            },
            'image/jpeg',
            currentQuality
          )
        }

        compress(quality)
      }
      image.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * บีบอัดรูปสำหรับบรรทัด "รายการรอผลิต/รอแปลง" (copy item) ในใบเสนอราคา/ใบสั่งขาย — ไม่มี endpoint
 * อัปโหลด blob สำหรับสินค้าที่ยังไม่มี stockNumber จริง จึงเก็บเป็น imageBase64 ตรงๆ ใน JSON ของเอกสาร
 * จำกัดด้านยาวสุด 800px และเป้าหมายไม่เกิน ~150KB กัน JSON เอกสารบวมเกินไป
 * @param {File} file - ไฟล์รูปภาพที่ต้องการบีบอัด
 * @returns {Promise<File>} - ไฟล์รูปภาพที่ถูกบีบอัดแล้ว
 */
const compressCopyItemImage = async (file) => {
  if (!file.type.match(/image.*/)) return file

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      const image = new Image()
      image.onload = () => {
        const maxDimension = 800
        let currentWidth = image.width
        let currentHeight = image.height

        if (currentWidth > currentHeight) {
          if (currentWidth > maxDimension) {
            currentHeight = Math.round((currentHeight * maxDimension) / currentWidth)
            currentWidth = maxDimension
          }
        } else if (currentHeight > maxDimension) {
          currentWidth = Math.round((currentWidth * maxDimension) / currentHeight)
          currentHeight = maxDimension
        }

        const canvas = document.createElement('canvas')
        canvas.width = currentWidth
        canvas.height = currentHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, currentWidth, currentHeight)

        const targetBytes = 150 * 1024

        const tryCompression = (attemptQuality) => {
          canvas.toBlob(
            (blob) => {
              if (blob.size <= targetBytes || attemptQuality <= 0.4) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: new Date().getTime()
                })
                resolve(compressedFile)
              } else {
                tryCompression(attemptQuality - 0.1)
              }
            },
            'image/jpeg',
            attemptQuality
          )
        }

        tryCompression(0.85)
      }
      image.src = readerEvent.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * decode ไฟล์รูปเป็น source ที่วาดลง canvas ได้ (ImageBitmap หรือ HTMLImageElement) พร้อมความกว้าง/สูงจริง
 * ใช้ createImageBitmap({ imageOrientation: 'from-image' }) ก่อนเสมอ — เคารพ EXIF orientation ของกล้องมือถือ
 * ไม่รองรับ/decode ไม่ได้ (เช่น HEIC บน desktop) → fallback เป็น Image element แล้วโยน error ที่อ่านง่ายถ้ายัง fail
 * @param {File} file
 * @returns {Promise<{ width: number, height: number, draw: (CanvasImageSource), close: () => void }>}
 */
const decodeImageSource = async (file) => {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { width: bitmap.width, height: bitmap.height, draw: bitmap, close: () => bitmap.close() }
    } catch {
      // ไฟล์บาง format (เช่น HEIC บน desktop) createImageBitmap ไม่รองรับ — ลอง fallback ด้านล่าง
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const image = new Image()
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight, draw: image, close: () => {} })
      image.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ กรุณาเลือกไฟล์ JPEG/PNG/WEBP อื่น'))
      image.src = event.target.result
    }
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ กรุณาเลือกไฟล์ JPEG/PNG/WEBP อื่น'))
    reader.readAsDataURL(file)
  })
}

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality))

const toJpegFileName = (name) => `${(name || 'image').replace(/\.[^./\\]+$/, '')}.jpg`

/**
 * บีบอัดรูปสำหรับ gallery ลูกค้า (StockProductGallery) — ใช้ที่หน้าจัดการรูปสินค้า (mobile)
 * กติกา: decode ตาม EXIF orientation ก่อนเสมอ, ห้าม upscale (ปฏิเสธถ้าด้านยาว < 1000px ให้ถ่ายใหม่),
 * resize ด้านยาวเหลือ min(ต้นฉบับ, 1600) คุณภาพ 0.85 แล้วถ้ายังเกิน 600KB ลดคุณภาพเหลือ 0.7
 * @param {File} file
 * @returns {Promise<{ file: File, width: number, height: number }>}
 */
const compressGalleryImage = async (file) => {
  const source = await decodeImageSource(file)
  const { width: srcWidth, height: srcHeight } = source
  const longEdge = Math.max(srcWidth, srcHeight)

  if (longEdge < 1000) {
    source.close()
    throw new Error('ภาพมีความละเอียดต่ำเกินไป (ด้านยาวต้องไม่น้อยกว่า 1000px) กรุณาถ่ายใหม่')
  }

  const targetLongEdge = Math.min(longEdge, 1600)
  const scale = targetLongEdge / longEdge
  const width = Math.round(srcWidth * scale)
  const height = Math.round(srcHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(source.draw, 0, 0, width, height)
  source.close()

  let blob = await canvasToBlob(canvas, 0.85)
  if (blob.size > 600 * 1024) {
    blob = await canvasToBlob(canvas, 0.7)
  }

  const compressedFile = new File([blob], toJpegFileName(file.name), {
    type: 'image/jpeg',
    lastModified: Date.now()
  })

  return { file: compressedFile, width, height }
}

export {
  compressOptimalImage,
  compressMultipleImages,
  compressImageToMaxSize,
  compressCopyItemImage,
  compressGalleryImage
}
