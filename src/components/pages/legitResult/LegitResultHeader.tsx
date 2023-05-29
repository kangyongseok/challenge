import { useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Flexbox, Icon, dark } from '@mrcamelhub/camel-ui';

import { SNSShareDialog } from '@components/UI/organisms';
import Header from '@components/UI/molecules/Header';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { executedShareURl, getProductDetailUrl } from '@utils/common';

import type { ShareData } from '@typings/common';

function LegitResultHeader() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: { productResult, result, status } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  const [open, setOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>();

  const isRequestLegit =
    (productResult || {}).sellerType !== 0 && (productResult || {}).status === 7;

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_SHARE, {
      name: attrProperty.legitName.LEGIT_INFO,
      title: attrProperty.legitTitle.AUTHENTICATING
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

  if (status === 20 || isRequestLegit) {
    return (
      <>
        <Header
          rightIcon={
            <Flexbox
              justifyContent="center"
              alignment="center"
              onClick={handleClick}
              customStyle={{
                padding: '0 8px',
                maxHeight: 56,
                cursor: 'pointer'
              }}
            >
              <Icon name="ShareOutlined" />
            </Flexbox>
          }
          hideTitle={status === 20}
          isTransparent={status === 20}
          customStyle={{ backgroundColor: status === 20 ? dark.palette.common.bg03 : undefined }}
        />
        <SNSShareDialog
          open={open}
          onClose={() => setOpen(false)}
          shareData={shareData}
          product={productResult}
        />
      </>
    );
  }

  return <Header />;
}

export default LegitResultHeader;
