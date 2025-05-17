<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCustomerStore } from '../stores/customerStore';
import AppHeader from '../components/AppHeader.vue';
import CustomerCard from '../components/CustomerCard.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import Notification from '../components/Notification.vue';

const router = useRouter();
const route = useRoute();
const customerStore = useCustomerStore();

const showDeleteDialog = ref(false);
const customerToDeleteId = ref<string | null>(null);
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

// Watch for query parameters for search
watch(() => route.query, (query) => {
  if (query.searchType && query.q) {
    const searchType = query.searchType as string;
    const searchValue = query.q as string;
    
    if (searchValue.trim()) {
      performSearch(searchType, searchValue);
    }
  } else {
    // If no search params, load all customers
    customerStore.fetchCustomers();
  }
}, { immediate: true });

const searchResultsMessage = computed(() => {
  if (!route.query.q) return '';
  
  const count = customerStore.customers.length;
  const searchType = route.query.searchType as string || 'criteria';
  const searchValue = route.query.q as string || '';
  
  if (count === 0) {
    return `No customers found matching ${searchType}: "${searchValue}"`;
  }
  
  return `Found ${count} customer${count !== 1 ? 's' : ''} matching ${searchType}: "${searchValue}"`;
});

onMounted(() => {
  if (!route.query.searchType && !route.query.q) {
    customerStore.fetchCustomers();
  }
});

async function performSearch(type: string, value: string) {
  await customerStore.searchCustomers(type, value);
}

function viewCustomer(id: string) {
  router.push(`/customers/${id}`);
}

function editCustomer(id: string) {
  router.push(`/customers/${id}/edit`);
}

function confirmDelete(id: string) {
  customerToDeleteId.value = id;
  showDeleteDialog.value = true;
}

async function deleteCustomer() {
  if (!customerToDeleteId.value) return;
  
  const success = await customerStore.deleteCustomer(customerToDeleteId.value);
  
  if (success) {
    notification.value = {
      show: true,
      message: 'Customer deleted successfully',
      type: 'success'
    };
  } else {
    notification.value = {
      show: true,
      message: customerStore.error || 'Failed to delete customer',
      type: 'error'
    };
  }
}

function clearSearch() {
  router.push('/');
}
</script>

<template>
  <div class="customer-list-page">
    <AppHeader />
    
    <div class="container main-content">
      <div v-if="customerStore.loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Loading customers...</p>
      </div>
      
      <div v-else-if="customerStore.error" class="error-message">
        <p>{{ customerStore.error }}</p>
        <button class="btn btn-primary" @click="customerStore.fetchCustomers">
          Try Again
        </button>
      </div>
      
      <div v-else class="customers-container">
        <div v-if="searchResultsMessage" class="search-results-header">
          <p>{{ searchResultsMessage }}</p>
          <button v-if="route.query.q" class="btn btn-outline" @click="clearSearch">
            Clear Search
          </button>
        </div>
        
        <div v-if="customerStore.customers.length === 0" class="empty-state">
          <h2>No Customers Found</h2>
          <p>Get started by adding your first customer.</p>
          <router-link to="/customers/new" class="btn btn-primary">
            Add Customer
          </router-link>
        </div>
        
        <div v-else class="customers-grid">
          <CustomerCard
            v-for="customer in customerStore.customers"
            :key="customer.id"
            :customer="customer"
            @view="viewCustomer(customer.id)"
            @edit="editCustomer(customer.id)"
            @delete="confirmDelete(customer.id)"
          />
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

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(25, 118, 210, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: var(--error-color);
  padding: var(--spacing-lg);
  border-radius: 4px;
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid #e0e0e0;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.empty-state h2 {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .customers-grid {
    grid-template-columns: 1fr;
  }
  
  .search-results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>