'use client';

import { COMPONENT_DEFINITIONS } from '@/lib/componentDefinitions';

export function ComponentPalette() {
  const components = Object.values(COMPONENT_DEFINITIONS);

  return (
    <div className="bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-4">Components</h3>

      <div className="space-y-2">
        {components.map((comp) => (
          <div
            key={comp.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copy';
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({
                  type: comp.type,
                  properties: comp.defaultProperties,
                }),
              );
            }}
            className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 transition"
          >
            <div className="text-2xl mb-1">{comp.icon}</div>
            <div className="text-sm font-medium text-gray-700">{comp.label}</div>
            <div className="text-xs text-gray-500">Drag to add</div>
          </div>
        ))}
      </div>
    </div>
  );
}
