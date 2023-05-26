import { useEffect, useState } from 'react';
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

import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import { IOS_SAFE_AREA_TOP } from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { deviceIdState } from '@recoil/common';

function ButlerDemo05() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    setInnerHeight(document.body.clientHeight);
  }, []);

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
    <Box
      customStyle={{
        marginTop: `calc(30px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'})`
      }}
    >
      <ThemeProvider theme="dark">
        <Flexbox
          gap={innerHeight < 700 ? 20 : 32}
          customStyle={{ padding: '0 20px' }}
          direction="vertical"
        >
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
      </ThemeProvider>
    </Box>
  );
}

export default ButlerDemo05;
