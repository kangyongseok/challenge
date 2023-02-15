/**
 * @name getRandomNumber
 * @returns number
 * @example 123456
 */
export function getRandomNumber(length = 6) {
  return Number(
    Array.from({ length })
      .map((_) => Math.floor(Math.random() * 10) + 1)
      .join('')
  );
}
