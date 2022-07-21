export default function deDuplication(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort();
}
