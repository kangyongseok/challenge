import { baseCons, doubleCon } from '@constants/consonant';

export function deDuplication(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort();
}

export function getBrandListTitles(resultKo: Array<string>, regexp: RegExp) {
  const data = resultKo.filter((koCon) => !regexp.test(koCon));
  doubleCon.forEach((double, index) => {
    if (data.includes(double)) {
      const doubleIndex = data.findIndex((con) => con === double);
      const matchIndex = data.findIndex((con) => con === baseCons[index]);
      data.splice(doubleIndex, 1);
      data[matchIndex] = `${data[matchIndex]}, ${double}`;
    }
  });
  if (resultKo.filter((koCon) => regexp.test(koCon)).length > 0) {
    data.push('기타');
  }
  return data;
}

/**
 * @name parseWordToConsonant
 * @returns string 자음 반환
 * @example 'ㄱ'
 */
export function parseWordToConsonant(word: string) {
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

export function scrollCenterIndex(scrollAreaEl: HTMLDivElement, target: HTMLButtonElement) {
  let position = 0;
  const el = scrollAreaEl;
  const listHeight = el.scrollHeight;
  const halfHeight = el.clientHeight / 2;
  const targetTop = target.offsetTop;
  const selectTargetPos = targetTop + 30 / 2;
  if (selectTargetPos <= halfHeight) {
    position = 0;
  } else if (listHeight - selectTargetPos <= halfHeight) {
    position = listHeight - el.clientHeight;
  } else {
    position = selectTargetPos - halfHeight;
  }
  el.scrollTo(0, position);
}

/**
 * @name sortBrand
 * @returns int 정렬값(-x, 0, x)
 * @example '오리', '오리너구리'
 */
export function sortBrand(b1: string, b2: string) {
  const b1char = b1.split('');
  const b2char = b2.split('');

  const result = b2char
    .map((c, i) => {
      if (b1char.length <= i) {
        return -9999;
      }
      return b1char[i].charCodeAt(0) - c.charCodeAt(0);
    })
    .filter((r) => r !== 0);

  return result[0];
}
