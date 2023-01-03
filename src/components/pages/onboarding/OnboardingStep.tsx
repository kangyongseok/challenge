import { MouseEvent, useState } from 'react';

import { useRouter } from 'next/router';
import { BottomSheet, Button, Flexbox, Typography, dark } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { SIGN_UP_STEP } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import OnboardingPermission from './OnboardingPermission';

function OnboardingStep() {
  const { query, push } = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleClickClose = () => {
    setIsOpen(false);
  };

  const handleClickStep = (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const step = Number(target.dataset.step);
    LocalStorage.set(SIGN_UP_STEP, step);
    push(`/onboarding?step=${step}`);
  };

  const attTitle = () => {
    switch (Number(query.step)) {
      case 2:
        return attrProperty.title.STYLE;
      case 3:
        return attrProperty.title.SIZE;
      default:
        return attrProperty.title.BUYINGTYPE;
    }
  };

  const handleClickSkip = () => {
    logEvent(attrKeys.welcome.CLICK_SKIP, {
      name: attrProperty.name.PERSONAL_INPUT,
      title: attTitle()
    });
    setIsOpen(true);
  };

  return (
    <StepHeaderWrap gap={2} alignment="center">
      {Array.from({ length: 4 }, (_, v) => v + 1).map((value) => (
        <Step
          justifyContent="center"
          alignment="center"
          avtive={value === Number(query.step)}
          key={`step-number-${value}`}
          data-step={value}
          onClick={handleClickStep}
        >
          <Typography
            variant="small1"
            weight="bold"
            customStyle={{
              color:
                value === Number(query.step)
                  ? dark.palette.common.uiBlack
                  : dark.palette.common.ui80
            }}
          >
            {value}
          </Typography>
        </Step>
      ))}
      <SkipBtn variant="outline" onClick={handleClickSkip}>
        SKIP
      </SkipBtn>
      <BottomSheet
        open={isOpen}
        onClose={handleClickClose}
        customStyle={{ background: dark.palette.common.uiBlack }}
        disableSwipeable
      >
        <OnboardingPermission />
      </BottomSheet>
    </StepHeaderWrap>
  );
}

const StepHeaderWrap = styled(Flexbox)`
  position: fixed;
  top: 0;
  left: 0;
  padding: 0 32px;
  width: 100%;
  height: 74px;
  background: ${({ theme: { palette } }) => palette.common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
`;

const Step = styled(Flexbox)<{ avtive: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme: { palette }, avtive }) => (avtive ? '#2937FF' : palette.common.bg02)};
`;

const SkipBtn = styled(Button)`
  margin-left: auto;
  background: none;
  border: none;
  color: ${({ theme: { palette } }) => palette.common.ui80};
`;

export default OnboardingStep;
