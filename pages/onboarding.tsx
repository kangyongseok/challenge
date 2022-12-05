import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';
import styled from '@emotion/styled';

import {
  OnboardingGenderAndYearOfBirth,
  OnboardingLikeModel,
  // OnboardingPermission,
  OnboardingPurchaseType,
  OnboardingResult,
  OnboardingSize,
  OnboardingWelcome
} from '@components/pages/onboarding';

import LocalStorage from '@library/localStorage';

import { SIGN_UP_STEP } from '@constants/localStorage';

function Onboarding() {
  const { query, push } = useRouter();
  const step = Number(query.step ?? 0);

  const handleClickStep = useCallback(() => {
    LocalStorage.set(SIGN_UP_STEP, step + 1);
    push(`/onboarding?step=${step + 1}`);
  }, [push, step]);

  useEffect(() => {
    document.body.className = 'legit-dark';

    return () => {
      document.body.removeAttribute('class');
    };
  }, []);

  return (
    <Wrapper>
      {step === 0 && <OnboardingWelcome onClick={handleClickStep} />}
      {step === 1 && <OnboardingGenderAndYearOfBirth onClick={handleClickStep} />}
      {step === 2 && <OnboardingLikeModel onClick={handleClickStep} />}
      {step === 3 && <OnboardingSize onClick={handleClickStep} />}
      {step === 4 && <OnboardingPurchaseType onClick={handleClickStep} />}
      {step === 5 && <OnboardingResult />}
      {/* {step === 5 && <OnboardingPermission />} */}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export default Onboarding;
