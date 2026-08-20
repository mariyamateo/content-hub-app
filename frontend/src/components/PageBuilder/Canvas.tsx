'use client';

import { PageComponent } from '@/lib/types';
import { ComponentRenderer } from './ComponentRenderer';
import React, { useRef } from 'react';

interface CanvasProps {
  components: PageComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onAddComponent: (component: Partial<PageComponent>) => void;
  onDeleteComponent: (id: string) => void;
}

export function Canvas({
  components,
  selectedComponentId,
  onSelectComponent,
  onAddComponent,
  onDeleteComponent,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

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
        <div className="space-y-6 max-w-2xl mx-auto">
          {components.map((component, index) => (
            <div key={component.id} className="relative group">
              <ComponentRenderer
                component={component}
                isSelected={selectedComponentId === component.id}
                onClick={() => onSelectComponent(component.id)}
              />

              {selectedComponentId === component.id && (
                <div className="absolute -top-8 left-0 right-0 flex gap-2 bg-gray-100 p-2 rounded-t">
                  <button
                    onClick={() => onDeleteComponent(component.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
