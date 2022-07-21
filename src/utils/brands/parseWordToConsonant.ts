/**
 * @name parseWordToConsonant
 * @returns string 자음 반환
 * @example 'ㄱ'
 */
export default function parseWordToConsonant(word: string) {
  let result = '';
  const choArr = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ'
  ];
  const code = Math.floor((word[0].charCodeAt(0) - 44032) / 588);
  result += code >= 0 ? choArr[code] : word[0];
  return result;
}
