<template>
  <div>
    <div class="filter-container-highlight">
      <div class="form-col-container">
        <div>
          <form @submit.prevent="handleSubmitImageName">
            <div class="input-group input-group-sm">
              <div class="input-group input-group-inner">
                <input
                  class="form-control"
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
                <div class="input-group-append">
                  <button type="submit" class="btn btn-green btn-sm btn-input-group mt-1">
                    <span class="bi bi-search"></span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div>
          <form @submit.prevent="handleSubmitImageStock">
            <div class="input-group input-group-sm">
              <div class="input-group input-group-inner">
                <input
                  class="form-control"
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
                <div class="input-group-append">
                  <button type="submit" class="btn btn-green btn-sm btn-input-group mt-1">
                    <span class="bi bi-search"></span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div></div>
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-dark btn-sm mt-1 mr-2" @click="onClear">
            <span class="bi bi-x-circle"></span>
          </button>
          <button type="button" class="btn btn-info btn-sm mt-1">
            <span class="bi bi-printer"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="line"></div>

    <div class="image-grid">
      <!-- วนลูปแสดงรูปภาพแต่ละรายการ -->
      <div v-for="(image, index) in imageList" :key="index" class="image-item">
        <!-- ใช้ Component ImagePreview ที่มีอยู่แล้ว -->
        <div class="d-flex flex-column align-items-center">
          <imagePreview
            :imageName="image.path"
            :type="type"
            :width="100"
            :height="100"
            :path="image.path"
            :borderShow="true"
          />
          <!-- <span>{{ truncateFileName(image.name, 2) }}</span> -->
          <span>{{ image.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'

const interfaceImageList = [
  {
    name: 'AAA-1233-12',
    test: 'AAA-1233-12-green',
    type: 'MOLD',
    path: 'MOLD'
  },
  {
    name: 'AAA-DK-002',
    test: 'AAA-1233-12-blue',
    type: 'MOLD',
    path: 'MOLD'
  },
  {
    name: 'RF158',
    test: 'AAA-1233-12-gray',
    type: 'MOLD',
    path: 'MOLD'
  }
]

const interfaceSearch = {
  name: null
}

export default {
  name: 'ImageView',
  components: {
    imagePreview
  },

  setup() {
    const stockProductImageStore = stockProductImageApiStor()
    return { stockProductImageStore }
  },

  data() {
    return {
      imageList: [],
      search: {
        ...interfaceSearch
      },
      type: 'STOCK-PRODUCT'
    }
  },
  methods: {
    generateImageList() {
      // สร้างอาร์เรย์ 10 รอบโดยใช้ข้อมูลเดิมจาก interfaceImageList
      const repeatedList = Array(10).fill(interfaceImageList).flat()
      this.imageList = repeatedList
    },
    truncateFileName(fileName, maxLength) {
      if (fileName.length <= maxLength) return fileName

      const extension = fileName.split('.').pop()
      const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'))

      if (nameWithoutExtension.length <= maxLength) return fileName

      return `${nameWithoutExtension.slice(0, maxLength)}.... .${extension}`
    },
    getBgColor(data) {
      if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    onClear() {
      this.search = { ...interfaceSearch }
      this.imageList = []
    },

    async handleSubmitImageName() {
      this.imageList = []
      this.search.stock = null

      const param = {
        take: 50,
        skip: 0,
        sort: null,
        search: {
          name: this.search.name,
          year: null
        }
      }

      const res = await this.stockProductImageStore.fetchListImage({
        take: param.take,
        skip: param.skip,
        sort: param.sort,
        search: param.search
      })

      if (res) {
        //map
        this.imageList = res.data.map((item) => {
          return {
            id: item.id,
            name: item.name,
            year: item.year,
            remark: item.remark,
            path: item.namePath
          }
        })

        //console.log('Image List:', this.imageList)
      }
    },
    async handleSubmitImageStock() {
      console.log('search.stock:', this.search.stock)

      this.imageList = []
      this.search.name = null
    }
  },
  created() {
    this.$nextTick(() => {
      //this.generateImageList()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

// สไตล์สำหรับ Grid Layout
.image-grid {
  display: grid;
  // สร้าง grid ที่ปรับขนาดอัตโนมัติ โดยให้แต่ละ column มีขนาดอย่างน้อย 300px
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px; // ระยะห่างระหว่างรูปภาพ
  padding: 20px;
}

.image-item {
  display: flex;
  justify-content: center;
  align-items: center;
  // เพิ่ม transition เวลารูปโหลด
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02); // เพิ่ม effect เมื่อ hover
  }
}

.btn-input-group {
  height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}
</style>
