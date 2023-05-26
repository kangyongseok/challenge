import { useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Flexbox,
  Icon,
  Input,
  ThemeProvider,
  Typography,
  dark
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import { IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { deviceIdState } from '@recoil/common';

function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  const [brands, setBrands] = useState<string[]>([]);

  const deviceId = useRecoilValue(deviceIdState);

  const { mutate } = useMutation(postSurvey);

  const handleClickSelect = (e: MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.dataset.brand as string;
    if (brands.includes(value)) {
      setBrands(brands.filter((v) => v !== value));
    } else {
      setBrands((prev) => [...prev, value]);
    }
  };

  const handleSubmit = () => {
    logEvent('SUBMIT_EVENT_DETAIL', {
      name: 'EVENT_DETAIL',
      title: '2305_CAMEL_BUTLER',
      username: name,
      phone,
      time,
      brands
    });

    mutate(
      {
        deviceId,
        answer: 0,
        options: `${name}|${phone}|${time}|${brands.join(',')}`,
        surveyId: 6
      },
      {
        onSuccess: () => {
          setName('');
          setPhone('');
          setTime('');
          setBrands([]);
          router.push({
            pathname: '/events/butler',
            query: {
              result: true
            }
          });
        }
      }
    );
  };

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate
        hideAppDownloadBanner
        customStyle={{
          paddingTop: 60,
          background: dark.palette.common.bg03,
          height: 'auto',
          paddingBottom: 30
        }}
      >
        <LandingHeader
          alignment="center"
          direction="horizontal"
          borderColor={dark.palette.common.line01}
        >
          <Icon
            name="Logo_45_45"
            height={18}
            // width={62}
            onClick={() => {
              logEvent(attrKeys.myPortfolio.CLICK_LOGO, {
                name: attrProperty.productName.MYPORTFOLIO
              });
              router.replace('/');
            }}
          />
          <Icon
            name="LogoText_96_20"
            height={12}
            width={62}
            customStyle={{ marginLeft: -10, marginRight: 7 }}
            onClick={() => {
              logEvent(attrKeys.myPortfolio.CLICK_LOGO, {
                name: attrProperty.productName.MYPORTFOLIO
              });
              router.replace('/');
            }}
          />
          <ButlerText color="white" />
        </LandingHeader>
        <Flexbox gap={32} customStyle={{ marginTop: 52 }} direction="vertical">
          <Typography weight="bold" variant="h2">
            Camel Butler 신청하기
          </Typography>
          <Box>
            <Typography weight="bold" color="ui80">
              신청자 성함
            </Typography>
            <Input
              fullWidth
              size="xlarge"
              placeholder="이름을 입력해주세요"
              customStyle={{ marginTop: 12 }}
              endAdornment={
                name ? (
                  <Icon name="DeleteCircleFilled" color="ui80" onClick={() => setName('')} />
                ) : undefined
              }
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </Box>
          <Box>
            <Typography weight="bold" color="ui80">
              신청자 핸드폰번호
            </Typography>
            <Input
              fullWidth
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              size="xlarge"
              placeholder="핸드폰번호를 입력해주세요"
              customStyle={{ marginTop: 12 }}
              endAdornment={
                phone ? (
                  <Icon name="DeleteCircleFilled" color="ui80" onClick={() => setPhone('')} />
                ) : undefined
              }
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
            />
          </Box>
          <Box>
            <Typography weight="bold" color="ui80">
              연락가능 시간
            </Typography>
            <Input
              fullWidth
              size="xlarge"
              placeholder="연락가능 시간대를 입력해주세요"
              customStyle={{ marginTop: 12 }}
              endAdornment={
                time ? (
                  <Icon name="DeleteCircleFilled" color="ui80" onClick={() => setTime('')} />
                ) : undefined
              }
              onChange={(e) => setTime(e.target.value)}
              value={time}
            />
          </Box>
          <Box>
            <Typography weight="bold" color="ui80">
              신청 브랜드
            </Typography>
            <Flexbox alignment="center" gap={5} customStyle={{ marginTop: 12 }}>
              <Button
                fullWidth
                size="xlarge"
                variant="outline"
                brandColor={brands.includes('bag') ? 'black' : 'gray'}
                customStyle={{
                  background: 'transparent',
                  color: brands.includes('bag')
                    ? dark.palette.common.uiBlack
                    : dark.palette.common.ui80
                }}
                onClick={handleClickSelect}
                data-brand="bag"
              >
                <Icon
                  name="CheckOutlined"
                  width={13}
                  color={brands.includes('bag') ? 'uiBlack' : 'darkgray'}
                />
                샤넬 가방
              </Button>
              <Button
                fullWidth
                size="xlarge"
                variant="outline"
                brandColor={brands.includes('watch') ? 'black' : 'gray'}
                customStyle={{
                  background: 'transparent',
                  color: brands.includes('watch')
                    ? dark.palette.common.uiBlack
                    : dark.palette.common.ui80
                }}
                onClick={handleClickSelect}
                data-brand="watch"
              >
                <Icon
                  name="CheckOutlined"
                  width={13}
                  color={brands.includes('watch') ? 'uiBlack' : 'darkgray'}
                />
                롤렉스 시계
              </Button>
            </Flexbox>
          </Box>
          <Button
            fullWidth
            size="xlarge"
            variant="solid"
            brandColor="primary"
            disabled={!(name && phone && time && brands.length)}
            onClick={handleSubmit}
          >
            신청하기
          </Button>
        </Flexbox>
      </GeneralTemplate>
    </ThemeProvider>
  );
}

