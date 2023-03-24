import { useRecoilState, useRecoilValue } from 'recoil';
import { BottomSheet, Box, Button, Icon, Typography, useTheme } from 'mrcamel-ui';
import { PopupButton } from '@typeform/embed-react';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { deviceIdState, exitNextStepBottomSheetState, exitUserNextStepState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { CloseIcon } from './InterfereKingResult.style';

function InterfereKingResult() {
  const {
    theme: {
      palette: { common, primary }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const deviceId = useRecoilValue(deviceIdState);
  const exitUserNextStepText = useRecoilValue(exitUserNextStepState);
  const [nextBottomSheetIsOpen, setNextBottomSheetOpen] = useRecoilState(
    exitNextStepBottomSheetState
  );

  const handleSubmit = () => {
    logEvent(attrKeys.events.SUBMIT_EVENT_DETAIL, {
      name: exitUserNextStepText.currentView,
      title: '2303_CAMEL_OPINION_V2',
      type: exitUserNextStepText.logType,
      step: 2
    });

    LocalStorage.set(DISPLAY_COUNT_EXIT_SURVEY_BOTTOM_SHEET, 2);
    setNextBottomSheetOpen(false);
  };

  const handleClick = () => {
    logEvent(attrKeys.events.CLICK_EVENT_DETAIL, {
      name: exitUserNextStepText.currentView,
      title: '2303_CAMEL_OPINION_V2',
      type: exitUserNextStepText.logType,
      step: 2
    });
  };

  const handleClose = () => {
    setNextBottomSheetOpen(false);
  };

  return (
    <BottomSheet
      disableSwipeable
      open={nextBottomSheetIsOpen}
      onClose={() => setNextBottomSheetOpen(false)}
      customStyle={{ padding: 30, textAlign: 'center' }}
    >
      <CloseIcon onClick={() => setNextBottomSheetOpen(false)}>
        <Icon name="CloseOutlined" />
      </CloseIcon>
      <Typography variant="h0">🙇‍♀️</Typography>
      <Typography weight="bold" variant="h3">
        의견주셔서 감사합니다!
      </Typography>
      <Box
        customStyle={{ width: '100%', height: 1, background: common.line02, margin: '20px 0' }}
      />
      <Typography weight="bold" variant="h3" customStyle={{ marginBottom: 8 }}>
        {exitUserNextStepText.text}
      </Typography>
      <Typography customStyle={{ color: common.ui60 }}>
        추가 설문에 참여하신{' '}
        <span style={{ fontWeight: 700, color: common.ui20 }}>모든 분께 네이버페이 포인트</span>
      </Typography>
      <Typography customStyle={{ color: common.ui60 }}>
        <span style={{ fontWeight: 700, color: common.ui20 }}>1,000원</span>, 추첨된{' '}
        <span style={{ fontWeight: 700, color: primary.main }}>두 분께는 10만원</span> 을 드려요!
      </Typography>
      <PopupButton
        id="WosmQnVG"
        as="section"
        style={{ width: '100%', cursor: 'pointer' }}
        onReady={handleClick}
        onClose={handleClose}
        onSubmit={handleSubmit}
        tracking={{
          utm_source: exitUserNextStepText.currentView,
          utm_medium: exitUserNextStepText.logType,
          utm_campaign: '2303_CAMEL_OPINION_V2',
          utm_term: String(accessUser?.userId || deviceId),
          utm_content: exitUserNextStepText.content
        }}
      >
        <Button
          fullWidth
          size="xlarge"
          variant="solid"
          brandColor="primary"
          customStyle={{ marginTop: 32 }}
        >
          좋아요, 도와줄게요!
        </Button>
      </PopupButton>
      <Typography
        weight="medium"
        customStyle={{ marginTop: 16, color: common.ui60 }}
        onClick={handleClose}
      >
        싫어요
      </Typography>
    </BottomSheet>
  );
}

export default InterfereKingResult;
