export function convertStringToArray(value: string, separator?: string) {
  if (!value) return [];

  return value.split(separator || ',').map((splitValue) => Number(splitValue));
}
