<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { format, parseISO } from 'date-fns';
import { useCustomerStore } from '../stores/customerStore';
import AppHeader from '../components/AppHeader.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import Notification from '../components/Notification.vue';
import { CustomerTier } from '../types';

const props = defineProps<{
  id: string
}>();

const router = useRouter();
const customerStore = useCustomerStore();

const showDeleteDialog = ref(false);
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

onMounted(async () => {
  await customerStore.fetchCustomerById(props.id);
});

const tierClass = computed(() => {
  if (!customerStore.currentCustomer?.tier) return 'tier-silver';
  
  switch(customerStore.currentCustomer.tier) {
    case CustomerTier.GOLD:
      return 'tier-gold';
    case CustomerTier.PLATINUM:
      return 'tier-platinum';
    default:
      return 'tier-silver';
  }
});

const formattedDate = computed(() => {
  if (!customerStore.currentCustomer?.lastPurchaseDate) return 'N/A';
  
  try {
    return format(parseISO(customerStore.currentCustomer.lastPurchaseDate), 'MMMM dd, yyyy');
  } catch (e) {
    return 'Invalid date';
  }
});

const formattedSpend = computed(() => {
  if (customerStore.currentCustomer?.annualSpend === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(customerStore.currentCustomer?.annualSpend || 0);
});

function editCustomer() {
  router.push(`/customers/${props.id}/edit`);
}

function confirmDelete() {
  showDeleteDialog.value = true;
}

async function deleteCustomer() {
  const success = await customerStore.deleteCustomer(props.id);
  
  if (success) {
    notification.value = {
      show: true,
      message: 'Customer deleted successfully',
      type: 'success'
    };
    
    // Navigate back to list after short delay
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } else {
    notification.value = {
      show: true,
      message: customerStore.error || 'Failed to delete customer',
      type: 'error'
    };
  }
}

function goBack() {
  router.push('/');
}
</script>

<template>
  <div class="customer-details-page">
    <AppHeader />
    
    <div class="container main-content">
      <div class="back-button">
        <button class="btn btn-outline" @click="goBack">
          &larr; Back to Customers
        </button>
      </div>
      
      <div v-if="customerStore.loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Loading customer details...</p>
      </div>
      
      <div v-else-if="customerStore.error" class="error-message">
        <p>{{ customerStore.error }}</p>
        <button class="btn btn-primary" @click="customerStore.fetchCustomerById(id)">
          Try Again
        </button>
        <button class="btn btn-outline" @click="goBack">
          Go Back
        </button>
      </div>
      
      <div v-else-if="!customerStore.currentCustomer" class="error-message">
        <p>Customer not found</p>
        <button class="btn btn-outline" @click="goBack">
          Go Back
        </button>
      </div>
      
      <div v-else class="customer-details-container">
        <div class="customer-details-header">
          <div class="customer-name-tier">
            <h1>{{ customerStore.currentCustomer.name }}</h1>
            <div :class="['tier-badge', tierClass]">
              {{ customerStore.currentCustomer.tier || 'SILVER' }}
            </div>
          </div>
          
          <div class="customer-actions">
            <button class="btn btn-primary" @click="editCustomer">Edit</button>
            <button class="btn btn-danger" @click="confirmDelete">Delete</button>
          </div>
        </div>
        
        <div class="customer-details-card">
          <div class="details-section">
            <h2>Contact Information</h2>
            <div class="detail-row">
              <div class="detail-label">Customer ID</div>
              <div class="detail-value">{{ customerStore.currentCustomer.id }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email</div>
              <div class="detail-value">{{ customerStore.currentCustomer.email }}</div>
            </div>
          </div>
          
          <div class="details-section">
            <h2>Financial Information</h2>
            <div class="detail-row">
              <div class="detail-label">Annual Spend</div>
              <div class="detail-value">{{ formattedSpend }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Last Purchase</div>
              <div class="detail-value">{{ formattedDate }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Tier Status</div>
              <div class="detail-value">
                <div :class="['tier-badge', tierClass]">
                  {{ customerStore.currentCustomer.tier || 'SILVER' }}
                </div>
                <div class="tier-description">
                  <template v-if="customerStore.currentCustomer.tier === 'PLATINUM'">
                    Premium customer with $10,000+ annual spend and active in the last 6 months
                  </template>
                  <template v-else-if="customerStore.currentCustomer.tier === 'GOLD'">
                    Valued customer with $1,000+ annual spend and active in the last 12 months
                  </template>
                  <template v-else>
                    Standard customer with less than $1,000 annual spend
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ConfirmDialog
      v-model:show="showDeleteDialog"
      title="Confirm Deletion"
      message="Are you sure you want to delete this customer? This action cannot be undone."
      confirm-text="Delete"
      @confirm="deleteCustomer"
    />
    
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

.customer-details-container {
  animation: fadeIn 0.3s ease-in;
}

.customer-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.customer-name-tier {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.customer-name-tier h1 {
  margin: 0;
  font-size: 1.75rem;
}

.customer-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.customer-details-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: var(--spacing-lg);
}

.details-section {
  margin-bottom: var(--spacing-xl);
}

.details-section h2 {
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid #e0e0e0;
  color: var(--primary-dark);
}

.detail-row {
  display: flex;
  margin-bottom: var(--spacing-md);
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  width: 150px;
}

.detail-value {
  flex: 1;
}

.tier-description {
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .customer-details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .customer-name-tier {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-label {
    width: 100%;
    margin-bottom: var(--spacing-xs);
  }
}
</style>