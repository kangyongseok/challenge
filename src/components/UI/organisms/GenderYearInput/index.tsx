import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';

import type { Gender } from '@dto/user';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { SpinnerPicker } from '@utils/onboarding';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { CenterContents, DatePicker, GenderSelect } from './GenderYearInput.styles';

const BASE_URL = `https://${process.env.IMAGE_DOMAIN}/assets/images/onboarding`;

function GenderYearInput({
  onClickGender,
  onChangeYear,
  genderValue = 'M',
  themeType
}: {
  onClickGender: (e: MouseEvent<HTMLDivElement>) => void;
  onChangeYear: (value: string) => void;
  genderValue: Gender | null;
  themeType?: 'normal';
}) {
  const textRef = useRef(null);
  const { data: userInfo, isSuccess } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { data: accessUser, refetch } = useQueryAccessUser();
  // const [yearOfBirthValue, setYearOfBirthValue] = useState('');
  const [smallHeight, setSmallHeight] = useState(false);
  const {
    theme: { palette }
  } = useTheme();

  useEffect(() => {
    setSmallHeight(window.innerHeight <= 560);
  }, [refetch]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (isSuccess && accessUser?.birthday) {
      // eslint-disable-next-line no-new
      new SpinnerPicker(
        textRef.current,
        // eslint-disable-next-line func-names, @typescript-eslint/no-explicit-any
        (index: number): any => {
          if (index < 0 || index > 74) {
            return null;
          }
          return currentYear - index;
        },
        {
          index: currentYear - Number(userInfo.info.value.yearOfBirth),
          font_color: palette.common.ui60,
          selection_color: themeType === 'normal' ? palette.common.ui20 : '#ffffff'
        },
        // eslint-disable-next-line func-names
        onChangeYear
      );
    }

    if (isSuccess && !accessUser?.birthday) {
      // eslint-disable-next-line no-new
      new SpinnerPicker(
        textRef.current,
        // eslint-disable-next-line func-names, @typescript-eslint/no-explicit-any
        (index: number): any => {
          if (index < 0 || index > 74) {
            return null;
          }
          return currentYear - index;
        },
        {
          index: 19,
          font_color: palette.common.ui60,
          selection_color: themeType === 'normal' ? palette.common.ui20 : '#ffffff'
        },
        // eslint-disable-next-line func-names
        onChangeYear
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeType, isSuccess]);

  return (
    <CenterContents>
      <Flexbox justifyContent="center" alignment="center">
        <GenderSelect
          justifyContent="center"
          alignment="center"
          direction="vertical"
          data-gender="M"
          onClick={onClickGender}
          isGender={genderValue === 'M'}
        >
          <Image
            disableAspectRatio
            src={`${BASE_URL}/male_face.png`}
            alt="Male Face Img"
            width={32}
          />
          <Typography
            variant="h3"
            weight="medium"
            customStyle={{
              color: genderValue === 'M' ? palette.common.uiWhite : palette.common.ui20,
              marginTop: 4
            }}
          >
            남성
          </Typography>
        </GenderSelect>
        <GenderSelect
          justifyContent="center"
          alignment="center"
          direction="vertical"
          data-gender="F"
          onClick={onClickGender}
          isGender={genderValue === 'F'}
        >
          <Image
            disableAspectRatio
            src={`${BASE_URL}/female_face.png`}
            alt="Female Face Img"
            width={32}
          />
          <Typography
            variant="h3"
            weight="medium"
            customStyle={{
              color: genderValue === 'F' ? palette.common.uiWhite : palette.common.ui20,
              marginTop: 4
            }}
          >
            여성
          </Typography>
        </GenderSelect>
      </Flexbox>
      <DatePicker
        smallHeight={smallHeight}
        url={`${BASE_URL}/bg_datepicker_${themeType === 'normal' ? 'light' : 'dark'}${
          smallHeight ? '_small' : ''
        }.png`}
      >
        <canvas
          style={{
            width: '100%',
            height: smallHeight ? 120 : 150,
            background: 'transparent'
          }}
          ref={textRef}
        />
      </DatePicker>
    </CenterContents>
  );
}

export default GenderYearInput;
