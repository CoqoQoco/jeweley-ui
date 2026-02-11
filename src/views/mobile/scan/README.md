# Mobile Scan Feature

## Overview
Mobile-optimized scan feature for stock products with QR/Barcode scanning capability.

## Structure

```
src/views/mobile/scan/
├── index-view.vue                    # Main scan interface
└── components/
    ├── product-detail-card.vue       # Product detail display component
    └── qr-scanner.vue                # QR/Barcode camera scanner
```

## Features Implemented

### 1. Scan Type Selection
- User can select what type of item to scan
- Currently supports: **Stock Product** (สแกนสินค้า)
- Extensible design for future scan types:
  - Production Plans (แผนการผลิต)
  - Molds (แม่พิมพ์)
  - Gems (พลอย)

### 2. Scanning Interface
- **QR/Barcode Camera Scanner**: Real-time camera scanning using `html5-qrcode` library
  - Auto-detects available cameras
  - Prefers back camera for better scanning
  - Support for switching between cameras
  - Visual scanner frame with corner indicators
  - Automatic stop after successful scan
- **Manual Input**: User can manually enter stock number or product code
- Uses API: `productStore.fetchDataGet({ formValue })`
  - Searches by both `stockNumber` and `productNumber`

### 3. Product Detail Display
Mobile-optimized product card showing:
- **Product Image**: Using existing `ImagePreview` component (type: 'STOCK-PRODUCT')
- **Stock Information**:
  - Stock Number (new/original)
  - Product Number
  - Mold Number
- **Product Details**:
  - Product Names (EN/TH)
  - Product Type
  - Size
- **Production Info**:
  - Gold/Silver Color
  - Gold/Silver Type
  - W.O. Number
- **Price & Location**:
  - Product Price (formatted)
  - Storage Location
- **Materials Summary** (if available):
  - Gold weight (grams)
  - Diamond weight (carats)
  - Gem weight (carats)
- **Remark** (if available)

### 4. Action Zone
Placeholder for future mobile-specific actions:
- Update Stock (อัพเดทสต็อก)
- Print Label (พิมพ์ป้าย)
- Change Location (เปลี่ยนที่จัดเก็บ)

All buttons are currently disabled with a note: "ฟีเจอร์การดำเนินการจะพัฒนาในอนาคต"

### 5. User Flow

```
1. User opens /mobile/scan
   ↓
2. Select Scan Type (e.g., "สแกนสินค้า")
   ↓
3. Scanner Interface
   ├─ Option A: Camera scanning
   │   ├─ Click "เปิดกล้อง"
   │   ├─ Grant camera permission
   │   ├─ Scan QR/Barcode
   │   └─ Auto-search after scan
   └─ Option B: Manual input
       ├─ Enter stock number/product code
       └─ Click search or press Enter
   ↓
4. Product Detail Display
   ├─ View product information
   ├─ View product image
   └─ See available actions (placeholder)
   ↓
5. Actions
   ├─ Scan Again (สแกนอีกครั้ง)
   └─ Back to Type Selection (←)
```

## Components Used

### Existing Components
- `ImagePreview` (`@/components/prime-vue/ImagePreview.vue`)
  - Used for displaying product images
  - Type: `STOCK-PRODUCT`
  - Size: 200x200px (configurable)
  - Includes preview functionality

### New Components

#### ProductDetailCard (`./components/product-detail-card.vue`)
- Reusable mobile-optimized product display
- Props:
  - `product` (Object): Product data from API
  - `imageType` (String): Image type for ImagePreview
  - `imageSize` (Number): Image dimensions

#### QrScanner (`./components/qr-scanner.vue`)
- Real-time QR/Barcode camera scanner
- Uses `html5-qrcode` library
- Features:
  - Auto camera detection
  - Camera switching support
  - Visual scanner frame overlay
  - Error handling for permissions
- Events:
  - `@scan(decodedText, decodedResult)`: Emitted when code is successfully scanned
- Camera Configuration:
  - FPS: 10 frames per second
  - Scanner Box: 250x250px
  - Aspect Ratio: 1.0

## API Integration

### Product API Store
```javascript
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

// Get product by stock number or product code
const response = await productStore.fetchDataGet({
  formValue: {
    stockNumber: searchValue,
    productNumber: searchValue
  }
})
```

