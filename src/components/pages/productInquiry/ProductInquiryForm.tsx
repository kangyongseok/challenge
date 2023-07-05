import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { Flexbox, Input, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import { postRequest } from '@api/userAuth';

import validator from '@utils/common/validator';

import {
  productInquiryFeedbackDialogState,
  productInquiryFormState,
  productInquiryReSendState
} from '@recoil/productInquiry/atom';
import { inputFocusState } from '@recoil/common';

interface ProductInquiryFormProps {
  authNumberInputRef: RefObject<HTMLInputElement>;
}

function ProductInquiryForm({ authNumberInputRef }: ProductInquiryFormProps) {
  const {
    palette: { common }
  } = useTheme();

  const [{ step, content, phoneNumber, authNumber }, setProductInquiryFormState] =
    useRecoilState(productInquiryFormState);
  const [{ time, date }, setProductInquiryReSendState] = useRecoilState(productInquiryReSendState);
  const resetProductInquiryReSendState = useResetRecoilState(productInquiryReSendState);
  const setProductInquiryFeedbackDialogState = useSetRecoilState(productInquiryFeedbackDialogState);
  const setInputFocusState = useSetRecoilState(inputFocusState);

  const [reSendPossibleTime, setReSendPossibleTime] = useState(10);

  const reSendIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const reSendPossibleIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const { mutate } = useMutation(postRequest);

  const handleFocus = () => setInputFocusState((prevState) => !prevState);

  const handleClickReSend = () => {
    if (reSendPossibleTime) return;

    if (!validator.phoneNumber(phoneNumber)) {
      setProductInquiryFeedbackDialogState({
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

    resetProductInquiryReSendState();
    setReSendPossibleTime(10);
    clearInterval(reSendIntervalRef.current);
    reSendIntervalRef.current = undefined;
    reSendPossibleIntervalRef.current = undefined;

    mutate(phoneNumber, {
      onSuccess({ userId: newUserId }) {
        setProductInquiryFormState((prevState) => ({
          ...prevState,
          userId: newUserId
        }));
      },
      onError() {
        setProductInquiryFeedbackDialogState({
          open: true,
          title: '인증번호 전송에 실패했어요.<br/>다시 시도해주세요.',
          description: ''
        });
      }
    });
  };

  useEffect(() => {
    if (step === 2) {
      if (reSendIntervalRef.current) {
        return;
      }

      reSendIntervalRef.current = setInterval(() => {
        setProductInquiryReSendState((prevState) => {
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
  }, [setProductInquiryReSendState, step, time]);

  useEffect(() => {
    if (step === 2) {
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
    setProductInquiryReSendState((prevState) => ({
      ...prevState,
      date: `${newMinute}:${newSecond}`
    }));
  }, [setProductInquiryReSendState, time]);

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
      {step >= 1 && (
        <Flexbox direction="vertical" gap={8}>
          <Typography weight="medium" color="ui60">
            답변 받을 연락처를 입력해주세요.
          </Typography>
          <Input
            fullWidth
            autoFocus={!!content}
            inputMode="numeric"
            pattern="[0-9]*"
            size="large"
            placeholder="010-0000-0000"
            onFocus={handleFocus}
            onBlur={handleFocus}
            onChange={(e) =>
              setProductInquiryFormState((prevState) => ({
                ...prevState,
                phoneNumber: e.currentTarget.value.replace(/[^0-9-]/g, '')
              }))
            }
            value={phoneNumber}
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
            autoComplete="one-time-code"
            placeholder="인증번호 입력"
            onFocus={handleFocus}
            onBlur={handleFocus}
            onChange={(e) =>
              setProductInquiryFormState((prevState) => ({
                ...prevState,
                authNumber: e.currentTarget.value
              }))
            }
            value={authNumber}
            customStyle={{
              '& > span': {
                color: common.ui60
              }
            }}
          />
          <Flexbox alignment="center" justifyContent="space-between">
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
      )}
      <Flexbox direction="vertical" gap={8}>
        <Typography weight="medium" color="ui60">
          문의내용
        </Typography>
        <TextArea
          autoFocus
          onFocus={handleFocus}
          onBlur={handleFocus}
          onChange={(e) =>
            setProductInquiryFormState((prevState) => ({
              ...prevState,
              content: e.currentTarget.value
            }))
          }
          value={content}
          placeholder="매물에 대해 궁금한 점을 입력해주세요."
        />
      </Flexbox>
    </Flexbox>
  );
}

const TextArea = styled.textarea`
  padding: 12px;
  outline: 0;
  resize: none;
  height: 84px;
  border-radius: 8px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  ${({
    theme: {
      typography: { h4 },
      palette: { common }
    }
  }) => ({
    fontSize: h4.size,
    fontWeight: h4.weight.regular,
    lineHeight: h4.lineHeight,
    letterSpacing: h4.letterSpacing,
    color: common.ui20
  })};

  &::placeholder {
    ${({
      theme: {
        palette: { common }
      }
    }) => ({
      color: common.ui80
    })};
  }
`;

export default ProductInquiryForm;
