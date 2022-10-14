import { useEffect, useRef, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { TextInput } from '@components/UI/molecules';

import type { Gender } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserAgeAndGender } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import OnboardingBottomCTA from './OnboardingBottomCTA';

interface OnboardingGenderAndYearOfBirthProps {
  onClick: () => void;
}

function OnboardingGenderAndYearOfBirth({ onClick }: OnboardingGenderAndYearOfBirthProps) {
  const {
    theme: {
      palette: { primary, secondary }
    }
  } = useTheme();
  const { isLoading: isLoadingAccessUser, data: accessUser } = useQueryAccessUser();
  const {
    isLoading: isLoadingUserInfo,
    data: { info: { value: { yearOfBirth = '', gender = '' } = {} } = {} } = {},
    remove
  } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { isLoading: isLoadingMutateUserGenderAndAge, mutate } = useMutation(postUserAgeAndGender);

  const [genderValue, setGenderValue] = useState<Gender>('N');
  const [yearOfBirthValue, setYearOfBirthValue] = useState(
    String(new Date().getFullYear() - Number(accessUser?.age || 0) + 1)
  );
  const yearOfBirthRef = useRef<HTMLInputElement>(null);
  const isShowYearOfBirthError =
    Number(yearOfBirthValue || 0) < 1900 ||
    Number(yearOfBirthValue || 0) > Number(dayjs().format('YYYY'));
  const handleClickGender = (selectedGender: Extract<Gender, 'F' | 'M'>) => () => {
    logEvent(attrKeys.welcome.SELECT_ITEM, {
      name: attrProperty.productName.INFO,
      title: attrProperty.productTitle.GENDER,
      att: selectedGender === 'F' ? 'FEMALE' : 'MALE'
    });
    setGenderValue(selectedGender);
    if (yearOfBirthValue.length === 0 && yearOfBirthRef.current) {
      yearOfBirthRef.current.focus();
    }
  };

  const handleClickNext = () => {
    logEvent(attrKeys.welcome.SUBMIT_PERSONAL_INPUT, {
      name: attrProperty.productName.INFO,
      gender: genderValue === 'F' ? 'FEMALE' : 'MALE',
      age: yearOfBirthValue
    });
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

  useEffect(() => {
    logEvent(attrKeys.welcome.VIEW_PERSONAL_INPUT, {
      name: attrProperty.productName.INFO
    });
  }, []);

  useEffect(() => {
    if (yearOfBirthValue !== yearOfBirth) setYearOfBirthValue(yearOfBirth);

    if (gender === 'F') setGenderValue('F');

    if (gender === 'M') setGenderValue('M');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, yearOfBirth]);

  const handleBlur = () => {
    logEvent(attrKeys.welcome.SELECT_ITEM, {
      name: attrProperty.productName.INFO,
      title: attrProperty.productTitle.BIRTH,
      att: yearOfBirthValue
    });
  };

  return (
    <>
      <Box customStyle={{ flex: 1 }}>
        <Typography
          variant="h2"
          weight="bold"
          customStyle={{ padding: '48px 20px 80px', '& > span': { color: primary.main } }}
        >
          <span>카멜을 100% 활용</span>할 수 있게
          <br />
          {accessUser?.userName || '회원'}님에 대해 알려주세요
        </Typography>
        <Typography variant="h4" weight="bold" customStyle={{ padding: '0 20px' }}>
          성별
        </Typography>
        <Flexbox gap={7} customStyle={{ padding: '12px 20px' }}>
          <TextInput
            readOnly
            variant="outlined"
            borderWidth={2}
            defaultValue="남성"
            isSelected={genderValue === 'M'}
            onClick={handleClickGender('M')}
            inputStyle={{ textAlign: 'center', width: '100%' }}
          />
          <TextInput
            readOnly
            variant="outlined"
            borderWidth={2}
            defaultValue="여성"
            isSelected={genderValue === 'F'}
            onClick={handleClickGender('F')}
            inputStyle={{ textAlign: 'center', width: '100%' }}
          />
        </Flexbox>
        <Typography variant="h4" weight="bold" customStyle={{ padding: '0 20px', marginTop: 32 }}>
          출생연도
        </Typography>
        <Box customStyle={{ padding: '12px 20px 12px' }}>
          <TextInput
            ref={yearOfBirthRef}
            autoFocus={gender.length > 0 && yearOfBirth.length === 0}
            inputMode="numeric"
            variant="outlined"
            borderWidth={2}
            endAdornment="년"
            value={yearOfBirthValue}
            onChange={(e) =>
              setYearOfBirthValue(e.currentTarget.value.replace(/[^0-9]/g, '').substring(0, 4))
            }
            onBlur={handleBlur}
            inputStyle={{ textAlign: 'center', width: '100%', fontWeight: 500 }}
          />
          {!isLoadingAccessUser &&
            !isLoadingUserInfo &&
            !isLoadingMutateUserGenderAndAge &&
            isShowYearOfBirthError &&
            yearOfBirthValue.length > 0 && (
              <Typography
                variant="body2"
                weight="medium"
                customStyle={{ marginTop: 8, color: secondary.red.main }}
              >
                올바른 출생연도를 입력해주세요.
              </Typography>
            )}
        </Box>
      </Box>
      <OnboardingBottomCTA
        onClick={handleClickNext}
        disabled={
          isLoadingAccessUser ||
          isLoadingUserInfo ||
          !(genderValue === 'M' || genderValue === 'F') ||
          isShowYearOfBirthError ||
          isLoadingMutateUserGenderAndAge
        }
      >
        다음
      </OnboardingBottomCTA>
    </>
  );
}

export default OnboardingGenderAndYearOfBirth;
