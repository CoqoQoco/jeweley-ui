<template>
  <div class="app-container">
    <PageHeaderGeneric :title="pageTitle" backRoute="announcement-list" />

    <SectionCardGeneric :title="$t('view.announcement.form.section.detail')" icon="bi-card-text" accent="main" headerStyle="legend">
      <FormFieldGeneric :label="$t('view.announcement.field.title')" :required="true">
        <InputTextGeneric v-model="form.title" :maxlength="200" :placeholder="$t('view.announcement.field.title')" />
        <small class="field-counter">{{ (form.title || '').length }}/200</small>
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.announcement.field.body')" :required="true" class="mt-field">
        <TextareaGeneric v-model="form.body" :rows="8" :placeholder="$t('view.announcement.field.body')" />
        <small class="field-hint">{{ $t('view.announcement.field.bodyHint') }}</small>
      </FormFieldGeneric>
    </SectionCardGeneric>

    <SectionCardGeneric :title="$t('view.announcement.form.section.display')" icon="bi-eye" accent="main" headerStyle="legend" class="box-gap">
      <div class="form-row two-col">
        <FormFieldGeneric :label="$t('view.announcement.field.publishStart')" :required="true">
          <CalendarGeneric v-model="form.publishStart" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.announcement.field.publishEnd')">
          <CalendarGeneric v-model="form.publishEnd" :showClear="true" />
          <small class="field-hint">{{ $t('view.announcement.field.publishEndHint') }}</small>
        </FormFieldGeneric>
      </div>

      <div class="form-row two-col mt-field">
        <CheckboxGeneric v-model="form.isPinned" :label="$t('view.announcement.field.isPinned')" />
        <div>
          <CheckboxGeneric v-model="form.isPublished" :label="$t('view.announcement.field.isPublished')" />
          <small class="field-hint d-block">{{ $t('view.announcement.field.isPublishedHint') }}</small>
        </div>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric :title="$t('view.announcement.form.section.image')" icon="bi-image" accent="main" headerStyle="legend" class="box-gap">
      <p class="section-hint">{{ $t('view.announcement.field.imageHint') }}</p>
      <UploadImage
        :modelValue="form.image"
        :previewUrl="imagePreviewUrl"
        :compact="true"
        accept="image/*"
        :maxSizeMB="5"
        :showClear="false"
        @update:modelValue="onImageChange"
        @update:previewUrl="newImagePreviewUrl = $event"
      />
      <ButtonGeneric
        v-if="imagePreviewUrl"
        variant="red"
        icon="bi-trash"
        :label="$t('view.announcement.action.removeImage')"
        class="mt-field"
        @click="onRemoveImage"
      />
    </SectionCardGeneric>

    <div class="form-footer">
      <ButtonGeneric variant="outline" :label="$t('view.announcement.action.cancel')" @click="onCancel" />
      <ButtonGeneric variant="main" icon="bi-save" :label="$t('view.announcement.action.save')" class="ml-2" @click="onSubmit" />
    </div>
  </div>
</template>

<script>
import { useAnnouncementStore } from '@/stores/modules/api/announcement/announcement-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import UploadImage from '@/components/prime-vue/UploadImage.vue'

const initForm = () => ({
  title: '',
  body: '',
  publishStart: new Date(),
  publishEnd: null,
  isPinned: false,
  isPublished: true,
  image: null
})

