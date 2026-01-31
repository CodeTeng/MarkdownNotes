import { ref, computed } from 'vue';
import type { Note } from '@/types';
import { getNotes, saveNotes } from '@/utils/storage';
import { DEFAULT_NOTE_TITLE } from '@/utils/constant';

// Global state
const notes = ref<Note[]>(getNotes());
const activeNoteId = ref<string>('');
const searchQuery = ref<string>('');

export function useNoteStore() {
  
  // Initialize active note if notes exist but none selected
  if (notes.value.length > 0 && !activeNoteId.value) {
    const firstNote = notes.value[0];
    if (firstNote) {
        activeNoteId.value = firstNote.id;
    }
  }

  const activeNote = computed(() => 
    notes.value.find(n => n.id === activeNoteId.value) || undefined
  );

  const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) {
      return notes.value;
    }
    const query = searchQuery.value.toLowerCase();
    return notes.value.filter(note => 
      (note.title && note.title.toLowerCase().includes(query)) || 
      (note.content && note.content.toLowerCase().includes(query))
    );
  });

  const addNote = () => {
    const now = Date.now();
    const newNote: Note = {
      id: `${now}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${DEFAULT_NOTE_TITLE}-${new Date(now).toLocaleTimeString()}`,
      content: '',
      createTime: now,
      updateTime: now
    };
    notes.value.unshift(newNote);
    activeNoteId.value = newNote.id;
    searchQuery.value = ''; // Clear search on new note
    saveNotes(notes.value);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    const index = notes.value.findIndex(n => n.id === id);
    if (index !== -1) {
      const currentNote = notes.value[index];
      if (currentNote) {
        // Explicitly construct the object to satisfy TS
        const updatedNote: Note = {
            id: currentNote.id,
            title: updates.title !== undefined ? updates.title : currentNote.title,
            content: updates.content !== undefined ? updates.content : currentNote.content,
            createTime: currentNote.createTime,
            updateTime: Date.now()
        };
        
        // Remove old, add new to top
        notes.value.splice(index, 1);
        notes.value.unshift(updatedNote);
        saveNotes(notes.value);
      }
    }
  };

  const deleteNote = (id: string) => {
    const index = notes.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notes.value.splice(index, 1);
      if (activeNoteId.value === id) {
        const firstNote = notes.value[0];
        activeNoteId.value = (notes.value.length > 0 && firstNote) ? firstNote.id : '';
      }
      saveNotes(notes.value);
    }
  };

  const selectNote = (id: string) => {
    activeNoteId.value = id;
  };

  const saveAll = () => {
    saveNotes(notes.value);
  };

  return {
    notes,
    filteredNotes,
    searchQuery,
    activeNoteId,
    activeNote,
    addNote,
    updateNote,
    deleteNote,
    selectNote,
    saveAll
  };
}
