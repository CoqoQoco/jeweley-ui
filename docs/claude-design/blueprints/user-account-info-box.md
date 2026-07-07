# Blueprint — User Account · กล่อง "ข้อมูลบัญชี" (accountInfo)

> พิมพ์เขียว design ของ `src/views/setting/user-account/index-view.vue` — กล่องแรก (accountInfo) เท่านั้น
> source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | User Account — กล่อง "ข้อมูลบัญชี" — `src/views/setting/user-account/index-view.vue` |
| **สถานะ** | 🚀 mapped |
| **วันที่ (อัปเดตล่าสุด)** | 2026-07-07 |
| **Ref ที่ใช้** | Two-panel identity/detail layout (profile card ซ้าย + key-value ขวา) |
| **Claude Design** | - |
| **ทางเลือกที่เลือก** | B — แยก identity panel (avatar + ชื่อ) ออกจาก detail panel (key-value) ให้ scan ง่ายกว่าเดิม |

---

## Layout (frame ที่ approve)

```
┌─ 👤 ข้อมูลบัญชี ──────────────────────────────────────────────┐
│  ┌───────────────┐   ┌──────────────────────────────────┐   │
│  │    ╭─────╮    │   │  ชื่อ         ชัยสุริยะ             │   │
│  │    │ IMG │    │   │  ──────────────────────────────── │   │
│  │    ╰─────╯    │   │  นามสกุล      สร้อยสูงเนิน          │   │
│  │ ชัยสุริยะ สร้อยฯ│   │                                   │   │
│  │  @CoqoAdmin   │   │                                   │   │
│  └───────────────┘   └──────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
≤768px → 2 พาเนลยุบแนวตั้ง (identity บน / detail ล่าง เต็มกว้าง)
```

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| `.account-grid` | display/columns | `grid-template-columns: 240px 1fr` (240px = width constraint คงเป็น px ได้) |
| `.account-grid` | gap | `var(--sp-lg)` |
| `.account-grid` @≤768px | columns | `1fr` (ยุบแนวตั้ง) |
| `.identity-panel` | background | `var(--color-highlight-bg)` |
| `.identity-panel` | border-radius | `var(--radius-md)` |
| `.identity-panel` | padding | `var(--sp-lg)` |
| `.identity-panel` | layout | flex column, `align-items: center`, gap `var(--sp-sm)`/`var(--sp-md)` |
| avatar | size | 100px (คงเดิมจาก `.profile-header .avatar`) |
| fullname/username | text-align | center |
| `.detail-panel` | layout | flex column, `justify-content: center` |
| `.detail-row` | padding | `var(--sp-sm) 0` |
| `.detail-row` | border-bottom | `1px solid var(--color-border)` (แถวสุดท้าย: none) |
| `.detail-row` label | class/color | `title-text` (base-font-color ผ่าน standard-form.scss) |

> คง `.avatar` / `.avatar-overlay` / `.avatar-options` / `.file-input` เดิมทุก property (ย้าย scope เท่านั้น ไม่แก้ค่า)

---

## States (ครบทุก state ที่ component มี)

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | avatar placeholder icon (`bi-person-circle`) ถ้าไม่มีรูป |
| hover (avatar) | `.avatar-overlay` opacity 0→1 (เดิม ไม่เปลี่ยน) |
| avatar options popup | เดิม ไม่เปลี่ยน (`.avatar-options`) |
| responsive ≤768px | `.account-grid` เป็น 1 คอลัมน์ — identity บน, detail ล่าง เต็มกว้าง |

---

## Diff จากของเดิม

- เดิม: `.profile-header` เป็น flex row เดียว (avatar+user-info) แล้วมี `.form-row.two-col` แยกด้านล่างสำหรับ ชื่อ/นามสกุล
- ใหม่: ครอบด้วย `.account-grid` (grid 240px/1fr) แยกเป็น `.identity-panel` (avatar+user-info, พื้น highlight-bg) ซ้าย และ `.detail-panel` (key-value rows คั่นเส้น) ขวา
- ลบ `.form-row.two-col` เดิมของกล่องนี้ (ย้ายเข้า detail-panel เป็น `.detail-row` แทน)
- กล่อง loginInfo / rolePermission ไม่แตะ ยังใช้ `form-row two-col` เดิม

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `src/views/setting/user-account/index-view.vue` | Template: ครอบเนื้อในกล่อง accountInfo ด้วย `.account-grid` (identity-panel + detail-panel), ลบ form-row two-col เดิมของกล่องนี้; Style: เพิ่ม `.account-grid`/`.identity-panel`/`.detail-panel`/`.detail-row`, ย้าย `.profile-header` styles ไปเป็น `.identity-panel` (ลบ media query เดิมของ profile-header) |

- delegate: **@ui-implementer** · verify: `npm run build`
- ไม่มี token ใหม่เพิ่มใน `variable.scss` — ใช้ token ที่มีอยู่ทั้งหมด

---

## Screenshots

- (ไม่มี — ทำตาม text plan ที่ user อนุมัติ ไม่ผ่าน Claude Design)
