export interface Movie {
  id: string
  title: string
  imageUrl: string
  trailerUrl?: string
  price?: number
  category?: string
  cast?: string[]
  director?: string
  producer?: string
  synopsis?: string
  reviews?: Review[]
  rating?: MPAARating
  releaseDate: Date | string
  showTimes: string[]
  status?: "Currently Running" | "Coming Soon" | "Ended"
  isCurrentlyRunning: boolean
  description: string
}

export interface Review {
  id: string
  author: string
  content: string
  rating: number
  date: Date
}

export type MPAARating = "G" | "PG" | "PG-13" | "R" | "NC-17"

