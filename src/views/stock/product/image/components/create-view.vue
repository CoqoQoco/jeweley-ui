# ProductImageUpload.vue
<template>
  <div>
    <pageTitle title="รูปสินค้า" description="อัพโหลดเเละตรวจสอบรูปสินค้า" :isShowBtnClose="false">
    </pageTitle>

    <div class="form-col-container mt-2">
      <div class="filter-container">
        <form @submit.prevent="handleSubmit">
          <div>
            <div class="form-col-fix-2-container-custom mt-3">
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
                  <!-- <div>
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
                  </div> -->

                  <div class="input-group input-group-sm">
                    <div class="input-group input-group-inner">
                      <input
                        class="form-control"
                        :style="getBgColor(form.name)"
                        type="text"
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"
                        v-model="form.name"
                        placeholder="ชื่อรูปภาพ"
                        required
                      />
                      <div class="input-group-append">
                        <button
                          type="submit"
                          class="btn btn-main btn-sm btn-input-group mt-1"
                          :disabled="loading"
                        >
                          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                          <span v-else><i class="bi bi-cloud-arrow-up"></i></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- remark -->
                <div class="form-col-container mt-2">
                  <div>
                    <input
                      class="form-control form-control-sm"
                      :style="getBgColor(form.remark)"
                      type="text"
                      autocomplete="off"
                      autocorrect="off"
                      autocapitalize="off"
                      spellcheck="false"
                      v-model="form.remark"
                      placeholder=" รายละเอียด ..."
                    />
                  </div>
                  <!-- <div class="vertical-end-container"></div> -->
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- data update latest -->
      <div class="filter-container">
        <div class="title-text">
          <span><i class="bi bi-database-fill-up mr-1"></i></span>
          <span>{{ ` >>> ${latestImageTake} รายการอัพโหลดล่าสุด` }}</span>
        </div>
        <BaseDataTable
          scrollHeight="250px"
          :paginator="false"
          :items="latestImage"
          :columns="columns"
        >
          <!-- Image Column -->
          <template #imageTemplate="{ data }">
            <div class="image-container">
              <div>
                <imagePreview
                  :imageName="data.path"
                  :path="data.path"
                  :type="type"
                  :width="25"
                  :height="25"
                />
              </div>
            </div>
          </template>
        </BaseDataTable>
      </div>
    </div>

    <div class="line"></div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

// const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitleMain.vue'))

import pageTitle from '@/components/custom/PageTitleMain.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { compressOptimalImage } from '@/services/helper/file/compress-image.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'

const interfaceForm = {
  name: null
}

export default {
  name: 'ProductImageUpload',

  components: {
    pageTitle,
    BaseDataTable,
    imagePreview
  },

  setup() {
    const stockProductImageStore = stockProductImageApiStor()
    return { stockProductImageStore }
  },

  data() {
    return {
      imageUrl: null,
      loading: false,
      isSubmitted: false,
      form: {
        ...interfaceForm
      },

      type: 'STOCK-PRODUCT',

      latestImage: [],
      latestImageTake: 20,
      tableHeight: '800px',
      columns: [
        {
          field: 'image',
          header: '',
          width: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'name',
          header: 'ชื่อ',
          sortable: false,
          width: '150px'
        },
        {
          field: 'createDate',
          header: 'วันที่สร้าง',
          sortable: false,
          format: 'datetime',
          width: '150px'
        },
        {
          field: 'remark',
          header: 'รายละเอียด',
          sortable: false,
          minWidth: '150px'
        }
      ]
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
        swAlert.warning('', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }

      this.loading = true

      try {
        // บีบอัดไฟล์
        const compressedFile = await compressOptimalImage(file)

        this.imageUrl = URL.createObjectURL(compressedFile)
      } catch (error) {
        console.error('Error:', error)
        swAlert.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ')
      } finally {
        this.loading = false
      }
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
        swAlert.warning('', 'กรุณากรอกข้อมูลให้ครบถ้วน')
        return
      }

      this.loading = true
      try {
        // init form data
        const formData = new FormData()

        // แปลง Blob URL กลับเป็น File object
        const response = await fetch(this.imageUrl)
        const blob = await response.blob()
        const compressedFile = new File([blob], this.$refs.fileInput.files[0].name, {
          type: 'image/png' // เปลี่ยนเป็น PNG
        })

        formData.append('name', this.form.name)
        formData.append('description', this.form.remark ?? '')
        // ส่ง file ที่ถูกบีบอัดแล้ว
        formData.append('image', compressedFile)

        const res = await this.stockProductImageStore.fetchSaveImage({
          form: formData
        })

        if (res) {
          swAlert.success('', '', async () => {
            await this.fetchLatestImage()
            this.resetForm()
          })
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    },
    async fetchLatestImage() {
      const res = await this.stockProductImageStore.fetchListImage({
        take: this.latestImageTake,
        skip: 0,
        sort: [{ field: 'createDate', dir: 'desc' }],
        search: {
          name: null,
          year: null
        },
        skipLoading: true
      })

      if (res) {
        this.latestImage = res.data.map((item) => {
          return {
            id: item.id,
            name: item.name,
            year: item.year,
            remark: item.remark,
            path: item.namePath,
            createDate: item.createDate
          }
        })
      }
    },

    resetForm() {
      this.isSubmitted = false

      //this.form = { ...interfaceForm }

      this.removeImage()
    }
  },

  created() {
    this.$nextTick(() => {
      this.fetchLatestImage()
    })
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
  gap: 0px;
  padding: 20px 20px 20px 0px;
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

.btn-input-group {
  height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}
</style>
