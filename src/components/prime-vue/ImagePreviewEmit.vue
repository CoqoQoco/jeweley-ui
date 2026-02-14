<template>
  <div>
    <Image
      v-if="imageUrl"
      :src="imageUrl"
      :alt="alt"
      :width="width"
      :height="height"
      :preview="preview"
      :style="imageStyle"
    />
    <div v-else-if="isLoading" :style="loadingStyle">
      <i class="bi bi-hourglass-split"></i>
    </div>
    <div v-else :style="placeholderStyle">
      <i class="bi bi-image"></i>
    </div>
  </div>
</template>

<script>
import Image from 'primevue/image'
import { getAzureBlobAsBase64 } from '@/config/azure-storage-config.js'

/**
 * ImagePreviewEmit - Component สำหรับแสดง image จาก Azure Blob Storage
 * พร้อม emit ข้อมูล blob path กลับไปให้ parent component
 *
 * รองรับทั้ง:
 * 1. Azure Blob path จาก database (แนะนำ) - เช่น "Mold/ABC-001-Mold.png"
 * 2. imageName กับ type (backward compatible สำหรับ code เดิม)
 *
 * @example
 * // วิธีใหม่ - ส่ง blob path โดยตรง (แนะนำ)
 * <image-preview-emit
 *   image-name="Mold/ABC-001-Mold.png"
 *   :width="150"
 *   :height="150"
 *   @image-loaded="handleImageLoaded"
 * />
 *
 * // วิธีเดิม - ใช้ type และ imageName (backward compatible)
 * <image-preview-emit
 *   type="MOLD"
 *   image-name="ABC-001"
 *   :width="150"
 *   :height="150"
 *   @image-loaded="handleImageLoaded"
 * />
 *
 * // Event payload:
 * {
 *   blobPath: "Mold/ABC-001-Mold.png",  // Blob path for Azure Storage
 *   imageName: "ABC-001",                // Original image name
 *   path: "",                            // Original path (if provided)
 *   type: "MOLD"                         // Original type (if provided)
 * }
 */
