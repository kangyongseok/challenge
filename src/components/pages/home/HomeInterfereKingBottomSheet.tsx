import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';

import type { EvaluationData, Selected } from '@components/UI/molecules/InterfereKingBottomSheet';
import { InterfereKingBottomSheet } from '@components/UI/molecules';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import {
  DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET,
  LAST_DISPLAY_EXIT_SURVEY_BOTTOM_SHEET
} from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { deviceIdState, exitUserNextStepState, exitUserViewBottomSheetState } from '@recoil/common';
import useExitSurveyBottomSheet from '@hooks/useExitSurveyBottomSheet';

const evaluationData: EvaluationData[] = [
  { evalType: 0, icon: '😤', toolTipText: '별로에요!' },
  {
    evalType: 1,
    icon: '😐',
    toolTipText: '그럭저럭 쓸만해요',
    defaultTooltip: '눌러서 평가해주세요! '
  },
  { evalType: 2, icon: '😍', toolTipText: '좋아요!' }
];

function HomeInterfereKingBottomSheet() {
  const router = useRouter();
  const { isOverWeek } = useExitSurveyBottomSheet();
  const [isOpen, setIsOpen] = useRecoilState(exitUserViewBottomSheetState);
  const [exitUserNextStep, setExitUserNextStep] = useRecoilState(exitUserNextStepState);
  const [selectedType, setSelectedType] = useState<Selected>(null);
  const [description, setDescription] = useState('');
  const deviceId = useRecoilValue(deviceIdState);
  const { mutate: mutateSurvey } = useMutation(postSurvey);

  const handleSelectEvaluation = (value: Selected) => {
    setSelectedType(value);
  };

  const handleChangeDescription = (value: string) => {
    setDescription(value);
  };

  const handleClickNext = () => {
    logEvent(attrKeys.events.SUBMIT_EVENT_DETAIL, {
      name: exitUserNextStep.currentView,
      title: '2303_CAMEL_OPINION_V2',
      type: 'NOT_GOOD',
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
    setSelectedType(null);
    setDescription('');
    setExitUserNextStep((prev) => ({
      ...prev,
      text: '혹시 조금 더 의견주실 수 있나요?',
      logType: 'NOT_GOOD'
    }));
  };

  useEffect(() => {
    if (isOpen) {
      logEvent(attrKeys.events.VIEW_EVENT_DETAIL, {
        name: router.asPath === '/search' ? 'PRODUCT_LIST' : ' PRODUCT_MAIN',
        title: '2303_CAMEL_OPINION_V2',
        type: 'NOT_GOOD'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const displayCount = LocalStorage.get(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET) || 0;
    if (isOpen) {
      if (!displayCount) {
        LocalStorage.set(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET, 1);
        LocalStorage.set(LAST_DISPLAY_EXIT_SURVEY_BOTTOM_SHEET, dayjs().format('YYYY-MM-DD'));
      }

      if (Number(displayCount) === 1 && isOverWeek) {
        LocalStorage.set(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET, 2);
      }
    }
  }, [isOpen, isOverWeek]);

  return (
    <InterfereKingBottomSheet
      titles={['카멜 사용해보니 어떠셨어요?']}
      evaluationData={evaluationData}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSelect={handleSelectEvaluation}
      onChange={handleChangeDescription}
      selectedType={selectedType}
      description={description}
      onNext={handleClickNext}
    />
  );
}

export default HomeInterfereKingBottomSheet;
