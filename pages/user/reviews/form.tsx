import { useEffect, useMemo, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { FixedProductInfo, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { PostReviewData } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { postReview } from '@api/user';
import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { toastState } from '@recoil/common';
import { AnimationLoading } from '@pages/user/report';

function ReviewForm() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const { productId, userId, isSeller } = useMemo(
    () => ({
      productId: Number(router.query.productId || ''),
      userId: Number(router.query.targetUserId || ''),
      isSeller: router.query.isTargetUserSeller || false
    }),
    [router.query.isTargetUserSeller, router.query.productId, router.query.targetUserId]
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

  const handleClickSendReview = () => {
    if (isLoadingPostReview) return;

    logEvent(attrKeys.channel.SUBMIT_REVIEW, {
      att: isSeller ? 'BUYER' : 'SELLER',
      score: Number(params.score) / 2
    });

    mutatePostReview(params, {
      onSuccess() {
        setToastState({ type: 'user', status: 'successSendReview' });
        router.back();
      }
    });
  };

  useEffect(() => {
    if (!productId || !userId) router.push({ pathname: '/channels', query: { type: 0 } });

    logEvent(attrKeys.channel.VIEW_REVIEW_SEND, { att: isSeller ? 'BUYER' : 'SELLER' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          status={product?.status || 0}
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
        <Flexbox>
          {Array.from({ length: 5 }, (_, index) => (
            <Icon
              name="StarFilled"
              customStyle={{
                color: index < Number(params.score) / 2 ? '#FEB700' : common.bg02,
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
          ))}
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

export default ReviewForm;
