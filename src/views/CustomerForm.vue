<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { format, parseISO } from 'date-fns';
import { useCustomerStore } from '../stores/customerStore';
import AppHeader from '../components/AppHeader.vue';
import Notification from '../components/Notification.vue';
import type { CustomerRequest } from '../types';

const props = defineProps<{
  id?: string
}>();

const router = useRouter();
const customerStore = useCustomerStore();

// Form data with initial values
const formData = ref<CustomerRequest>({
  name: '',
  email: '',
  annualSpend: null,
  lastPurchaseDate: null
});

// Form validation errors
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

// Computed property to determine if we're editing or creating
const isEditing = computed(() => !!props.id);

// Format today's date for the date picker max value
const today = new Date().toISOString().split('T')[0];

onMounted(async () => {
  // If we have an ID, we're in edit mode - fetch the customer data
  if (props.id) {
    await customerStore.fetchCustomerById(props.id);
    if (customerStore.currentCustomer) {
      // Copy data to our form
      formData.value = {
        name: customerStore.currentCustomer.name,
        email: customerStore.currentCustomer.email,
        annualSpend: customerStore.currentCustomer.annualSpend,
        lastPurchaseDate: customerStore.currentCustomer.lastPurchaseDate
      };
      
      // Format date for input if it exists
      if (formData.value.lastPurchaseDate) {
        try {
          formData.value.lastPurchaseDate = format(
            parseISO(formData.value.lastPurchaseDate),
            'yyyy-MM-dd'
          );
        } catch (e) {
          formData.value.lastPurchaseDate = null;
        }
      }
    }
  }
});

function validateForm(): boolean {
  const newErrors: Record<string, string> = {};
  
  // Name validation
  if (!formData.value.name.trim()) {
    newErrors.name = 'Name is required';
  }
  
  // Email validation
  if (!formData.value.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!isValidEmail(formData.value.email)) {
    newErrors.email = 'Invalid email format';
  }
  
  // Annual spend validation (must be a number if provided)
  if (formData.value.annualSpend !== null && isNaN(Number(formData.value.annualSpend))) {
    newErrors.annualSpend = 'Annual spend must be a number';
  }
  
  // Update errors state
  errors.value = newErrors;
  
  // Form is valid if there are no errors
  return Object.keys(newErrors).length === 0;
}

function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

async function handleSubmit() {
  if (!validateForm() || isSubmitting.value) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    let result;
    
    // Prepare the payload with the correct date format for API
    const payload: CustomerRequest = {
      ...formData.value,
      lastPurchaseDate: formData.value.lastPurchaseDate 
        ? new Date(formData.value.lastPurchaseDate).toISOString() 
        : null
    };
    
    if (isEditing.value && props.id) {
      // Update existing customer
      result = await customerStore.updateCustomer(props.id, payload);
      notification.value = {
        show: true,
        message: 'Customer updated successfully',
        type: 'success'
      };
    } else {
      // Create new customer
      result = await customerStore.createCustomer(payload);
      notification.value = {
        show: true,
        message: 'Customer created successfully',
        type: 'success'
      };
    }
    
    // Navigate to the customer details page after a short delay
    setTimeout(() => {
      router.push(`/customers/${result.id}`);
    }, 1000);
    
  } catch (err) {
    notification.value = {
      show: true,
      message: customerStore.error || 'An error occurred',
      type: 'error'
    };
  } finally {
    isSubmitting.value = false;
  }
}

function cancel() {
  if (isEditing.value && props.id) {
    router.push(`/customers/${props.id}`);
  } else {
    router.push('/');
  }
}
</script>

<template>
  <div class="customer-form-page">
    <AppHeader />
    
    <div class="container main-content">
      <div class="back-button">
        <button class="btn btn-outline" @click="cancel">
          &larr; Cancel
        </button>
      </div>
      
      <div class="customer-form-container">
        <h1 class="form-title">{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h1>
        
        <div v-if="customerStore.loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading customer data...</p>
        </div>
        
        <div v-else-if="isEditing && customerStore.error" class="error-message">
          <p>{{ customerStore.error }}</p>
          <button class="btn btn-primary" @click="customerStore.fetchCustomerById(id as string)">
            Try Again
          </button>
          <button class="btn btn-outline" @click="cancel">
            Cancel
          </button>
        </div>
        
        <form v-else class="customer-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name" class="form-label">Name*</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-control"
              :class="{ 'has-error': errors.name }"
              placeholder="Enter customer name"
            />
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email*</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-control"
              :class="{ 'has-error': errors.email }"
              placeholder="Enter customer email"
            />
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>
          
          <div class="form-group">
            <label for="annualSpend" class="form-label">Annual Spend</label>
            <input
              id="annualSpend"
              v-model="formData.annualSpend"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              :class="{ 'has-error': errors.annualSpend }"
              placeholder="Enter annual spend amount"
            />
            <div v-if="errors.annualSpend" class="form-error">{{ errors.annualSpend }}</div>
          </div>
          
          <div class="form-group">
            <label for="lastPurchaseDate" class="form-label">Last Purchase Date</label>
            <input
              id="lastPurchaseDate"
              v-model="formData.lastPurchaseDate"
              type="date"
              class="form-control"
              :max="today"
              placeholder="Select last purchase date"
            />
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-outline" 
              @click="cancel"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <Notification
      v-model:show="notification.show"
      :message="notification.message"
      :type="notification.type"
    />
  </div>
</template>

<style scoped>
.main-content {
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
}

.back-button {
  margin-bottom: var(--spacing-lg);
}

.customer-form-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: var(--spacing-xl);
  max-width: 600px;
  margin: 0 auto;
}

.form-title {
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  font-size: 1.5rem;
  text-align: center;
  color: var(--primary-dark);
}

.loading-indicator,
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xxl) 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(25, 118, 210, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: var(--error-color);
  padding: var(--spacing-lg);
  border-radius: 4px;
  text-align: center;
}

.customer-form {
  animation: fadeIn 0.3s ease-in;
}

.form-control.has-error {
  border-color: var(--error-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .customer-form-container {
    padding: var(--spacing-md);
  }
}
</style>