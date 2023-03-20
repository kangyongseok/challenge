import { useRecoilValue } from 'recoil';
import dayjs from 'dayjs';

import UserTraceRecord from '@library/userTraceRecord';
import LocalStorage from '@library/localStorage';

import {
  DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET,
  LAST_DISPLAY_EXIT_SURVEY_BOTTOM_SHEET
} from '@constants/localStorage';

import { historyState } from '@recoil/common';

// function productSellWaitLeave() {
//   // 매물등록 시도 => 필수정보 입력 다 안하고 중간에 나가기
// }

function useExitSurveyBottomSheet() {
  const history = useRecoilValue(historyState);

  const displayCount = LocalStorage.get(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET) || 0;
  const lastDisplayDate = (LocalStorage.get(LAST_DISPLAY_EXIT_SURVEY_BOTTOM_SHEET) || '') as string;

  const productDetailOverViewLeave = !!(
    (UserTraceRecord.getPageViewCount('exitProduct') || 0) >= 3 &&
    UserTraceRecord.getExitWishChannel() !== 'exitProduct'
  );

  const searchProductLeave = !!(
    UserTraceRecord.getPageViewCount('exitSearch') &&
    UserTraceRecord.getExitWishChannel() !== 'exitSearch'
  );

  const isOverWeek = dayjs(lastDisplayDate).diff(dayjs(), 'days') >= 7;

  const isUserViewPerDay = () => {
    if (Number(displayCount) === 2) return false;
    if (Number(displayCount) === 1 && lastDisplayDate && !isOverWeek) return false;
    return true;
  };

  const searchIndex = history.asPaths.indexOf('/search');
  const nextPagePath = history.asPaths[searchIndex + 1] || '';
  const isProducts = nextPagePath.split('/').includes('products');

  return {
    isUserViewPerDay,
    productDetailOverViewLeave,
    searchProductLeave,
    isOverWeek,
    isSearchExitPattern: !!(searchIndex && isProducts)
  };
}

export default useExitSurveyBottomSheet;
