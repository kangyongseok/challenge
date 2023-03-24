import { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';

import type { EvaluationData, Selected } from '@components/UI/molecules/InterfereKingBottomSheet';
import { InterfereKingBottomSheet } from '@components/UI/molecules';

import UserTraceRecord from '@library/userTraceRecord';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import {
  DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET,
  LAST_DISPLAY_EXIT_SURVEY_BOTTOM_SHEET,
  PRODUCT_EVENT_AD_BANNER_HIDE_DATE
} from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { deviceIdState, exitUserNextStepState } from '@recoil/common';
import useExitSurveyBottomSheet from '@hooks/useExitSurveyBottomSheet';

const evaluationData: EvaluationData[] = [
  { evalType: 0, icon: '😐', toolTipText: '아무렇지도 않아요' },
  {
    evalType: 1,
    icon: '🥺',
    toolTipText: '힝.. 조금 아쉬울 것 같아요',
    defaultTooltip: '눌러서 평가해주세요! '
  },
  { evalType: 2, icon: '😭', toolTipText: '없어지면 안돼요ㅠㅠ ' }
];

function ProductInterfereKingBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<Selected>(null);
  const [description, setDescription] = useState('');

  const setExitUserNextStep = useSetRecoilState(exitUserNextStepState);
  const { isOverWeek, isUserViewPerDay } = useExitSurveyBottomSheet();
  const deviceId = useRecoilValue(deviceIdState);

  const { mutate: mutateSurvey } = useMutation(postSurvey);

  const handleSelectEvaluation = (value: Selected) => {
    setSelectedType(value);
  };

  const handleChangeDescription = (value: string) => {
    setDescription(value);
  };

  const handleClickTodayHide = () => {
    LocalStorage.set(PRODUCT_EVENT_AD_BANNER_HIDE_DATE, dayjs().format('YYYY-MM-DD'));
    setIsOpen(false);
  };

  const handleClickNext = () => {
    logEvent(attrKeys.events.SUBMIT_EVENT_DETAIL, {
      name: 'PRODUCT_DETAIL',
      title: '2303_CAMEL_OPINION_V2',
      type: 'GOOD',
      step: 1,
      value: Number(selectedType) + 1,
      description
    });

    mutateSurvey({
      deviceId,
      answer: 0,
      options: `${selectedType}|${description}`,
      surveyId: 5
    });

    setExitUserNextStep({
      text: '혹시 카멜이 망하지 않게 의견주실 수 있나요? ',
      logType: 'GOOD',
      currentView: '매물상세',
      content: `${Number(selectedType) + 1}|${description}`
    });
    setSelectedType(null);
    setDescription('');
  };

  useEffect(() => {
    const displayCount = LocalStorage.get(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET) || 0;
    if (isOpen) {
      logEvent(attrKeys.events.VIEW_EVENT_DETAIL, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: '2303_CAMEL_OPINION_V2',
        type: 'GOOD'
      });

      if (!displayCount) {
        LocalStorage.set(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET, 1);
        LocalStorage.set(LAST_DISPLAY_EXIT_SURVEY_BOTTOM_SHEET, dayjs().format('YYYY-MM-DD'));
      }

      if (Number(displayCount) === 1 && isOverWeek) {
        LocalStorage.set(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET, 2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const hideDate = LocalStorage.get<string>(PRODUCT_EVENT_AD_BANNER_HIDE_DATE);
    // 최근 일주일 이내 당일을 제외한 재방문 && 매물 상세 5회 조회된 상태에서 매물 상세에 진입 시 노출
    if (
      UserTraceRecord.getLastVisitDateDiffDay() < -7 ||
      !UserTraceRecord.isReVisit() ||
      (UserTraceRecord?.getPageViewCount('product') || 0) < 5 ||
      !isUserViewPerDay()
    )
      return;

    if (hideDate) {
      if (dayjs().diff(hideDate, 'days') >= 1) {
        LocalStorage.remove(PRODUCT_EVENT_AD_BANNER_HIDE_DATE);
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InterfereKingBottomSheet
      titles={['카멜이 망하면', '어떨 것 같으세요?']}
      evaluationData={evaluationData}
      isOpen={isOpen}
      setIsOpen={handleClickTodayHide}
      onSelect={handleSelectEvaluation}
      onChange={handleChangeDescription}
      selectedType={selectedType}
      description={description}
      onNext={handleClickNext}
    />
  );
}

export default ProductInterfereKingBottomSheet;
