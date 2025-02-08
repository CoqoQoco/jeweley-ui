<template>
  <div>
    <div class="image-grid">
      <!-- วนลูปแสดงรูปภาพแต่ละรายการ -->
      <div v-for="(image, index) in imageList" :key="index" class="image-item">
        <!-- ใช้ Component ImagePreview ที่มีอยู่แล้ว -->
        <div class="d-flex flex-column align-items-center">
          <imagePreview
            :imageName="image.name"
            :type="image.type"
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

export default {
  name: 'ImageView',
  components: {
    imagePreview
  },
  data() {
    return {
      imageList: []
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
    }
  },
  created() {
    this.$nextTick(() => {
      this.generateImageList()
    })
  }
}
</script>

<style lang="scss" scoped>
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
</style>