export default {
  name: 'AnnouncementFormView',

  components: {
    PageHeaderGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    CalendarGeneric,
    CheckboxGeneric,
    UploadImage
  },

  setup() {
    const announcementStore = useAnnouncementStore()
    return { announcementStore }
  },

  data() {
    return {
      id: null,
      form: initForm(),
      existingImageUrl: null,
      newImagePreviewUrl: null,
      removeImage: false
    }
  },

  computed: {
    pageTitle() {
      return this.id ? this.$t('view.announcement.form.editTitle') : this.$t('view.announcement.form.createTitle')
    },

    imagePreviewUrl() {
      if (this.removeImage) return null
      return this.newImagePreviewUrl || this.existingImageUrl
    }
  },

  created() {
    this.id = this.$route.params.id || null
    if (this.id) {
      this.loadAnnouncement()
    }
  },

  methods: {
    async loadAnnouncement() {
      const res = await this.announcementStore.getAnnouncement(this.id)
      if (res) {
        this.form.title = res.title
        this.form.body = res.body
        this.form.publishStart = res.publishStart ? new Date(res.publishStart) : null
        this.form.publishEnd = res.publishEnd ? new Date(res.publishEnd) : null
        this.form.isPinned = !!res.isPinned
        this.form.isPublished = !!res.isPublished
        this.existingImageUrl = res.imageUrl || null
      }
    },

    onImageChange(file) {
      this.form.image = file
      this.removeImage = false
    },

    onRemoveImage() {
      this.form.image = null
      this.newImagePreviewUrl = null
      this.removeImage = true
    },

    validate() {
      if (!this.form.title?.trim() || !this.form.body?.trim() || !this.form.publishStart) {
        warning(this.$t('view.announcement.alert.required'))
        return false
      }
      if (this.form.publishEnd) {
        const startDay = new Date(this.form.publishStart)
        startDay.setHours(0, 0, 0, 0)
        const endDay = new Date(this.form.publishEnd)
        endDay.setHours(0, 0, 0, 0)
        if (endDay < startDay) {
          warning(this.$t('view.announcement.alert.endBeforeStart'))
          return false
        }
      }
      return true
    },

    // ถ้าเลือกวันเริ่มเป็นวันนี้ ให้ส่งเวลาปัจจุบันเพื่อให้ประกาศแสดงผลทันที ถ้าเป็นวันอื่นให้ปัดเป็นต้นวัน (00:00:00.000)
    toStartOfDayIso(date) {
      const now = new Date()
      const start = new Date(date)
      if (start.toDateString() === now.toDateString()) {
        return now.toISOString()
      }
      start.setHours(0, 0, 0, 0)
      return start.toISOString()
    },

    // วันสิ้นสุดต้องนับรวมทั้งวันที่เลือก (23:59:59.999) ไม่งั้นประกาศจะหมดอายุตั้งแต่ต้นวันนั้น
    toEndOfDayIso(date) {
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      return end.toISOString()
    },

    onCancel() {
      this.$router.push('/announcement')
    },

    onSubmit() {
      if (!this.validate()) return

      confirmThenSubmit(this.form.title, this.$t('view.announcement.confirm.save'), async () => {
        const formData = new FormData()
        formData.append('title', this.form.title)
        formData.append('body', this.form.body)
        formData.append('isPinned', this.form.isPinned)
        formData.append('publishStart', this.toStartOfDayIso(this.form.publishStart))
        if (this.form.publishEnd) {
          formData.append('publishEnd', this.toEndOfDayIso(this.form.publishEnd))
        }
        formData.append('isPublished', this.form.isPublished)
        if (this.form.image) {
          formData.append('image', this.form.image)
        }

        let res = null
        if (this.id) {
          formData.append('id', this.id)
          formData.append('removeImage', this.removeImage)
          res = await this.announcementStore.updateAnnouncement(formData)
        } else {
          res = await this.announcementStore.createAnnouncement(formData)
        }

        if (res) {
          success(this.$t('view.announcement.alert.saved'))
          this.$router.push('/announcement')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';
@import '@/assets/scss/responsive-style/web';

.form-row {
  &.two-col {
    @include form-row-grid(2);
  }
}

.mt-field {
  margin-top: var(--sp-lg);
}

.box-gap {
  margin-top: var(--sp-lg);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: var(--sp-lg);
}

.field-hint,
.field-counter {
  display: block;
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.field-counter {
  text-align: right;
}

.section-hint {
  margin-top: calc(var(--sp-xs) * -1);
  margin-bottom: var(--sp-md);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
