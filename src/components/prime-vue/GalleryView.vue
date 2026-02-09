<template>
  <div class="galleria-component" v-if="isVisible">
    <!-- Main Galleria -->
    <div class="galleria-wrapper" v-if="displayImages.length > 0">
      <Galleria
        :value="displayImages"
        :numVisible="responsiveNumVisible"
        :thumbnailsPosition="'bottom'"
        containerStyle="width: 100%"
        :circular="true"
        :autoPlay="autoPlay"
        :transitionInterval="transitionInterval"
      >
        <template #item="slotProps">
          <div class="galleria-item-container" v-if="slotProps.item">
            <!-- <img
              :src="slotProps.item.itemImageSrc"
              :alt="slotProps.item.alt"
              class="galleria-main-image"
            /> -->
            <Image
              class="galleria-main-image"
              :src="slotProps.item.itemImageSrc"
              :alt="slotProps.item.alt"
              :width="width"
              :height="height"
              preview
            />
            <button
              v-if="getIsRemoveVisible(slotProps.item)"
              class="btn-delete-image"
              type="button"
              @click="removeImage(slotProps.item)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
        <template #thumbnail="slotProps">
          <div class="thumbnail-container">
            <img
              :src="slotProps.item.thumbnailImageSrc"
              :alt="slotProps.item.alt"
              class="galleria-thumbnail-image"
            />
          </div>
        </template>
      </Galleria>
    </div>
    <div v-else class="no-images-message">
      <p>ไม่มีรูปภาพ กรุณาเพิ่มรูปภาพ</p>
    </div>
  </div>
</template>

<script>
import Galleria from 'primevue/galleria'
import Image from 'primevue/image'

