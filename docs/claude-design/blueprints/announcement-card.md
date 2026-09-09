# Blueprint — Announcement Card (feed widget)

> พิมพ์เขียว design ของ `announcement-card` + pinned tag + feed empty/load-more — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | `src/views/announcement/components/announcement-card.vue` + feed widget `src/views/dashboard/home/components/announcement-feed.vue` |
| **สถานะ** | ✅ approved |
| **วันที่ (อัปเดตล่าสุด)** | 2026-09-09 (เพิ่ม audience field all/dev + tag "เห็นเฉพาะ Dev") |
| **Ref ที่ใช้** | mirror ของหน้า Ticket (`docs/design-system.md` baseline) + `recent-activities.vue` (empty state pattern) |
| **Claude Design** | ไม่มี frame แยก — สืบทอด token/มาตรฐานจาก design-system.md ตรงๆ |
| **ทางเลือกที่เลือก** | plan approved 2026-09-08 (feed บนหน้าแรก + management page /announcement) |

---

## Layout (frame ที่ approve)

```
┌─ SectionCardGeneric (legend, icon bi-megaphone) ─────────────────────────────┐
│  ┏━ ประกาศข่าว ━┓                                                            │
│  └───────────────┘                              [⚙ จัดการประกาศ] (canManage) │
│  ┌─ announcement-card (compact) ───────────────────────────────────────────┐ │
│  │ [ปักหมุด] [เห็นเฉพาะ Dev]  หัวข้อประกาศ..............    12 ก.ย. 2569    │ │
│  │ [88x88]   เนื้อหาย่อ 3 บรรทัด แล้ว...(clamp)...                          │ │
│  │           โดย admin                                        อ่านต่อ ▸    │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│  ┌─ announcement-card (compact) ───────────────────────────────────────────┐ │
│  │ หัวข้อประกาศ 2 (ไม่ปักหมุด)                                 10 ก.ย. 2569 │ │
│  │ เนื้อหาย่อ...                                                            │ │
│  │ โดย sale1                                                    อ่านต่อ ▸  │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                              [ ⬇ โหลดเพิ่ม (เหลืออีก 3) ]                     │
└────────────────────────────────────────────────────────────────────────────────┘

Empty state (canManage=false — viewer):
┌──────────────────────────────────────────────────┐
│                    ╭──────╮                        │
│                    │  📣  │  ← icon circle 72px     │
│                    ╰──────╯                        │
│                  ยังไม่มีประกาศ                     │
│     เมื่อมีข่าวสารจากบริษัท จะแสดงที่นี่เป็นที่แรกครับ │
└──────────────────────────────────────────────────┘

Empty state (canManage=true — manager, full-box CTA):
┌──────────────────────────────────────────────────┐
│                    ╭──────╮                        │
│                    │  📣  │                         │
│                    ╰──────╯                        │
│                  ยังไม่มีประกาศ                     │
│  เริ่มต้นด้วยการสร้างประกาศแรกให้ทุกคนเห็นบนหน้าแรกครับ │
│                [ + สร้างประกาศแรก ]                 │
│  ─────────────────────────────────────────────────  │  ← border-top
│  ✓ ปักหมุดเรื่องสำคัญไว้บนสุด                        │
│  ✓ ตั้งเวลาแสดงล่วงหน้าและวันหมดอายุ                 │
│  ✓ แนบรูปประกอบได้ 1 รูป                            │
└──────────────────────────────────────────────────┘

Detail modal (headerVariant="main"):
╔══════════════════════════════════════════════════════╗
║  หัวข้อประกาศ (ขาว)                          [ ✕ ]    ║
╠══════════════════════════════════════════════════════╣
│  [ปักหมุด] [เห็นเฉพาะ Dev]  12 ก.ย. 2569 · โดย admin  │
│  [ภาพประกอบเต็มความกว้าง (ImagePreview, contain)]      │
│  เนื้อหาเต็ม (white-space: pre-line)                   │
├──────────────────────────────────────────────────────┤
│                                          [ ปิด ]        │
└──────────────────────────────────────────────────────┘
```

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| card | border / radius | `1px solid var(--color-border)` / `var(--radius-md)` |
| card hover/focus | border / shadow | `var(--base-font-color)` / `var(--shadow-sm)` |
| card gap ภายใน | gap | `var(--sp-sm)` (header/body/footer), `var(--sp-md)` (body: thumb↔text) |
| pinned tag | border / color / radius | `1px solid var(--base-warning)` / `var(--base-warning)` / `var(--radius-sm)` |
| dev-only tag | border / color / radius | `1px solid var(--color-border)` / `var(--base-sub-color)` / `var(--radius-sm)` (neutral, ขนาด/รูปร่างเหมือน pinned tag — `.announcement-card__tag` base class + modifier `--pinned`/`--dev`) |
| title | font-weight / color | `700` / `var(--base-font-color)` |
| date/meta | font-size / color | `var(--fs-sm)` / `var(--base-sub-color)` |
| thumbnail | size / radius / object-fit | `88px × 88px` / `var(--radius-md)` / `cover` (raw `<img>` — ดูเหตุผลใน Diff) |
| body text (compact) | clamp | `-webkit-line-clamp: 3` |
| body text (full) | white-space | `pre-line` |
| feed list gap | gap | `var(--sp-md)` |
| empty state | padding / min-height / gap | `var(--sp-2xl) var(--sp-lg)` / `calc(var(--sp-2xl) * 11)` / `var(--sp-md)` |
| empty state icon circle | size / radius / bg / icon color / icon size | `calc(var(--sp-2xl) * 3)` (72px) / `50%` / `var(--color-highlight-bg)` / `var(--base-font-color)` / `calc(var(--fs-xl) * 1.6)` |
| empty state title | font-weight / font-size | `700` / `var(--fs-lg)` |
| empty state hint | font-size / color | `var(--fs-base)` / `var(--base-sub-color)` |
| empty state tips row | border-top / margin-top / padding-top / gap | `1px solid var(--color-border)` / `var(--sp-lg)` / `var(--sp-lg)` / `var(--sp-lg)` |
| empty state tip item | gap / font-size / color | `var(--sp-xs)` / `var(--fs-sm)` / `var(--base-sub-color)` |
| load-more row | margin-top | `var(--sp-md)` |
| manage toolbar row | margin-bottom | `var(--sp-md)` (จัด right-align ในเนื้อหา ไม่ใช่ header — ดู Diff; ซ่อนทั้งแถวเมื่อ list ว่างกันมี 2 CTA ซ้อนกับปุ่มใน empty state) |

