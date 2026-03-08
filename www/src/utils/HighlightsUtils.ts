export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Extracts the clip ID & clip Slug from a combined slug string
 * This function splits on the last underscore and validates the UUID pattern (slug_uuid)
 * If the part after underscore is not a valid UUID, clipId will be an empty string
 *
 * @example
 * extractClipSlugAndId('hello-overlap-x-genuin-demo-49vg_8c5ee013-b806-4616-85d2-32f83c0200df')
 * // Returns: { clipSlug: 'hello-overlap-x-genuin-demo-49vg', clipId: '8c5ee013-b806-4616-85d2-32f83c0200df' }
 *
 * extractClipSlugAndId('some-podcast-title-description_abc12345-1234-4678-90ab-cdef12345678')
 * // Returns: { clipSlug: 'some-podcast-title-description', clipId: 'abc12345-1234-4678-90ab-cdef12345678' }
 *
 * extractClipSlugAndId('title_12345')
 * // Returns: { clipSlug: 'title', clipId: '' }
 *
 * extractClipSlugAndId(undefined)
 * // Returns: { clipSlug: undefined, clipId: undefined }
 */
export function extractClipSlugAndId(clipSlugAndId?: string): {
  clipSlug?: string;
  clipId?: string;
} {
  if (!clipSlugAndId) {
    return {
      clipSlug: undefined,
      clipId: undefined,
    };
  }

  const lastUnderscoreIndex = clipSlugAndId.lastIndexOf('_');

  // No underscore found, return the whole string as slug
  if (lastUnderscoreIndex === -1) {
    return {
      clipSlug: clipSlugAndId,
      clipId: undefined,
    };
  }

  const clipSlug = clipSlugAndId.slice(0, lastUnderscoreIndex);
  const potentialId = clipSlugAndId.slice(lastUnderscoreIndex + 1);

  // Validate if the part after underscore is a valid UUID
  const clipId = isValidUUID(potentialId) ? potentialId : '';

  return {
    clipSlug,
    clipId,
  };
}

export function highlightsPlayerLink(): Array<{
  rel: string;
  href: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}> {
  return [
    { rel: 'dns-prefetch', href: 'https://api.begenuin.com' },
    {
      rel: 'preconnect',
      href: 'https://api.begenuin.com',
      crossOrigin: 'anonymous',
    },
    { rel: 'dns-prefetch', href: 'https://media.begenuin.com' },
    {
      rel: 'preconnect',
      href: 'https://media.begenuin.com',
      crossOrigin: 'anonymous',
    },
  ];
}
