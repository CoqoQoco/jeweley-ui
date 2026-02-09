# Responsive Styles

> Responsive utility classes for **Tablet and Desktop only**. Mobile will have separate routes and layouts.

## 📁 File Structure

```
responsive-style/
├── index.scss                 # Main import file
├── responsive-utilities.scss  # All responsive utility classes
└── README.md                 # This file
```

## 🚀 Usage

### Import in Component

```vue
<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss'; // Legacy styles
@import '@/assets/scss/responsive-style';                // Responsive utilities
</style>
```

### Quick Example

```vue
<template>
  <div class="responsive-container">
    <!-- Table with horizontal scroll on tablet -->
    <div class="responsive-table-wrapper">
      <DataTable :value="items">...</DataTable>
    </div>

    <!-- Buttons that wrap naturally -->
    <div class="responsive-btn-group">
      <button class="btn btn-sm btn-green">บันทึก</button>
      <button class="btn btn-sm btn-secondary">ยกเลิก</button>
    </div>

    <!-- Grid: 3 columns → 2 columns on tablet -->
    <div class="responsive-grid-container">
      <div>Field 1</div>
      <div>Field 2</div>
      <div>Field 3</div>
    </div>
  </div>
</template>
```

## 📋 Available Classes

### Table & Data Display
- `.responsive-table-wrapper` - Table with horizontal scroll on tablet

### Button Groups
- `.responsive-btn-group` - Buttons with flex-wrap

### Action Groups
- `.responsive-action-group` - Dropdown + button group

### Info & Display
- `.responsive-info-row` - Info row with flex-wrap

### Text & Typography
- `.responsive-text-note` - Note text with responsive font size

### Grid Layouts
- `.responsive-grid-container` - 3 cols → 2 cols on tablet
- `.responsive-grid-2col` - 2 cols → 1 col on tablet
- `.responsive-grid-2col-fixed` - Always 2 cols

### Visibility
- `.hide-tablet` - Hide on tablet (≤ 1024px)
- `.show-desktop-only` - Show only on desktop (> 1024px)
- `.show-tablet-only` - Show only on tablet (≤ 1024px)

### Spacing
- `.responsive-padding` - Responsive padding
- `.responsive-padding-lg` - Large padding
- `.responsive-padding-sm` - Small padding
- `.responsive-margin` - Responsive margin

### Containers & Layout
- `.responsive-container` - Max-width container
- `.responsive-section` - Section with responsive padding
- `.responsive-card` - Card with responsive padding

### Flex Utilities
- `.responsive-flex-row` - Flex row with wrap
- `.responsive-flex-column` - Flex column
- `.responsive-flex-center` - Centered flex
- `.responsive-flex-between` - Space between with wrap

### Form Utilities
- `.responsive-form-group` - Form group with responsive margin
- `.responsive-label` - Label with responsive font size
- `.responsive-modal-content` - Modal content with responsive padding

## 🎯 Breakpoints

| Device  | Breakpoint | Behavior |
|---------|-----------|----------|
| Desktop | > 1024px  | Default styles |
| Tablet  | ≤ 1024px  | Adjusted styles |
| Mobile  | < 768px   | Separate routes/layouts |

## ⚠️ Important Notes

1. **Mobile is separate**: Don't add mobile breakpoints here. Mobile will have its own routes and layouts.

2. **Legacy styles**: Old styles remain in `custom-style/standard-form.scss`. Don't mix them.

3. **Import both**: Always import both `standard-form.scss` and `responsive-style` if you need both:
   ```scss
   @import '@/assets/scss/custom-style/standard-form.scss';
   @import '@/assets/scss/responsive-style';
   ```

4. **Component-specific styles**: Use media queries in component styles for specific needs:
   ```scss
   :deep(.p-datatable) {
     @media (max-width: 1024px) {
       font-size: 13px;
     }
   }
   ```

## 🧪 Testing

```bash
# Open Chrome DevTools (F12)
# Toggle Device Toolbar (Ctrl+Shift+M)
# Test at these widths:
- 1024px (Tablet)
- 1280px+ (Desktop)
```

## 📝 Adding New Classes

When adding new responsive utilities:

1. Add to `responsive-utilities.scss`
2. Document in this README
3. Update examples in CLAUDE.md
4. Test at both breakpoints (1024px and 1280px+)

## 🔗 Related Documentation

- Main Documentation: `E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md`
- Legacy Styles: `E:\coqo_duangkeaw\Code\jeweley-ui\src\assets\scss\custom-style\standard-form.scss`
