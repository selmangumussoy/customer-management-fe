<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');
const searchType = ref('name');

const searchOptions = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'id', label: 'ID' }
];

function handleSearch() {
  if (!searchQuery.value.trim()) return;
  
  router.push({
    path: '/',
    query: { 
      searchType: searchType.value,
      q: searchQuery.value
    }
  });
}
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <h1>Customer Manager</h1>
        </div>
        
        <div class="search-container">
          <div class="search-type">
            <select v-model="searchType">
              <option v-for="option in searchOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="search-input">
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="`Search by ${searchType}...`"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn btn-primary search-btn" @click="handleSearch">
            Search
          </button>
        </div>
        
        <div class="action-buttons">
          <router-link to="/customers/new" class="btn btn-primary">
            Add Customer
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-md) 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.logo {
  cursor: pointer;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.search-container {
  display: flex;
  flex: 1;
  max-width: 500px;
  margin: 0 var(--spacing-md);
}

.search-type select {
  height: 38px;
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 0 var(--spacing-sm);
  background-color: rgba(255, 255, 255, 0.9);
}

.search-input {
  flex: 1;
}

.search-input input {
  width: 100%;
  height: 38px;
  border: none;
  padding: 0 var(--spacing-md);
  outline: none;
}

.search-btn {
  border-radius: 0 4px 4px 0;
  background-color: var(--accent-color);
}

.search-btn:hover {
  background-color: var(--accent-dark);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: 100%;
    margin: var(--spacing-sm) 0;
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
  }
}
</style>