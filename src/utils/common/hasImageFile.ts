export function hasImageFile(url: string | undefined | null): boolean {
  if (!url?.split('/').at(-1)) return false;
  return !['0.png', 'noimage.png'].includes(url?.split('/').at(-1) || '');
}
