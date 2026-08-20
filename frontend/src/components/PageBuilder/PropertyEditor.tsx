'use client';

import { PageComponent } from '@/lib/types';
import { COMPONENT_DEFINITIONS } from '@/lib/componentDefinitions';
import { asString, asNumber } from '@/lib/propertyValue';
import React, { useEffect, useRef, useState } from 'react';

interface PropertyEditorProps {
  component: PageComponent | null;
  // Fired on every keystroke — updates Canvas/PreviewPane immediately.
  onLiveChange: (id: string, properties: Record<string, unknown>) => void;
  // Debounced — persists to the backend after a pause in typing.
  onUpdateComponent: (id: string, properties: Record<string, unknown>) => void;
}

const AUTO_SAVE_DELAY_MS = 600;

export function PropertyEditor({
  component,
  onLiveChange,
  onUpdateComponent,
}: PropertyEditorProps) {
  // Local edit buffer so typing feels instant; the actual save is debounced
  // (see handlePropertyChange) so we don't fire a PUT on every keystroke.
  const [localProperties, setLocalProperties] = useState<
    Record<string, unknown>
  >(component?.properties ?? {});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{
    id: string;
    properties: Record<string, unknown>;
  } | null>(null);

  // Reset the edit buffer only when the SELECTED component changes — not on
  // every re-render — otherwise the debounced save echoing back through
  // props would blow away in-progress typing.
  useEffect(() => {
    setLocalProperties(component?.properties ?? {});

    // Flush any pending save (e.g. the user switched components mid-type)
    // instead of silently dropping the last edit.
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (pendingRef.current) {
        onUpdateComponent(pendingRef.current.id, pendingRef.current.properties);
        pendingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component?.id]);

  if (!component) {
    return (
      <div className="bg-white border-l border-gray-200 p-4 w-80 overflow-y-auto flex items-center justify-center">
        <p className="text-gray-500 text-center">
          Select a component to edit its properties
        </p>
      </div>
    );
  }

  const definition = COMPONENT_DEFINITIONS[component.type];

  if (!definition) {
    return (
      <div className="bg-white border-l border-gray-200 p-4 w-80">
        <p className="text-gray-500">Unknown component type</p>
      </div>
    );
  }

  const handlePropertyChange = (fieldName: string, value: unknown) => {
    const updated = { ...localProperties, [fieldName]: value };
    setLocalProperties(updated);
    onLiveChange(component.id, updated);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    pendingRef.current = { id: component.id, properties: updated };
    debounceRef.current = setTimeout(() => {
      onUpdateComponent(component.id, updated);
      pendingRef.current = null;
    }, AUTO_SAVE_DELAY_MS);
  };

  return (
    <div className="bg-white border-l border-gray-200 p-4 w-80 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-4">
        Edit {definition.label}
      </h3>

      <div className="space-y-4">
        {definition.propertyFields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={asString(localProperties[field.name])}
                onChange={(e) =>
                  handlePropertyChange(field.name, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={asString(localProperties[field.name])}
                onChange={(e) =>
                  handlePropertyChange(field.name, e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {field.type === 'url' && (
              <input
                type="url"
                value={asString(localProperties[field.name])}
                onChange={(e) =>
                  handlePropertyChange(field.name, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={asNumber(localProperties[field.name])}
                onChange={(e) =>
                  handlePropertyChange(
                    field.name,
                    parseInt(e.target.value, 10),
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                value={asString(localProperties[field.name])}
                onChange={(e) =>
                  handlePropertyChange(field.name, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an option</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
