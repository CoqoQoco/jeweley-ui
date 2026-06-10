<template>
  <div class="contaianer-image">
    <div class="title-text">
      <span class="mr-2"><i class="bi bi-image"></i></span>
      <span>{{ label }}</span>
    </div>

    <div v-if="!isEditing">
      <div v-if="imageList.length" class="contaianer-image-show">
        <div v-for="(img, index) in imageList" :key="index">
          <imagePreview
            :imageName="img"
            :type="previewType"
            :path="previewPath"
            :width="100"
            :height="100"
            :cacheKey="cacheKey"
          />
        </div>
      </div>
      <button
        v-if="editable"
        class="btn btn-sm btn-main mt-2"
        type="button"
        @click="startEdit"
      >
        <i class="bi bi-pencil mr-1"></i>แก้ไขรูป
      </button>
    </div>

    <div v-else>
      <div v-if="maxImages === 1">
        <UploadImage
          :modelValue="selectedFiles[0] || null"
          title=""
          accept="image/*"
          :maxSizeMB="5"
          :previewSize="120"
          :compact="true"
          :showClear="true"
          @update:modelValue="onSingleFileChange"
          @clear="selectedFiles = []"
        />
      </div>
      <div v-else>
        <UploadImages
          :title="'เลือกรูปภาพ (สูงสุด ' + maxImages + ' รูป)'"
          :isAllClear="true"
          @onUpdateFile="onMultiFilesChange"
        />
      </div>
      <div class="mt-2">
        <button class="btn btn-sm btn-main" type="button" @click="saveImage">
          <i class="bi bi-save mr-1"></i>บันทึก
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="cancelEdit">
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useMoldPlanStore } from '@/stores/modules/api/mold/mold-plan-store.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import UploadImage from '@/components/prime-vue/UploadImage.vue'
import UploadImages from '@/components/prime-vue/UploadImages.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

function stringToArray(str) {
  if (!str) return []
  str = str.trim()
  if (!str) return []
  if (!str.includes(',')) return [str]
  return str.split(',').map((item) => item.trim()).filter((item) => item !== '')
}

export default {
  name: 'StageImageEditor',

  components: {
    imagePreview,
    UploadImage,
    UploadImages
  },

  props: {
    planId: {
      type: Number,
      required: true
    },
    stage: {
      type: String,
      required: true
    },
    imageString: {
      type: String,
      default: ''
    },
    previewType: {
      type: String,
      default: ''
    },
    previewPath: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'รูปภาพ'
    },
    maxImages: {
      type: Number,
      default: 1
    },
    editable: {
      type: Boolean,
      default: false
    }
  },

  emits: ['updated'],

  setup() {
    return {
      store: useMoldPlanStore()
    }
  },

  data() {
    return {
      isEditing: false,
      selectedFiles: [],
      cacheKey: ''
    }
  },

  computed: {
    imageList() {
      return stringToArray(this.imageString)
    }
  },

  methods: {
    startEdit() {
      this.selectedFiles = []
      this.isEditing = true
    },

    cancelEdit() {
      this.selectedFiles = []
      this.isEditing = false
    },

    onSingleFileChange(file) {
      this.selectedFiles = file ? [file] : []
    },

    onMultiFilesChange(files) {
      this.selectedFiles = files || []
    },

    async saveImage() {
      if (!this.selectedFiles.length) {
        warning('กรุณาเลือกรูปภาพก่อนบันทึก')
        return
      }
      if (this.selectedFiles.length > this.maxImages) {
        warning(`สามารถอัพโหลดได้สูงสุด ${this.maxImages} รูปภาพ`)
        return
      }

      const formData = new FormData()
      formData.append('id', this.planId)
      formData.append('stage', this.stage)
      this.selectedFiles.forEach((file) => {
        formData.append('Images', file)
      })

      const res = await this.store.updateStageImage(formData)
      if (res !== undefined) {
        this.cacheKey = Date.now().toString()
        this.isEditing = false
        this.selectedFiles = []
        success('แก้ไขรูปสำเร็จ')
        this.$emit('updated')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.contaianer-image {
  padding: 10px;
}

.contaianer-image-show {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
</style>