export default {
  name: 'ImagePreviewEmit',
  components: {
    Image
  },
  props: {
    // ชื่อ image หรือ blob path
    imageName: {
      type: String,
      required: true,
      default: ''
    },
    // Path สำหรับ type='PATH' (deprecated - ใช้ imageName โดยตรงแทน)
    path: {
      type: String,
      default: ''
    },
    // Type ของ image สำหรับ backward compatibility
    // ถ้าไม่ระบุ จะถือว่า imageName เป็น blob path โดยตรง
    type: {
      type: String,
      default: ''
    },
    // ความกว้างของ image
    width: {
      type: Number,
      default: 60
    },
    // ความสูงของ image
    height: {
      type: Number,
      default: 60
    },
    // แสดง border รอบ image หรือไม่
    borderShow: {
      type: Boolean,
      default: true
    },
    // เปิดใช้งาน preview (zoom) หรือไม่
    preview: {
      type: Boolean,
      default: true
    },
    // Alt text สำหรับ accessibility
    alt: {
      type: String,
      default: 'Preview Image'
    },
    // เปิดใช้งาน emit ข้อมูลรูปภาพหรือไม่
    emitImage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      imageUrl: null,
      isLoading: false
    }
  },
  computed: {
    /**
     * แปลง imageName และ type เป็น blob path
     * @returns {string} - Blob path สำหรับใช้กับ Azure Blob Storage
     */
    imagePath() {
      // ถ้าไม่มี imageName ให้ return empty string
      if (!this.imageName) return ''

      // ถ้า imageName เป็น blob path อยู่แล้ว (มี "/" อยู่ใน path)
      // หรือไม่มี type ให้ return imageName โดยตรง
      if (!this.type || this.imageName.includes('/')) {
        return this.imageName
      }

      // สร้าง blob path จาก type และ imageName (backward compatible)
      return this.buildBlobPathFromType()
    },
    /**
     * สร้าง style object สำหรับ image
     * @returns {object} - Style object
     */
    imageStyle() {
      return {
        border: this.borderShow ? '1px solid var(--base-color)' : 'none',
        borderRadius: '8px',
        objectFit: 'contain'
      }
    },
    /**
     * สร้าง style object สำหรับ loading placeholder
     * @returns {object} - Style object
     */
    loadingStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: this.borderShow ? '1px solid var(--base-color)' : 'none',
        borderRadius: '8px',
        backgroundColor: '#f0f0f0',
        color: '#999'
      }
    },
    /**
     * สร้าง style object สำหรับ placeholder
     * @returns {object} - Style object
     */
    placeholderStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: this.borderShow ? '1px solid var(--base-color)' : 'none',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        color: '#ccc'
      }
    }
  },
  watch: {
    /**
     * Watch imagePath และโหลดรูปภาพเมื่อมีการเปลี่ยนแปลง
     */
    imagePath: {
      handler(newPath) {
        if (newPath) {
          this.loadImage()
        } else {
          this.imageUrl = null
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.imagePath) {
      this.loadImage()
    }
  },
  methods: {
    /**
     * โหลดรูปภาพจาก Azure Blob Storage แบบ async
     */
    async loadImage() {
      if (!this.imagePath) {
        this.imageUrl = null
        return
      }

      try {
        this.isLoading = true

        // โหลดรูปภาพเป็น Base64 ผ่าน API proxy
        const base64Image = await getAzureBlobAsBase64(this.imagePath)

        if (base64Image && base64Image.length > 0) {
          this.imageUrl = base64Image

          // Emit ข้อมูลรูปภาพถ้าเปิดใช้งาน
          if (this.emitImage) {
            this.emitImageData()
          }
        } else {
          console.warn('No image found for blob path:', this.imagePath)
          this.imageUrl = null
        }
      } catch (error) {
        console.error('Error loading image:', error)
        this.imageUrl = null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * สร้าง blob path จาก type และ imageName สำหรับ backward compatibility
     * @returns {string} - Blob path
     */
    buildBlobPathFromType() {
      const cleanImageName = this.imageName.trim()

      switch (this.type) {
        case 'MOLD':
          // MOLD type: "Mold/{imageName}-Mold.png"
          return `Mold/${cleanImageName}-Mold.png`

        case 'PLANMOLD':
        case 'PLANMOLDDESIGN':
          // PLANMOLD type: "MoldPlanDesign/{imageName}"
          return `MoldPlanDesign/${cleanImageName}`

        case 'PLANMOLDRESIN':
          // PLANMOLDRESIN type: "MoldPlanResin/{imageName}"
          return `MoldPlanResin/${cleanImageName}`

        case 'PLANMOLDCASTINGSILVER':
          // PLANMOLDCASTINGSILVER type: "MoldPlanCastingSilver/{imageName}"
          return `MoldPlanCastingSilver/${cleanImageName}`

        case 'PLANMOLDCASTING':
          // PLANMOLDCASTING type: "MoldPlanCasting/{imageName}"
          return `MoldPlanCasting/${cleanImageName}`

        case 'PLANMOLDCUTTING':
          // PLANMOLDCUTTING type: "MoldPlanCutting/{imageName}"
          return `MoldPlanCutting/${cleanImageName}`

        case 'ORDERPLAN':
        case 'PRODUCTIONPLAN':
          // ORDERPLAN/PRODUCTIONPLAN type: "ProductionPlan/{imageName}"
          return `ProductionPlan/${cleanImageName}`

        case 'STOCK':
        case 'STOCK-PRODUCT':
          // STOCK type: "Stock/{imageName}"
          // ถ้ามี path ให้ใช้ path แทน imageName
          return this.path ? `Stock/${this.path}` : `Stock/${cleanImageName}`

        case 'USER':
          // USER type: "User/{imageName}"
          return `User/${cleanImageName}`

        case 'PAYMENT':
          // PAYMENT type: "Payment/{imageName}"
          return `Payment/${cleanImageName}`

        case 'PATH':
          // PATH type: ใช้ path ที่ระบุมา
          return this.path ? `${this.path}/${cleanImageName}` : cleanImageName

        default:
          // ถ้าไม่ตรงกับ type ไหน ให้ return imageName โดยตรง
          console.warn(`Unknown image type: ${this.type}. Using imageName directly.`)
          return cleanImageName
      }
    },

    /**
     * Emit ข้อมูลรูปภาพกลับไปให้ parent component
     * แทนที่จะ emit base64 ให้ emit blobPath แทน (เนื่องจากใช้ Azure Blob Storage)
     */
    emitImageData() {
      this.$emit('image-loaded', {
        blobPath: this.imagePath, // Blob path สำหรับ Azure Storage
        imageName: this.imageName, // Original image name
        path: this.path, // Original path (ถ้ามี)
        type: this.type // Original type (ถ้ามี)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// ไม่ต้องมี style เพราะใช้ style จาก azure-blob-image component
</style>
