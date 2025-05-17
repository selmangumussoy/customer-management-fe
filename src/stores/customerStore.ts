import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerService, handleApiError } from '../services/api'
import type { Customer, CustomerRequest, ValidationError } from '../types'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const currentCustomer = ref<Customer | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const validationErrors = ref<ValidationError[]>([])

  // Get all customers
  async function fetchCustomers() {
    loading.value = true
    error.value = null
    
    try {
      customers.value = await customerService.getCustomers()
    } catch (err) {
      error.value = handleApiError(err)
      console.error('Error fetching customers:', err)
    } finally {
      loading.value = false
    }
  }

  // Get customer by ID
  async function fetchCustomerById(id: string) {
    loading.value = true
    error.value = null
    currentCustomer.value = null
    
    try {
      currentCustomer.value = await customerService.getCustomerById(id)
    } catch (err) {
      error.value = handleApiError(err)
      console.error(`Error fetching customer with ID ${id}:`, err)
    } finally {
      loading.value = false
    }
  }

  // Search customers by different criteria
  async function searchCustomers(type: string, value: string) {
    loading.value = true
    error.value = null
    
    try {
      if (type === 'id') {
        const customer = await customerService.getCustomerById(value)
        customers.value = customer ? [customer] : []
      } else if (type === 'email') {
        const customer = await customerService.getCustomerByEmail(value)
        customers.value = customer ? [customer] : []
      } else if (type === 'name') {
        const customer = await customerService.getCustomerByName(value)
        customers.value = customer ? [customer] : []
      }
    } catch (err) {
      error.value = handleApiError(err)
      customers.value = []
      console.error(`Error searching customers by ${type}:`, err)
    } finally {
      loading.value = false
    }
  }

  // Create a new customer
  async function createCustomer(customer: CustomerRequest) {
    loading.value = true
    error.value = null
    validationErrors.value = []
    
    try {
      const newCustomer = await customerService.createCustomer(customer)
      customers.value.push(newCustomer)
      return newCustomer
    } catch (err: any) {
      error.value = handleApiError(err)
      // Handle validation errors if available in response
      if (err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
      }
      console.error('Error creating customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update an existing customer
  async function updateCustomer(id: string, customer: CustomerRequest) {
    loading.value = true
    error.value = null
    validationErrors.value = []
    
    try {
      const updatedCustomer = await customerService.updateCustomer(id, customer)
      // Update in the local array if present
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = updatedCustomer
      }
      
      if (currentCustomer.value && currentCustomer.value.id === id) {
        currentCustomer.value = updatedCustomer
      }
      
      return updatedCustomer
    } catch (err: any) {
      error.value = handleApiError(err)
      // Handle validation errors if available in response
      if (err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
      }
      console.error(`Error updating customer with ID ${id}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a customer
  async function deleteCustomer(id: string) {
    loading.value = true
    error.value = null
    
    try {
      await customerService.deleteCustomer(id)
      // Remove from the local array
      customers.value = customers.value.filter(c => c.id !== id)
      
      if (currentCustomer.value && currentCustomer.value.id === id) {
        currentCustomer.value = null
      }
      
      return true
    } catch (err) {
      error.value = handleApiError(err)
      console.error(`Error deleting customer with ID ${id}:`, err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    currentCustomer,
    loading,
    error,
    validationErrors,
    fetchCustomers,
    fetchCustomerById,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})