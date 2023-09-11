<template>
  <div class="app-container-modal">
    <modal :showModal="isShowModal" @closeModal="closeModal" width="800px">
      <template v-slot:title>
        <div class="box-title">
          <h1 class="modal-title ml-3">6608010</h1>
        </div>
      </template>
      <template v-slot:content>
        <div class="box-form">
          <form>
            <div class="box-input-line">
              <div class="box-input">
                <h5 class="label-subject">เลขที่ W.O.</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">ลำดับ W.O.</h5>
                <input class="form-control" />
              </div>
            </div>
            <div class="box-input-line">
              <div class="box-input">
                <h5 class="label-subject">วันที่ส่งงาน</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">วันที่รับงาน</h5>
                <input class="form-control" />
              </div>
            </div>
            <div class="box-input-line">
              <div class="box-input">
                <h5 class="label-subject">เเม่พิมพ์</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">รหัสสินค้า</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">รหัสลูกค้า</h5>
                <input class="form-control" />
              </div>
            </div>
             <div class="box-input-line">
              <div class="box-input">
                <h5 class="label-subject">หน่วย</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">ยอดสั่ง</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">สำเร็จรูป</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">กึ่งสำเร็จรูป</h5>
                <input class="form-control" />
              </div>
              <div class="box-input ml-2">
                <h5 class="label-subject">ต้องหล่อ</h5>
                <input class="form-control" />
              </div>
            </div>
          </form>
        </div>
      </template>
      <template v-slot:action>
        <div class="box-action">
          <!-- <button class="btn btm-sm btn-danger">
            {{ $t('button.title.cancel') }}
          </button> -->
          <button class="btn btm-sm btn-success float-right">
            {{ $t('button.title.submit') }}
          </button>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import modal from '@/components/modal/ModalView.vue'
export default {
  components: { modal },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container-modal {
}
.box-title {
  background-color: var(--base-color);
  padding: 10px;
  .modal-title {
    color: var(--base-font-color);
  }
}
.box-form {
  //background-color: var(--base-sub-color);
  .label-subject {
    color: var(--base-font-color);
  }
  .box-input-line {
    display: flex;
    justify-content: space-evenly;
    margin-top: 5px;
    .box-input {
      width: 100%;
    }
  }
}
</style>
