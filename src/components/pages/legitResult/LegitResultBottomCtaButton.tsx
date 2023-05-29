import { useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { SNSShareDialog } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { executedShareURl, getProductDetailUrl, isExtendedLayoutIOSVersion } from '@utils/common';

import type { ShareData } from '@typings/common';
import { legitResultCommentFocusedState } from '@recoil/legitResultComment/atom';

function LegitResultBottomCtaButton() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const commentWriterFocused = useRecoilValue(legitResultCommentFocusedState);

  const [open, setOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>();

  const { data: { status, productResult, result } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );
  const isRequestLegit = (productResult || {}).postType === 2;

  const handleClick = () => {
    if (isRequestLegit) {
      logEvent(attrKeys.legitResult.CLICK_LEGIT_INFO, {
        name: attrProperty.name.AUTHORIZED
      });

      router.push({
        pathname: '/legit/request',
        query: {
          id: productId
        }
      });
      return;
    }
    router.push(`/products/${id}`);
  };

  const handleClickShare = () => {
    logEvent(attrKeys.legit.CLICK_SHARE, {
      name: attrProperty.legitName.LEGIT_INFO,
      title:
        (status === 20 && attrProperty.legitTitle.AUTHENTICATING) ||
        (status === 30 && attrProperty.legitTitle.AUTHORIZED)
    });

    if (!productResult) return;

    let text = '카멜 사진감정 결과, 실물감정을 추천해요';

    if (result === 1) text = '카멜 사진감정 결과, 정품의견이 더 우세해요!';
    if (result === 2) text = '카멜 사진감정 결과, 가품의심의견이 있어요!';
    if (status === 20) text = '카멜의 감정 전문가들이 사진감정중입니다.';

    const newShareData = {
      title: productResult.quoteTitle,
      description: text,
      image: productResult.imageMain || productResult.imageThumbnail,
      url: `${window.location.origin}/legit${getProductDetailUrl({
        type: 'productResult',
        product: productResult
      }).replace('/products', '')}/result`,
      product: productResult
    };

    if (
      !executedShareURl({
        url: newShareData.url,
        title: newShareData.title,
        text: newShareData.description,
        product: newShareData.product
      })
    ) {
      setOpen(true);
      setShareData(newShareData);
    }
  };

  if (commentWriterFocused || (isRequestLegit && status !== 30)) return null;

  return (
    <>
      <Box
        component="nav"
        customStyle={{
          minHeight: `calc(89px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'})`
        }}
      >
        <CtaButtonWrapper gap={8} status={status}>
          <Button
            startIcon={<Icon name="ShareOutlined" />}
            size="large"
            iconOnly
            onClick={handleClickShare}
            customStyle={{
              backgroundColor: status === 20 ? 'transparent' : common.uiWhite,
              borderColor: common.ui95
            }}
          />
          <Button
            fullWidth
            variant="solid"
            brandColor={status === 20 ? 'primary' : 'black'}
            size="large"
            onClick={handleClick}
          >
            {isRequestLegit ? '해당 신청건 바로가기' : '해당 매물 보러가기'}
          </Button>
        </CtaButtonWrapper>
      </Box>
      <SNSShareDialog
        open={open}
        onClose={() => setOpen(false)}
        shareData={shareData}
        product={productResult}
      />
    </>
  );
}

const CtaButtonWrapper = styled(Flexbox)<{ status?: number }>`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 20px;
  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      },
      status
    }) => (status === 20 ? 'transparent' : common.ui90)};
  background-color: ${({
    theme: {
      palette: { common }
    },
    status
  }) => (status === 20 ? common.bg03 : common.uiWhite)};
  z-index: ${({ theme: { zIndex } }) => zIndex.bottomNav};
  padding-bottom: ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '20px'};
`;

export default LegitResultBottomCtaButton;
