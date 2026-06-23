export function setTableHeader(text) {
  return {
    text: text,
    bold: true,
    fontSize: 10,
    alignment: 'center',
    fillColor: '#8B0000',
    color: 'white',
    margin: [2, 5, 2, 5]
  }
}

export function setTableCell(text) {
  return {
    text: text || '',
    fontSize: 7,
    margin: [2, 3, 2, 3]
  }
}

export function setTableCellRight(text) {
  return {
    text: text || '',
    fontSize: 7,
    alignment: 'right',
    margin: [2, 3, 2, 3]
  }
}

export function setImageCell(imageBase64, imageBlobPath = null) {
  if (!imageBase64 && !imageBlobPath) {
    return {
      text: '',
      alignment: 'center'
    }
  }

  if (imageBase64) {
    const imageData = imageBase64.startsWith('data:image')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`

    return {
      image: imageData,
      width: 38,
      height: 38,
      alignment: 'center',
      margin: [2, 3, 2, 3]
    }
  }

  if (imageBlobPath) {
    return {
      text: 'No Image',
      fontSize: 8,
      color: '#999999',
      alignment: 'center',
      margin: [2, 5, 2, 5]
    }
  }
}

export function buildMaterialTable(materials, type) {
  if (!materials || !Array.isArray(materials)) return ''
  const rows = materials
    .filter((m) => m.type === type)
    .map((m) => [
      {
        text:
          type === 'Gold'
            ? m.typeCode || ''
            : (m.qty ? '(' + m.qty + ') ' : '') + (m.typeCode || ''),
        alignment: 'left',
        fontSize: 7,
        margin: [0, 0, 0, 0]
      },
      {
        text: m.weight ? Number(m.weight).toFixed(2) : Number(0).toFixed(2),
        alignment: 'right',
        fontSize: 7,
        margin: [0, 0, 0, 0]
      }
    ])
  if (!rows.length) return ''
  return {
    table: {
      widths: ['*', 22],
      body: rows
    },
    layout: {
      hLineWidth: function () {
        return 0
      },
      vLineWidth: function () {
        return 0
      },
      paddingLeft: function () {
        return 0
      },
      paddingRight: function () {
        return 0
      },
      paddingTop: function () {
        return 0
      },
      paddingBottom: function () {
        return 0
      }
    },
    margin: [2, 3, 0, 0]
  }
}
