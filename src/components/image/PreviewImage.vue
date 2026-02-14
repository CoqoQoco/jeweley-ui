<template>
  <azure-blob-image
    :blob-path="imagePath"
    :width="width"
    :height="height"
    :border-show="borderShow"
    :preview="true"
    :alt="alt"
    :show-placeholder="true"
  />
</template>

<script>
import AzureBlobImage from '@/components/prime-vue/azure-blob-image.vue'

/**
 * PreviewImage - Component สำหรับแสดง image จาก Azure Blob Storage
 *
 * รองรับทั้ง:
 * 1. Azure Blob path จาก database (แนะนำ) - เช่น "Mold/ABC-001-Mold.png"
 * 2. imageName กับ type (backward compatible สำหรับ code เดิม)
 *
 * @example
 * // วิธีใหม่ - ส่ง blob path โดยตรง (แนะนำ)
 * <preview-image image-name="Mold/ABC-001-Mold.png" :width="150" :height="150" />
 *
 * // วิธีเดิม - ใช้ type และ imageName (backward compatible)
 * <preview-image type="MOLD" image-name="ABC-001" :width="150" :height="150" />
 */
export default {
  name: 'PreviewImage',
  components: {
    AzureBlobImage
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
    // Alt text สำหรับ accessibility
    alt: {
      type: String,
      default: 'Preview Image'
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
    }
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss" scoped>
// ไม่ต้องมี style เพราะใช้ style จาก azure-blob-image component
</style>
