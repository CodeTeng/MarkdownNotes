import { ref } from 'vue';

export function useSearch() {
  const searchQuery = ref('');
  
  return {
    searchQuery
  };
}
