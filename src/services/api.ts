import axios from 'axios'
import type { Customer, CustomerRequest } from '../types'

// Base API URL - should be configured from environment variables in production
const API_URL = 'http://localhost:8080'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const customerService = {
  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    const response = await api.get('/customers')
    return response.data.data
  },

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`)
    return response.data.data
  },

  // Get customer by email
  async getCustomerByEmail(email: string): Promise<Customer> {
    const response = await api.get(`/customers`, { params: { email } })
    return response.data.data
  },

  // Get customer by name
  async getCustomerByName(name: string): Promise<Customer> {
    const response = await api.get(`/customers`, { params: { name } })
    return response.data.data
  },

  // Create a new customer
  async createCustomer(customer: CustomerRequest): Promise<Customer> {
    const response = await api.post('/customers', customer)
    return response.data.data
  },

  // Update an existing customer
  async updateCustomer(id: string, customer: CustomerRequest): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, customer)
    return response.data.data
  },

  // Delete a customer
  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`)
  }
}

// Error handler helper
export function handleApiError(error: any): string {
  if (error.response) {
    // The request was made and the server responded with a status code
    const data = error.response.data
    return data.message || `Error: ${error.response.status} - ${error.response.statusText}`
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server. Please check your connection.'
  } else {
    // Something happened in setting up the request
    return error.message || 'An unknown error occurred'
  }
}