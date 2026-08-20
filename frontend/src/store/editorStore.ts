'use client';

import { create } from 'zustand';
import { PageComponent } from '@/lib/types';

interface EditorState {
  pageId: string;
  components: PageComponent[];
  selectedComponentId: string | null;

  setPageId: (id: string) => void;
  setComponents: (components: PageComponent[]) => void;
  setSelectedComponentId: (id: string | null) => void;

  addComponent: (component: PageComponent) => void;
  updateComponent: (id: string, updates: Partial<PageComponent>) => void;
  deleteComponent: (id: string) => void;
  reorderComponents: (ids: string[]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  pageId: '',
  components: [],
  selectedComponentId: null,

  setPageId: (id) => set({ pageId: id }),
  setComponents: (components) => set({ components }),
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),

  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component],
    })),

  updateComponent: (id, updates) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),

  deleteComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      selectedComponentId:
        state.selectedComponentId === id ? null : state.selectedComponentId,
    })),

  reorderComponents: (ids) =>
    set((state) => ({
      components: ids
        .map((id) => state.components.find((c) => c.id === id))
        .filter(Boolean) as PageComponent[],
    })),
}));
