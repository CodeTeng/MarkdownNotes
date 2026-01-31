<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Note } from '@/types';
import { formatDate } from '@/utils/format';

const props = defineProps<{
  note: Note;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
  (e: 'select', id: string): void;
  (e: 'navigate', info: { noteId: string; index: number; text: string; level: number }): void;
}>();

const isExpanded = ref(false);

const headings = computed(() => {
  if (!props.note.content) return [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  const matches = [];
  let match;
  while ((match = regex.exec(props.note.content)) !== null) {
    matches.push({
      level: match[1].length,
      text: match[2].trim(),
      index: match.index // Capture character index
    });
  }
  return matches;
});

const toggleOutline = (e: Event) => {
  e.stopPropagation();
  isExpanded.value = !isExpanded.value;
};

const handleHeadingClick = (e: Event, heading: { index: number; text: string; level: number }) => {
  e.stopPropagation();
  emit('navigate', { ...heading, noteId: props.note.id });
};

const handleDelete = (e: Event) => {
  e.stopPropagation(); // Prevent selecting the note when clicking delete
  emit('delete', props.note.id);
};
</script>

<template>
  <div 
    class="group relative border-b border-gray-800 transition-colors"
    :class="{ 'bg-gray-800 border-l-4 border-l-emerald-500': isActive, 'hover:bg-gray-800/50': !isActive }"
  >
    <!-- Main Note Item Content -->
    <div class="p-3 cursor-pointer" @click="$emit('select', note.id)">
      <div class="flex flex-col gap-1">
        <!-- Title Row -->
        <div class="flex items-start justify-between pr-6">
           <div class="font-semibold text-gray-300 truncate group-hover:text-emerald-400 transition-colors">
            {{ note.title || 'Untitled' }}
          </div>
        </div>
        
        <!-- Info Row (Date + Toggle) -->
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center gap-2">
            <span>{{ formatDate(note.updateTime) }}</span>
            
            <!-- Toggle Outline Button (Bottom Left) -->
            <button 
              v-if="headings.length > 0"
              @click="toggleOutline"
              class="flex items-center gap-1 px-1.5 py-0.5 rounded hover:text-emerald-400 hover:bg-gray-700 transition-colors"
              :class="{ 'text-emerald-500': isExpanded }"
              title="显示大纲"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform duration-200" :class="{ 'rotate-180': isExpanded }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span class="text-[10px]">大纲</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Button (Visible on hover or if active) -->
      <button 
        @click="handleDelete"
        class="absolute right-2 top-3 p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
        :class="{ 'opacity-100': isActive }"
        title="删除笔记"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Outline Section -->
    <div v-if="isExpanded && headings.length > 0" class="px-3 pb-3 pt-0 bg-gray-800/50">
      <div class="h-px bg-gray-700 mb-2 opacity-50"></div>
      <div class="space-y-1">
        <div 
          v-for="(heading, index) in headings" 
          :key="index"
          @click="handleHeadingClick($event, heading)"
          class="text-xs text-gray-500 truncate hover:text-emerald-400 cursor-pointer transition-colors"
          :style="{ paddingLeft: `${(heading.level - 1) * 8}px` }"
        >
          {{ heading.text }}
        </div>
      </div>
    </div>
  </div>
</template>
