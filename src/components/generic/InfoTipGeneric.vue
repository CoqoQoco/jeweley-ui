<!--
  InfoTipGeneric — ไอคอน ⓘ เล็กๆ (bi-info-circle, สีจาง token) เปิด tooltip คำอธิบายเมื่อ hover หรือโฟกัส
  ด้วยคีย์บอร์ด (native <button> จึง focusable เองอยู่แล้ว ไม่ต้องพึ่ง tabindex มือ) — ใช้แปะข้าง
  หัวข้อ/แถวข้อมูล/ปุ่ม ที่ต้องการคำอธิบายสั้นๆ โดยไม่กินพื้นที่ถาวรบนจอ (ไม่มี tooltip library ใน
  โปรเจกต์นี้ — ไม่มี PrimeVue Tooltip directive ลงทะเบียนไว้ — เป็น CSS-only tooltip ล้วน)

  ตัวอย่างการใช้งาน:
  <InfoTipGeneric text="ตรวจจากข้อมูล ณ วันนี้ ตามกฎที่ตั้งไว้" />
  <InfoTipGeneric :text="`บรรทัดที่ 1\nบรรทัดที่ 2`" position="bottom" />

  Props:
    text     — String (required) — เนื้อหา tooltip (ขึ้นบรรทัดใหม่ได้ด้วย \n) — ให้สั้น กระชับ ≤2 บรรทัด
    position — 'top'|'bottom'|'left'|'right' (default 'top') — ทิศทางที่ bubble กางออก
    tone     — 'default'|'inverse' (default 'default') — สีไอคอน: 'default' = หมึกจาง (--base-sub-color)
               ใช้บนพื้นสว่าง/การ์ดปกติ, 'inverse' = สีจางบนพื้นเข้ม (--on-inverse-muted, hover/focus
               --on-inverse) ใช้เมื่อวางบนพื้น filled สีเข้ม เช่น หัวตาราง (th พื้นแดง var(--base-font-color))

  Slots: ไม่มี (ข้อความมาจาก prop text เท่านั้น)
-->
<template>
  <span class="info-tip-generic" :class="[`info-tip-generic--${position}`, `info-tip-generic--tone-${tone}`]">
    <button type="button" class="info-tip-generic__trigger" :aria-label="text" :aria-describedby="tooltipId">
      <i class="bi bi-info-circle"></i>
    </button>
    <span :id="tooltipId" role="tooltip" class="info-tip-generic__bubble">{{ text }}</span>
  </span>
</template>

<script>
let uid = 0

export default {
  name: 'InfoTipGeneric',

  props: {
    text: {
      type: String,
      required: true
    },
    position: {
      type: String,
      default: 'top',
      validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v)
    },
    tone: {
      type: String,
      default: 'default',
      validator: (v) => ['default', 'inverse'].includes(v)
    }
  },

  data() {
    uid += 1
    return {
      tooltipId: `info-tip-generic-${uid}`
    }
  }
}
</script>

<style lang="scss" scoped>
.info-tip-generic {
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.info-tip-generic__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: help;
  color: var(--base-sub-color);
  line-height: 1;

  i {
    font-size: var(--fs-sm);
  }

  &:hover,
  &:focus-visible {
    color: var(--base-font-color);
  }

  &:focus-visible {
    outline: 2px solid var(--base-font-color);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
}

// tone="inverse" — วางบนพื้น filled เข้ม (เช่น th หัวตารางสีแดง) หมึกจางปกติ (--base-sub-color) กลืนกับพื้น
// เกือบมองไม่เห็น ต้องสลับเป็นโทนสว่างจาง/เต็มแทน
.info-tip-generic--tone-inverse .info-tip-generic__trigger {
  color: var(--on-inverse-muted);

  &:hover,
  &:focus-visible {
    color: var(--on-inverse);
  }

  &:focus-visible {
    outline-color: var(--on-inverse);
  }
}

.info-tip-generic__bubble {
  // display:none (ไม่ใช่แค่ opacity/visibility) — element ที่ opacity:0 แต่ยัง position:absolute ปกติ
  // ยังนับเป็น "scrollable overflow" ของ ancestor ได้ (ทำให้เกิด scrollbar แนวนอนทั้งหน้าเวลา trigger
  // อยู่ใกล้ขอบขวา/ซ้ายของ viewport ทั้งที่มองไม่เห็น) display:none ตัดปัญหานี้เพราะไม่มี layout box เลย
  display: none;
  position: absolute;
  z-index: 30;
  min-width: 160px;
  max-width: 260px;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  background: var(--base-font-sub-color);
  color: var(--on-inverse);
  font-size: var(--fs-sm);
  font-weight: 400;
  line-height: var(--lh-sm);
  white-space: pre-line;
  text-align: left;
  box-shadow: var(--shadow-md);
  pointer-events: none;
}

.info-tip-generic__trigger:hover + .info-tip-generic__bubble,
.info-tip-generic__trigger:focus-visible + .info-tip-generic__bubble {
  display: block;
}

.info-tip-generic--top .info-tip-generic__bubble {
  bottom: calc(100% + var(--sp-xs));
  left: 50%;
  transform: translateX(-50%);
}

.info-tip-generic--bottom .info-tip-generic__bubble {
  top: calc(100% + var(--sp-xs));
  left: 50%;
  transform: translateX(-50%);
}

.info-tip-generic--left .info-tip-generic__bubble {
  right: calc(100% + var(--sp-xs));
  top: 50%;
  transform: translateY(-50%);
}

.info-tip-generic--right .info-tip-generic__bubble {
  left: calc(100% + var(--sp-xs));
  top: 50%;
  transform: translateY(-50%);
}
</style>
