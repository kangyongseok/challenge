import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { BottomSheet, Box, Button, Flexbox, Input, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { NonMemberAuthFeedbackDialog } from '@components/UI/organisms';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';
import { logEvent } from '@library/amplitude';

import { postAuthorize, postRequest } from '@api/userAuth';
import { postToken } from '@api/nextJs';

import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import validator from '@utils/common/validator';

import { productOpenNonMemberPaymentBottomSheetState } from '@recoil/product';
import useSignOut from '@hooks/useSignOut';

function ProductNonMemberPaymentBottomSheet() {
  const router = useRouter();
  const { id } = router.query;

  const {
    palette: { common }
  } = useTheme();

  const [open, setOpen] = useRecoilState(productOpenNonMemberPaymentBottomSheetState);
  const resetOpen = useResetRecoilState(productOpenNonMemberPaymentBottomSheetState);

  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [reSendTime, setReSendTime] = useState(180);
  const [reSendDate, setReSendDate] = useState('3:00');
  const [reSendPossibleTime, setReSendPossibleTime] = useState(10);
  const [{ open: openDialog, title, description }, setOpenDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: '',
    description: ''
  });

  const reSendIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const reSendPossibleIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const authNumberInputRef = useRef<HTMLInputElement>(null);

  const signOut = useSignOut();

  const { mutate, isLoading } = useMutation(postRequest);
  const { mutate: mutateAuthorize, isLoading: isLoadingAuthorize } = useMutation(postAuthorize);

  const handleClick = () => {
    if (!validator.phoneNumber(phoneNumber)) {
      setOpenDialog({
        open: true,
        title: '인증받을 수 있는<br/>휴대전화번호를 입력해주세요.',
        description: ''
      });
      return;
    }

    if (authNumberInputRef.current) {
      const inputElements = authNumberInputRef.current.getElementsByTagName('input');
      if (inputElements[0]) {
        inputElements[0].focus();
      }
    }

    mutate(phoneNumber, {
      onSuccess({ userId: newUserId }) {
        setStep(1);
        setUserId(newUserId);
      },
      onError() {
        setOpenDialog({
          open: true,
          title: '인증번호 전송에 실패했어요.<br/>다시 시도해주세요.',
          description: ''
        });
      }
    });
  };

  const handleClickReSend = () => {
    if (reSendPossibleTime) return;

    if (!validator.phoneNumber(phoneNumber)) {
      setOpenDialog({
        open: true,
        title: '인증받을 수 있는<br/>휴대전화번호를 입력해주세요.',
        description: ''
      });
      return;
    }

    if (authNumberInputRef.current) {
      const inputElements = authNumberInputRef.current.getElementsByTagName('input');
      if (inputElements[0]) {
        inputElements[0].focus();
      }
    }

    setReSendTime(180);
    setReSendDate('3:00');
    setReSendPossibleTime(10);

    clearInterval(reSendIntervalRef.current);
    reSendIntervalRef.current = undefined;
    reSendPossibleIntervalRef.current = undefined;

    mutate(phoneNumber, {
      onSuccess({ userId: newUserId }) {
        setUserId(newUserId);
      },
      onError() {
        setOpenDialog({
          open: true,
          title: '인증번호 전송에 실패했어요.<br/>다시 시도해주세요.',
          description: ''
        });
      }
    });
  };

  const handleClickConfirm = () => {
    logEvent(attrKeys.products.SUBMIT_CHECK_NUMBER, {
      title: attrProperty.title.PAYMENT
    });

    mutateAuthorize(
      {
        userId,
        authNumber
      },
      {
        async onSuccess({ jwtToken, accessUser }) {
          await signOut();
          await postToken(jwtToken, accessUser);

          LocalStorage.set(ACCESS_USER, accessUser);
          LocalStorage.set(ACCESS_TOKEN, jwtToken);
          Axios.setAccessToken(jwtToken);

          await router.replace(`/products/${id}/order`);
        },
        onError(data) {
          const { response } = (data as AxiosError) || {};
          if (response?.status === 401) {
            setOpenDialog({
              open: true,
              title: '인증에 실패했어요.',
              description: '인증번호가 올바르지 않거나 시간이 초과되었어요.<br/>다시 시도해주세요.'
            });
          } else {
            setOpenDialog({
              open: true,
              title: '인증에 실패했어요.',
              description: '올바른 인증번호를 입력해주세요.'
            });
          }
        }
      }
    );
  };

  useEffect(() => {
    if (step === 1) {
      if (reSendIntervalRef.current) {
        return;
      }

      reSendIntervalRef.current = setInterval(() => {
        setReSendTime((prevState) => {
          const newReSendTime = prevState - 1;

          if (!newReSendTime) {
            clearInterval(reSendIntervalRef.current);
          }

          return newReSendTime;
        });
      }, 1000);
    }
  }, [step, reSendTime, open]);

  useEffect(() => {
    if (step === 1) {
      if (reSendPossibleIntervalRef.current) {
        return;
      }

      reSendPossibleIntervalRef.current = setInterval(() => {
        setReSendPossibleTime((prevState) => {
          const newReSendPossibleTime = prevState - 1;

          if (!newReSendPossibleTime) {
            clearInterval(reSendPossibleIntervalRef.current);
          }

          return newReSendPossibleTime;
        });
      }, 1000);
    }
  }, [step, reSendPossibleTime, open]);

  useEffect(() => {
    const newMinute = parseInt(String(reSendTime / 60), 10);
    const newSecond =
      String(reSendTime % 60).length === 2 ? reSendTime % 60 : `0${reSendTime % 60}`;
    setReSendDate(`${newMinute}:${newSecond}`);
  }, [reSendTime]);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.mypage.VIEW_CHECK_NUMBER, {
        title: attrProperty.title.PAYMENT
      });
    }
  }, [open]);

  useEffect(() => {
    return () => {
      resetOpen();
      if (reSendIntervalRef.current) {
        clearInterval(reSendIntervalRef.current);
      }
    };
  }, [resetOpen]);

  return (
    <>
      <BottomSheet open={open} onClose={() => setOpen(false)} disableSwipeable>
        <Box
          customStyle={{
            padding: '32px 20px'
          }}
        >
          <Typography variant="h2" weight="bold">
            비회원으로 결제하기
          </Typography>
          <Typography
            color="ui60"
            customStyle={{
              marginTop: 4
            }}
          >
            연락처를 인증해주세요.
            <br />
            주문내역을 카카오 알림톡으로 보내드려요.
          </Typography>
          <Flexbox
            direction="vertical"
            gap={8}
            customStyle={{
              marginTop: 32,
              maxHeight: step !== 1 ? 72 : undefined
            }}
          >
            <Typography weight="medium" color="ui60">
              휴대전화번호
            </Typography>
            <Input
              fullWidth
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              size="large"
              placeholder="010-0000-0000"
              onChange={(e) => setPhoneNumber(e.currentTarget.value.replace(/[^0-9-]/g, ''))}
              value={phoneNumber}
              customStyle={{
                zIndex: 1
              }}
            />
            <Input
              ref={authNumberInputRef}
              fullWidth
              autoFocus={!!phoneNumber && step === 1}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              size="large"
              unit={reSendDate}
              onChange={(e) => setAuthNumber(e.currentTarget.value)}
              value={authNumber}
              placeholder="인증번호 입력"
              customStyle={{
                transform: `translateY(-${step !== 1 ? 52 : 0}px)`,
                transition: 'transform 0.2s',
                zIndex: step !== 1 ? -1 : undefined,
                '& > span': {
                  color: common.ui60
                }
              }}
            />
            <Flexbox
              alignment="center"
              justifyContent="space-between"
              customStyle={{
                transform: `translateY(-${step !== 1 ? 80 : 0}px)`,
                transition: 'transform 0.2s'
              }}
            >
              <Typography variant="body2" color="ui60">
                인증번호를 받지 못했나요?
              </Typography>
              <Typography
                variant="body2"
                color={!reSendPossibleTime ? 'primary-light' : 'ui80'}
                onClick={handleClickReSend}
                customStyle={{
                  textDecoration: 'underline',
                  cursor: !reSendPossibleTime ? 'pointer' : 'default'
                }}
              >
                인증번호 재전송
              </Typography>
            </Flexbox>
          </Flexbox>
        </Box>
        {step === 0 && (
          <Button
            fullWidth
            variant="solid"
            brandColor="black"
            size="xlarge"
            onClick={handleClick}
            disabled={!validator.phoneNumber(phoneNumber) || isLoading}
            customStyle={{
              borderRadius: 0
            }}
          >
            인증번호 받기
          </Button>
        )}
        {step === 1 && (
          <Button
            fullWidth
            variant="solid"
            brandColor="black"
            size="xlarge"
            onClick={handleClickConfirm}
            disabled={!authNumber || authNumber.length < 6 || isLoadingAuthorize}
            customStyle={{
              borderRadius: 0
            }}
          >
            확인
          </Button>
        )}
      </BottomSheet>
      <NonMemberAuthFeedbackDialog
        open={openDialog}
        onClose={() =>
          setOpenDialog((prevState) => ({
            ...prevState,
            open: false
          }))
        }
        title={title}
        description={description}
      />
    </>
  );
}

export default ProductNonMemberPaymentBottomSheet;
