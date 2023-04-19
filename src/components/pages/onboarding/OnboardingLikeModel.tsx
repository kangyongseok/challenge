import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { Box, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StylesCards } from '@components/UI/organisms';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { postUserStyle } from '@api/user';
import { fetchStyles } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { SELECTED_MODEL_CARD, SELECTED_STYLE_CARD_IDS } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { openState, selectedModelCardState } from '@recoil/onboarding';

import OnboardingStep from './OnboardingStep';
import OnboardingBottomCTA from './OnboardingBottomCTA';

function OnboardingLikeModel({ onClick }: { onClick: () => void }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { mutate: styleMutate } = useMutation(postUserStyle);
  const openTooltip = useRecoilValue(openState('likeTooltip'));
  const selectedModelCard = useRecoilValue(selectedModelCardState);

  const { data: { styles: stylesList = [] } = {} } = useQuery(
    queryKeys.commons.styles(),
    fetchStyles
  );

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_PERSONAL_INPUT, {
      name: attrProperty.name.STYLE_MODEL
    });
  }, []);

  useEffect(() => {
    if (stylesList.length && selectedModelCard.length) {
      const onlyDetails = stylesList
        .map(({ styleDetails }) => styleDetails)
        .reduce((previous, current) => previous.concat(current));
      const detailFilter = onlyDetails.filter((detail) =>
        find(selectedModelCard, { id: detail.id })
      );
      LocalStorage.set(
        SELECTED_STYLE_CARD_IDS,
        detailFilter.map((item) => item.styleId)
      );
    }
  }, [selectedModelCard, stylesList]);

  const handleClickNext = () => {
    logEvent(attrKeys.welcome.SUBMIT_PERSONAL_INPUT, {
      name: attrProperty.name.STYLE_MODEL,
      att: selectedModelCard.filter((model) => model.name).map((model) => model.name)
    });

    LocalStorage.set(SELECTED_MODEL_CARD, selectedModelCard);
    styleMutate({
      styleIds: selectedModelCard.filter((model) => model.id).map((model) => model.id)
    });

    onClick();
  };

  return (
    <>
      <Box customStyle={{ padding: 32, background: common.uiWhite }}>
        <OnboardingStep />
        <Box customStyle={{ margin: '50px 0 32px' }}>
          <Typography variant="h2" weight="bold" customStyle={{ marginBottom: 8 }}>
            관심 아이템을 선택해주세요!
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>
            {selectedModelCard.length
              ? '혹은 비슷한 아이템을 골라주셔도 돼요'
              : '스타일을 먼저 골라보세요'}
          </Typography>
        </Box>
        <StylesCards />
      </Box>
      <OnboardingBottomCTA onClick={handleClickNext} disabled={!selectedModelCard.length}>
        <Tooltip
          open={openTooltip.open}
          variant="solid"
          message={
            <Typography variant="body2" weight="medium" customStyle={{ color: common.ui98 }}>
              😎 최대 5개까지 고를 수 있어요.
            </Typography>
          }
        >
          다음
        </Tooltip>
      </OnboardingBottomCTA>
    </>
  );
}

export default OnboardingLikeModel;
