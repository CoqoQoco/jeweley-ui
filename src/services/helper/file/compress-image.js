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

export { compressOptimalImage, compressMultipleImages, compressImageToMaxSize }
