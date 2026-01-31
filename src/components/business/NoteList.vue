<script setup lang="ts">
import { useNoteStore } from '@/composables/useNoteStore';
import NoteItem from './NoteItem.vue';

const { filteredNotes, notes, activeNoteId, selectNote } = useNoteStore();

const emit = defineEmits<{
  (e: 'delete-request', id: string): void;
  (e: 'navigate', info: { noteId: string; index: number; text: string; level: number }): void;
}>();

const handleDelete = (id: string) => {
  emit('delete-request', id);
};

const handleNavigate = (info: { noteId: string; index: number; text: string; level: number }) => {
  emit('navigate', info);
};
</script>

<template>
  <div class="space-y-0">
    <div v-if="filteredNotes.length === 0" class="p-4 text-center text-gray-500 text-sm font-mono">
      {{ filteredNotes.length !== notes.length ? '无匹配笔记' : '暂无笔记，点击“新建笔记”创建' }}
    </div>
    <NoteItem
      v-for="note in filteredNotes"
      :key="note.id"
      :note="note"
      :is-active="note.id === activeNoteId"
      @select="selectNote"
      @delete="handleDelete"
      @navigate="handleNavigate"
    />
  </div>
</template>
