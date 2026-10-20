export const normalizeCostVersions = (response) => {
  let rawVersions = []
  if (Array.isArray(response)) {
    rawVersions = response
  } else if (response && Array.isArray(response.data)) {
    rawVersions = response.data
  } else if (response && response.data) {
    rawVersions = [response.data]
  }

  return rawVersions.map((version, index) => {
    const totalPrice = version.prictransection
      ? version.prictransection.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
      : 0

    return {
      ...version,
      versionId: version.running || `v-${index}`,
      versionNumber: rawVersions.length - index,
      priceTransactions: version.prictransection || [],
      totalPrice,
      customerNumber: version.customerCode || null
    }
  })
}
