import { useEffect, useRef, useState } from 'react';

import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, CtaButton, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { Header, TextInput } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { Gender } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserAgeAndGender } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function PersonalInput() {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const { data: accessUser } = useQueryAccessUser();
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { isLoading, mutate } = useMutation(postUserAgeAndGender, {
    onSuccess: () => {
      router.back();
    }
  });
  const [genderValue, setGenderValue] = useState<Gender>('N');
  const [yearOfBirthValue, setYearOfBirthValue] = useState('');
  const yearOfBirthRef = useRef<HTMLInputElement>(null);
  const isShowYearOfBirthError =
    Number(yearOfBirthValue || 0) < 1900 ||
    Number(yearOfBirthValue || 0) > Number(dayjs().format('YYYY'));

  const handleClickGender = (selectedGender: Gender) => () => {
    setGenderValue(selectedGender);
    if (yearOfBirthValue.length === 0 && yearOfBirthRef.current) {
      yearOfBirthRef.current.focus();
    }

    logEvent(attrKeys.userInput.SELECT_ITEM, {
      name: 'INFO',
      title: 'GENDER',
      att: selectedGender === 'M' ? 'MALE' : 'FEMALE'
    });
  };

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, { name: 'INFO' });
  }, []);

  useEffect(() => {
    if (userInfo) {
      setYearOfBirthValue(
        String(
          userInfo.info.value.yearOfBirth
            ? userInfo.info.value.yearOfBirth
            : new Date().getFullYear() - Number(userInfo.info.value.age || 0) + 1
        )
      );
      setGenderValue(userInfo.info.value.gender);
    }
  }, [userInfo]);

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} />}
      footer={
        <Footer>
          <CtaButton
            fullWidth
            variant="contained"
            size="large"
            disabled={
              isLoading || !(genderValue === 'M' || genderValue === 'F') || isShowYearOfBirthError
            }
            brandColor="primary"
            onClick={() => {
              logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
                name: 'INFO',
                gender: genderValue === 'M' ? 'MALE' : 'FEMALE',
                yearOfBirth: yearOfBirthValue
              });

              mutate({ birthday: Number(yearOfBirthValue), gender: genderValue });
            }}
          >
            저장
          </CtaButton>
        </Footer>
      }
    >
      <Box component="section" customStyle={{ marginTop: 20 }}>
        <Flexbox direction="vertical" gap={8} customStyle={{ textAlign: 'center' }}>
          <Typography variant="h3" weight="bold" brandColor="black">
            {accessUser?.userName}님에 대해 알려주세요.
          </Typography>
          <Typography weight="medium">딱 맞는 매물을 저희가 추천해드릴게요.</Typography>
        </Flexbox>
        <Flexbox
          justifyContent="center"
          direction="vertical"
          gap={32}
          customStyle={{ marginTop: 52 }}
        >
          <Flexbox direction="vertical" gap={12}>
            <Typography variant="h4" weight="bold">
              성별
            </Typography>
            <Flexbox gap={7}>
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
          </Flexbox>
          <Flexbox direction="vertical" gap={12}>
            <Typography variant="h4" weight="bold">
              출생연도
            </Typography>
            <Box customStyle={{ position: 'relative' }}>
              <TextInput
                ref={yearOfBirthRef}
                inputMode="numeric"
                variant="outlined"
                borderWidth={2}
                endAdornment="년"
                value={yearOfBirthValue}
                onClick={() =>
                  logEvent(attrKeys.userInput.SELECT_ITEM, { name: 'INFO', title: 'AGE' })
                }
                onChange={(e) =>
                  setYearOfBirthValue(e.currentTarget.value.replace(/[^0-9]/g, '').substring(0, 4))
                }
                inputStyle={{ textAlign: 'center', width: '100%', fontWeight: 500 }}
              />
              {!isLoading && isShowYearOfBirthError && yearOfBirthValue.length > 0 && (
                <Typography
                  variant="body2"
                  weight="medium"
                  customStyle={{ marginTop: 8, color: palette.secondary.red.main }}
                >
                  올바른 출생연도를 입력해주세요.
                </Typography>
              )}
            </Box>
          </Flexbox>
        </Flexbox>
      </Box>
    </GeneralTemplate>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px 20px 24px;
  background-color: white;
`;

export default PersonalInput;
