<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}>();

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'update:show', value: boolean): void
}>();

const dialogRef = ref<HTMLDivElement | null>(null);

function handleClickOutside(event: MouseEvent) {
  if (dialogRef.value && !dialogRef.value.contains(event.target as Node)) {
    emit('update:show', false);
    emit('cancel');
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    emit('update:show', false);
    emit('cancel');
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});

function confirm() {
  emit('confirm');
  emit('update:show', false);
}

function cancel() {
  emit('cancel');
  emit('update:show', false);
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="dialog-overlay">
      <div ref="dialogRef" class="dialog-content">
        <h3 class="dialog-title">{{ title }}</h3>
        <div class="dialog-body">
          <p>{{ message }}</p>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-outline" @click="cancel">
            {{ cancelText || 'Cancel' }}
          </button>
          <button class="btn btn-danger" @click="confirm">
            {{ confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

.dialog-content {
  background-color: white;
  border-radius: 8px;
  padding: var(--spacing-lg);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.2s ease-in-out;
}

.dialog-title {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: 1.25rem;
}

.dialog-body {
  margin-bottom: var(--spacing-lg);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>