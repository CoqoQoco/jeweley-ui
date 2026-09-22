# Blueprint — Public Product Showcase (Stock Link `/p/:token`)

> พิมพ์เขียว design ของหน้าสินค้าสาธารณะที่ลูกค้าสแกน QR/ลิงก์แล้วเปิดดู — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | `src/views/public/product-showcase/index-view.vue` + `src/components/public/showcase-header.vue`, `product-showcase.vue`, `showcase-gallery.vue`, `showcase-spec.vue`, `showcase-contact.vue` |
| **สถานะ** | ✅ approved (2026-09-22) → รอ map เข้าโค้ด |
| **วันที่ (อัปเดตล่าสุด)** | 2026-09-22 |
| **Ref ที่ใช้** | หน้าเดิม (screenshot 2026-09-22: logo เล็กจนอ่านไม่ออก, รหัส 3 ชุดรก, สเปกเป็น icon list) |
| **Claude Design** | Artifact canvas "Stock Link Redesign" — https://claude.ai/artifact/8hYv39kPcACvsHdKNFcgpq · frame `A · Ivory Boutique (mobile)` + `A · Ivory Boutique (web 1440)` |
| **ทางเลือกที่เลือก** | **A · Ivory Boutique** (จาก A/B/C) — ใกล้หน้าเดิมที่สุด แก้น้อยสุด, user ปรับรอบ 2: ตัดรหัสใหม่ + ปุ่มคัดลอก, ย้ายราคาเข้ากรอบกลาง, รหัสสินค้าลงไปเป็นบรรทัดเล็กใต้ราคา, เปิดหน้ามาเป็นภาษาอังกฤษ |

---

## Layout (frame ที่ approve)

### Mobile (< 900px, ออกแบบที่ 390px)

```
┌──────────────────────────────────────────┐
│                                 EN | TH  │  ← toggle มุมขวาบน (EN ก่อน, active = maroon)
│              ◇ (diamond mark)            │
│             DUANG KAEW                   │  ← โลโก้ตัดขอบว่างแล้ว กว้าง 176px
│               JEWELRY                    │
├──────────────────────────────────────────┤  ← เส้นคั่น 1px
│ ┌──────────────────────────────────────┐ │
│ │ (1 / 4)                              │ │  ← counter แสดงเมื่อรูป > 1
│ │                                      │ │
│ │            [ รูปสินค้า ]             │ │  ← กรอบ 1:1 พื้นขาว border 1px radius 18
│ │                                      │ │     แตะ = เปิด preview เต็มจอ (เหมือนเดิม)
│ └──────────────────────────────────────┘ │
│ [ ▣ ][ ▣ ][ ▣ ][ ▣ ]                     │  ← thumbnails แสดงเมื่อรูป > 1 (สูงสุด 4)
│                                          │     active = ring 2px maroon
│                 RING                     │  ← productTypeName ตัวเล็ก letterspacing
│             9K RING WG D/YS              │  ← ชื่อ serif (Taviraj) 30px
│            (ชื่อรองภาษาอื่น)             │
│      ┌────────────────────────────┐      │
│      │          ฿14,300           │      │  ← ราคา serif 36px maroon
│      │            ────            │      │  ← เส้นสั้น 40px
│      │  Product code  9K02906     │      │  ← รหัสเก่า ?? รหัสใหม่ (mono ตัวหนา)
│      └────────────────────────────┘      │
│             ● Available                  │  ← availability pill (ถ้ามีข้อมูล)
│ ┌──────────────────────────────────────┐ │
│ │ METAL                                │ │  ← หัว section สี maroon
│ │ Material               9K White Gold │ │
│ │ Weight                        1.58 g │ │
│ │ Size                             #55 │ │
│ │ GEMSTONES                            │ │
│ │ ◇ Sapphire            1 pcs · 0.43 ct│ │
│ │ ◇ VS2G                4 pcs · 0.03 ct│ │
│ └──────────────────────────────────────┘ │
│ ┌─────────────────┐ ┌──────────────────┐ │
│ │ ⚑ Made in       │ │ ✪ Handcrafted by │ │  ← trust tiles พื้นอ่อน 2 คอลัมน์
│ │   Thailand      │ │   Duangkaew ...  │ │
│ └─────────────────┘ └──────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │        ⤴  Share this item            │ │  ← ButtonGeneric main (filled maroon) block
│ └──────────────────────────────────────┘ │
│ [ f      ][ ◎      ][ ✉      ][ ⊕      ] │  ← 4 ช่องทาง icon + label ใต้ icon
│  Facebook  Instagram  Email    Website   │
├──────────────────────────────────────────┤
│                  ◇                       │
│   Duangkaew Jewelry · www.dkbangkok.com  │
└──────────────────────────────────────────┘
```

