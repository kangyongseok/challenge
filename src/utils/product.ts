import type { MrCamelTheme } from 'mrcamel-ui/dist/types';

export function getProductLabelColor(name: string, theme: MrCamelTheme) {
  const {
    palette: { primary, common }
  } = theme;
  if (name === '시세이하' || name === '가품 시, 100%환불') {
    return common.grey['20'];
  }
  if (name === '새상품급') {
    return primary.dark;
  }
  return primary.main;
}
