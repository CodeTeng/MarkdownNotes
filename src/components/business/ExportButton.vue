<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <button class="px-3 py-1 bg-gray-800 border border-gray-600 text-gray-300 text-xs rounded hover:bg-gray-700 transition-colors">
    {{ label }}
  </button>
</template>
