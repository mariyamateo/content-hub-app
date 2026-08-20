'use client';

import { PageComponent } from '@/lib/types';
import { ComponentRenderer } from './ComponentRenderer';
import React, { useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CanvasProps {
  components: PageComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onAddComponent: (component: Partial<PageComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onReorderComponents: (ids: string[]) => void;
}

function DragHandleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" {...props}>
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="8" cy="2" r="1.5" />
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="2" cy="14" r="1.5" />
      <circle cx="8" cy="14" r="1.5" />
    </svg>
  );
}

interface SortableComponentItemProps {
  component: PageComponent;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableComponentItem({
  component,
  index,
  isSelected,
  onSelect,
  onDelete,
}: SortableComponentItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: component.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1.5 bg-white/90 border border-gray-200 rounded cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <DragHandleIcon />
      </div>

      <ComponentRenderer
        component={component}
        isSelected={isSelected}
        onClick={onSelect}
      />

      {isSelected && (
        <div className="absolute -top-8 left-0 right-0 flex gap-2 bg-gray-100 p-2 rounded-t">
          <button
            onClick={onDelete}
            className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <span className="text-xs text-gray-600 flex items-center">
            Component {index + 1}
          </span>
        </div>
      )}
    </div>
  );
}

export function Canvas({
  components,
  selectedComponentId,
  onSelectComponent,
  onAddComponent,
  onDeleteComponent,
  onReorderComponents,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (canvasRef.current) {
      canvasRef.current.classList.add('ring-2', 'ring-blue-400', 'ring-dashed');
    }
  };

  const handleDragLeave = () => {
    if (canvasRef.current) {
      canvasRef.current.classList.remove(
        'ring-2',
        'ring-blue-400',
        'ring-dashed',
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (canvasRef.current) {
      canvasRef.current.classList.remove(
        'ring-2',
        'ring-blue-400',
        'ring-dashed',
      );
    }

    try {
      const data = e.dataTransfer.getData('application/json');
      const component = JSON.parse(data) as Partial<PageComponent>;
      onAddComponent(component);
    } catch (error) {
      console.error('Failed to parse dropped component:', error);
    }
  };

  const handleCanvasClick = () => {
    onSelectComponent('');
  };

  const handleSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(components, oldIndex, newIndex);
      onReorderComponents(reordered.map((c) => c.id));
    }
  };

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      className="flex-1 bg-gray-50 overflow-y-auto p-8 transition"
    >
      {components.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center text-gray-500">
          <div>
            <p className="text-lg font-medium">No components yet</p>
            <p className="text-sm">Drag a component from the left panel</p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSortEnd}
        >
          <SortableContext
            items={components.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6 max-w-2xl mx-auto">
              {components.map((component, index) => (
                <SortableComponentItem
                  key={component.id}
                  component={component}
                  index={index}
                  isSelected={selectedComponentId === component.id}
                  onSelect={() => onSelectComponent(component.id)}
                  onDelete={() => onDeleteComponent(component.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
