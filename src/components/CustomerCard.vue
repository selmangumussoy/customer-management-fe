<script setup lang="ts">
import { computed } from 'vue';
import { format, parseISO } from 'date-fns';
import type { Customer } from '../types';
import { CustomerTier } from '../types';

const props = defineProps<{
  customer: Customer
}>();

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'view'): void
}>();

const tierClass = computed(() => {
  switch(props.customer.tier) {
    case CustomerTier.GOLD:
      return 'tier-gold';
    case CustomerTier.PLATINUM:
      return 'tier-platinum';
    default:
      return 'tier-silver';
  }
});

const formattedDate = computed(() => {
  if (!props.customer.lastPurchaseDate) return 'N/A';
  try {
    return format(parseISO(props.customer.lastPurchaseDate), 'MMM dd, yyyy');
  } catch (e) {
    return 'Invalid date';
  }
});

const formattedSpend = computed(() => {
  if (props.customer.annualSpend === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(props.customer.annualSpend);
});
</script>

<template>
  <div class="customer-card" @click="emit('view')">
    <div class="customer-header">
      <h3>{{ customer.name }}</h3>
      <div :class="['tier-badge', tierClass]">
        {{ customer.tier || 'SILVER' }}
      </div>
    </div>
    
    <div class="customer-details">
      <div class="detail-item">
        <span class="detail-label">Email:</span>
        <span class="detail-value">{{ customer.email }}</span>
      </div>
      
      <div class="detail-item">
        <span class="detail-label">Annual Spend:</span>
        <span class="detail-value">{{ formattedSpend }}</span>
      </div>
      
      <div class="detail-item">
        <span class="detail-label">Last Purchase:</span>
        <span class="detail-value">{{ formattedDate }}</span>
      </div>
    </div>
    
    <div class="customer-actions">
      <button class="btn btn-outline" @click.stop="emit('view')">View</button>
      <button class="btn btn-primary" @click.stop="emit('edit')">Edit</button>
      <button class="btn btn-danger" @click.stop="emit('delete')">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.customer-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: var(--spacing-lg);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.customer-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.customer-details {
  margin-bottom: var(--spacing-md);
}

.detail-item {
  display: flex;
  margin-bottom: var(--spacing-xs);
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  width: 120px;
}

.detail-value {
  flex: 1;
}

.customer-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.customer-actions button {
  padding: 6px 12px;
  font-size: 0.875rem;
}
</style>