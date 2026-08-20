export interface GalleryImage {
  url: string;
  alt: string;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  defaultProperties: Record<string, unknown>;
  propertyFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'url' | 'images';
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
  }>;
}

export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
  hero: {
    type: 'hero',
    label: 'Hero',
    icon: '🎬',
    defaultProperties: {
      title: 'Hero Title',
      subtitle: 'Add a subtitle here',
      backgroundImage: 'https://via.placeholder.com/1200x600',
      ctaText: 'Get Started',
      ctaColor: 'primary',
    },
    propertyFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'backgroundImage', label: 'Background Image URL', type: 'url' },
      {
        name: 'ctaColor',
        label: 'CTA Button Color',
        type: 'select',
        options: [
          { value: 'primary', label: 'Primary (Blue)' },
          { value: 'secondary', label: 'Secondary (Gray)' },
        ],
      },
      { name: 'ctaText', label: 'Button Text', type: 'text' },
    ],
  },

  text: {
    type: 'text',
    label: 'Text',
    icon: '📝',
    defaultProperties: {
      content: 'Add your text content here',
      fontSize: 'base',
      alignment: 'left',
    },
    propertyFields: [
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      {
        name: 'fontSize',
        label: 'Font Size',
        type: 'select',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'base', label: 'Normal' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ],
      },
      {
        name: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
    ],
  },

  image: {
    type: 'image',
    label: 'Image',
    icon: '🖼️',
    defaultProperties: {
      src: 'https://via.placeholder.com/600x400',
      alt: 'Image',
      width: 600,
      height: 400,
    },
    propertyFields: [
      { name: 'src', label: 'Image URL', type: 'url', required: true },
      { name: 'alt', label: 'Alt Text', type: 'text', required: true },
      { name: 'width', label: 'Width (px)', type: 'number' },
      { name: 'height', label: 'Height (px)', type: 'number' },
    ],
  },

  button: {
    type: 'button',
    label: 'Button',
    icon: '🔘',
    defaultProperties: {
      text: 'Click Me',
      color: 'primary',
      size: 'md',
    },
    propertyFields: [
      { name: 'text', label: 'Button Text', type: 'text', required: true },
      {
        name: 'color',
        label: 'Color',
        type: 'select',
        options: [
          { value: 'primary', label: 'Primary (Blue)' },
          { value: 'secondary', label: 'Secondary (Gray)' },
          { value: 'success', label: 'Success (Green)' },
        ],
      },
      {
        name: 'size',
        label: 'Size',
        type: 'select',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ],
      },
    ],
  },

  gallery: {
    type: 'gallery',
    label: 'Gallery',
    icon: '🖼️',
    defaultProperties: {
      images: [
        {
          url: 'https://via.placeholder.com/300x300',
          alt: 'Image 1',
        },
        {
          url: 'https://via.placeholder.com/300x300',
          alt: 'Image 2',
        },
      ] as GalleryImage[],
      columns: 2,
    },
    propertyFields: [
      {
        name: 'images',
        label: 'Images',
        type: 'images',
      },
      {
        name: 'columns',
        label: 'Columns',
        type: 'select',
        options: [
          { value: '1', label: '1 Column' },
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
        ],
      },
    ],
  },

  cta: {
    type: 'cta',
    label: 'CTA Section',
    icon: '📢',
    defaultProperties: {
      heading: 'Ready to get started?',
      description: 'Add a description of your call to action',
      buttonText: 'Start Now',
      buttonColor: 'primary',
    },
    propertyFields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
      },
      {
        name: 'buttonText',
        label: 'Button Text',
        type: 'text',
        required: true,
      },
      {
        name: 'buttonColor',
        label: 'Button Color',
        type: 'select',
        options: [
          { value: 'primary', label: 'Primary (Blue)' },
          { value: 'secondary', label: 'Secondary (Gray)' },
        ],
      },
    ],
  },
};
