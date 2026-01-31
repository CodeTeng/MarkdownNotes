<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="relative">
    <input 
      :value="modelValue"
      @input="handleInput"
      type="text" 
      placeholder="搜索笔记..." 
      class="w-full pl-9 pr-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
    />
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
</template>
