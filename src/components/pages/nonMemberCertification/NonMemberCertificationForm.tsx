import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { Flexbox, Input, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { postRequest } from '@api/userAuth';

import validator from '@utils/common/validator';

import {
  nonMemberCertificationFeedbackDialogState,
  nonMemberCertificationFormState,
  nonMemberCertificationReSendState
} from '@recoil/nonMemberCertification/atom';
import { inputFocusState } from '@recoil/common';

interface NonMemberCertificationFormProps {
  authNumberInputRef: RefObject<HTMLInputElement>;
}

function NonMemberCertificationForm({ authNumberInputRef }: NonMemberCertificationFormProps) {
  const {
    palette: { common }
  } = useTheme();

  const [{ step, phoneNumber, authNumber }, setNonMemberCertificationFormState] = useRecoilState(
    nonMemberCertificationFormState
  );
  const [{ time, date }, setNonMemberCertificationReSendState] = useRecoilState(
    nonMemberCertificationReSendState
  );
  const resetNonMemberCertificationReSendState = useResetRecoilState(
    nonMemberCertificationReSendState
  );
  const setNonMemberCertificationFeedbackDialogState = useSetRecoilState(
    nonMemberCertificationFeedbackDialogState
  );
  const setInputFocusState = useSetRecoilState(inputFocusState);

  const [reSendPossibleTime, setReSendPossibleTime] = useState(10);

  const reSendIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const reSendPossibleIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const { mutate } = useMutation(postRequest);

  const handleFocus = () => setInputFocusState((prevState) => !prevState);

  const handleClickReSend = () => {
    if (reSendPossibleTime) return;

    if (!validator.phoneNumber(phoneNumber)) {
      setNonMemberCertificationFeedbackDialogState({
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

    resetNonMemberCertificationReSendState();
    setReSendPossibleTime(10);
    clearInterval(reSendIntervalRef.current);
    reSendIntervalRef.current = undefined;
    reSendPossibleIntervalRef.current = undefined;

    mutate(phoneNumber, {
      onSuccess({ userId: newUserId }) {
        setNonMemberCertificationFormState((prevState) => ({
          ...prevState,
          userId: newUserId
        }));
      },
      onError() {
        setNonMemberCertificationFeedbackDialogState({
          open: true,
          title: '인증번호 전송에 실패했어요.<br/>다시 시도해주세요.',
          description: ''
        });
      }
    });
  };

  useEffect(() => {
    if (step === 1) {
      if (reSendIntervalRef.current) {
        return;
      }

      reSendIntervalRef.current = setInterval(() => {
        setNonMemberCertificationReSendState((prevState) => {
          const newReSendTime = prevState.time - 1;

          if (!newReSendTime) {
            clearInterval(reSendIntervalRef.current);
          }

          return {
            ...prevState,
            time: newReSendTime
          };
        });
      }, 1000);
    }
  }, [setNonMemberCertificationReSendState, step, time]);

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
  }, [step, reSendPossibleTime]);

  useEffect(() => {
    const newMinute = parseInt(String(time / 60), 10);
    const newSecond = String(time % 60).length === 2 ? time % 60 : `0${time % 60}`;
    setNonMemberCertificationReSendState((prevState) => ({
      ...prevState,
      date: `${newMinute}:${newSecond}`
    }));
  }, [setNonMemberCertificationReSendState, time]);

  useEffect(() => {
    return () => {
      if (reSendIntervalRef.current) {
        clearInterval(reSendIntervalRef.current);
      }
    };
  }, []);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={32}
      customStyle={{
        margin: '32px 0 20px'
      }}
    >
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          maxHeight: step !== 1 ? 72 : undefined
        }}
      >
        <Typography weight="medium" color="ui60">
          휴대전화번호
        </Typography>
        <Input
          autoFocus
          fullWidth
          inputMode="numeric"
          pattern="[0-9]*"
          size="large"
          placeholder="010-0000-0000"
          onFocus={handleFocus}
          onBlur={handleFocus}
          onChange={(e) =>
            setNonMemberCertificationFormState((prevState) => ({
              ...prevState,
              phoneNumber: e.currentTarget.value.replace(/[^0-9-]/g, '')
            }))
          }
          value={phoneNumber}
          customStyle={{
            zIndex: 1
          }}
        />
        <Input
          ref={authNumberInputRef}
          fullWidth
          autoFocus={!!phoneNumber}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          size="large"
          unit={date}
          placeholder="인증번호 입력"
          autoComplete="one-time-code"
          onFocus={handleFocus}
          onBlur={handleFocus}
          onChange={(e) =>
            setNonMemberCertificationFormState((prevState) => ({
              ...prevState,
              authNumber: e.currentTarget.value
            }))
          }
          value={authNumber}
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
    </Flexbox>
  );
}

export default NonMemberCertificationForm;
