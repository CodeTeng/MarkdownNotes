<script setup lang="ts">
import { ref } from 'vue';
import { useNoteStore } from '@/composables/useNoteStore';
import { debounce } from 'lodash-es';

const { activeNote, updateNote } = useNoteStore();
const saveStatus = ref<'Saved' | 'Saving'>('Saved');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Debounce updates to the store
const debouncedUpdate = debounce((content: string) => {
  if (activeNote.value) {
    updateNote(activeNote.value.id, { content });
    saveStatus.value = 'Saved';
  }
}, 500);

const handleInput = (e: Event) => {
  saveStatus.value = 'Saving';
  const target = e.target as HTMLTextAreaElement;
  debouncedUpdate(target.value);
};

const handleTitleInput = (e: Event) => {
  if (activeNote.value) {
     const target = e.target as HTMLInputElement;
     updateNote(activeNote.value.id, { title: target.value });
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!activeNote.value) return;

  const textarea = e.target as HTMLTextAreaElement;
  const { selectionStart, selectionEnd, value } = textarea;
  
  // Helper to insert text and update cursor
  const insertText = (text: string, newCursorPos?: number) => {
    e.preventDefault();
    const newValue = value.substring(0, selectionStart) + text + value.substring(selectionEnd);
    
    // Update store immediately for shortcuts, but handle status
    saveStatus.value = 'Saving';
    updateNote(activeNote.value!.id, { content: newValue });
    setTimeout(() => { saveStatus.value = 'Saved'; }, 200);
    
    // Need to set value manually on the element to see change immediately
    textarea.value = newValue;
    
    // Restore/Update cursor position
    const nextPos = newCursorPos !== undefined ? newCursorPos : selectionStart + text.length;
    textarea.setSelectionRange(nextPos, nextPos);
  };

  // Tab: Insert 2 spaces
  if (e.key === 'Tab') {
    insertText('  ');
    return;
  }

  // Ctrl+B: Bold
  if (e.ctrlKey && e.key === 'b') {
    const selectedText = value.substring(selectionStart, selectionEnd);
    const text = `**${selectedText}**`;
    insertText(text, selectionStart + 2 + selectedText.length); 
    if (!selectedText) {
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
    }
    return;
  }

  // Ctrl+I: Italic
  if (e.ctrlKey && e.key === 'i') {
    const selectedText = value.substring(selectionStart, selectionEnd);
    const text = `*${selectedText}*`;
    insertText(text);
    if (!selectedText) {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
    }
    return;
  }

  // Ctrl+1 to Ctrl+6: Headers
  if (e.ctrlKey && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
    const level = parseInt(e.key);
    const prefix = '#'.repeat(level) + ' ';
    
    const lastNewLine = value.lastIndexOf('\n', selectionStart - 1);
    const currentLineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
    const beforeLine = value.substring(0, currentLineStart);
    const afterCursor = value.substring(selectionStart);
    const lineBeforeCursor = value.substring(currentLineStart, selectionStart);
    
    const match = lineBeforeCursor.match(/^(#+\s)?/);
    let newLineBeforeCursor = lineBeforeCursor;
    
    if (match && match[0]) {
        newLineBeforeCursor = lineBeforeCursor.substring(match[0].length);
    }
    
    const newValue = beforeLine + prefix + newLineBeforeCursor + afterCursor;
    updateNote(activeNote.value!.id, { content: newValue });
    textarea.value = newValue;
    const newCursor = currentLineStart + prefix.length + newLineBeforeCursor.length;
    textarea.setSelectionRange(newCursor, newCursor);
    return;
  }
  
  // Ctrl+K: Link
  if (e.ctrlKey && e.key === 'k') {
    const selectedText = value.substring(selectionStart, selectionEnd);
    const text = `[${selectedText || 'text'}](url)`;
    insertText(text);
    
    if (selectedText) {
         const start = selectionStart + 1 + selectedText.length + 2; 
         const end = start + 3; 
         textarea.setSelectionRange(start, end);
    } else {
         const start = selectionStart + 1;
         const end = start + 4; 
         textarea.setSelectionRange(start, end);
    }
    return;
  }
};

const scrollToPosition = (index: number) => {
  if (textareaRef.value) {
    const textarea = textareaRef.value;
    textarea.focus();
    textarea.setSelectionRange(index, index);
    
    // Create a mirror element to calculate exact position
    const mirror = document.createElement('div');
    const style = window.getComputedStyle(textarea);
    
    // Copy relevant styles
    const stylesToCopy = [
      'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing',
      'line-height', 'text-transform', 'word-spacing', 'text-indent',
      'box-sizing', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'white-space', 'word-wrap', 'word-break', 'text-align', 'direction'
    ];
    
    stylesToCopy.forEach(key => {
      mirror.style.setProperty(key, style.getPropertyValue(key));
    });
    
    // Important specific overrides
    mirror.style.position = 'absolute';
    mirror.style.top = '0';
    mirror.style.left = '-9999px';
    mirror.style.visibility = 'hidden';
    mirror.style.height = 'auto';
    mirror.style.overflow = 'hidden';
    
    // Fix width to match content area (excluding scrollbar)
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.borderWidth = '0px';
    
    // Set content
    const textBefore = textarea.value.substring(0, index);
    mirror.textContent = textBefore;
    
    // Create a marker span at the end
    const span = document.createElement('span');
    span.textContent = '|';
    mirror.appendChild(span);
    
    document.body.appendChild(mirror);
    
    const offsetTop = span.offsetTop;
    
    // Center the cursor
    const clientHeight = textarea.clientHeight;
    textarea.scrollTop = Math.max(0, offsetTop - clientHeight / 2);
    
    document.body.removeChild(mirror);
  }
};

defineExpose({
  scrollToPosition
});
</script>

<template>
  <div v-if="activeNote" class="h-full flex flex-col bg-gray-800">
    <!-- Title Input -->
    <input 
      :value="activeNote.title"
      @input="handleTitleInput"
      class="w-full p-4 text-2xl font-bold bg-gray-800 text-gray-100 border-b border-gray-700 outline-none placeholder-gray-600 font-mono"
      placeholder="笔记标题"
    />
    <!-- Content Editor -->
    <textarea 
      ref="textareaRef"
      :value="activeNote.content"
      @input="handleInput"
      @keydown="handleKeydown"
      class="flex-1 w-full p-4 resize-none outline-none font-mono text-base leading-relaxed bg-gray-800 text-gray-300 placeholder-gray-600 custom-scrollbar" 
      placeholder="开始输入 Markdown..."
    ></textarea>
    
    <!-- Status Bar -->
    <div class="px-4 py-1 text-xs text-gray-500 bg-gray-900 border-t border-gray-700 flex justify-end items-center gap-2">
      <span v-if="saveStatus === 'Saving'" class="flex items-center gap-1">
        <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        保存中...
      </span>
      <span v-else class="text-emerald-500 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        已自动保存
      </span>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center text-gray-500 bg-gray-800 font-mono">
    选择或新建笔记以开始编辑
  </div>
</template>
