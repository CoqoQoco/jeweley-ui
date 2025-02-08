# ProductImageUpload.vue
<template>
  <div>
    <pageTitle title="รูปสินค้า" description="อัพโหลดเเละตรวจสอบรูปสินค้า" :isShowBtnClose="false">
    </pageTitle>

    <!-- upload image -->
    <form @submit.prevent="handleSubmit">
      <div class="mt-2">
        <div class="form-col-fix-2-container-custom">
          <div class="upload-container">
            <!-- Upload/Preview Area -->
            <div
              class="drop-zone"
              @dragover.prevent
              @drop.prevent="handleDrop"
              :class="{ error: isSubmitted && !imageUrl }"
            >
              <!-- Preview Image -->
              <div v-if="imageUrl" class="preview-content">
                <img :src="imageUrl" alt="Preview" class="preview-image" />
                <button @click.stop="removeImage" class="remove-btn">
                  <i class="bi bi-x"></i>
                </button>
              </div>

              <!-- Upload Content -->
              <div v-else class="upload-content" @click="$refs.fileInput.click()">
                <img src="@/assets/duangkaew-logo.png" class="upload-icon" alt="Upload Icon" />
                <p class="upload-text">
                  วางรูปภาพที่นี่หรือ <span class="browse-text">เลือกรูปภาพ</span>
                </p>
                <p class="upload-subtext">รองรับไฟล์ JPG, JPEG และ PNG</p>
              </div>

              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                class="file-input"
                :disabled="loading"
              />
            </div>
            <!-- Error Message -->
            <div v-if="isSubmitted && !imageUrl" class="error-message">กรุณาเลือกรูปภาพ</div>
          </div>
          <div>
            <div class="filter-container-bg">
              <span class="desc-text-white"><i class="bi bi-image"></i></span>
              <span class="desc-text-white ml-2">บันทึกรูปสินค้า</span>
            </div>

            <!-- name -->
            <div class="form-col-container mt-2">
              <div>
                <div>
                  <span class="title-text">ชื่อรูปภาพ</span>
                  <span class="title-text"> *</span>
                </div>
                <input
                  class="form-control form-control-sm"
                  :style="getBgColor(form.name)"
                  type="text"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  v-model="form.name"
                  required
                />
              </div>
              <div class="vertical-end-container">
                <button type="submit" class="btn btn-main btn-sm" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                  <span v-else><i class="bi bi-cloud-arrow-up"></i></span>
                </button>
              </div>
            </div>

            <!-- remark -->
            <div class="form-col-container mt-2">
              <div>
                <div>
                  <span class="title-text">รายละเอียด</span>
                  <!-- <span class="title-text"> *</span> -->
                </div>
                <input
                  class="form-control form-control-sm"
                  :style="getBgColor(form.remark)"
                  type="text"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  v-model="form.remark"
                />
              </div>
              <!-- <div class="vertical-end-container"></div> -->
            </div>
          </div>
        </div>
      </div>
    </form>

    <div class="line"></div>

    <!-- search image -->
    <form>
      <div class="filter-container-highlight">
        <div class="form-col-container">
          <div>
            <input
              class="form-control form-control-sm"
              :style="getBgColor(search.name)"
              type="text"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              v-model="search.name"
              placeholder="ค้นหาด้วยชื่อรูปภาพ"
              required
            />
          </div>
          <div>
            <input
              class="form-control form-control-sm"
              :style="getBgColor(search.stock)"
              type="text"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              v-model="search.stock"
              placeholder="ค้นหาด้วยรหัสสินค้า"
              required
            />
          </div>

          <div></div>

          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-light btn-sm mt-1" :disabled="loading">
              <span class="bi bi-search"></span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <div class="line"></div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitleMain.vue'))

const interfaceForm = {
  name: null
}
const interfaceSearch = {
  name: null
}

export default {
  name: 'ProductImageUpload',

  components: {
    pageTitle
  },

  data() {
    return {
      imageUrl: null,
      loading: false,
      isSubmitted: false,
      form: {
        ...interfaceForm
      },
      search: {
        ...interfaceSearch
      }
    }
  },

  methods: {
    handleDrop(e) {
      const file = e.dataTransfer.files[0]
      if (file) {
        this.processFile(file)
      }
    },

    handleFileUpload(e) {
      const file = e.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },

    async processFile(file) {
      if (!file.type.match(/image.*/)) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
          life: 3000
        })
        return
      }

      this.loading = true

      try {
        const compressedFile = await this.compressImage(file)
        this.imageUrl = URL.createObjectURL(compressedFile)
      } catch (error) {
        console.error('Error:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
          life: 3000
        })
      } finally {
        this.loading = false
      }
    },

    compressImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (e) => {
          const img = new Image()
          img.src = e.target.result

          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            let width = img.width
            let height = img.height
            const maxSize = 800

            if (width > height && width > maxSize) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else if (height > maxSize) {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
              (blob) => {
                resolve(
                  new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  })
                )
              },
              'image/jpeg',
              0.7
            )
          }
        }
      })
    },

    removeImage() {
      if (this.imageUrl) {
        URL.revokeObjectURL(this.imageUrl)
      }
      this.imageUrl = null
      this.$refs.fileInput.value = ''
    },

    getBgColor(data) {
      if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },

    async handleSubmit() {
      this.isSubmitted = true

      if (!this.imageUrl || !this.form.name) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          life: 3000
        })
        return
      }

      this.loading = true
      try {
        // ส่วนการ submit form
        // const formData = new FormData()
        // formData.append('image', file)
        // formData.append('name', this.form.name)
        // await api.post('/api/upload', formData)

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'บันทึกข้อมูลสำเร็จ',
          life: 3000
        })

        this.resetForm()
      } catch (error) {
        console.error('Error:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
          life: 3000
        })
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.isSubmitted = false
      this.form = { ...interfaceForm }
      this.removeImage()
    }
  },

  beforeUnmount() {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.upload-container {
  max-width: 600px;
  margin: 0 auto;
}

.drop-zone {
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff4b6e;
  }

  &.error {
    border-color: #dc3545;
  }
}

.upload-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.browse-text {
  color: #ff4b6e;
  text-decoration: underline;
}

.upload-subtext {
  font-size: 14px;
  color: #666;
}

.file-input {
  display: none;
}

.preview-content {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 10px;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--base-font-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 75, 110, 1);
  }

  i {
    font-size: 16px;
  }
}

.drop-zone.loading {
  opacity: 0.7;
  pointer-events: none;
}

.form-col-fix-2-container-custom {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 300px 1fr; /* เปลี่ยนจาก 2fr 5fr เป็น 300px 1fr */
}

/* เพิ่ม responsive สำหรับหน้าจอขนาดเล็ก */
@media screen and (max-width: 768px) {
  .form-col-fix-2-container-custom {
    grid-template-columns: 1fr; /* เปลี่ยนเป็น 1 column เมื่อหน้าจอเล็กลง */
  }
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 4px;
}
</style>
