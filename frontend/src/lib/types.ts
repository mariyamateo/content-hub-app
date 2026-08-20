export interface AuthUser {
  keycloakId: string;
  email: string;
  name: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt?: Date;
  components: PageComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PageComponent {
  id: string;
  pageId: string;
  type: 'hero' | 'text' | 'image' | 'button' | 'gallery' | 'cta';
  order: number;
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  totalViews: number;
  totalClicks: number;
  viewsByDate: Array<{ date: string; count: number }>;
  topComponents: Array<{
    componentId?: string;
    componentType?: string;
    clicks: number;
  }>;
}

export const ComponentTypes = {
  HERO: 'hero',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  GALLERY: 'gallery',
  CTA: 'cta',
} as const;

export const ComponentTypeLabels: Record<string, string> = {
  hero: 'Hero',
  text: 'Text',
  image: 'Image',
  button: 'Button',
  gallery: 'Gallery',
  cta: 'Call to Action',
};
