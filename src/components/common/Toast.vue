<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { show, message, type } = useToast();

const typeClasses = {
  success: 'bg-emerald-600 border border-emerald-500 text-white shadow-emerald-900/50',
  error: 'bg-red-600 border border-red-500 text-white shadow-red-900/50',
  info: 'bg-gray-800 border border-gray-600 text-gray-200 shadow-gray-900/50'
};
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-y-2"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 translate-y-2"
  >
    <div 
      v-if="show"
      class="fixed top-20 right-4 px-4 py-2 rounded shadow-lg z-50 flex items-center gap-2"
      :class="typeClasses[type]"
    >
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>
