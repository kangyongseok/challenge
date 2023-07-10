/* eslint-disable import/no-duplicates */
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';
import { CSSValue } from '@mrcamelhub/camel-ui';

require('dayjs/locale/ko');

dayjs.locale('ko');
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

/**
 * @name getTenThousandUnitPrice
 * @returns 만원 단위 금액 반환
 * @example 550000 => 55
 */
export function getTenThousandUnitPrice(price: number) {
  const resultPrice = price / 10000;

  if (resultPrice - Math.floor(resultPrice) > 0) {
    if (resultPrice.toString().length > 6) {
      return Math.round(resultPrice); // 반올림
    }

    return Number(resultPrice.toFixed(1));
  }

  if (resultPrice.toString().length > 6) {
    return Math.round(resultPrice); // 반올림
  }
  return Math.round(resultPrice);
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

export function commaNumber(value: number | string) {
  return Number(value).toLocaleString();
}

export function convertNumberToCSSValue(value: CSSValue | 'auto', unit?: string) {
  if (typeof value === 'number') {
    return `${value}${unit || 'px'}`;
  }
  return value;
}

/**
 *
 * @param {*} count 총 매물 수
 * @returns 한 시간에 오는 알림의 수
 */
export const calculateExpectCountPerHour = (count: number) => {
  try {
    const numberOfAlarmasPerHour = Math.ceil((count * 0.05) / 24);
    return numberOfAlarmasPerHour > 0 ? numberOfAlarmasPerHour : 2;
  } catch (e) {
    return 2;
  }
};

/**
 * @name getFormattedActivatedTime
 * @returns 24시간 전 까지는 현재 시간으로 부터 시간 표시, 이후 부터는 "x일 전 접속" 으로 표시
 * @example 접속중, x시간 전 접속, x일 전 접속
 */
export function getFormattedActivatedTime(date: string | Date) {
  const minuteDiff = dayjs().diff(dayjs(date), 'minute');
  const hourDiff = dayjs().diff(dayjs(date), 'hour');
  const daysDiff = dayjs().diff(dayjs(date), 'days');
  const monthDiff = dayjs().diff(dayjs(date), 'month');

  if (minuteDiff < 11) return { icon: 'dot', text: '접속중' };
  if (hourDiff < 23 || daysDiff === 0 || !date) return { icon: 'dot', text: '오늘 접속' };
  if (daysDiff > 30 && daysDiff <= 59) return { icon: 'time', text: '1달 전 접속' };
  if (daysDiff > 60 && daysDiff <= 89) return { icon: 'time', text: '2달 전 접속' };
  if (daysDiff > 90 && daysDiff <= 119) return { icon: 'time', text: '3달 전 접속' };
  if (monthDiff > 3) {
    return { icon: 'time', text: `${monthDiff}달 전 접속` };
  }

  return { icon: 'time', text: `${daysDiff}일 전 접속` };
}

export const getFormatPhoneNumberDashParser = (phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, '');

  const formattedNumber = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;

  return formattedNumber;
};
