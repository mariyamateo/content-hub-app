'use client';

import { PageComponent } from '@/lib/types';
import { ComponentRenderer } from './ComponentRenderer';

interface PreviewPaneProps {
  components: PageComponent[];
  isMobile?: boolean;
}

export function PreviewPane({
  components,
  isMobile = false,
}: PreviewPaneProps) {
  return (
    <div
      className={`bg-white overflow-y-auto border-l border-gray-200 ${
        isMobile ? 'max-w-sm' : 'max-w-2xl'
      }`}
    >
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-medium text-gray-600">
          {isMobile ? '📱 Mobile Preview' : '💻 Desktop Preview'}
        </p>
      </div>

      <div className={isMobile ? 'max-w-sm mx-auto p-4' : 'p-8'}>
        {components.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>Preview will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {components.map((component) => (
              <ComponentRenderer
                key={component.id}
                component={component}
                isSelected={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
