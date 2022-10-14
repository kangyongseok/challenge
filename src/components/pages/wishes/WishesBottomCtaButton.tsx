import { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Label, Typography, light, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { OrderOptionKeys } from '@components/pages/wishes/WishesFilter';

import { logEvent } from '@library/amplitude';

import { postRequestProductLegits } from '@api/productLegit';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { deviceIdState, toastState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function WishesBottomCtaButton() {
  const router = useRouter();
  const { order = 'updatedDesc', hiddenTab }: { order?: OrderOptionKeys; hiddenTab?: string } =
    router.query;
  const deviceId = useRecoilValue(deviceIdState);
  const setToastState = useSetRecoilState(toastState);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [open, setOpen] = useState(false);

  const { refetch } = useQueryUserInfo();
  const { data: accessUser } = useQueryAccessUser();
  const { data: { userWishes = [] } = {} } = useQueryCategoryWishes({
    size: 200,
    sort: [order],
    isLegitProduct: hiddenTab === 'legit',
    deviceId
  });

  const { mutate, isSuccess } = useMutation(postRequestProductLegits);

  const handleClose = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
      name: attrProperty.productName.WISH_LEGIT,
      att: 'CLOSE'
    });
    setOpen(false);
  };

  const handleClick = () => {
    logEvent(attrKeys.wishes.CLICK_WISHLEGIT, {
      title: attrProperty.legitTitle.WISH_TO_LEGIT
    });
    setOpen(true);
  };

  const handleClickConfirm = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_MODAL, {
      name: attrProperty.productName.WISH_LEGIT,
      att: 'OK'
    });
    mutate(
      { productIds: userWishes.map(({ product: { id } }) => id), deviceId },
      {
        onSettled: () => setOpen(false),
        onSuccess: () => refetch()
      }
    );
  };

  useEffect(() => {
    if (isSuccess && !open) {
      router
        .push({
          pathname: '/legit',
          query: {
            tab: 'my'
          }
        })
        .then(() =>
          setToastState({
            type: 'legit',
            status: 'saved'
          })
        );
    }
  }, [router, isSuccess, open, setToastState]);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.legit.VIEW_LEGIT_MODAL, {
        name: attrProperty.productName.WISH_LEGIT
      });
    }
  }, [open]);

  return (
    <>
      <Box customStyle={{ minHeight: 89 }}>
        <CtaButtonWrapper>
          <Button
            fullWidth
            variant="contained"
            brandColor="primary"
            size="large"
            onClick={handleClick}
          >
            <NewLabel variant="contained" text="무료" />
            모두 사진감정 해보기
          </Button>
        </CtaButtonWrapper>
      </Box>
      <BottomSheet open={open} onClose={() => setOpen(false)} disableSwipeable>
        <Box customStyle={{ padding: '24px 20px 20px' }}>
          <Typography variant="h4">
            {(accessUser || {}).userName || '회원'}님이 찜한 상품 중 사진감정 가능한{' '}
            {userWishes.length}건 모두 <strong>실시간 정가품 의견</strong> 받아보시겠어요?
          </Typography>
          <Typography weight="medium" customStyle={{ marginTop: 16, color: common.ui60 }}>
            🤑 베타기간 내 감정비용은 무료입니다!
          </Typography>
          <Flexbox gap={8} customStyle={{ marginTop: 32 }}>
            <Button
              fullWidth
              variant="ghost"
              size="large"
              onClick={handleClose}
              customStyle={{ minWidth: 108, maxWidth: 108 }}
            >
              다음에
            </Button>
            <Button
              fullWidth
              variant="contained"
              brandColor="primary"
              size="large"
              onClick={handleClickConfirm}
            >
              네 좋아요
            </Button>
          </Flexbox>
        </Box>
      </BottomSheet>
    </>
  );
}

const CtaButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
`;

export const NewLabel = styled(Label)`
  width: 26px;
  height: 19px;
  border: 2px solid ${light.palette.common.uiWhite};
  background-color: ${light.palette.common.uiBlack};
  border-radius: 10px;
  ${({
    theme: {
      typography: { small2 }
    }
  }) => ({
    fontSize: small2.size,
    fontWeight: small2.weight.bold,
    lineHeight: small2.lineHeight,
    letterSpacing: small2.letterSpacing
  })}
`;

export default WishesBottomCtaButton;
