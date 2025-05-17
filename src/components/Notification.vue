<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  message: string
  type: 'success' | 'error'
  show: boolean
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>();

const visible = ref(props.show);
let timeout: number | undefined;

watch(() => props.show, (newValue) => {
  visible.value = newValue;
  if (newValue) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      visible.value = false;
      emit('update:show', false);
    }, 3000) as unknown as number;
  }
});

onMounted(() => {
  if (props.show) {
    timeout = setTimeout(() => {
      visible.value = false;
      emit('update:show', false);
    }, 3000) as unknown as number;
  }
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      :class="['toast', `toast-${type}`]"
      @click="emit('update:show', false)"
    >
      {{ message }}
    </div>
  </Teleport>
</template>

<style scoped>
/* Toast styles are defined in the global CSS */
</style>