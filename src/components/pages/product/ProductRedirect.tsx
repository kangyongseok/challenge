import { useEffect, useRef, useState } from 'react';

import LinesEllipsis from 'react-lines-ellipsis';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';
import Image from '@components/UI/atoms/Image';

import type { Product } from '@dto/product';

import LocalStorage from '@library/localStorage';
import Amplitude from '@library/amplitude';

import { PRODUCT_SITE, PRODUCT_SITE_NAVER } from '@constants/product';
import { ACCESS_USER, APP_BANNER } from '@constants/localStorage';

import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import commaNumber from '@utils/commaNumber';
import checkAgent from '@utils/checkAgent';

import { User } from '@typings/user';
import type { AppBanner } from '@typings/common';

interface ProductRedirectProps {
  product: Product;
}

function ProductRedirect({
  product: {
    price,
    id,
    siteUrl,
    site,
    url,
    postId,
    imageThumbnail,
    imageMain,
    title,
    datePosted,
    dateFirstPosted,
    area
  }
}: ProductRedirectProps) {
  const {
    theme: { palette }
  } = useTheme();
  const { query } = useRouter();
  const [isBunjangView, setIsBunjangView] = useState(false);

  const redirectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const windowCloseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const sessionId = Amplitude.getClient()?.getSessionId();
    const appBanner: AppBanner = LocalStorage.get<AppBanner>(APP_BANNER) || {
      sessionId,
      counts: {},
      isInit: !!sessionId,
      lastAction: '',
      isClosed: false,
      mainCloseTime: '',
      mainType: 0,
      isTooltipView: false,
      viewProductList: []
    };
    const checkBunjangView =
      PRODUCT_SITE.BUNJANG.id === site.id &&
      checkAgent.isIOSApp() &&
      !appBanner.viewProductList.includes(id) &&
      appBanner.viewProductList.length < 3;

    if (checkBunjangView) {
      setIsBunjangView(true);
      appBanner.viewProductList.push(id);
      LocalStorage.set(APP_BANNER, appBanner);
    }

    const userAgent = Number(query.userAgent || 0);
    const isIOSApp = userAgent === 1;
    const isAndroidApp = userAgent === 2;

    window.getExecuteApp = (result: boolean) => {
      if (!result) {
        window.location.replace(url);
      } else {
        window.close();
      }
    };

    redirectTimerRef.current = setTimeout(
      () => {
        let productUrl = url;
        const windowCloseDelayPlatforms = [PRODUCT_SITE.KANGKAS.id];
        const windowCloseTimeout = windowCloseDelayPlatforms.includes(site.id) ? 2500 : 1000;

        if (checkAgent.isMobileApp() && productUrl.includes('//smartstore.naver.com')) {
          productUrl = productUrl.replace('//smartstore.naver.com', '//m.smartstore.naver.com');
        }

        if (!PRODUCT_SITE_NAVER.find((siteId) => siteId === site.id)) {
          productUrl += `${
            productUrl.includes('?') ? '&' : '?'
          }utm_source=mrcamel&utm_medium=redirect_product&utm_content=product_detail`;

          const accessUser = LocalStorage.get<User | null>(ACCESS_USER);
          const mrcamelId = accessUser?.mrcamelId || accessUser?.userId;

          if (site.id === PRODUCT_SITE.KOODON.id && mrcamelId) {
            productUrl += `&mrcamel_id=${mrcamelId}`;
          }
        }

        if (isIOSApp || checkAgent.isIOSApp()) {
          if (site.id === PRODUCT_SITE.BUNJANG.id) {
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              `bunjang://goto?type=product&val=${postId}`
            );
            return;
          }
          if (site.id === PRODUCT_SITE.DAANGN.id) {
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              `towneers://articles/${postId}`
            );
            return;
          }
          if (site.id === PRODUCT_SITE.HELLO.id) {
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              `hellomarket://hellomarket.api/item/${postId}`
            );
            return;
          }
          window.location.replace(productUrl);
          windowCloseTimerRef.current = setTimeout(() => window.close(), windowCloseTimeout);
        } else if (isAndroidApp || checkAgent.isAndroidApp()) {
          if (site.id === PRODUCT_SITE.BUNJANG.id) {
            window.webview.callExecuteApp(`bunjang://goto?type=product&val=${postId}`);
            return;
          }
          if (site.id === PRODUCT_SITE.DAANGN.id) {
            window.webview.callExecuteApp(`towneers://articles/${postId}`);
            return;
          }
          if (site.id === PRODUCT_SITE.HELLO.id) {
            window.webview.callExecuteApp(`hellomarket://hellomarket.api/item/${postId}`);
            return;
          }
          window.location.replace(productUrl);
          windowCloseTimerRef.current = setTimeout(() => window.close(), windowCloseTimeout);
        } else {
          window.location.replace(productUrl);
          windowCloseTimerRef.current = setTimeout(() => window.close(), windowCloseTimeout);
        }
      },
      appBanner.counts.PURCHASE || 0 < 2 ? 1500 : 1000
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      if (windowCloseTimerRef.current) {
        clearTimeout(windowCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <Box customStyle={{ marginTop: 48 }}>
      <Box customStyle={{ textAlign: 'center' }}>
        <Typography variant="body1" weight="medium">
          {(siteUrl.hasImage && siteUrl.name) || site.name}에서 거래를 완료하세요
        </Typography>
        <Typography variant="h4" weight="bold" customStyle={{ marginTop: 4 }}>
          판매 페이지로 이동 할게요!
        </Typography>
        {isBunjangView && (
          <Typography
            variant="body2"
            customStyle={{ marginTop: 8, color: palette.common.grey['40'] }}
          >
            (번개장터는 App이 백그라운드에 켜져 있어야 해요)
          </Typography>
        )}
      </Box>
      <Flexbox justifyContent="center" alignment="center" customStyle={{ marginTop: 22 }}>
        <Image
          width={48}
          height={48}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/mrcamel-logo.png`}
          alt="Platform Logo Img"
          disableAspectRatio
        />
        <Flexbox justifyContent="center" customStyle={{ margin: '0 26px 0 22px', width: 45 }}>
          <Loader style={{ animationDelay: '-0.32s' }} />
          <Loader style={{ animationDelay: '-0.16s' }} />
          <Loader />
        </Flexbox>
        <Image
          width={48}
          height={48}
          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
            (siteUrl.hasImage && siteUrl.id) || site.id
          }.png`}
          alt="Platform Logo Img"
          disableAspectRatio
        />
      </Flexbox>
      <Card justifyContent="center" direction="vertical">
        <Image src={imageThumbnail || imageMain} width={164} height={164} disableAspectRatio />
        <Typography variant="body2" weight="medium" customStyle={{ marginTop: 12 }}>
          <LinesEllipsis text={title} maxLine="2" ellipsis="..." basedOn="letters" component="p" />
        </Typography>
        <Typography variant="body1" weight="bold" customStyle={{ marginTop: 4 }}>
          {commaNumber(getTenThousandUnitPrice(price))}만원
        </Typography>
        <Typography
          variant="small2"
          weight="medium"
          customStyle={{ marginTop: 8, color: palette.common.grey['60'] }}
        >
          <LinesEllipsis
            text={`${datePosted > dateFirstPosted ? '끌올 ' : ''}${getFormattedDistanceTime(
              new Date(datePosted)
            )}${area ? ` · ${getProductArea(area)}` : ''}`}
            maxLine="2"
            ellipsis="..."
            basedOn="letters"
            component="p"
          />
        </Typography>
      </Card>
      <CustomDivider />
      <Box customStyle={{ padding: '24px 0', textAlign: 'center' }}>
        <Typography variant="body2" weight="bold">
          카멜은 가격비교 정보중개자이며, 판매자가 아닙니다.
        </Typography>
        <Typography
          variant="small2"
          customStyle={{ marginTop: 8, color: palette.common.grey['40'] }}
        >
          - 판매 페이지에서 가격이 일치하는지 반드시 확인 바랍니다.
          <br />- 상품정보, 배송, 환불은 해당 매물의 판매자가 관리합니다.
        </Typography>
      </Box>
    </Box>
  );
}

const Loader = styled.div`
  height: 15px;
  width: 15px;
  border-style: solid;
  border-color: ${({ theme }) => theme.palette.common.grey['80']};
  border-width: 4px 4px 0 0;
  transform: rotate(45deg);
  animation: bounceDelay 1.4s infinite ease-in-out both;

  @keyframes bounceDelay {
    0%,
    100% {
      border-style: solid;
      border-color: ${({ theme }) => theme.palette.common.grey['80']};
      border-width: 4px 4px 0 0;
    }
    20%,
    40% {
      border-style: solid;
      border-color: ${({ theme }) => theme.palette.primary.main};
      border-width: 4px 4px 0 0;
    }
  }
`;

const Card = styled(Flexbox)`
  margin: 40px auto;
  padding: 32px;
  background-color: ${({ theme }) => theme.palette.common.grey['95']};
  width: 228px;
  border-radius: ${({ theme }) => theme.box.round['16']};
`;

const CustomDivider = styled(Divider)`
  margin-top: 0;
`;

export default ProductRedirect;
