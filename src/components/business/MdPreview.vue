<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNoteStore } from '@/composables/useNoteStore';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import highlight from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const previewRef = ref<HTMLElement | null>(null);

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = highlight.getLanguage(lang) ? lang : 'plaintext';
      return highlight.highlight(code, { language }).value;
    }
  })
);

marked.setOptions({
  breaks: true,
  gfm: true
});

const { activeNote } = useNoteStore();

const renderedContent = computed(() => {
  if (!activeNote.value) return '';
  return marked.parse(activeNote.value.content) as string;
});

const scrollToHeader = (text: string) => {
  if (!previewRef.value) return;
  
  // Find all headers
  const headers = previewRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6');
  for (const header of headers) {
    // Simple text matching, might need normalization
    if (header.textContent?.trim() === text) {
      header.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight temporarily
      const originalColor = (header as HTMLElement).style.color;
      (header as HTMLElement).style.color = '#10B981'; // emerald-500
      setTimeout(() => {
        (header as HTMLElement).style.color = originalColor;
      }, 1500);
      
      break;
    }
  }
};

defineExpose({
  scrollToHeader
});
</script>

<template>
  <div ref="previewRef" v-if="activeNote" class="markdown-body prose prose-invert max-w-none font-mono" v-html="renderedContent"></div>
  <div v-else class="h-full flex items-center justify-center text-gray-500 font-mono">
    未选择笔记
  </div>
</template>

<style>
/* Ensure styles for markdown content */
.markdown-body img {
  max-width: 100%;
}
</style>
