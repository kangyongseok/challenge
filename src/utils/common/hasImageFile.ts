export function hasImageFile(url: string | undefined | null): boolean {
  const splitUrl = url?.split('/') || [];
  if (!splitUrl.length) return false;
  return !['0.png', 'noimage.png'].includes(splitUrl[splitUrl.length - 1] || '');
}
