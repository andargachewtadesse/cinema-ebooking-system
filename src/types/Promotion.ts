export interface Promotion {
  promotionId: number
  code: string
  discountPercentage: number
  description: string // This will serve as the "Promotion Title" and description combined
  creationDate: string // Assuming backend sends date as ISO string
  sent: boolean
} 