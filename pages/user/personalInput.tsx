import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import GenderYearInput from '@components/UI/organisms/GenderYearInput';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { AccessUser } from '@dto/userAuth';
import type { Gender } from '@dto/user';

import updateAccessUserOnBraze from '@library/updateAccessUserOnBraze';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postUserAgeAndGender } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function PersonalInput() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();
  const { userNickName } = useQueryMyUserInfo();
  const { data: userInfo } = useQueryUserInfo();
  const { isLoading, mutate } = useMutation(postUserAgeAndGender, {
    onSuccess: () => {
      router.back();
    }
  });
  const [genderValue, setGenderValue] = useState<Gender | null>('M');
  const [yearOfBirthValue, setYearOfBirthValue] = useState('');

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
      gender: genderValue === 'F' ? 'FEMALE' : 'MALE',
      yearOfBirth: yearOfBirthValue
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.users.myUserInfo(),
      refetchType: 'inactive'
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
      name: attrProperty.name.INFO,
      title: attrProperty.title.gender,
      att: selectedGender === 'F' ? 'FEMALE' : 'MALE'
    });
    if (genderValue === selectedGender) {
      setGenderValue(null);
    } else {
      setGenderValue(selectedGender);
    }
  };

  const handleChangeYear = debounce((value: string) => {
    logEvent(attrKeys.userInput.SELECT_ITEM, {
      name: attrProperty.name.INFO,
      title: attrProperty.title.AGE,
      att: value
    });
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
          <Typography variant="h2" weight="bold" customStyle={{ marginBottom: 8 }}>
            {userNickName}님에 대해 알려주세요.
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

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default PersonalInput;
