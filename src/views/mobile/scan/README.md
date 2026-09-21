# Mobile Scan Feature

## Overview
Mobile-optimized scan feature for stock products — scan bar + fullscreen camera + product detail card, same pattern as `/mobile/pos`.

## Structure

```
src/views/mobile/scan/
├── index-view.vue                    # Main scan interface
└── components/
    └── product-detail-card.vue       # Product detail display component
```

## Flow

1. User opens `/mobile/scan` — sees a scan bar (`[InputTextGeneric][search][camera]`) and an empty state.
2. Product lookup, either way:
   - Type/scan the code into the input and press Enter or tap the search button.
   - Tap the camera button to open a fullscreen camera (`CameraScanGeneric`, shared with `/mobile/pos`'s scan bar).
3. Lookup tries the old code (`stockNumberOrigin`) first, then falls back to the new code (`stockNumber`) automatically — user never has to choose which field to search by.
4. Found → `ProductDetailCard` renders below the scan bar, plus an action zone (create cost plan when appraisal data exists; other actions are placeholders for future work). Failed lookups keep the previously found product on screen.

## Components Used

### CameraScanGeneric (`@/components/generic/CameraScanGeneric.vue`)
Shared fullscreen barcode/QR camera (html5-qrcode) — also used by `/mobile/pos`'s scan bar and `/showcase-scan`. Emits `detect(code)` / `close`; this view has no domain logic inside the camera component itself.

### ProductDetailCard (`./components/product-detail-card.vue`)
Reusable mobile-optimized product display.
- Props:
  - `product` (Object): Product data from API
  - `priceTransactions` (Array): appraisal cost line items, if any
  - `imageType` (String): Image type for `ImagePreview`

## API Integration

Lookup goes through the shared helper `fetchStockProduct(productStore, formValue)` in `@/services/utils/stock-scan.js`, which never throws and returns `{ data, status: 'ok'|'not-found'|'error', httpStatus }`.

```javascript
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { fetchStockProduct } from '@/services/utils/stock-scan.js'

const byOriginCode = await fetchStockProduct(productStore, { stockNumberOrigin: code })
// not-found → fall back to stockNumber
const byNewCode = await fetchStockProduct(productStore, { stockNumber: code })
```

## Alert System
Uses centralized alert service (as per CLAUDE.md guidelines): `warning`/`error`/`success` from `@/services/alert/sweetAlerts.js`.

## Styling
Uses mobile utility classes from `@/assets/scss/responsive-style/mobile` (`.mobile-container`, `.mobile-empty-state`, `.mobile-mt-*`) plus design tokens (`var(--sp-*)`, `var(--radius-*)`) for the scan bar and action zone.

## Permissions
Controlled by `mobile:scan` permission in:
- `src/router/mobile/authen-routes.js`
- `src/services/permission/config.js`
- `src/components/layout/mobile-bottom-nav.vue`

## Related Files
- Router: `src/router/mobile/authen-routes.js`
- Permissions: `src/services/permission/config.js`
- API Store: `src/stores/modules/api/stock/product-api.js`
- Stock lookup helper: `src/services/utils/stock-scan.js`
- Image Component: `src/components/prime-vue/ImagePreview.vue`
- Camera: `src/components/generic/CameraScanGeneric.vue`
- Mobile Styles: `src/assets/scss/responsive-style/mobile/`
