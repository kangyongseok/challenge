/* eslint-disable import/no-duplicates */
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

require('dayjs/locale/ko');

dayjs.locale('ko');
dayjs.extend(relativeTime);

/**
 * @name getTenThousandUnitPrice
 * @returns 만원 단위 금액 반환
 * @example 550000 => 55
 */
export function getTenThousandUnitPrice(price: number) {
  const resultPrice = price / 10000;

  if (resultPrice - Math.floor(resultPrice) > 0) {
    if (resultPrice.toString().length > 6) {
      return Math.round(resultPrice);
    }

    return Number(resultPrice.toFixed(1));
  }

  if (resultPrice.toString().length > 6) {
    return Math.round(resultPrice);
  }
  return Math.floor(resultPrice);
}

/**
 * @name getFormattedDistanceTime
 * @returns 7일 전 까지는 현재 시간으로 부터 시간 표시, 이후 부터는 "x월 x일" 으로 표시
 * @example x분 전, x시간 전, x일전, x월 x일
 */
export function getFormattedDistanceTime(date: Date) {
  const dateDiff = dayjs(date).diff(dayjs(), 'day');
  return dateDiff < -7 ? dayjs(date).format('M월 D일') : dayjs(date).fromNow();
}

/**
 * @name getProductArea
 * @returns ‘시/군/구'중 ‘구' 정보가 있는 경우 ‘구’ 단위부터 반환, '구' 정보가 없는 경우 '시' 단위부터 반환
 * @example 서울특별시 영등포구 영등포동 1019-16 => 영등포구 영등포동 1019-16
 */
export function getProductArea(area: string) {
  const regex = /[가-힣]+?구[^가-힣]/g;
  let resultArea = area;

  const gu = area.match(regex);

  if (gu) {
    resultArea = resultArea.slice(resultArea.indexOf(gu[0]), resultArea.length);
  }

  return resultArea;
}