export default {
  name: 'GalleriaComponent',
  components: {
    Galleria,
    Image
  },
  props: {
    urls: {
      type: Array,
      default: () => []
    },
    code: {
      type: String,
      default: ''
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    isRemoveFirstImage: {
      type: Boolean,
      default: false
    },
    isRemoveImage: {
      type: Boolean,
      default: false
    },
    titlePrefix: {
      type: String,
      default: ''
    },
    numVisible: {
      type: Number,
      default: 5
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    transitionInterval: {
      type: Number,
      default: 3000
    },
    width: {
      type: Number,
      default: () => 350
    },
    height: {
      type: Number,
      default: () => 350
    }
  },
  data() {
    return {
      removedIndices: [],
      internalUrls: [],
      responsiveOptions: [
        {
          breakpoint: '1500px',
          numVisible: 5,
          numScroll: 1 // เลื่อนทีละ 1 รูป
        },
        {
          breakpoint: '1024px',
          numVisible: 4,
          numScroll: 1
        },
        {
          breakpoint: '768px',
          numVisible: 3,
          numScroll: 1
        },
        {
          breakpoint: '560px',
          numVisible: 2,
          numScroll: 1
        }
      ],
      responsiveNumVisible: 0
    }
  },
  computed: {
    displayImages() {
      const res = this.internalUrls.map((url, index) => ({
        index: index,
        itemImageSrc: url,
        thumbnailImageSrc: url,
        alt: `${this.code}${index > 0 ? `-${index + 1}` : ''}`,
        title: `${this.code}${index > 0 ? `-${index + 1}` : ''}`
      }))

      //console.log('Display Images:', res)
      return res
    }
  },
  watch: {
    urls: {
      immediate: true,
      handler(newUrls) {
        if (Array.isArray(newUrls)) {
          this.internalUrls = [...newUrls]
        } else {
          console.warn('ข้อมูล URLs ไม่ใช่ array:', typeof newUrls)
        }
      }
    }
  },
  methods: {
    removeImage(data) {
      // ตรวจสอบข้อมูลก่อนลบ
      if (!data || data.index === undefined) {
        console.error('Invalid image data:', data)
        return
      }

      const index = data.index

      // ตรวจสอบ index ที่ต้องการลบ
      if (index >= 0 && index < this.internalUrls.length) {
        // สร้าง copy ของ URLs เพื่อหลีกเลี่ยงการอ้างอิงโดยตรง
        const newUrls = [...this.internalUrls]
        newUrls.splice(index, 1) // ใช้ splice แทนการสร้าง array ใหม่ด้วย filter

        // อัปเดต URLs
        this.internalUrls = newUrls

        // อัปเดต selectedFiles ถ้ามีการลบรูปที่เพิ่งเลือกใหม่
        const totalExisting = this.urls.length - this.removedIndices.length
        if (index >= totalExisting && this.selectedFiles.length > 0) {
          const selectedIndex = index - totalExisting
          if (selectedIndex >= 0 && selectedIndex < this.selectedFiles.length) {
            // ยกเลิก URL ของรูปที่ลบ
            const urlToRevoke = this.selectedFiles[selectedIndex].preview
            if (urlToRevoke) {
              URL.revokeObjectURL(urlToRevoke)
            }

            // ลบรูปออกจาก selectedFiles
            this.selectedFiles.splice(selectedIndex, 1)
          }
        }

        // เรียกใช้ notifyChange()
        this.notifyChange()

        // บังคับให้ re-render
        //this.$nextTick(() => this.$forceUpdate())
      } else {
        console.warn('Invalid image index:', index)
      }
    },

    updateImages(newUrls) {
      if (Array.isArray(newUrls) && newUrls.length > 0) {
        this.internalUrls = [...newUrls]
        this.removedIndices = []
        //this.$nextTick(() => this.$forceUpdate())
      }

      // เรียกใช้ notifyChange()
      this.notifyChange()
    },

    notifyChange() {
      const displayData = this.internalUrls.map((url, index) => ({
        index: index,
        itemImageSrc: url,
        thumbnailImageSrc: url,
        alt: `${this.code}${index > 0 ? `-${index + 1}` : ''}`,
        title: `${this.code}${index > 0 ? `-${index + 1}` : ''}`
      }))

      this.$emit('change', { urls: this.internalUrls, displayData })
    },

    getIsRemoveVisible(data) {
      if (!data || data.index === undefined) {
        return false
      }

      if (data.index === 0) {
        if (this.isRemoveFirstImage) {
          return true
        } else {
          return false
        }
      } else {
        return this.isRemoveImage ? true : false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.galleria-component {
  width: 100%;
  //margin-bottom: 20px;
}

.galleria-item-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 350px;
  width: 100%;
  position: relative;
}

.galleria-main-image {
  //max-height: 300px;
  //max-width: 100%;
  object-fit: contain;
  border-radius: 5px;
}

.thumbnail-container {
  width: 60px;
  height: 45px;
  object-fit: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  border-width: 1px;
  overflow: hidden;
}

.galleria-thumbnail-image {
  width: 100%;
  height: 100%;
  //max-height:100px;
  //max-width: 100%;
  margin-right: 5px;
  margin-left: 5px;
  //object-fit: cover;

  background-color: aqua;
}

.btn-delete-image {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--base-red, rgba(220, 53, 69, 0.8));
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-image:hover {
  background-color: rgba(220, 53, 69, 1);
}

.no-images-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 5px;
  color: #888;
}

// @media (max-width: 768px) {
//   .galleria-item-container {
//     height: 300px;
//   }

//   .galleria-main-image {
//     max-height: 300px;
//   }
// }

:deep(.p-galleria-thumbnail-item) {
  width: 80px !important; /* กำหนดขนาดแน่นอน */
  height: 60px !important;
  margin: 0 2px !important;
  padding: 0 !important;
  flex: 0 0 80px !important; /* ใช้ flex-basis เป็นค่าเดียวกับ width */
  overflow: hidden;
}

:deep(.p-galleria-thumbnail-items-container) {
  width: 100%;
  overflow: hidden;
}

:deep(.p-galleria-thumbnails) {
  display: flex;
  justify-content: flex-start; /* ให้เริ่มจากด้านซ้ายเสมอ */
  width: 100%;
  min-width: 100%;
  gap: 1px;
  padding: 0 !important;
}

:deep(.p-galleria-thumbnail-container) {
  background-color: white;
  padding: 10px 40px;
  border-top: 2px solid var(--base-font-color);
  overflow: hidden; /* ป้องกันการล้น */
  position: relative;
}

/* ทำให้ navigators ของ thumbnail มองเห็นชัดเจนขึ้น */
:deep(.p-galleria-thumbnail-prev),
:deep(.p-galleria-thumbnail-next) {
  background-color: var(--base-font-color);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  opacity: 0.8;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

:deep(.p-galleria-thumbnail-prev) {
  left: 5px;
}

:deep(.p-galleria-thumbnail-next) {
  right: 5px;
}
</style>
