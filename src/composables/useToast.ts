import { ref } from 'vue';

const show = ref(false);
const message = ref('');
const type = ref<'success' | 'error' | 'info'>('info');

export function useToast() {
  const showToast = (msg: string, toastType: 'success' | 'error' | 'info' = 'info', duration = 2000) => {
    message.value = msg;
    type.value = toastType;
    show.value = true;
    
    setTimeout(() => {
      show.value = false;
    }, duration);
  };

  return {
    show,
    message,
    type,
    showToast
  };
}
