/**
 * @name sortBrand
 * @returns int 정렬값(-x, 0, x)
 * @example '오리', '오리너구리'
 */
export default function sortBrand(b1: string, b2: string) {
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
