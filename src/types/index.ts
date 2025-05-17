// Customer tier enum
export enum CustomerTier {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

// Customer response type from API
export interface Customer {
  id: string
  name: string
  email: string
  annualSpend: number | null
  lastPurchaseDate: string | null
  tier?: CustomerTier
}

// Customer request payload for create/update
export interface CustomerRequest {
  name: string
  email: string
  annualSpend: number | null
  lastPurchaseDate: string | null
}

// API response format
export interface ApiResponse<T> {
  meta: {
    timestamp: string
    status: number
    message: string
  }
  data: T
}

// Form validation error type
export interface ValidationError {
  field: string
  message: string
}

// Search options
export type SearchType = 'id' | 'name' | 'email'