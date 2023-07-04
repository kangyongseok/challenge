import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Button } from '@mrcamelhub/camel-ui';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';

import { postAuthorize, postRequest } from '@api/userAuth';
import { fetchProduct } from '@api/product';
import { postToken } from '@api/nextJs';
import { fetchChannel } from '@api/channel';

import queryKeys from '@constants/queryKeys';
import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';

import validator from '@utils/common/validator';

import {
  productInquiryFeedbackDialogState,
  productInquiryFormState
} from '@recoil/productInquiry/atom';
import useSignOut from '@hooks/useSignOut';
import useSafariKeyboardFocus from '@hooks/useSafariKeyboardFocus';
import useMutationSendMessage from '@hooks/useMutationSendMessage';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

interface ProductInquiryFooterProps {
  authNumberInputRef: RefObject<HTMLInputElement>;
}

function ProductInquiryFooter({ authNumberInputRef }: ProductInquiryFooterProps) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const queryClient = useQueryClient();
  const toastStack = useToastStack();
  const { height } = useSafariKeyboardFocus();
  const signOut = useSignOut();

  const [{ step, content, phoneNumber, authNumber, userId }, setProductInquiryFormState] =
    useRecoilState(productInquiryFormState);
  const setProductInquiryFeedbackDialogState = useSetRecoilState(productInquiryFeedbackDialogState);

  const [pending, setPending] = useState(false);

  const ref = useRef<HTMLButtonElement>(null);

  const { data: { channels = [], product, roleSeller } = {} } = useQuery(
    queryKeys.products.product({
      productId
    }),
    () => fetchProduct({ productId }),
    {
      enabled: !!productId
    }
  );

  const { mutate, isLoading } = useMutation(postRequest);
  const { mutate: mutateAuthorize } = useMutation(postAuthorize);
  const { mutate: mutateCreateChannel } = useMutationCreateChannel();
  const { mutate: mutateSendMessage } = useMutationSendMessage({
    lastMessageIndex: 1
  });

  const handleClick = () => {
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

    mutate(phoneNumber, {
      onSuccess({ userId: newUserId }) {
        setProductInquiryFormState((prevState) => ({
          ...prevState,
          step: 2,
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

  const handleClickInquiry = () => {
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

            const channelId = (channels || []).find(
              (channel) => channel.userId === accessUser?.userId
            )?.id;

            if (channelId) {
              await router.replace(`/channels/${channelId}`);
            } else {
              const createChannelParams = {
                targetUserId: String(roleSeller?.userId || 0),
                productId: String(product?.id),
                productTitle: product?.title || '',
                productImage: product?.imageThumbnail || product?.imageMain || ''
              };

              await mutateCreateChannel(
                {
                  userId: String(accessUser?.userId || 0),
                  ...createChannelParams
                },
                undefined,
                undefined,
                async (newChannelId?: number) => {
                  if (!newChannelId) return;

                  try {
                    const { channel, channelTargetUser, isTargetUserNoti } =
                      await queryClient.fetchQuery(queryKeys.channels.channel(newChannelId), () =>
                        fetchChannel(newChannelId)
                      );

                    if (!channel || !channelTargetUser) return;

                    await mutateSendMessage({
                      data: { channelId: channel.id, content, event: 'LAST_MESSAGE' },
                      channelUrl: channel.externalId,
                      isTargetUserNoti,
                      userId: channelTargetUser.user.id,
                      productId,
                      callback: () => {
                        router.replace(`/channels/${channel.id}`).then(() =>
                          toastStack({
                            children: (
                              <>
                                <p>판매자에게 문의를 남겼어요.</p>
                                <p>답변이 오면 알림톡을 보내드릴게요!</p>
                              </>
                            ),
                            bottom: 110
                          })
                        );
                      }
                    });
                  } catch {
                    toastStack({
                      children: '문의에 실패했어요. 새로고침 후 시도해 주세요.'
                    });
                    setPending(false);
                  }
                },
                true,
                () => {
                  setPending(false);
                }
              );
            }
          } catch {
            setPending(false);
          }
        },
        onError(data) {
          const { response } = (data as AxiosError) || {};
          if (response?.status === 401) {
            setProductInquiryFeedbackDialogState({
              open: true,
              title: '인증에 실패했어요.',
              description: '인증번호가 올바르지 않거나 시간이 초과되었어요. 다시 시도해주세요.'
            });
          } else {
            setProductInquiryFeedbackDialogState({
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
        onClick={() =>
          setProductInquiryFormState((prevState) => ({
            ...prevState,
            step: 1
          }))
        }
        disabled={!content}
        customStyle={{
          borderRadius: 0
        }}
      >
        다음
      </Button>
    );
  }

  if (step === 1) {
    return (
      <Button
        ref={ref}
        variant="solid"
        brandColor="black"
        size="xlarge"
        fullWidth
        onClick={handleClick}
        disabled={!content || !validator.phoneNumber(phoneNumber) || isLoading}
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
      onClick={handleClickInquiry}
      disabled={!content || !phoneNumber || !authNumber || authNumber.length < 6 || pending}
      customStyle={{
        borderRadius: 0
      }}
    >
      문의하기
    </Button>
  );
}

export default ProductInquiryFooter;
