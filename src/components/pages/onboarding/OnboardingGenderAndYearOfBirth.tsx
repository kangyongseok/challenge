import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useResetRecoilState } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { Box, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';

import GenderYearInput from '@components/UI/organisms/GenderYearInput';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserAgeAndGender, postUserSize, postUserStyle } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { SELECTED_MODEL_CARD } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { openState, selectedModelCardState } from '@recoil/onboarding';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import OnboardingStep from './OnboardingStep';
import OnboardingBottomCTA from './OnboardingBottomCTA';

function OnboardingGenderAndYearOfBirth({ onClick }: { onClick: () => void }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [genderValue, setGenderValue] = useState<'F' | 'M' | null>(null);
  const { data: accessUser } = useQueryAccessUser();
  const [yearOfBirthValue, setYearOfBirthValue] = useState('');
  const resetLiketooltip = useResetRecoilState(openState('likeTooltip'));
  const { mutate } = useMutation(postUserAgeAndGender);
  const { mutate: styleMutate } = useMutation(postUserStyle);
  const { mutateAsync } = useMutation(postUserSize);
  const resetSelectedModelCard = useResetRecoilState(selectedModelCardState);
  const { data: { info: { value: { yearOfBirth = '', gender = '' } = {} } = {} } = {}, remove } =
    useQuery(queryKeys.users.userInfo(), fetchUserInfo);

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_PERSONAL_INPUT, {
      name: attrProperty.productName.INFO
    });
  }, []);

  useEffect(() => {
    setYearOfBirthValue(String(new Date().getFullYear() - Number(accessUser?.age || 0) + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (yearOfBirthValue !== yearOfBirth) setYearOfBirthValue(yearOfBirth);

    if (gender === 'F') setGenderValue('F');

    if (gender === 'M') setGenderValue('M');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, yearOfBirth]);

  const resetAfterStepData = () => {
    const sizeMutate = [
      mutateAsync({ sizeType: 'top', categorySizeIds: [] }),
      mutateAsync({ sizeType: 'bottom', categorySizeIds: [] }),
      mutateAsync({ sizeType: 'shoes', categorySizeIds: [] })
    ];
    LocalStorage.remove(SELECTED_MODEL_CARD);
    resetSelectedModelCard();
    resetLiketooltip();
    Promise.all(sizeMutate);
    styleMutate({
      styleIds: [],
      purchaseTypeIds: []
    });
  };

  const handleclickGender = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.welcome.SELECT_ITEM, {
      name: attrProperty.productName.INFO,
      title: attrProperty.productTitle.GENDER,
      att: target.dataset.gender === 'F' ? 'FEMALE' : 'MALE'
    });

    if (genderValue === target.dataset.gender) {
      setGenderValue(null);
    } else {
      setGenderValue(target.dataset.gender as 'M' | 'F' | null);
    }
  };

  const handleClickNext = () => {
    logEvent(attrKeys.welcome.SUBMIT_PERSONAL_INPUT, {
      name: attrProperty.productName.INFO,
      gender: genderValue === 'F' ? 'FEMALE' : 'MALE',
      age: yearOfBirthValue
    });

    if (genderValue !== gender) {
      resetAfterStepData();
    }

    mutate(
      { birthday: Number(yearOfBirthValue), gender: genderValue === 'F' ? 'F' : 'M' },
      {
        onSuccess: () => {
          onClick();
          remove();
        }
      }
    );
  };

  const handleChangeYear = debounce((value: string) => {
    logEvent(attrKeys.welcome.SELECT_ITEM, {
      name: attrProperty.productName.INFO,
      title: attrProperty.productTitle.BIRTH,
      att: value
    });

    setYearOfBirthValue(value);
  }, 500);

  return (
    <>
      <Box customStyle={{ padding: 32, background: common.uiWhite, height: '100%' }}>
        <OnboardingStep />
        <Box customStyle={{ marginTop: 50 }}>
          <Typography variant="h2" weight="bold" customStyle={{ marginBottom: 8 }}>
            성별과 나이를 알려주세요!
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>인기매물을 추천해드릴게요</Typography>
        </Box>
        <GenderYearInput
          onClickGender={handleclickGender}
          genderValue={genderValue}
          onChangeYear={handleChangeYear}
        />
      </Box>
      <OnboardingBottomCTA disabled={!genderValue || !yearOfBirthValue} onClick={handleClickNext}>
        다음
      </OnboardingBottomCTA>
    </>
  );
}

export default OnboardingGenderAndYearOfBirth;
