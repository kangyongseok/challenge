import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon } from 'mrcamel-ui';

import type { ProductDetail } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { checkAgent, executedShareURl } from '@utils/common';

import { dialogState, showAppDownloadBannerState } from '@recoil/common';

import { CustomHeader, IconBox } from './ProductDetailHeader.styles';
import Header from '../Header';

interface ProductDetailHeaderProps {
  data?: ProductDetail;
  hideRightIcon?: boolean;
}

function ProductDetailHeader({ data, hideRightIcon }: ProductDetailHeaderProps) {
  const {
    push,
    query: { id: redirect, isCrm }
  } = useRouter();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setDialogState = useSetRecoilState(dialogState);

  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);

  const handleClickLogo = () => {
    push('/');
  };

  const handleClickShare = () => {
    if (data) {
      let viewPrice = data.product ? data.product.price / 10000 : 0;

      if (Number.isNaN(viewPrice)) {
        viewPrice = 0;
      }

      if (
        !executedShareURl({
          title: data.product.title,
          text: `${data.product.site.name} ${commaNumber(
            viewPrice - Math.floor(viewPrice) > 0
              ? Number(viewPrice.toFixed(1))
              : Math.floor(viewPrice)
          )}만원\r\nAi추천지수 ${data.product.scoreTotal}/10`,
          url: window.location.href,
          product: data.product
        })
      ) {
        setDialogState({ type: 'SNSShare', product: data.product });
      }
    }
  };

  const handleClickSearch = () => {
    logEvent(attrKeys.header.CLICK_SEARCHMODAL, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      att: 'HEADER'
    });

    push('/search');
  };

  if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
    return (
      <Header
        showRight={!isRedirectPage && !hideRightIcon}
        onClickLeft={
          isCrm ? () => push(`/products/search/${data?.product.quoteTitle || ''}`) : undefined
        }
        disableAppDownloadBannerVariableTop={isRedirectPage}
      />
    );
  }

  return (
    <Header
      customHeader={
        <>
          <CustomHeader
            justifyContent="space-between"
            alignment="center"
            showAppDownloadBanner={showAppDownloadBanner}
          >
            <Icon name="LogoText_96_20" onClick={handleClickLogo} />
            <Flexbox alignment="center">
              <IconBox show disablePadding="right" onClick={handleClickShare}>
                <Icon name="ShareOutlined" />
              </IconBox>
              <IconBox show disablePadding="right" onClick={handleClickSearch}>
                <Icon name="SearchOutlined" />
              </IconBox>
            </Flexbox>
          </CustomHeader>
          <Box customStyle={{ height: 56 }} />
        </>
      }
    />
  );
}

export default ProductDetailHeader;