### Desktop (≥ 900px, ออกแบบที่ 1440px)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ◇ DUANG KAEW JEWELRY (200px)                   EN | TH   │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│            ┌──────────────────────────────┐    RING                                         │
│            │ (1 / 4)                      │    9K RING WG D/YS              ← serif 42px    │
│            │                              │    ┌───────────────────────┐                    │
│            │        [ รูปสินค้า ]         │    │ ฿14,300               │ ← serif 44px       │
│            │          560 × 560           │    │ ────                  │                    │
│            │      (sticky ตอน scroll)     │    │ Product code 9K02906  │                    │
│            │                              │    └───────────────────────┘                    │
│            └──────────────────────────────┘    ● Available                                  │
│            [ ▣ ][ ▣ ][ ▣ ][ ▣ ]                ┌─ spec card (เต็มคอลัมน์) ────────┐         │
│                                                │ METAL / GEMSTONES (เหมือน mobile) │         │
│            ◀──────── 560 ────────▶  gap 64 ▶   └───────────────────────────────────┘         │
│                                                [⚑ Made in Thailand][✪ Handcrafted ...]      │
│                                                [ ⤴ Share this item     ][f][◎][✉][⊕]        │
│            ◀──────────────── container 1120 ────────────────▶                               │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                              ◇  Duangkaew Jewelry · www.dkbangkok.com                       │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Spec — ค่าที่ใช้

### Palette (ใหม่ — scoped เฉพาะหน้าสาธารณะ เพิ่มใน `variable.scss` เป็น `--showcase-*`)

| token | ค่า | ใช้ที่ |
|---|---|---|
| `--showcase-bg` | #FBF8F5 | พื้นหน้า (ivory) |
| `--showcase-line` | #EADFD8 | เส้นคั่น header/footer, border กรอบรูป/การ์ด |
| `--showcase-line-soft` | #F1E8E3 | เส้นคั่นระหว่างแถวในการ์ดสเปก |
| `--showcase-box-border` | #E3D3CB | กรอบราคา, ปุ่มช่องทางติดต่อ |
| `--showcase-tile` | #F5EEE9 | พื้น trust tile, placeholder รูป |
| `--showcase-ink` | #2A1A1A | ตัวอักษรหลัก |
| `--showcase-text-soft` | #5C4A44 | ค่ารองในสเปก, label ใต้ icon ช่องทาง |
| `--showcase-muted` | #7A6760 | label สเปก, บรรทัดรหัส, footer (contrast 5.3:1 บนขาว) |
| `--showcase-accent` | #A4604F | overline ประเภทสินค้า, icon พลอย (rose-gold เข้ม) |
| `--showcase-toggle-off` | #8C7A74 | ปุ่มภาษาที่ไม่ active |
| primary | `var(--base-font-color)` #921313 | ราคา, หัว section, active ring, ปุ่มแชร์, icon ช่องทาง |

### Typography (โหลดเฉพาะหน้านี้ — self-host ผ่าน `@fontsource/*`)

| ส่วน | font | ขนาด (mobile / desktop) |
|---|---|---|
| ชื่อสินค้า | Taviraj 500 | 30px / 42px |
| ราคา | Taviraj 600 | 36px / 44px |
| เนื้อหาทั้งหมด | IBM Plex Sans Thai 400/500/600 | 15px (แถวสเปก), 13px (label), 12px (overline/footer) |
| รหัสสินค้า / counter | IBM Plex Mono 600 | 13px / 14px |

### ขนาด/ระยะ

| ส่วน | ค่า |
|---|---|
| header | padding `28px 16px 20px` (desktop `32px 0 26px`), logo 176px / 200px |
| gutter | 16px (mobile) · container 1120px + grid `560px 1fr` gap 64px (desktop) |
| กรอบรูป | 1:1, radius 18px (desktop 20px), border 1px `--showcase-line`, พื้นขาว |
| thumbnails | grid 4 คอลัมน์ gap 8px (desktop 12px), สูง 64px (desktop 100px), radius 12px |
| กรอบราคา | min-width 250px (desktop 300px), padding `16px 24px 14px`, radius 14px, พื้นขาว |
| การ์ดสเปก | padding `6px 20px 8px`, radius 18px, แถว padding 12px 0 |
| trust tile | radius 14px, padding 12px, พื้น `--showcase-tile` |
| ปุ่มแชร์ | สูง 52px, radius 14px |
| ช่องทาง | mobile: 4 คอลัมน์ icon+label radius 14px · desktop: 52×52 icon-only ต่อท้ายปุ่มแชร์แถวเดียว |
| touch target | ≥ 44px ทุกปุ่ม (ปุ่มภาษา 40–44 × 44) |

---

## States

