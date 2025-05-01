export interface Ticket {
    id: string
    type: string
    price: number
    quantity: number
    movie: {
      title: string
      showtime: string
      seat: string
      id: string
    }
    showId: string
  }