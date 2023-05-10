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

import { PageHead } from '@components/UI/atoms';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postSurvey } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';

import { getImageResizePath } from '@utils/common';

import { deviceIdState } from '@recoil/common';

function ButlerWatch() {
  const router = useRouter();
  const { result } = router.query;

  const { mutate, isLoading } = useMutation(postSurvey);

  const deviceId = useRecoilValue(deviceIdState);

  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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
      att: 'LANDING',
      source: SessionStorage.get(sessionStorageKeys.butlerSource) || 'PUSH'
    });
  }, [result]);

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
      <PageHead
        title="원하는 명품을 카멜이 대신 찾아드립니다 | Camel Butler"
        description="Camel Butler 서비스는, 원하는 모델과 예산을 알려주시면 카멜이 대신 사서 대신 검수 후 보내드리는 서비스 입니다"
        ogTitle="원하는 명품을 카멜이 대신 찾아드립니다 | Camel Butler"
        ogDescription="Camel Butler 서비스는, 원하는 모델과 예산을 알려주시면 카멜이 대신 사서 대신 검수 후 보내드리는 서비스 입니다"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_img01.png`}
      />
      <Flexbox
        direction="vertical"
        alignment="center"
        justifyContent="center"
        gap={120}
        customStyle={{
          background: '#111214',
          position: 'relative',
          paddingBottom: 150,
          minHeight: '100vh'
        }}
      >
        <CloseButton name="CloseOutlined" onClick={() => router.back()} />
        <ButlerLogo
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_logo.png`}
          alt="Camel Butler Logo"
          disableAspectRatio
          height={18}
        />
        {result ? (
          <Image
            src={getImageResizePath({
              imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/new_butler_img04.png`,
              h: 300
            })}
            alt="Thank you for applying"
            disableAspectRatio
            width="100%"
            customStyle={{ flex: 1 }}
          />
        ) : (
          <>
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_watch_img01.png`,
                h: 919
              })}
              alt="Camel Butler"
              disableAspectRatio
              disableSkeleton
              disableSkeletonAnimation
              width="100%"
            />
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_watch_img02.png`,
                h: 512
              })}
              alt="what is Butler?"
              disableAspectRatio
              disableSkeleton
              disableSkeletonAnimation
              width="100%"
            />
            <Image
              src={getImageResizePath({
                imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/events/butler_watch_img03.png`,
                h: 798
              })}
              alt="No fees!"
              disableAspectRatio
              disableSkeleton
              disableSkeletonAnimation
              width="100%"
            />
          </>
        )}
        <SubmiTbuttonWrap alignment="center" justifyContent="center">
          <Button
            fullWidth
            size="xlarge"
            customStyle={{ background: '#3D57FF' }}
            variant="solid"
            onClick={() => {
              if (result) {
                router.replace('/');
              } else {
                logEvent('CLICK_EVENT_DETAIL', {
                  name: 'EVENT_DETAIL',
                  title: '2304_CAMEL_BUTLER'
                });
                setOpen(true);
              }
            }}
          >
            {result ? '확인' : '버틀러 신청하기'}
          </Button>
        </SubmiTbuttonWrap>
      </Flexbox>
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

const ButlerLogo = styled(Image)`
  position: fixed;
  top: 25px;
  left: 50%;
  margin-left: -75px;
  z-index: 1;
`;

const CloseButton = styled(Icon)`
  position: fixed;
  top: 20px;
  left: 20px;
  color: white;
  z-index: 1;
`;

const SubmiTbuttonWrap = styled(Flexbox)`
  padding: 0 20px 40px 20px;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  background: #111214;
`;

export default ButlerWatch;