| State | สิ่งที่เปลี่ยน |
|---|---|
| default (เปิดหน้า) | ภาษา **EN เสมอ** ไม่อ่าน/ไม่เขียน `lang` ของระบบหลังบ้าน |
| สลับภาษา | เปลี่ยน locale ในหน่วยความจำเท่านั้น · ออกจากหน้า (เช่นกด "สแกนชิ้นถัดไป") → คืน locale เดิมของระบบ |
| รูป 1 รูป | ซ่อน counter + thumbnails |
| รูป 2–4 รูป | แสดง counter "n / N" + thumbnails, แตะ thumbnail เปลี่ยนรูปใหญ่ |
| ไม่มีรูป (ยังไม่มีรูป gallery ลูกค้า) | placeholder พื้น `--showcase-tile` + icon `bi-gem` |
| ไม่มีรหัสเก่า | บรรทัดรหัสใช้รหัสใหม่ (`stockNumberOrigin || stockNumber`) |
| ไม่มีราคา (`ShowPrice=false`) | กรอบเหลือแค่บรรทัดรหัส (ไม่มีเส้นสั้น) |
| availability | pill เล็กใต้กรอบราคา (มีข้อมูลเท่านั้น) — เหมือนเดิม |
| loading / not found | skeleton + not-found เดิม เปลี่ยนพื้นเป็น `--showcase-bg` |
| staff flow (`?from=showcase`) | แถบ "สแกนชิ้นถัดไป" ติดล่างเหมือนเดิม |

---

## Diff จากของเดิม

- โลโก้: ไฟล์ 300×300 มีขอบว่างเยอะ แสดงสูง 36px จนตัวหนังสืออ่านไม่ออก → ใช้ไฟล์ตัดขอบ (290×160) กว้าง 176/200px กลางหัว
- **ตัดรหัสใหม่ (บรรทัด `codeNewLabel`) และรหัสชุดที่ 3 (`productNumber`) ออก** — เหลือรหัสเดียว
- ราคาย้ายเข้ากรอบกลาง (แทนตำแหน่งรหัสเดิม) · รหัสสินค้าย้ายลงเป็นบรรทัดเล็กใต้ราคา (แทนตำแหน่งรหัสใหม่เดิม)
- สเปกจาก icon list → การ์ด label/value 2 ฝั่ง แบ่ง Metal / Gemstones
- trust จากบรรทัด icon → tile 2 คอลัมน์
- ปุ่มแชร์จาก outline → filled maroon · ช่องทางติดต่อ mobile มี label ใต้ icon
- gallery รองรับหลายรูป (สูงสุด 4) — มาจาก `PublicProduct/Get.images` (StockProductGallery ล้วน) เท่านั้น, `imagePath` (รูปภายใน) ไม่ใช้ fallback แล้ว · จัดการรูปที่หน้ามือถือ "จัดการรูป" (SKU/MOLD scope)
- ภาษาเริ่มต้น EN (เดิมตามค่า `lang` ของระบบ) และไม่เขียนทับภาษาของระบบหลังบ้านอีกต่อไป
- **ยังไม่ทำ 3D/360°** ในรอบนี้ (ต้องมีไฟล์ 3D หรือชุดภาพหมุนก่อน — ตัวใน canvas เป็นโมเดลสาธิต)

---

## Mapping → โค้ด

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `src/assets/duangkaew-logo-trim.png` (ใหม่) | โลโก้ตัดขอบ 290×160 |
| `src/assets/scss/variable.scss` | เพิ่ม `--showcase-*` |
| `src/views/public/product-showcase/index-view.vue` | ตั้ง locale EN ตอนเข้า / คืนค่าตอนออก, import font, พื้น ivory |
| `src/components/public/showcase-header.vue` | โลโก้ใหม่ + toggle EN \| TH แบบไม่เขียน storage |
| `src/components/public/product-showcase.vue` | layout ใหม่ (title block, กรอบราคา+รหัส, ตัดรหัสใหม่/productNumber, trust tiles, desktop grid) |
| `src/components/public/showcase-gallery.vue` | รับ `images[]` + counter + thumbnails |
| `src/components/public/showcase-spec.vue` | การ์ด label/value |
| `src/components/public/showcase-contact.vue` | ปุ่มแชร์ filled + ช่องทาง mobile/desktop |
| `src/language/view/public/th.js`, `en.js` | key ใหม่ (`materialLabel`, `thumbAria`) |
| `docs/design-system.md` | Decision Log |

- delegate: **@ui-implementer** · verify: `npm run lint` + `npm run build` + chrome-mcp เปิดหน้า `/p/:token` จริงทั้ง mobile/desktop

---

## Screenshots

- ดีไซน์ที่ approve: artifact canvas ด้านบน (frame A mobile + A web)
- before: screenshot หน้าเดิมที่ user ส่งมา 2026-09-22 (logo หาย, รหัส 3 ชุด)
