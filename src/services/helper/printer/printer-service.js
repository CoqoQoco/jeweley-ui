// services/printService.js
export const printBarcode = async (zplData) => {
  try {
    const response = await fetch('http://localhost:5000/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: zplData })
    })

    const result = await response.json()
    if (result.status === 'success') {
      return true
    }
    throw new Error(result.message)
  } catch (error) {
    console.error('Print error:', error)
    throw error
  }
}
