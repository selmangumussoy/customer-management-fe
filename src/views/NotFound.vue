<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goToHome() {
  router.push('/');
}
</script>

<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <button class="btn btn-primary" @click="goToHome">
          Go to Homepage
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-lg);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  font-size: 6rem;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  margin: var(--spacing-md) 0;
}

p {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
}
</style>