import { PRODUCT_SITE } from '@constants/product';

export function getUserScoreText(curnScore: number, maxScore: number, siteId: number) {
  if (!curnScore && !maxScore) {
    return '아직 평점이 없는 판매자에요.';
  }
  if (curnScore && siteId === PRODUCT_SITE.DAANGN.id) {
    return `매너온도 ${curnScore}인 판매자에요.`;
  }
  if (curnScore && siteId === PRODUCT_SITE.MUSTIT.id) {
    return `평점 ${curnScore}점인 판매자에요..`;
  }
  return `평점 ${maxScore}점 만점에 ${curnScore}점을 받은 판매자에요.`;
}

export const getUserName = (name: string | undefined, id: number | undefined): string => {
  return name || `회원${id || ''}`;
};
