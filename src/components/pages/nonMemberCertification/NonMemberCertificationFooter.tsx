import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@mrcamelhub/camel-ui';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';
import { logEvent } from '@library/amplitude';

import { postAuthorize, postRequest } from '@api/userAuth';
import { postToken } from '@api/nextJs';

import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import validator from '@utils/common/validator';

import {
  nonMemberCertificationFeedbackDialogState,
  nonMemberCertificationFormState
} from '@recoil/nonMemberCertification/atom';
import useSignOut from '@hooks/useSignOut';
import useSafariKeyboardFocus from '@hooks/useSafariKeyboardFocus';

interface NonMemberCertificationFooterProps {
  authNumberInputRef: RefObject<HTMLInputElement>;
}

function NonMemberCertificationFooter({ authNumberInputRef }: NonMemberCertificationFooterProps) {
  const router = useRouter();

  const { height } = useSafariKeyboardFocus();
  const signOut = useSignOut();

  const [{ step, phoneNumber, authNumber, userId }, setNonMemberCertificationFormState] =
    useRecoilState(nonMemberCertificationFormState);
  const setNonMemberCertificationFeedbackDialogState = useSetRecoilState(
    nonMemberCertificationFeedbackDialogState
  );

  const [pending, setPending] = useState(false);

  const ref = useRef<HTMLButtonElement>(null);

  const { mutate, isLoading } = useMutation(postRequest);
  const { mutate: mutateAuthorize } = useMutation(postAuthorize);

  const handleClick = () => {
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

    mutate(phoneNumber, {
      onSuccess({ userId: newUserId }) {
        setNonMemberCertificationFormState((prevState) => ({
          ...prevState,
          step: 1,
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

  const handleClickConfirm = () => {
    logEvent(attrKeys.mypage.SUBMIT_CHECK_NUMBER, {
      title: attrProperty.title.ORDER
    });

    setPending(true);

    mutateAuthorize(
      {
        userId,
        authNumber
      },
      {
        async onSuccess({ jwtToken, accessUser }) {
          if (!accessUser || !jwtToken) {
            setPending(false);
            return;
          }

          try {
            await signOut();
            await postToken(jwtToken, accessUser);

            LocalStorage.set(ACCESS_USER, accessUser);
            LocalStorage.set(ACCESS_TOKEN, jwtToken);
            Axios.setAccessToken(jwtToken);

            await router.replace('/mypage/nonMember/orders');
          } catch {
            setPending(false);
          }
        },
        onError(data) {
          const { response } = (data as AxiosError) || {};
          if (response?.status === 401) {
            setNonMemberCertificationFeedbackDialogState({
              open: true,
              title: '인증에 실패했어요.',
              description: '인증번호가 올바르지 않거나 시간이 초과되었어요. 다시 시도해주세요.'
            });
          } else {
            setNonMemberCertificationFeedbackDialogState({
              open: true,
              title: '인증에 실패했어요.',
              description: '올바른 인증번호를 입력해주세요.'
            });
          }
          setPending(false);
        }
      }
    );
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.animate(
        [
          {
            transform: `translateY(-${height}px)`
          }
        ],
        { fill: 'forwards', duration: 200 }
      );
    }
  }, [height]);

  if (step === 0) {
    return (
      <Button
        ref={ref}
        variant="solid"
        brandColor="black"
        size="xlarge"
        fullWidth
        onClick={handleClick}
        disabled={!validator.phoneNumber(phoneNumber) || isLoading}
        customStyle={{
          borderRadius: 0
        }}
      >
        인증번호 받기
      </Button>
    );
  }

  return (
    <Button
      ref={ref}
      variant="solid"
      brandColor="black"
      size="xlarge"
      fullWidth
      onClick={handleClickConfirm}
      disabled={!phoneNumber || !authNumber || authNumber.length !== 6 || pending}
      customStyle={{
        borderRadius: 0
      }}
    >
      확인
    </Button>
  );
}

export default NonMemberCertificationFooter;
