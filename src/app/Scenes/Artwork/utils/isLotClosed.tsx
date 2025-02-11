interface SaleAttributes {
  isClosed: boolean | null
}

interface SaleArtworkAttributes {
  endedAt: string | null
}

// TODO: duplites Force's logic
//       consider moving this to Metaphysics
export const isLotClosed = (
  sale: SaleAttributes | null,
  saleArtwork: SaleArtworkAttributes | null
): boolean => {
  // If there is no sale or saleArtwork, we can't determine if the lot is closed
  // so we return true to be safe.
  if (!sale || !saleArtwork) return true

  if ("isClosed" in sale && sale.isClosed) return true
  if (saleArtwork.endedAt) return true

  return false
}
