import { STORAGE_KEY } from './constant';
import type { Note } from '@/types';

export const getNotes = (): Note[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};
