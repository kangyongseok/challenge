export function hasImageFile(url: string | undefined | null): boolean {
  return ['0.png', 'noimage.png'].every((fileName) => !url?.endsWith(fileName));
}
