import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Box, Button, Input, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { fetchSurvey, postSurvey } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { deviceIdState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function EventRegisterDialog({ open, close }: { open: boolean; close: () => void }) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const [phoneNumber, setPhoneNumber] = useState('');
  const { data: accessUser } = useQueryAccessUser();
  const { mutate } = useMutation(postSurvey);
  const deviceId = useRecoilValue(deviceIdState);
  const { data } = useQuery(queryKeys.client.survey(), fetchSurvey, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  useEffect(() => {
    if (accessUser?.phone) {
      setPhoneNumber(accessUser?.phone);
    }
  }, [accessUser?.phone]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleClickRegister = () => {
    if (data) {
      toastStack({
        children: '이미 참여 하셨습니다.'
      });
    } else {
      mutate(
        {
          deviceId,
          answer: 0,
          options: phoneNumber,
          surveyId: 4
        },
        {
          onSuccess: () => {
            close();
            setPhoneNumber('');
            router.replace('/camelSeller/registerConfirm?event=true');
          }
        }
      );
    }
  };

  const handleMobileNumber = (e: ChangeEvent<HTMLInputElement>) => {
    const inputPrice = e.target.value.replace(/[^0-9]*/g, '');
    if (String(inputPrice).length > 11) return;
    setPhoneNumber(inputPrice);
  };

  return (
    <Dialog open={open}>
      <Typography variant="h3" weight="bold" textAlign="center">
        판매하기 이벤트 참여
      </Typography>
      <Typography variant="h4" textAlign="center" customStyle={{ marginTop: 8 }}>
        내 명품을 판매등록하면 추첨을 통해
      </Typography>
      <Typography variant="h4" textAlign="center">
        선물을 드려요!
      </Typography>
      <form style={{ marginTop: 32 }} onSubmit={handleSubmit}>
        <Typography weight="medium" color="ui60">
          경품 받을 핸드폰번호
        </Typography>
        <Input
          fullWidth
          size="xlarge"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="경품을 받을 연락처를 입력해주세요."
          customStyle={{ marginTop: 8 }}
          onChange={handleMobileNumber}
          value={phoneNumber}
        />
        <Box customStyle={{ background: common.bg02, borderRadius: 8, padding: 12, marginTop: 8 }}>
          <Typography color="ui60" customStyle={{ fontSize: 12 }}>
            수집된 연락처는 경품 지급 용도로 사용되며, 경품 발송 후 파기 됩니다.
          </Typography>
        </Box>
        <Button
          fullWidth
          size="xlarge"
          variant="solid"
          brandColor="blue"
          customStyle={{ marginTop: 32 }}
          onClick={handleClickRegister}
          disabled={!(String(phoneNumber).length >= 10)}
        >
          이벤트 참여하기
        </Button>
      </form>
      <Button
        fullWidth
        size="xlarge"
        variant="ghost"
        customStyle={{ marginTop: 8 }}
        onClick={() => {
          setPhoneNumber('');
          close();
          router.replace('/camelSeller/registerConfirm');
        }}
      >
        다음에하기
      </Button>
    </Dialog>
  );
}

export default EventRegisterDialog;