### Response Structure
```javascript
{
  data: {
    stockNumber: string,
    stockNumberOrigin: string,
    productNumber: string,
    mold: string,
    productNameEn: string,
    productNameTh: string,
    productTypeName: string,
    size: string,
    productionType: string,      // Gold/Silver color
    productionTypeSize: string,  // Gold/Silver type
    woText: string,
    productPrice: number,
    location: string,
    imagePath: string,
    remark: string,
    // Materials (if available)
    goldTotal: number,
    diamondTotal: number,
    gemTotal: number
  }
}
```

## Alert System
Uses centralized alert service (as per CLAUDE.md guidelines):
```javascript
import { warning, error } from '@/services/alert/sweetAlerts.js'

// Show validation warning
warning('กรุณากรอกเลขที่ผลิตหรือรหัสสินค้า')

// Show error when product not found
error('ไม่พบข้อมูลสินค้า', 'กรุณาตรวจสอบเลขที่ผลิตหรือรหัสสินค้า')
```

## Styling
Uses mobile utility classes from:
```scss
@import '@/assets/scss/responsive-style/mobile';
```

Key mobile classes used:
- `.mobile-container` - Main container with padding
- `.mobile-mt-*` - Margin top utilities
- `.mobile-title` - Page title
- `.mobile-btn` - Button styles
- `.mobile-btn-primary` - Primary button
- `.mobile-btn-secondary` - Secondary button
- `.mobile-btn-outline` - Outline button
- `.mobile-btn-icon` - Icon-only button
- `.mobile-btn-block` - Full-width button

## Dependencies

### html5-qrcode
```bash
npm install html5-qrcode
```

Library for QR/Barcode scanning using device camera:
- Support for both QR codes and various barcode formats
- Cross-browser compatibility
- Mobile-friendly
- No external dependencies
- Documentation: https://github.com/mebjas/html5-qrcode

## Camera Permissions

The app requires camera permission to scan QR/Barcode:
- Browser will prompt for camera access on first use
- Permission is required for HTTPS or localhost only (security requirement)
- User can grant/deny permission in browser settings
- Clear error message shown if permission denied

## Future Enhancements

### Additional Scan Types
Commented examples in code for:
- Production Plans
- Molds
- Gems

### Action Zone Features
Future implementations for:
- Stock updates
- Label printing
- Location changes
- History viewing
- Cost viewing

## Testing

### Manual Testing Steps

#### Camera Scanning:
1. Navigate to `/mobile/scan` on mobile device or desktop with camera
2. Select "สแกนสินค้า"
3. Click "เปิดกล้อง" button
4. Grant camera permission when prompted
5. Point camera at QR code or barcode containing stock number
6. Verify automatic search after successful scan
7. Check product details display correctly
8. Test "สลับกล้อง" button (if multiple cameras available)

#### Manual Input:
1. Navigate to `/mobile/scan`
2. Select "สแกนสินค้า"
3. Scroll down to manual input section
4. Enter a valid stock number or product code
5. Press "ค้นหา" or Enter
6. Verify product details display correctly
7. Verify image loads correctly

#### General:
1. Test "สแกนอีกครั้ง" button
2. Test back button to return to type selection
3. Test error handling (invalid stock number, camera permission denied)
4. Test on different devices (iPhone, Android, Desktop)

### Test Data
Use existing stock numbers from your database to test the search functionality.

## Notes

### Generic Components
- **ImagePreview**: Existing `src/components/prime-vue/ImagePreview.vue` is already generic and reusable
- No additional generic components needed for this feature
- ProductDetailCard is mobile-specific and placed in feature directory

### Code Quality
- Follows CLAUDE.md guidelines:
  - ✅ No try-catch blocks (axios handles errors)
  - ✅ No manual loading states (axios middleware handles)
  - ✅ Uses sweetAlerts service (no native alerts)
  - ✅ Kebab-case filenames
  - ✅ Mobile-specific styles
  - ✅ Component-based architecture

### Permissions
Controlled by mobile:scan permission in:
- `src/router/mobile/authen-routes.js`
- `src/services/permission/config.js`
- `src/components/layout/mobile-bottom-nav.vue`

## Related Files
- Router: `src/router/mobile/authen-routes.js` (line 37-47)
- Permissions: `src/services/permission/config.js` (line 58, 115-118, 154-157, etc.)
- API Store: `src/stores/modules/api/stock/product-api.js`
- Image Component: `src/components/prime-vue/ImagePreview.vue`
- Mobile Styles: `src/assets/scss/responsive-style/mobile/`
