// PageComponent.properties is a Record<string, unknown> (arbitrary JSON from
// the API) — these coerce individual values to the concrete type a given
// input/renderer needs, without resorting to `any`.

export function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

export interface GalleryImage {
  url: string;
  alt: string;
}

export function asGalleryImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is GalleryImage =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).url === 'string',
  );
}
