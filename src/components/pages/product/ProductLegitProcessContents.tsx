import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Toast, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';
import { Keyframes } from '@emotion/react';

import { logEvent } from '@library/amplitude';

import { postLegitsFollow } from '@api/user';
import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { animationKeyframesState, firstUserAnimationState } from '@recoil/productLegitProcess';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function ProductLegitProcessContents() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const splitIds = String(router.query.id || '').split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const [isAuthUser, setIsAuthUser] = useState<boolean | null>(null);
  const boxFade = useRecoilValue(animationKeyframesState);
  const isAnimation = useRecoilValue(firstUserAnimationState);
  const [showLegitTooltip, setShowLegitTooltip] = useState(true);
  const [openToast, setOpenToast] = useState(false);
  const { mutate: mutatePostProductsAdd } = useMutation(postLegitsFollow);
  const { data, isSuccess } = useQuery(
    queryKeys.products.productLegit({ productId }),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id
    }
  );

  useEffect(() => {
    if (
      (!isAuthUser && isSuccess && showLegitTooltip && !data.isFollow) ||
      !!(data?.status === 20 && isAuthUser)
    ) {
      logEvent(attrKeys.legit.VIEW_LEGIT_TOOLTIP, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'GO_MYLEGIT'
      });
    }
  }, [isAuthUser, isSuccess, showLegitTooltip, data]);

  useEffect(() => {
    if (accessUser && data && isSuccess) {
      setIsAuthUser(!!(accessUser.userId === data.userId));
    }
  }, [accessUser, data, isSuccess]);

  const returnText = () => {
    if (router.query.firstLegit === 'true') {
      if (isAnimation) {
        return {
          title: '사진이 충분한지 검토중이에요!',
          sub: (
            <>
              <Typography>사진감정에 필요한 사진들이 충분한지</Typography>
              <Typography>검토하고 있어요</Typography>
            </>
          )
        };
      }
      return {
        title: '사진감정 신청이 완료됐어요!',
        sub: (
          <>
            <Typography>카멜에서 활동하시는 명품감정 전문가들에게</Typography>
            <Typography>{accessUser?.userName}님의 요청을 전송하고 있어요!</Typography>
          </>
        )
      };
    }
    switch (data?.status) {
      case 10:
        return {
          title: '사진이 충분한지 검토중이에요!',
          sub: (
            <>
              <Typography>사진감정에 필요한 사진들이 충분한지</Typography>
              <Typography>검토하고 있어요</Typography>
            </>
          )
        };
      case 20:
        return {
          title: '실시간 사진감정 중입니다!',
          sub: (
            <>
              <Typography>3명의 전문가들이</Typography>
              <Typography>사진감정 의견을 남기는 중이에요</Typography>
            </>
          )
        };
      default:
        return {
          title: '',
          sub: ''
        };
    }
  };

  const handleClick = () => {
    if (!accessUser) {
      logEvent(attrKeys.legit.CLICK_LEGIT_TOOLTIP, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'LOGIN'
      });
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
    } else {
      logEvent(attrKeys.legit.CLICK_LEGIT_TOOLTIP, {
        name: attrProperty.productName.LEGIT_PRODUCT,
        title: attrProperty.productTitle.PRE_CONFIRM,
        subTitle: 'GO_MYLEGIT'
      });
      mutatePostProductsAdd(
        {
          productId: data?.productId as number
        },
        {
          onSuccess() {
            setOpenToast(true);
            setShowLegitTooltip(false);
          }
        }
      );
    }
  };

  return (
    <StyledLegitTextArea
      direction="vertical"
      gap={8}
      alignment="center"
      isAnimation={isAnimation}
      boxFade={boxFade}
      isFail={data?.status === 11}
    >
      <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
        {returnText().title}
      </Typography>
      <Tooltip
        open={
          (!isAuthUser && isSuccess && showLegitTooltip && !data.isFollow) ||
          !!(data?.status === 20 && isAuthUser)
        }
        brandColor="primary-highlight"
        message={
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography weight="bold" variant="small1">
              {data?.status === 20 && isAuthUser
                ? '🔔 의견이 모두 남겨지면 앱푸시로 알려드릴게요!'
                : '🔔 나도 감정결과를 받아보고싶다면?'}
            </Typography>
            {!(data?.status === 20 && isAuthUser) && (
              <Typography
                variant="small1"
                customStyle={{ textDecoration: 'underline' }}
                onClick={handleClick}
              >
                내 사진감정 추가
              </Typography>
            )}
          </Flexbox>
        }
        placement="bottom"
        customStyle={{ zIndex: 10, width: !(data?.status === 20 && isAuthUser) ? '100%' : 'auto' }}
      >
        <Typography customStyle={{ width: 'calc(100vw - 40px)' }}>{returnText().sub}</Typography>
      </Tooltip>
      {data?.status === 20 && isAuthUser && (
        <FrameBox>
          <Typography weight="medium">알림을 끄셨다면 사진감정 결과를 받을 수 없어요!</Typography>
          <Typography variant="small1">
            알림켜기: 휴대폰 설정 {'>'} 알림 {'>'} Camel 허용
          </Typography>
        </FrameBox>
      )}
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        <Typography weight="medium" customStyle={{ color: common.white }}>
          내 사진감정 목록에 추가되었습니다!
        </Typography>
      </Toast>
    </StyledLegitTextArea>
  );
}

const StyledLegitTextArea = styled(Flexbox)<{
  isAnimation: boolean;
  boxFade: Keyframes;
  isFail: boolean;
}>`
  display: ${({ isFail }) => (isFail ? 'none' : 'block')};
  text-align: center;
  ${({ isAnimation, boxFade }): CSSObject => (isAnimation ? { animation: `${boxFade} 0.7s` } : {})};
`;

const FrameBox = styled.div`
  width: 100%;
  border-radius: 8px;
  background: ${({ theme: { palette } }) => palette.common.grey['95']};
  margin: 130px 0 20px;
  padding: 8px 0;
  div:first-of-type {
    color: ${({ theme: { palette } }) => palette.common.grey['60']};
  }
`;

export default ProductLegitProcessContents;
