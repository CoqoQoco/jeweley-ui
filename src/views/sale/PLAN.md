# Plan: Generic InputWithButton Component

## Objective

สร้าง generic `InputWithButton.vue` ที่ `src/components/inputv/` เพื่อ re-use pattern
**input + button** ที่ใช้ซ้ำหลายจุดใน quotation-view.vue และ feature อื่นๆ

---

## 1. Pattern ที่ต้องแทนที่ใน quotation-view.vue

### Pattern A — เลขที่ใบเสนอราคา (บรรทัด 22-39)

```html
<!-- เดิม -->
<div class="d-flex align-items-center gap-1">
  <input
    :class="['form-control bg-input input-bg']"
    type="text"
    v-model.trim="customer.invoiceNumber"
    readonly
  />
  <button class="btn btn-main btn-sm" type="button"
    @click="generateQuotationNumber" title="สร้างเลขที่ใบเสนอราคาใหม่">
    <i class="bi bi-arrow-clockwise"></i>
  </button>
</div>
```

- type: `text`
- readonly: `true`
- width: full (ไม่มี inline style)
- button content: icon `bi-arrow-clockwise`

---

### Pattern B — Discount (%) (บรรทัด 77-95)

```html
<!-- เดิม -->
<div class="d-flex align-items-center gap-1">
  <input
    :class="['form-control bg-input', 'input-bg']"
    type="number"
    v-model.number="customer.discountPercent"
    min="0" max="100" step="any"
    style="width: 80px"
  />
  <button class="btn btn-main btn-sm" type="button"
    @click="applyGlobalDiscount" title="กำหนดส่วนลดให้ทุกรายการ">
    กำหนดทั้งหมด
  </button>
</div>
```

- type: `number`
- width: `80px`
- min/max/step
- button content: text "กำหนดทั้งหมด"

---

## 2. Component ที่จะสร้าง

**File**: `src/components/inputv/InputWithButton.vue`

### Props

| Prop | Type | Default | หน้าที่ |
|------|------|---------|--------|
| `modelValue` | String\|Number | `''` | v-model value |
| `type` | String | `'text'` | input type |
| `placeholder` | String | `''` | placeholder |
| `readonly` | Boolean | `false` | readonly |
| `disabled` | Boolean | `false` | disabled input + button |
| `width` | String | `null` | กำหนด width input เช่น `"80px"`, `"100%"` |
| `min` | String\|Number | `null` | สำหรับ type="number" |
| `max` | String\|Number | `null` | สำหรับ type="number" |
| `step` | String\|Number | `null` | สำหรับ type="number" |
| `inputClass` | String | `''` | CSS classes เพิ่มเติมสำหรับ input |
| `btnClass` | String | `'btn btn-main btn-sm'` | CSS classes สำหรับ button |
| `btnTitle` | String | `''` | title tooltip บน button |
| `btnDisabled` | Boolean | `false` | disable เฉพาะ button |

### Slot

| Slot | หน้าที่ |
|------|--------|
| `#btn-content` | เนื้อหาภายใน button (icon หรือ text) |

### Emits

| Event | Payload | หน้าที่ |
|-------|---------|--------|
| `update:modelValue` | new value | v-model sync |
| `btn-click` | - | เมื่อ button ถูกกด |

### Height

ใช้ `form-control` class จาก Bootstrap (height: 38px ตาม `.form-control` default) ให้ตรงกับ inputs อื่นๆ ในหน้า เช่น Calendar, Currency, Markup — ทุก input ในหน้าใช้ `form-control` เหมือนกัน

### Template Structure

```html
<div class="input-with-btn-group">
  <input
    class="form-control bg-input input-bg"
    :class="inputClass"
    :type="type"
    :value="modelValue"
    :readonly="readonly"
    :disabled="disabled"
    :style="width ? { width } : {}"
    :min="min ?? undefined"
    :max="max ?? undefined"
    :step="step ?? undefined"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', type === 'number' ? Number($event.target.value) : $event.target.value)"
  />
  <button
    :class="btnClass"
    type="button"
    :title="btnTitle"
    :disabled="disabled || btnDisabled"
    @click="$emit('btn-click')"
  >
    <slot name="btn-content" />
  </button>
</div>
```

### Style

```scss
.input-with-btn-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
```

---

## 3. Usage หลัง implement ใน quotation-view.vue

### Pattern A — เลขที่ใบเสนอราคา

```html
<InputWithButton
  v-model="customer.invoiceNumber"
  type="text"
  :readonly="true"
  btnTitle="สร้างเลขที่ใบเสนอราคาใหม่"
  @btn-click="generateQuotationNumber"
>
  <template #btn-content>
    <i class="bi bi-arrow-clockwise"></i>
  </template>
</InputWithButton>
```

### Pattern B — Discount (%)

```html
<InputWithButton
  v-model.number="customer.discountPercent"
  type="number"
  width="80px"
  min="0"
  max="100"
  step="any"
  btnTitle="กำหนดส่วนลดให้ทุกรายการ"
  @btn-click="applyGlobalDiscount"
>
  <template #btn-content>กำหนดทั้งหมด</template>
</InputWithButton>
```

---

## 4. Files ที่แก้ไข

| File | Action |
|------|--------|
| `src/components/inputv/InputWithButton.vue` | **สร้างใหม่** |
| `src/views/sale/quotation/components/quotation-view.vue` | **แก้ไข** — import + แทน 2 patterns |
| `src/views/sale/SALES_FLOW.md` | **อัปเดต** — เพิ่ม Generic Components section |

---

## 5. ไม่เปลี่ยนแปลง

- Logic ทั้งหมดใน quotation-view.vue ไม่เปลี่ยน
- `generateQuotationNumber()` และ `applyGlobalDiscount()` ไม่เปลี่ยน
- Input อื่นๆ (Currency, Currency Rate, Markup, Gold) ที่ไม่มี button คู่ — ไม่แตะ
