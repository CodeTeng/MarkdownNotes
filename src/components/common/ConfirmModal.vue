<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  title?: string;
  message?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
    <div class="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-96 p-6 transform transition-all">
      <h3 class="text-lg font-bold text-gray-100 mb-2">{{ title || '确认' }}</h3>
      <p class="text-gray-400 mb-6">{{ message || '确定吗？' }}</p>
      
      <div class="flex justify-end gap-3">
        <button 
          @click="emit('cancel')"
          class="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 font-medium transition-colors border border-gray-600"
        >
          取消
        </button>
        <button 
          @click="emit('confirm')"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors shadow-lg shadow-red-900/50"
        >
          确认
        </button>
      </div>
    </div>
  </div>
</template>
