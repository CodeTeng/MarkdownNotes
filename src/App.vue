<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useNoteStore } from '@/composables/useNoteStore';
import { useExport } from '@/composables/useExport';
import { useToast } from '@/composables/useToast';
import NoteList from '@/components/business/NoteList.vue';
import MdEditor from '@/components/business/MdEditor.vue';
import MdPreview from '@/components/business/MdPreview.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import ExportButton from '@/components/business/ExportButton.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import Toast from '@/components/common/Toast.vue';

const { addNote, searchQuery, deleteNote, saveAll, activeNote, selectNote } = useNoteStore();
const { exportPDF, exportMarkdown } = useExport();
const { showToast } = useToast();

const isDeleteModalOpen = ref(false);
const noteToDeleteId = ref<string | null>(null);

// Layout Resizing Logic
const sidebarWidth = ref(280);
const editorWidth = ref(600);
const isResizing = ref(false);
const resizeType = ref<'sidebar' | 'editor' | null>(null);

const startResize = (type: 'sidebar' | 'editor') => {
  isResizing.value = true;
  resizeType.value = type;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.userSelect = 'none'; // Prevent text selection while resizing
};

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return;

  if (resizeType.value === 'sidebar') {
    const newWidth = event.clientX;
    if (newWidth > 150 && newWidth < 600) {
      sidebarWidth.value = newWidth;
    }
  } else if (resizeType.value === 'editor') {
    // Editor width is tricky because it depends on sidebar width
    // The resizer is between editor and preview.
    // Width = MouseX - SidebarWidth - ResizerWidth(approx)
    const newWidth = event.clientX - sidebarWidth.value;
    // Calculate remaining space for preview to ensure it doesn't disappear
    const windowWidth = window.innerWidth;
    const remaining = windowWidth - event.clientX;
    
    if (newWidth > 200 && remaining > 200) {
      editorWidth.value = newWidth;
    }
  }
};

const stopResize = () => {
  isResizing.value = false;
  resizeType.value = null;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.userSelect = '';
};

const handleAddNote = () => {
  addNote();
  showToast('新建笔记成功', 'success');
};

const handleSave = () => {
  saveAll();
  showToast('所有笔记已保存', 'success');
};

const handleDeleteRequest = (id: string) => {
  noteToDeleteId.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = () => {
  if (noteToDeleteId.value) {
    deleteNote(noteToDeleteId.value);
    showToast('笔记已删除', 'success');
  }
  isDeleteModalOpen.value = false;
  noteToDeleteId.value = null;
};

const cancelDelete = () => {
  isDeleteModalOpen.value = false;
  noteToDeleteId.value = null;
};

const editorRef = ref<InstanceType<typeof MdEditor> | null>(null);
const previewRef = ref<InstanceType<typeof MdPreview> | null>(null);

const handleNavigate = async (info: { noteId: string; index: number; text: string; level: number }) => {
  if (activeNote.value?.id !== info.noteId) {
    selectNote(info.noteId);
    await nextTick();
  }
  
  editorRef.value?.scrollToPosition(info.index);
  previewRef.value?.scrollToHeader(info.text);
};

const handleNoteListNavigate = (info: { noteId: string; index: number; text: string; level: number }) => {
   handleNavigate(info);
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-gray-900 text-gray-300 font-mono">
    <Toast />
    <ConfirmModal 
      :is-open="isDeleteModalOpen" 
      title="删除笔记" 
      message="确定要删除这条笔记吗？此操作无法撤销。"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
    
    <!-- Top Navigation Bar -->
    <div class="h-14 border-b border-gray-700 bg-gray-900 flex items-center justify-between px-4 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-end gap-2">
          <h1 class="text-xl font-bold text-gray-100 tracking-tight">MarkNote</h1>
          <span class="text-xs text-gray-500 font-light mb-1">木子Teng的笔记本</span>
        </div>
        <button 
          @click="handleAddNote"
          class="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium transition-colors border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
        >
          新建笔记
        </button>
        <button 
          @click="handleSave"
          class="px-3 py-1.5 bg-gray-800 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 text-sm font-medium transition-colors"
        >
          保存
        </button>
      </div>
      
      <div class="flex items-center gap-4">
        <ExportButton label="导出 PDF" @click="exportPDF" />
        <ExportButton label="导出 MD" @click="exportMarkdown" />
        <div class="w-64">
          <SearchInput v-model="searchQuery" />
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Note List -->
      <div 
        class="h-full border-r border-gray-700 bg-gray-900 flex flex-col shrink-0 transition-none"
        :style="{ width: sidebarWidth + 'px' }"
      >
        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <NoteList @delete-request="handleDeleteRequest" @navigate="handleNoteListNavigate" />
        </div>
      </div>

      <!-- Resizer 1 -->
      <div 
        class="w-1 h-full bg-gray-800 hover:bg-emerald-500 cursor-col-resize flex-shrink-0 transition-colors z-10"
        @mousedown="startResize('sidebar')"
      ></div>
      
      <!-- Middle: Editor -->
      <div 
        class="h-full border-r border-gray-700 flex flex-col bg-gray-800 shrink-0 transition-none"
        :style="{ width: editorWidth + 'px' }"
      >
         <div class="flex-1 relative">
           <MdEditor ref="editorRef" />
         </div>
      </div>

      <!-- Resizer 2 -->
      <div 
        class="w-1 h-full bg-gray-800 hover:bg-emerald-500 cursor-col-resize flex-shrink-0 transition-colors z-10"
        @mousedown="startResize('editor')"
      ></div>
      
      <!-- Right: Preview -->
      <div class="flex-1 h-full flex flex-col bg-gray-900 min-w-[200px]">
        <div class="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <MdPreview ref="previewRef" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Custom Scrollbar Styles for Geeks Theme */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151; /* gray-700 */
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #10B981; /* emerald-500 */
}
</style>
