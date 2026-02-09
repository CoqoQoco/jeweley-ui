<template>
  <div class="barcode-demo-container">
    <div class="barcode-card">
      <!-- Row 1: Stock Code and Date -->
      <div class="barcode-row header-row">
        <span class="stock-code">{{ stockCode }}</span>
        <span class="date">{{ date }}</span>
      </div>

      <!-- Row 2: Barcode -->
      <div class="barcode-row barcode-image">
        <svg viewBox="0 0 300 50" class="barcode-svg">
          <!-- Barcode bars -->
          <g>
            <rect x="5" y="0" width="2" height="50" fill="black" />
            <rect x="9" y="0" width="1" height="50" fill="black" />
            <rect x="12" y="0" width="3" height="50" fill="black" />
            <rect x="17" y="0" width="1" height="50" fill="black" />
            <rect x="20" y="0" width="2" height="50" fill="black" />
            <rect x="24" y="0" width="1" height="50" fill="black" />
            <rect x="27" y="0" width="3" height="50" fill="black" />
            <rect x="32" y="0" width="2" height="50" fill="black" />
            <rect x="36" y="0" width="1" height="50" fill="black" />
            <rect x="39" y="0" width="2" height="50" fill="black" />
            <rect x="43" y="0" width="3" height="50" fill="black" />
            <rect x="48" y="0" width="1" height="50" fill="black" />
            <rect x="51" y="0" width="2" height="50" fill="black" />
            <rect x="55" y="0" width="1" height="50" fill="black" />
            <rect x="58" y="0" width="3" height="50" fill="black" />
            <rect x="63" y="0" width="2" height="50" fill="black" />
            <rect x="67" y="0" width="1" height="50" fill="black" />
            <rect x="70" y="0" width="2" height="50" fill="black" />
            <rect x="74" y="0" width="3" height="50" fill="black" />
            <rect x="79" y="0" width="1" height="50" fill="black" />
            <rect x="82" y="0" width="2" height="50" fill="black" />
            <rect x="86" y="0" width="1" height="50" fill="black" />
            <rect x="89" y="0" width="3" height="50" fill="black" />
            <rect x="94" y="0" width="2" height="50" fill="black" />
            <rect x="98" y="0" width="1" height="50" fill="black" />
            <rect x="101" y="0" width="2" height="50" fill="black" />
            <rect x="105" y="0" width="3" height="50" fill="black" />
            <rect x="110" y="0" width="1" height="50" fill="black" />
            <rect x="113" y="0" width="2" height="50" fill="black" />
            <rect x="117" y="0" width="1" height="50" fill="black" />
            <rect x="120" y="0" width="3" height="50" fill="black" />
            <rect x="125" y="0" width="2" height="50" fill="black" />
            <rect x="129" y="0" width="1" height="50" fill="black" />
            <rect x="132" y="0" width="2" height="50" fill="black" />
            <rect x="136" y="0" width="3" height="50" fill="black" />
            <rect x="141" y="0" width="1" height="50" fill="black" />
            <rect x="144" y="0" width="2" height="50" fill="black" />
            <rect x="148" y="0" width="1" height="50" fill="black" />
            <rect x="151" y="0" width="3" height="50" fill="black" />
            <rect x="156" y="0" width="2" height="50" fill="black" />
            <rect x="160" y="0" width="1" height="50" fill="black" />
            <rect x="163" y="0" width="2" height="50" fill="black" />
            <rect x="167" y="0" width="3" height="50" fill="black" />
            <rect x="172" y="0" width="1" height="50" fill="black" />
            <rect x="175" y="0" width="2" height="50" fill="black" />
            <rect x="179" y="0" width="1" height="50" fill="black" />
            <rect x="182" y="0" width="3" height="50" fill="black" />
            <rect x="187" y="0" width="2" height="50" fill="black" />
            <rect x="191" y="0" width="1" height="50" fill="black" />
            <rect x="194" y="0" width="2" height="50" fill="black" />
            <rect x="198" y="0" width="3" height="50" fill="black" />
            <rect x="203" y="0" width="1" height="50" fill="black" />
            <rect x="206" y="0" width="2" height="50" fill="black" />
            <rect x="210" y="0" width="1" height="50" fill="black" />
            <rect x="213" y="0" width="3" height="50" fill="black" />
            <rect x="218" y="0" width="2" height="50" fill="black" />
            <rect x="222" y="0" width="1" height="50" fill="black" />
            <rect x="225" y="0" width="2" height="50" fill="black" />
            <rect x="229" y="0" width="3" height="50" fill="black" />
            <rect x="234" y="0" width="1" height="50" fill="black" />
            <rect x="237" y="0" width="2" height="50" fill="black" />
            <rect x="241" y="0" width="1" height="50" fill="black" />
            <rect x="244" y="0" width="3" height="50" fill="black" />
            <rect x="249" y="0" width="2" height="50" fill="black" />
            <rect x="253" y="0" width="1" height="50" fill="black" />
            <rect x="256" y="0" width="2" height="50" fill="black" />
            <rect x="260" y="0" width="3" height="50" fill="black" />
            <rect x="265" y="0" width="1" height="50" fill="black" />
            <rect x="268" y="0" width="2" height="50" fill="black" />
            <rect x="272" y="0" width="1" height="50" fill="black" />
            <rect x="275" y="0" width="3" height="50" fill="black" />
            <rect x="280" y="0" width="2" height="50" fill="black" />
            <rect x="284" y="0" width="1" height="50" fill="black" />
            <rect x="287" y="0" width="2" height="50" fill="black" />
            <rect x="291" y="0" width="3" height="50" fill="black" />
          </g>
        </svg>
      </div>

      <!-- Row 3: Description and Gold Type -->
      <div class="barcode-row footer-row">
        <span class="description">{{ description }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    stockCode: {
      type: String,
      default: '*TEST001*'
    },
    barcode: {
      type: String,
      default: 'TEST001'
    },
    description: {
      type: String,
      default: 'Description'
    },
    date: {
      type: String,
      default: '01/01/2024'
    },
    goldType: {
      type: String,
      default: '18K'
    }
  }
}
</script>

<style lang="scss" scoped>
.barcode-demo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px;
}

.barcode-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border: 2px solid #333;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.barcode-row {
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #000;
  padding: 2px 0;

  .stock-code {
    letter-spacing: 1px;
  }

  .date {
    letter-spacing: 0.5px;
  }
}

.barcode-image {
  padding: 4px 0;

  .barcode-svg {
    width: 100%;
    height: 50px;
    display: block;
  }
}

.footer-row {
  font-size: 15px;
  color: #000;
  font-weight: 500;
  padding: 2px 0;

  .description {
    display: block;
    text-align: left;
  }
}
</style>
