const FORMAT = '?f=webp';

export const getImageResizePath = ({
  imagePath,
  w,
  h,
  q
}: {
  imagePath: string;
  w?: number;
  h?: number;
  q?: number;
}): string => {
  if (!imagePath) return '';
  let result = `${imagePath}${FORMAT}`;
  if (w) {
    result += `&w=${w * 2}`;
  }

  if (h) {
    result += `&h=${h * 2}`;
  }

  if (q) {
    result += `&q=${q}`;
  }

  return result;
};