const LandingHeader = styled(Flexbox)<{
  borderColor: string;
}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + 66px);
  padding: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0} 20px 0;
  z-index: 10;
  border-bottom: ${({ borderColor }) => (borderColor ? `1px solid ${borderColor}` : 'none')};
  transition: all 0.3s;
  background: ${dark.palette.common.bg03};
`;

function ButlerText({ color }: { color: 'black' | 'white' }) {
  return (
    <svg width="63" height="12" viewBox="0 0 63 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.53967 5.45905C9.45549 4.97704 10.0339 4.10942 10.0339 2.98474C10.0339 1.23344 8.58787 0.0605469 5.77615 0.0605469H0.28125V11.3074H6.09749C9.05382 11.3074 10.5962 10.1827 10.5962 8.23864C10.5962 6.82474 9.7929 5.86072 8.53967 5.45905ZM5.45481 2.02072C6.72411 2.02072 7.41498 2.45453 7.41498 3.33821C7.41498 4.22189 6.72411 4.67177 5.45481 4.67177H2.86803V2.02072H5.45481ZM5.90469 9.34726H2.86803V6.56767H5.90469C7.25431 6.56767 7.97733 7.01755 7.97733 7.9655C7.97733 8.92951 7.25431 9.34726 5.90469 9.34726Z"
        fill={color}
      />
      <path
        d="M17.0817 11.5002C20.279 11.5002 22.1749 9.6686 22.1749 6.3588V0.0605469H19.6042V6.2624C19.6042 8.39931 18.6884 9.28299 17.0977 9.28299C15.5232 9.28299 14.5913 8.39931 14.5913 6.2624V0.0605469H11.9884V6.3588C11.9884 9.6686 13.8843 11.5002 17.0817 11.5002Z"
        fill={color}
      />
      <path
        d="M26.4064 11.3074H29.0092V2.18139H32.6082V0.0605469H22.8074V2.18139H26.4064V11.3074Z"
        fill={color}
      />
      <path d="M33.5267 11.3074H41.7691V9.18659H36.1295V0.0605469H33.5267V11.3074Z" fill={color} />
      <path
        d="M45.3281 9.21872V6.61587H50.5499V4.59143H45.3281V2.14925H51.2408V0.0605469H42.7414V11.3074H51.4497V9.21872H45.3281Z"
        fill={color}
      />
      <path
        d="M63.0002 11.3074L60.4777 7.69236C61.9398 7.06575 62.7913 5.82859 62.7913 4.14156C62.7913 1.61904 60.9115 0.0605469 57.9069 0.0605469H53.0387V11.3074H55.6415V8.17437H57.9069H58.0355L60.2045 11.3074H63.0002ZM60.1563 4.14156C60.1563 5.36265 59.353 6.10173 57.7623 6.10173H55.6415V2.18139H57.7623C59.353 2.18139 60.1563 2.9044 60.1563 4.14156Z"
        fill={color}
      />
    </svg>
  );
}

export default Register;
