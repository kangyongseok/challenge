export function truncateString(fullStr: string, strLen?: number): string {
  // eslint-disable-next-line no-param-reassign
  if (!strLen) strLen = 40;

  if (fullStr === null || fullStr === undefined) return '';

  if (fullStr.length <= strLen) return fullStr;

  const separator = '...';
  const sepLen = separator.length;
  const charsToShow = strLen - sepLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
}
