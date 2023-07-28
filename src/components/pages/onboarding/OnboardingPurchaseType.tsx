import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { find } from 'lodash-es';
import { useMutation } from '@tanstack/react-query';
import { Box, Typography, useTheme } from '@mrcamelhub/camel-ui';

import PurchaseType from '@components/UI/organisms/PurchaseType';

import { logEvent } from '@library/amplitude';

import { postUserStyle } from '@api/user';

import { purchaseType } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { disabledState, purchaseTypeIdState } from '@recoil/onboarding';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

import OnboardingStep from './OnboardingStep';
import OnboardingBottomCTA from './OnboardingBottomCTA';

function OnboardingPurchaseType({ onClick }: { onClick: () => void }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const purchaseDisabledState = useRecoilValue(disabledState('purchase'));
  const { mutate: styleMutate } = useMutation(postUserStyle);
  const purchaseTypeId = useRecoilValue(purchaseTypeIdState);
  const { data: { personalStyle: { purchaseTypes = [] } = {} } = {} } = useQueryUserInfo();

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_PERSONAL_INPUT, {
      name: attrProperty.name.BUYINGTYPE
    });
  }, []);

  const handleClick = () => {
    logEvent(attrKeys.welcome.SUBMIT_PERSONAL_INPUT, {
      name: attrProperty.name.BUYINGTYPE,
      att: find(purchaseType, { value: purchaseTypeId })?.title
    });

    styleMutate({
      purchaseTypeIds: purchaseTypeId ? [purchaseTypeId] : [purchaseTypes[0].id as number]
    });
    onClick();
  };

  return (
    <>
      <Box customStyle={{ padding: 32, background: common.uiWhite, height: '100%' }}>
        <OnboardingStep />
        <Box customStyle={{ marginTop: 50 }}>
          <Typography variant="h2" weight="bold" customStyle={{ marginBottom: 8 }}>
            중고구매에서 가장 중요한 것은?
          </Typography>
          <Typography color="ui60">조건에 맞는 매물을 더 먼저 보여드릴게요</Typography>
        </Box>
        <PurchaseType />
      </Box>
      <OnboardingBottomCTA onClick={handleClick} disabled={purchaseDisabledState.open}>
        다음
      </OnboardingBottomCTA>
    </>
  );
}

export default OnboardingPurchaseType;
