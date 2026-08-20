'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { logout } from '@/lib/keycloak';
import { Page, PageComponent } from '@/lib/types';
import { ComponentPalette } from './ComponentPalette';
import { Canvas } from './Canvas';
import { PropertyEditor } from './PropertyEditor';
import { PreviewPane } from './PreviewPane';

interface PageBuilderProps {
  pageId: string;
}

const SAVED_INDICATOR_MS = 2000;

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function PageBuilder({ pageId }: PageBuilderProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<
    string | null
  >(null);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  );
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const markSaved = () => {
    setSaveStatus('saved');
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(
      () => setSaveStatus('idle'),
      SAVED_INDICATOR_MS,
    );
  };

  // Fetch page data
  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const res = await api.get<Page>(`/pages/${pageId}`);
      return res.data;
    },
  });

  // Add component mutation
  const addComponentMutation = useMutation({
    mutationFn: async (component: Partial<PageComponent>) => {
      setSaveStatus('saving');
      const res = await api.post<PageComponent>(
        `/pages/${pageId}/components`,
        { type: component.type, properties: component.properties },
      );
      return res.data;
    },
    onSuccess: (newComponent) => {
      setComponents((prev) => [...prev, newComponent]);
      markSaved();
    },
  });

  // Update component mutation
  const updateComponentMutation = useMutation({
    mutationFn: async ({
      componentId,
      properties,
    }: {
      componentId: string;
      properties: Record<string, unknown>;
    }) => {
      setSaveStatus('saving');
      const res = await api.put<PageComponent>(
        `/pages/${pageId}/components/${componentId}`,
        { properties },
      );
      return res.data;
    },
    onSuccess: (updatedComponent) => {
      setComponents((prev) =>
        prev.map((c) => (c.id === updatedComponent.id ? updatedComponent : c)),
      );
      markSaved();
    },
  });

  // Delete component mutation
  const deleteComponentMutation = useMutation({
    mutationFn: async (componentId: string) => {
      setSaveStatus('saving');
      await api.delete(`/pages/${pageId}/components/${componentId}`);
      return componentId;
    },
    onSuccess: (componentId) => {
      setComponents((prev) => prev.filter((c) => c.id !== componentId));
      setSelectedComponentId((prev) => (prev === componentId ? null : prev));
      markSaved();
    },
  });

  // Publish/unpublish mutation
  const publishMutation = useMutation({
    mutationFn: async (status: 'draft' | 'published') => {
      const res = await api.put<Page>(`/pages/${pageId}`, { status });
      return res.data;
    },
    onSuccess: (updatedPage) => {
      // The PUT /pages/:id response doesn't include `components` — merge
      // into the cached page rather than replacing it, so the editor's
      // already-loaded components aren't dropped from the cache.
      queryClient.setQueryData<Page>(['page', pageId], (old) =>
        old ? { ...old, ...updatedPage } : old,
      );
    },
  });

  // Reorder components mutation
  const reorderMutation = useMutation({
    mutationFn: async (order: string[]) => {
      setSaveStatus('saving');
      await api.put(`/pages/${pageId}/components/reorder`, { order });
      return order;
    },
    onSuccess: () => markSaved(),
  });

  // Load page components
  useEffect(() => {
    if (page?.components) {
      setComponents(page.components);
    }
  }, [page]);

  const handleAddComponent = (component: Partial<PageComponent>) => {
    addComponentMutation.mutate(component);
  };

  // Instant, local-only reflection so Canvas/PreviewPane update as the user
  // types — the actual persist (handleUpdateComponent) is debounced.
  const handleLiveChangeComponent = (
    id: string,
    properties: Record<string, unknown>,
  ) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, properties } : c)),
    );
  };

  const handleUpdateComponent = (
    id: string,
    properties: Record<string, unknown>,
  ) => {
    updateComponentMutation.mutate({ componentId: id, properties });
  };

  const handleDeleteComponent = (id: string) => {
    deleteComponentMutation.mutate(id);
  };

  // Canvas computes the new order client-side (via dnd-kit's arrayMove) and
  // hands back the full ordered id list — reflect it locally right away so
  // the drag doesn't visually snap back while the request is in flight.
  const handleReorderComponents = (ids: string[]) => {
    setComponents((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));
      const reordered = ids
        .map((id) => byId.get(id))
        .filter((c): c is PageComponent => Boolean(c));
      return reordered.length === prev.length ? reordered : prev;
    });
    reorderMutation.mutate(ids);
  };

  const selectedComponent =
    components.find((c) => c.id === selectedComponentId) || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex justify-between items-center">
        <div>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{page?.title}</h1>
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium">{page?.status}</span>
          </p>
        </div>

        <div className="flex gap-3 items-center">
          {saveStatus === 'saving' && (
            <span className="text-sm text-gray-600">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600">✓ Saved</span>
          )}

          {page?.status === 'draft' && (
            <button
              onClick={() => publishMutation.mutate('published')}
              disabled={publishMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {publishMutation.isPending &&
                publishMutation.variables === 'published' && <Spinner />}
              {publishMutation.isPending &&
              publishMutation.variables === 'published'
                ? 'Publishing...'
                : 'Publish'}
            </button>
          )}

          {page?.status === 'published' && (
            <>
              <a
                href={`/pub/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                View Public
              </a>
              <button
                onClick={() => publishMutation.mutate('draft')}
                disabled={publishMutation.isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {publishMutation.isPending &&
                  publishMutation.variables === 'draft' && <Spinner />}
                {publishMutation.isPending &&
                publishMutation.variables === 'draft'
                  ? 'Unpublishing...'
                  : 'Unpublish'}
              </button>
              <Link
                href={`/pages/${pageId}/analytics`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Analytics
              </Link>
            </>
          )}

          <button
            onClick={() => logout()}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Component Palette */}
        <div className="w-48 min-h-0">
          <ComponentPalette />
        </div>

        {/* Center Panel: Canvas */}
        <Canvas
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
          onAddComponent={handleAddComponent}
          onDeleteComponent={handleDeleteComponent}
          onReorderComponents={handleReorderComponents}
        />

        {/* Right Panel: Property Editor */}
        <PropertyEditor
          component={selectedComponent}
          onLiveChange={handleLiveChangeComponent}
          onUpdateComponent={handleUpdateComponent}
        />

        {/* Far Right: Preview */}
        <PreviewPane components={components} />
      </div>
    </div>
  );
}
