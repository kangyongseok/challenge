import { useEffect, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import {
  BottomSheet,
  Button,
  Flexbox,
  Icon,
  Image,
  Input,
  ThemeProvider,
  Typography
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';

import { deviceIdState } from '@recoil/common';

function ButlerIntroWatch() {
  const router = useRouter();

  const deviceId = useRecoilValue(deviceIdState);

  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { mutate, isLoading } = useMutation(postSurvey);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.name === 'name') {
      setName(e.currentTarget.value);
    } else {
      setPhoneNumber(e.currentTarget.value.replace(/[^0-9]/g, ''));
    }
  };

  const handleClickClear = (e: MouseEvent<HTMLOrSVGElement>) => {
    if (e.currentTarget.dataset.name === 'name') {
      setName('');
    } else {
      setPhoneNumber('');
    }
  };

  const handleClick = () => {
    logEvent('SUBMIT_EVENT_DETAIL', {
      name: 'EVENT_DETAIL',
      title: '2304_CAMEL_BUTLER',
      username: name,
      phone: phoneNumber
    });

    mutate(
      {
        deviceId,
        answer: 0,
        options: `${name}|${phoneNumber}`,
        surveyId: 6
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setPhoneNumber('');
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

  useEffect(() => {
    logEvent('VIEW_EVENT_DETAIL', {
      name: 'EVENT_DETAIL',
      title: '2304_CAMEL_BUTLER',
      att: 'INTRO',
      source: SessionStorage.get(sessionStorageKeys.butlerSource) || 'PUSH'
    });
  }, []);

  useEffect(() => {
    if (open) {
      logEvent('VIEW_EVENT_DETAIL', {
        name: 'EVENT_DETAIL',
        title: '2304_CAMEL_BUTLER',
        att: 'SUBMIT',
        source: SessionStorage.get(sessionStorageKeys.butlerSource) || 'PUSH'
      });
    }
  }, [open]);

  return (
    <>
      <Wrap direction="vertical" alignment="center" justifyContent="center" gap={10}>
        <CloseButton
          name="CloseOutlined"
          onClick={() => {
            router.back();
          }}
        />
        <Typography weight="bold" variant="h2" color="white">
          사고싶은 시계,
          <br />
          찾기 어려우신가요?
        </Typography>
        <Typography color="ui60" variant="h4">
          신청해주시면 대신 찾아서
          <br />
          안전하게 구매까지 도와드릴께요.
        </Typography>
        <Image
          disableAspectRatio
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_watch_intro.png`}
          alt="카멜이 조건에 딱 맞는 매물을 공유하려 합니다."
          round={10}
          onClick={() => {
            logEvent('CLICK_EVENT_DETAIL', {
              name: 'EVENT_DETAIL',
              title: '2304_CAMEL_BUTLER'
            });
            setOpen(true);
          }}
          customStyle={{ marginTop: 32 }}
        />
        <Typography
          color="ui98"
          weight="medium"
          variant="h4"
          customStyle={{ textDecoration: 'underline', marginTop: 20 }}
          onClick={() => {
            SessionStorage.set(sessionStorageKeys.butlerSource, 'EVENT_DETAIL');
            router.push('/events/butlerWatch');
          }}
        >
          자세히보기
        </Typography>
      </Wrap>
      <ThemeProvider theme="dark">
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          disableSwipeable
          customStyle={{
            padding: '32px 20px 20px'
          }}
        >
          <Typography variant="h2" weight="bold">
            Camel Butler 신청하기
          </Typography>
          <Flexbox
            direction="vertical"
            gap={12}
            customStyle={{
              marginTop: 32
            }}
          >
            <Typography color="ui80" weight="bold">
              신청자 성함
            </Typography>
            <Input
              fullWidth
              name="name"
              size="xlarge"
              onChange={handleChange}
              value={name}
              endAdornment={
                name ? (
                  <Icon
                    name="DeleteCircleFilled"
                    color="ui80"
                    data-name="name"
                    onClick={handleClickClear}
                  />
                ) : undefined
              }
              placeholder="이름을 입력해주세요"
            />
          </Flexbox>
          <Flexbox
            direction="vertical"
            gap={12}
            customStyle={{
              marginTop: 32
            }}
          >
            <Typography color="ui80" weight="bold">
              신청자 핸드폰번호
            </Typography>
            <Input
              fullWidth
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              name="phoneNumber"
              size="xlarge"
              onChange={handleChange}
              value={phoneNumber}
              endAdornment={
                phoneNumber ? (
                  <Icon
                    name="DeleteCircleFilled"
                    color="ui80"
                    data-name="phoneNumber"
                    onClick={handleClickClear}
                  />
                ) : undefined
              }
              placeholder="핸드폰번호를 입력해주세요"
            />
          </Flexbox>
          <Button
            fullWidth
            variant="solid"
            brandColor="primary"
            size="xlarge"
            onClick={handleClick}
            disabled={!name || !phoneNumber || isLoading}
            customStyle={{
              marginTop: 52
            }}
          >
            신청하기
          </Button>
        </BottomSheet>
      </ThemeProvider>
    </>
  );
}

const Wrap = styled(Flexbox)`
  background: #111214;
  position: relative;
  padding: 84px 32px 50px 32px;
  min-height: 100vh;
  text-align: center;
`;

const CloseButton = styled(Icon)`
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  z-index: 1;
`;

export default ButlerIntroWatch;
