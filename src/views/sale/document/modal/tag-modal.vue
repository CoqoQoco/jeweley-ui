<template>
  <modal :showModal="isShowModal" @closeModal="closeModal" width="450px">
    <template v-slot:content>
      <div class="title-text-lg-header mb-3">
        <i class="bi bi-tag mr-2"></i>
        <span>แก้ไข Tag เอกสาร</span>
      </div>

      <form @submit.prevent="onSubmit" class="p-2">
        <!-- ชื่อไฟล์ (read-only) -->
        <div class="mb-3">
          <span class="title-text">ชื่อไฟล์</span>
          <div class="form-control bg-input" style="background-color: #f5f5f5; cursor: default">
            {{ data.fileName || '-' }}
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-3">
          <span class="title-text">Tags</span>
          <input
            class="form-control bg-input"
            type="text"
            v-model.trim="form.tags"
            placeholder="เช่น approved, Q1, pending (คั่นด้วยลูกน้ำ)"
          />
        </div>

        <!-- หมายเหตุ -->
        <div class="mb-3">
          <span class="title-text">หมายเหตุ</span>
          <textarea
            class="form-control bg-input"
            v-model.trim="form.remark"
            rows="2"
            placeholder="หมายเหตุ (ถ้ามี)"
          ></textarea>
        </div>

        <div class="btn-submit-container">
          <button class="btn btn-sm btn-main mr-2" type="submit">
            <i class="bi bi-save mr-1"></i>บันทึก
          </button>
          <button class="btn btn-sm btn-outline-main" type="button" @click="closeModal">
            ยกเลิก
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useSaleDocumentStore } from '@/stores/modules/api/sale/sale-document-store.js'
import { success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'SaleDocumentTagModal',

  components: { modal },

  emits: ['close', 'saved'],

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },

  setup() {
    const store = useSaleDocumentStore()
    return { store }
  },

  data() {
    return {
      form: {
        tags: null,
        remark: null
      }
    }
  },

  watch: {
    data: {
      handler(val) {
        this.form.tags = val.tags || null
        this.form.remark = val.remark || null
      },
      immediate: true
    }
  },

  methods: {
    async onSubmit() {
      await this.store.updateTag({
        Id: this.data.id,
        Tags: this.form.tags,
        Remark: this.form.remark
      })
      success('บันทึก Tag สำเร็จ')
      this.$emit('saved')
      this.closeModal()
    },

    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
