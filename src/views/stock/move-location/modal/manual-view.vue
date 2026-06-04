<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="900px"
    :fitHeight="true"
    :clickToClose="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">คู่มือการใช้งาน — ย้าย Storage Location</span>
    </template>

    <template #content>
      <div class="p-3">
        <h6 class="section-heading">ก) การย้ายสินค้าไปยัง Storage Location</h6>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">ค้นหาและเลือกสินค้า</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">ค้นหาสินค้าด้วยเลขที่ผลิต รหัสสินค้า หรือ Storage Location ปัจจุบัน จากนั้นเลือกสินค้าที่ต้องการย้ายด้วย checkbox</p>
            <img :src="imgList" alt="หน้าแสดงรายการสินค้า" class="manual-img mb-2" />
            <img :src="imgSelect" alt="เลือกสินค้าด้วย checkbox" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">2</span>
            <span class="step-title">กดปุ่มย้าย Storage Location</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">เมื่อเลือกสินค้าแล้ว กดปุ่ม "ย้าย Storage Location" บนแถบด้านซ้าย ระบบจะเปิด modal ให้เลือก SLOC ปลายทาง</p>
            <img :src="imgModalTarget" alt="modal เลือก SLOC ปลายทาง" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">3</span>
            <span class="step-title">ยืนยันการย้าย</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">เลือก Storage Location ปลายทางจาก dropdown แล้วกดปุ่ม "ยืนยันการย้าย" ระบบจะแสดง dialog ยืนยันรายการก่อนดำเนินการ</p>
            <img :src="imgConfirm" alt="dialog ยืนยันการย้าย" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">4</span>
            <span class="step-title">ย้ายสำเร็จ</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">เมื่อย้ายสำเร็จ ระบบจะแจ้งผลและโหลดข้อมูลใหม่อัตโนมัติ</p>
            <img :src="imgSuccess" alt="แจ้งย้ายสำเร็จ" class="manual-img" />
          </div>
        </div>

        <h6 class="section-heading mt-4">ข) การสร้าง Storage Location ชั่วคราว</h6>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">1</span>
            <span class="step-title">เปิดฟอร์มสร้าง SLOC ชั่วคราว</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">ใน modal ย้าย Storage Location กดปุ่ม "+ สร้าง SLOC ชั่วคราว" เพื่อขยายฟอร์มสร้าง SLOC ใหม่</p>
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">2</span>
            <span class="step-title">กรอกข้อมูล &amp; เลือก</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">กรอกรหัสและชื่อ SLOC (ประเภทจะตั้งเป็น "ชั่วคราว" อัตโนมัติ) แล้วกดปุ่ม "เพิ่ม &amp; เลือก" ระบบจะสร้าง SLOC ใหม่และตั้งเป็น SLOC ปลายทางอัตโนมัติ</p>
            <img :src="imgTempForm" alt="ฟอร์มสร้าง SLOC ชั่วคราว" class="manual-img" />
          </div>
        </div>

        <div class="item-card">
          <div class="item-card-header">
            <span class="step-number">3</span>
            <span class="step-title">ยืนยันการย้ายเข้า SLOC ชั่วคราว</span>
          </div>
          <div class="item-card-body">
            <p class="step-desc">กดปุ่ม "ยืนยันการย้าย" เพื่อดำเนินการ — ดูขั้นตอนที่ 3-4 ของส่วน ก) สำหรับรายละเอียดเพิ่มเติม</p>
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import imgList from '@/assets/manuals/move-location/01-list.png'
import imgSelect from '@/assets/manuals/move-location/02-select.png'
import imgModalTarget from '@/assets/manuals/move-location/03-modal-target.png'
import imgTempForm from '@/assets/manuals/move-location/04-temp-form.png'
import imgConfirm from '@/assets/manuals/move-location/05-confirm.png'
import imgSuccess from '@/assets/manuals/move-location/06-success.png'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'ManualView',

  components: { modal },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal'],

  data() {
    return {
      imgList,
      imgSelect,
      imgModalTarget,
      imgTempForm,
      imgConfirm,
      imgSuccess
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.section-heading {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: transparent !important;
  margin-bottom: 16px;
}

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.item-card-header {
  background: #fdf2f2;
  color: var(--base-font-color);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--base-font-color);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.item-card-body {
  padding: 12px 16px;
}

.step-desc {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #444;
  line-height: 1.6;
}

.manual-img {
  width: 100%;
  max-width: 820px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  display: block;
}
</style>
