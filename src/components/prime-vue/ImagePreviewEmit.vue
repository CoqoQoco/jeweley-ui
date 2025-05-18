<template>
  <div class="image-container">
    <!-- <img class="image-preview" :src="urlImage" alt="PreviewImage" /> -->
    <Image
      v-if="urlImage && !loading"
      :class="borderShow ? `image-preview` : ``"
      :src="urlImage"
      alt="Image"
      :width="width"
      :height="height"
      :preview="preview"
    />
    <!-- แทนที่ spinner ด้วย Skeleton -->
    <div v-else class="skeleton-container" :style="{ width: `${width}px`, height: `${height}px` }">
      <Skeleton :width="width + 'px'" :height="height + 'px'" />
    </div>
  </div>
</template>

<script>
import api from '@/axios/axios-helper.js'
//import Avatar from 'primevue/avatar'
import Image from 'primevue/image'
import Skeleton from 'primevue/skeleton' // เพิ่ม import Skeleton

export default {
  name: 'PreviewImage',
  inheritAttrs: false, // ป้องกัน
  components: {
    //Avatar
    Image,
    Skeleton
  },

  props: {
    imageName: {
      type: String,
      required: true,
      default: () => ''
    },
    path: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      required: true,
      default: () => ''
    },
    width: {
      type: Number,
      default: () => 60
    },
    height: {
      type: Number,
      default: () => 60
    },
    borderShow: {
      type: Boolean,
      default: () => true
    },
    preview: {
      type: Boolean,
      default: () => true
    },
    // เพิ่ม prop ใหม่เพื่อกำหนดว่าต้องการ emit ข้อมูลรูปภาพหรือไม่
    emitImage: {
      type: Boolean,
      default: () => false
    }
  },

  watch: {
    imageName: {
      handler: 'fetchImageData',
      immediate: true
    }
  },

  data() {
    return {
      urlImage: null,
      imageBase64: null, // เพิ่มตัวแปรเก็บรูปภาพในรูปแบบ base64
      name: null,
      loading: true // เพิ่ม state สำหรับติดตามการโหลด
    }
  },

  methods: {
    async fetchImageData() {
      try {
        this.loading = true // เริ่มการโหลด
        let base64Data = null

        switch (this.type) {
          case 'PATH':
            {
              const param = {
                imageName: `${this.imageName}`,
                path: this.path
              }
              base64Data = await api.jewelry.get('FileExtension/GetImage', param, {
                skipLoading: true
              })
            }
            break
          case 'ORDERPLAN':
            {
              const param = {
                imageName: this.imageName
              }
              base64Data = await api.jewelry.get('FileExtension/GetPlanImage', param, {
                skipLoading: true
              })
            }
            break
          case 'MOLD':
            {
              const param = {
                imageName: `${this.imageName}-Mold.png`
              }
              base64Data = await api.jewelry.get('FileExtension/GetMoldImage', param, {
                skipLoading: true
              })
            }
            break
          case 'PLANMOLD':
            {
              const param = {
                imageName: `${this.imageName}`
              }
              base64Data = await api.jewelry.get('FileExtension/GetPlanMoldDesignImage', param, {
                skipLoading: true
              })
            }
            break
          case 'PLANMOLDRESIN':
            {
              const param = {
                imageName: `${this.imageName}`
              }
              base64Data = await api.jewelry.get('FileExtension/GetPlanMoldResinImage', param, {
                skipLoading: true
              })
            }
            break
          case 'STOCK-PRODUCT':
            {
              const param = {
                imageName: `${this.path}`
              }
              base64Data = await api.jewelry.get('FileExtension/GetStockProductImage', param, {
                skipLoading: true
              })
            }
            break
        }

        if (base64Data) {
          this.imageBase64 = base64Data // เก็บ base64 ไว้
          this.urlImage = `data:image/png;base64,${base64Data}`

          // ถ้า prop emitImage เป็น true หรือมีการรับฟัง event 'image-loaded'
          // ให้ส่ง emit ข้อมูลรูปภาพกลับไปยัง parent component
          if (this.emitImage || (this.$listeners && this.$listeners['image-loaded'])) {
            this.$emit('image-loaded', {
              base64: base64Data,
              imageName: this.imageName,
              path: this.path,
              type: this.type
            })
          }
        }

        // ใส่ setTimeout เพื่อแสดง skeleton สักครู่แม้ว่าโหลดเร็ว (ถ้าต้องการ)
        setTimeout(() => {
          this.loading = false // สิ้นสุดการโหลด
        }, 200)
      } catch (error) {
        console.log(error)
        this.loading = false // กรณีเกิด error ก็ยังต้องปิด loading
      }
    }
  },

  onUnmounted() {
    // ทำความสะอาดข้อมูลเมื่อคอมโพเนนต์ถูกยกเลิกการติดตาม
    this.urlImage = null
    this.imageBase64 = null
  }

  //   onDestroyed() {
  //     // ทำความสะอาดข้อมูลเมื่อคอมโพเนนต์ถูกทำลาย
  //     this.urlImage = null
  //     this.imageBase64 = null
  //   }
}
</script>

<style lang="scss" scoped>
.image-container {
  //display: grid;
  //place-content: center start;
  padding: 5px 0px 5px 0px;
}
.image-preview {
  //height: 100px;
  //width: 100px;
  border: 1px solid var(--base-color);
}
.skeleton-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--surface-d, #dee2e6);
  border-radius: 4px;
}
</style>