---

## States (ครบทุก state ที่ component มี)

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | border `--color-border`, ไม่มี shadow |
| hover / focus-visible | border `--base-font-color` + `box-shadow: var(--shadow-sm)` (ทั้ง card คลิกได้ ตาม role="button") |
| compact (การ์ดในฟีดหน้าแรก) | body clamp 3 บรรทัด + แสดง "อ่านต่อ ▸" |
| full (การ์ดใน detail modal / ไม่ compact) | body ไม่ clamp, `white-space: pre-line`, ไม่แสดง "อ่านต่อ" |
| pinned | แสดง pinned tag ก่อน title |
| audience=dev | แสดง dev-only tag ("เห็นเฉพาะ Dev", `bi-eye-slash`) ต่อจาก pinned tag — ทั้งในการ์ด, detail modal (meta line), และ list column สถานะ |
| มีรูป | แสดง thumbnail 88px (การ์ด) หรือรูปเต็มความกว้าง (modal) |
| ไม่มีรูป | ไม่ render thumbnail — text เต็มความกว้าง |
| empty + canManage=false (viewer) | icon circle `bi-megaphone` + emptyTitle + emptyHint — ไม่มี CTA/tips |
| empty + canManage=true (manager) | icon circle + emptyTitle + emptyHintManager + ปุ่ม `createFirst` (`btn-main`) + tips row 3 รายการ (ปักหมุด/ตั้งเวลา/แนบรูป) — manage toolbar (`.feed-toolbar`) ไม่ render ซ้ำ (กันมี 2 CTA) |
| load-more | ปุ่ม outline แสดงเฉพาะ `items.length < total` |

---

## Diff จากของเดิม

