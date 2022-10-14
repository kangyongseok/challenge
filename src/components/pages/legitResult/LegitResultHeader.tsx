import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Icon, dark } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, getProductDetailUrl } from '@utils/common';

import { dialogState } from '@recoil/common';

import Header from '../../UI/molecules/Header';

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

  const setDialogState = useSetRecoilState(dialogState);

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_SHARE, {
      name: attrProperty.legitName.LEGIT_INFO,
      title: attrProperty.legitTitle.AUTHENTICATING
    });

    if (!productResult) return;

    const url = window.location.href;
    let text = '카멜 사진감정 결과, 실물감정을 추천해요';

    if (result === 1) text = '카멜 사진감정 결과, 정품의견이 더 우세해요!';
    if (result === 2) text = '카멜 사진감정 결과, 가품의심의견이 있어요!';
    if (status === 20) text = '카멜의 감정 전문가들이 사진감정중입니다.';

    if (checkAgent.isAndroidApp() && window.AndroidShareHandler) {
      window.AndroidShareHandler.share(url);
      return;
    }

    if (
      ['android', 'iphone', 'ipad', 'ipod'].some((platfrom) =>
        navigator.userAgent.toLowerCase().indexOf(platfrom)
      )
    ) {
      if (navigator.share) {
        navigator.share({ text, url });
        return;
      }

      if (checkAgent.isAndroidApp() && window.webview && window.webview.callShareProduct) {
        window.webview.callShareProduct(url, JSON.stringify(productResult));
        return;
      }

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callShareProduct
      ) {
        window.webkit.messageHandlers.callShareProduct.postMessage(
          JSON.stringify({ url, product: productResult })
        );
        return;
      }
    }

    setDialogState({
      type: 'SNSShare',
      theme: 'dark',
      shareData: {
        title: productResult.quoteTitle,
        description: text,
        image: productResult.imageMain || productResult.imageThumbnail,
        url: `${window.location.origin}/legit${getProductDetailUrl({
          type: 'productResult',
          product: productResult
        }).replace('/products', '')}/result`
      }
    });
  };

  if (status === 20 || (productResult || {}).postType === 2) {
    return (
      <Header
        rightIcon={
          <Flexbox
            justifyContent="center"
            alignment="center"
            onClick={handleClick}
            customStyle={{
              padding: 16,
              maxHeight: 56,
              cursor: 'pointer'
            }}
          >
            <Icon name="ShareOutlined" />
          </Flexbox>
        }
        hideTitle={status === 20}
        isTransparent
        customStyle={{ backgroundColor: status === 20 ? dark.palette.common.bg03 : undefined }}
      />
    );
  }

  return <Header />;
}

export default LegitResultHeader;
