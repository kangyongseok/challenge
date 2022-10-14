import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Toast, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/styled';
import { Keyframes } from '@emotion/react';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { animationKeyframesState, firstUserAnimationState } from '@recoil/legitStatus';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitStatusContents() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();

  const splitIds = String(router.query.id || '').split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const [isAuthUser, setIsAuthUser] = useState<boolean | null>(null);
  const boxFade = useRecoilValue(animationKeyframesState);
  const isAnimation = useRecoilValue(firstUserAnimationState);
  const [openToast, setOpenToast] = useState(false);
  const { data, isSuccess } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id
    }
  );

  useEffect(() => {
    if (accessUser && data && isSuccess) {
      setIsAuthUser(accessUser.userId === data.userId);
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
      case 13:
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

  return (
    <StyledLegitTextArea
      direction="vertical"
      gap={8}
      alignment="center"
      isAnimation={isAnimation}
      boxFade={boxFade}
      isFail={data?.status === 11 || data?.status === 12}
    >
      <Typography variant="h2" weight="bold" customStyle={{ marginBottom: 8 }}>
        {returnText().title}
      </Typography>
      <Typography customStyle={{ width: 'calc(100vw - 40px)' }}>{returnText().sub}</Typography>
      {data?.status === 20 && isAuthUser && (
        <FrameBox>
          <Typography weight="medium">알림을 끄셨다면 사진감정 결과를 받을 수 없어요!</Typography>
          <Typography variant="small1">
            알림켜기: 휴대폰 설정 {'>'} 알림 {'>'} Camel 허용
          </Typography>
        </FrameBox>
      )}
      <Toast open={openToast} onClose={() => setOpenToast(false)}>
        내 사진감정 목록에 추가되었습니다!
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
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  margin: 130px 0 20px;
  padding: 8px 0;
  div:first-of-type {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui60};
  }
`;

export default LegitStatusContents;