- ฟีเจอร์ใหม่ทั้งหมด — ไม่มีของเดิมให้เทียบ
- **thumbnail ใช้ `<img>` ตรง ไม่ใช่ `ImagePreview`**: `ImagePreview.vue` ส่ง prop `style` (border/radius/object-fit) เข้า root `<span>` ของ PrimeVue `Image` ไม่ใช่ตัว `<img>` จริง (ดู `primevue/image/Image.vue` — แยก prop `style` root vs `imageStyle` img) จึงบังคับ `object-fit: cover` ระดับ 88px square ผ่าน `ImagePreview` ไม่ได้ ใช้ raw `<img>` แทนตาม native-call-policy (state เหตุผลใน comment ของโค้ด) — ส่วน detail modal ยังใช้ `ImagePreview` ตามแผน (full-width, contain, override responsive ด้วย `:deep(.p-image img)`)
- **manage toolbar ไม่ได้อยู่ใน `#header-actions`**: `SectionCardGeneric` รองรับ slot `#header-actions` เฉพาะ `headerStyle="filled"` เท่านั้น (ไม่รองรับ `legend`) — ปุ่ม "จัดการประกาศ" จึงย้ายมาเป็นแถว toolbar right-align บนสุดของ default slot แทน
- status badge (หน้า `/announcement` list) reuse token `--status-open/-resolved/-closed/-cancelled` เดิมจากโมดูล Ticket (scheduled=open, visible=resolved, hidden=closed, expired=cancelled) แทนการเพิ่ม token ใหม่ใน `variable.scss`
- **empty state (2026-09-08 follow-up)**: เปลี่ยนจาก icon 28px + ข้อความสั้น เป็น empty state เต็มกล่อง (icon circle 72px + title + hint + CTA เฉพาะผู้มีสิทธิ์ + tips 3 ข้อ) กันการ์ดดูโหว่บนหน้าแรก; hint แยก 2 ข้อความตามสิทธิ์ (`emptyHint` viewer / `emptyHintManager` manager); manage toolbar (`.feed-toolbar`) เปลี่ยนเป็น render เฉพาะเมื่อ `canManage && items.length` กันมี 2 ปุ่มจัดการซ้อนกับปุ่ม `createFirst` ใน empty state
- **audience field all/dev (2026-09-09 follow-up)**: เพิ่ม field `audience` (`all` default / `dev`) — ประกาศที่ตั้งเป็น `dev` เห็นเฉพาะ role Dev บนหน้าแรก (โหมด "ดูของจริงก่อน publish"); ฟอร์มใช้ `RadioGroupGeneric` (2 ตัวเลือก, `inline`) แทน `DropdownGeneric` เพราะมีแค่ 2 ค่าคงที่ ไม่ต้อง search/scroll; list filter ใช้ `DropdownGeneric` ตาม Core Principle #11 (exception เดียวกับ status/pinned — single-choice โดยธรรมชาติ); tag "เห็นเฉพาะ Dev" ดึง `.announcement-card__tag` เดิมมาทำเป็น base class + modifier (`--pinned` คงสีเดิม, `--dev` เป็น neutral border+sub-color) แทนการเขียน class ใหม่แยกจากกัน

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `src/views/announcement/components/announcement-card.vue` | การ์ดเดี่ยว — header (pinned tag + title + date), body (thumbnail + text clamp/full), footer (by + อ่านต่อ) |
| `src/views/announcement/modal/announcement-detail-modal.vue` | detail modal เต็ม — headerVariant="main", ImagePreview full-width |
| `src/views/dashboard/home/components/announcement-feed.vue` | feed widget — SectionCardGeneric legend, list, empty state, load-more, manage toolbar |
| `src/views/announcement/index-view.vue` | list/manage page — status badge ใช้ token ที่ reuse จาก ticket |

- delegate: **@ui-implementer** · verify: `npm run lint` + `npm run build` + `npx vitest run`
- บันทึก **Design Decision Log** ใน `docs/design-system.md` (วันที่ 2026-09-08)

---

## Screenshots

- ไม่มี — build จาก ASCII layout ข้างต้นตรงๆ (ไม่มี Claude Design frame แยกสำหรับฟีเจอร์นี้)
