import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import GenderYearInput from '@components/UI/organisms/GenderYearInput';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { AccessUser } from '@dto/userAuth';
import { Gender } from '@dto/user';

import updateAccessUserOnBraze from '@library/updateAccessUserOnBraze';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserAgeAndGender } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function PersonalInput() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { isLoading, mutate } = useMutation(postUserAgeAndGender, {
    onSuccess: () => {
      router.back();
    }
  });
  const [genderValue, setGenderValue] = useState<Gender | null>(null);
  const [yearOfBirthValue, setYearOfBirthValue] = useState('');
  // const yearOfBirthRef = useRef<HTMLInputElement>(null);
  const isShowYearOfBirthError =
    Number(yearOfBirthValue || 0) < 1900 ||
    Number(yearOfBirthValue || 0) > Number(dayjs().format('YYYY'));

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

  const save = () => {
    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: 'INFO',
      gender: genderValue === 'M' ? 'MALE' : 'FEMALE',
      yearOfBirth: yearOfBirthValue
    });

    updateAccessUserOnBraze({
      ...(accessUser as AccessUser),
      gender: String(genderValue)
    });

    mutate({ birthday: Number(yearOfBirthValue), gender: genderValue });
  };

  const handleclickGender = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    const selectedGender = target.dataset.gender as 'M' | 'F' | null;
    logEvent(attrKeys.userInput.SELECT_ITEM, {
      name: 'INFO',
      title: 'GENDER',
      att: selectedGender === 'M' ? 'MALE' : 'FEMALE'
    });
    if (genderValue === selectedGender) {
      setGenderValue(null);
    } else {
      setGenderValue(selectedGender);
    }
  };

  const handleChangeYear = debounce((value: string) => {
    setYearOfBirthValue(String(value));
  }, 500);

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} />}
      footer={
        <Footer>
          <Button
            fullWidth
            variant="solid"
            size="xlarge"
            disabled={
              isLoading || !(genderValue === 'M' || genderValue === 'F') || isShowYearOfBirthError
            }
            brandColor="primary"
            onClick={save}
          >
            저장
          </Button>
        </Footer>
      }
    >
      <Box component="section" customStyle={{ marginTop: 20 }}>
        <Box customStyle={{ marginBottom: 32, textAlign: 'center' }}>
          <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
            {accessUser?.userName || '회원'}님에 대해 알려주세요.
          </Typography>
          <Typography customStyle={{ color: common.ui60 }}>
            딱 맞는 매물을 저희가 추천해드릴게요.
          </Typography>
        </Box>
        <GenderYearInput
          onClickGender={handleclickGender}
          onChangeYear={handleChangeYear}
          genderValue={genderValue}
          themeType="normal"
        />
        {/* <Flexbox direction="vertical" gap={8} customStyle={{ textAlign: 'center' }}>
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
        </Flexbox> */}
      </Box>
    </GeneralTemplate>
  );
}

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px 20px 24px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export default PersonalInput;
