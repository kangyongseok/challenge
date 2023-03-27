import { useEffect, useMemo, useRef, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { FixedProductInfo, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { PostReviewData } from '@dto/user';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postReview } from '@api/user';
import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { checkAgent } from '@utils/common';

import { toastState } from '@recoil/common';
import { AnimationLoading } from '@pages/user/report';

function ReviewForm() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const { productId, userId, userName, isSeller } = useMemo(
    () => ({
      productId: Number(router.query.productId || ''),
      userId: Number(router.query.targetUserId || ''),
      userName: String(router.query.targetUserName || ''),
      isSeller: router.query.isTargetUserSeller || false
    }),
    [
      router.query.isTargetUserSeller,
      router.query.productId,
      router.query.targetUserId,
      router.query.targetUserName
    ]
  );

  const setToastState = useSetRecoilState(toastState);

  const { data: { product } = {}, isLoading } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    { enabled: !!productId }
  );
  const { mutate: mutatePostReview, isLoading: isLoadingPostReview } = useMutation(postReview);

  const [params, setParams] = useState<PostReviewData>({
    userId,
    productId,
    score: '0',
    content: ''
  });

  const loggedRef = useRef(false);

  const handleClickSendReview = () => {
    if (isLoadingPostReview) return;

    mutatePostReview(params, {
      onSuccess() {
        logEvent(attrKeys.channel.SUBMIT_REVIEW, {
          name: attrKeys.channel.REVIEW_SEND,
          att: isSeller ? 'BUYER' : 'SELLER',
          score: Number(params.score) / 2,
          data: {
            ...product
          },
          description: params.content
        });

        setToastState({ type: 'user', status: 'successSendReview' });
        router.back();
      }
    });
  };

  useEffect(() => {
    if (isLoading) return;

    if (!productId || !userId) router.push({ pathname: '/channels', query: { type: 0 } });

    if (!loggedRef.current) {
      loggedRef.current = true;
      logEvent(attrKeys.channel.VIEW_REVIEW_SEND, {
        att: isSeller ? 'BUYER' : 'SELLER',
        data: { ...product }
      });
    }
  }, [isLoading, isSeller, product, productId, router, userId]);

  useEffect(() => {
    if (checkAgent.isIOSApp()) {
      window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
    }
  }, []);

  return (
    <GeneralTemplate
      header={
        <Header
          onClickLeft={() => router.back()}
          showRight={false}
          customStyle={{ '& > div > div': { borderBottom: `1px solid ${common.line01}` } }}
        >
          <Typography variant="h3" weight="bold">
            후기 보내기
          </Typography>
        </Header>
      }
      disablePadding
    >
      {(isLoading || !!product) && (
        <FixedProductInfo
          isLoading={isLoading}
          image={product?.imageThumbnail || product?.imageMain || ''}
          status={1}
          title={product?.title || ''}
          price={product?.price || 0}
        />
      )}
      <Flexbox
        component="section"
        direction="vertical"
        alignment="center"
        gap={32}
        customStyle={{ padding: '52px 20px', flex: 1 }}
      >
        <Flexbox direction="vertical" alignment="center" gap={20}>
          <Typography variant="h3" weight="bold">
            {userName}님과의 거래는 어떠셨나요?
          </Typography>
          <Flexbox>
            {Array.from({ length: 5 }, (_, index) => {
              return index < Number(params.score) / 2 ? (
                <Icon
                  name="StarFilled"
                  width={23}
                  height={23}
                  customStyle={{
                    color: '#FFD911',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setParams((prevState) => ({
                      ...prevState,
                      score:
                        Number(params.score) / 2 === 1 && index === 0
                          ? '0'
                          : ((index + 1) * 2).toString()
                    }));
                  }}
                />
              ) : (
                <Icon
                  name="StarOutlined"
                  width={23}
                  height={23}
                  customStyle={{
                    color: '#FFD911',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setParams((prevState) => ({
                      ...prevState,
                      score:
                        Number(params.score) / 2 === 1 && index === 0
                          ? '0'
                          : ((index + 1) * 2).toString()
                    }));
                  }}
                />
              );
            })}
          </Flexbox>
        </Flexbox>
        <Description>
          <TextareaAutosize
            placeholder="거래 후기를 입력해주세요"
            maxLength={2000}
            value={params.content}
            onChange={(e) =>
              setParams((prevState) => ({
                ...prevState,
                content: prevState.content?.length ? e.target.value : e.target.value.trim()
              }))
            }
          />
        </Description>
      </Flexbox>
      <Flexbox component="section" customStyle={{ padding: '0 20px 20px' }}>
        <Button
          variant="solid"
          brandColor="primary"
          size="xlarge"
          fullWidth
          disabled={isLoading || !Number(params.score) || !params.content || isLoadingPostReview}
          onClick={handleClickSendReview}
        >
          {isLoadingPostReview ? <AnimationLoading name="LoadingFilled" /> : '후기 보내기'}
        </Button>
      </Flexbox>
    </GeneralTemplate>
  );
}

const Description = styled.div`
  position: relative;
  width: 100%;

  textarea {
    min-height: 124px;
    width: 100%;
    border: 1px solid ${({ theme: { palette } }) => palette.common.line01};
    border-radius: 8px;
    padding: 12px;
    color: ${({ theme: { palette } }) => palette.common.ui20};
    resize: none;

    ${({ theme: { typography } }) => ({
      fontSize: typography.h4.size,
      fontWeight: typography.h4.weight.regular,
      lineHeight: typography.h4.lineHeight,
      letterSpacing: typography.h4.letterSpacing
    })};

    ::placeholder {
      color: ${({
        theme: {
          palette: { common }
        }
      }) => common.ui80};
      white-space: pre-wrap;

      ${({ theme: { typography } }) => ({
        fontSize: typography.h4.size,
        fontWeight: typography.h4.weight.regular,
        lineHeight: typography.h4.lineHeight,
        letterSpacing: typography.h4.letterSpacing
      })};
    }
  }
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default ReviewForm;
