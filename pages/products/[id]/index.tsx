import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { DehydratedState, QueryClient, dehydrate } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import type { TypographyVariant } from 'mrcamel-ui';
import { CtaButton, Flexbox, Toast, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import AppDownloadDialog from '@components/UI/organisms/AppDownloadDialog';
import {
  DuplicatedOverlay,
  Header,
  PriceDownOverlay,
  ReservingOverlay,
  SoldOutOverlay
} from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  ProductActions,
  ProductAveragePriceChart,
  ProductCTAButton,
  ProductDetailLegitBanner,
  ProductDetailLegitBottomSheet,
  ProductFixedSummary,
  ProductImages,
  ProductInfo,
  ProductKeywordList,
  ProductRedirect,
  ProductRelatedProductList,
  ProductSellerProductList,
  ProductSellerReviews
} from '@components/pages/product';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { ID_FILTER, LABELS, PRODUCT_SITE, PRODUCT_STATUS } from '@constants/product';
import { ACCESS_USER, DUPLICATED_PRODUCT_IDS } from '@constants/localStorage';
import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import getMetaDescription from '@utils/getMetaDescription';
import { getTenThousandUnitPrice } from '@utils/formats';
import { findChannelTalkButtonElement } from '@utils/findChannelTalkButtonElement';
import { getRandomNumber } from '@utils/common';
import commaNumber from '@utils/commaNumber';
import checkAgent from '@utils/checkAgent';

import type { User } from '@typings/user';
import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryProduct from '@hooks/useQueryProduct';

function ProductDetail() {
  const {
    push,
    query: { id: productId, redirect, isCrm, chainPrice },
    asPath
  } = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const {
    data,
    isLoading,
    isFetching,
    mutatePostProductsAdd,
    mutatePostProductsRemove,
    mutateMetaInfo
  } = useQueryProduct();
  const [readyForOpenToast, setReadyForOpenToast] = useState(false);
  const [isShowAppDownloadDialog, setIsShowAppDownloadDialog] = useState(false);
  const [{ isOpenPriceDownToast, isOpenDuplicatedToast }, setOpenToast] = useState({
    isOpenPriceDownToast: false,
    isOpenDuplicatedToast: false
  });
  const contentRef = useRef<HTMLHRElement | null>(null);
  const channelTalkRef = useRef<HTMLDivElement | null>(null);
  const { isPriceDown, isDup, isPriceCrm, hasTarget, salePrice } = useMemo(() => {
    const newPrice = getTenThousandUnitPrice(data?.product.price || 0);
    const newTargetProductPrice = getTenThousandUnitPrice(data?.product.targetProductPrice || 0);
    let newIsPriceDown = newTargetProductPrice < newPrice;
    let newIsDup = data?.product.targetProductStatus === 0;
    let newHasTarget = !!data?.product.targetProductId;
    let newSalePrice =
      newIsDup && newHasTarget && newIsPriceDown ? newPrice - newTargetProductPrice : 0;

    if (newSalePrice < 1) {
      newIsPriceDown = false;
    }

    if (chainPrice) {
      newSalePrice = Number(chainPrice) - (data?.product.price || 0);
      newIsDup = false;
      newHasTarget = false;
      newIsPriceDown = false;
    }

    return {
      isPriceDown: newIsPriceDown,
      isPriceCrm: newSalePrice >= 1,
      isDup: newIsDup,
      hasTarget: newHasTarget,
      salePrice: newSalePrice
    };
  }, [chainPrice, data]);
  const isSafe = useMemo(() => {
    if (data) {
      return (
        Object.entries(PRODUCT_SITE).some(
          ([key, productSite]) =>
            ['HELLO', 'KREAM'].includes(key) &&
            productSite.id === data.product.productSeller.site.id
        ) ||
        data.product.labels.some(
          (label) =>
            label.codeId === ID_FILTER &&
            LABELS[ID_FILTER].some(
              ({ name, description }) => name === label.name && description === '안전'
            )
        )
      );
    }

    return false;
  }, [data]);
  const accessUser = LocalStorage.get<User | null>(ACCESS_USER);
  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);
  const product = !isLoading && !isFetching ? data?.product : undefined;

  const triggered = useScrollTrigger({
    ref: contentRef,
    additionalOffsetTop: showAppDownloadBanner
      ? -(HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT)
      : -HEADER_HEIGHT,
    delay: 300
  });

  useEffect(() => {
    if (data && data.showReviewPrompt) {
      if (checkAgent.isAndroidApp()) {
        if (window.webview && window.webview.callReviewRequest) {
          window.webview.callReviewRequest();
          logEvent(attrKeys.products.VIEW_APPREVIEW_PROMPT);
        }
      } else if (checkAgent.isIOSApp()) {
        if (
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.callReviewRequest
        ) {
          window.webkit.messageHandlers.callReviewRequest.postMessage(0);
          logEvent(attrKeys.products.VIEW_APPREVIEW_PROMPT);
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (
      !checkAgent.isMobileApp() &&
      !SessionStorage.get(sessionStorageKeys.isFirstVisitProductDetail) &&
      !isRedirectPage
    ) {
      SessionStorage.set(sessionStorageKeys.isFirstVisitProductDetail, true);
      setIsShowAppDownloadDialog(true);
    }
  }, [isRedirectPage]);

  useEffect(() => {
    if (!isRedirectPage && data?.product.brand && data.product.brand.name) {
      const { source } =
        SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
        {};
      productDetailAtt({
        key: attrKeys.products.VIEW_PRODUCT_DETAIL,
        product: data.product,
        source
      });
    }
  }, [isRedirectPage, data]);

  useEffect(() => {
    const { product: { id: newProductId = 0 } = {} } = data || {};

    if (!newProductId) return;

    const duplicatedProductIds = LocalStorage.get<number[]>(DUPLICATED_PRODUCT_IDS) || [];

    if (
      !duplicatedProductIds.some(
        (duplicatedProductId) => duplicatedProductId === Number(newProductId)
      ) &&
      isDup &&
      hasTarget &&
      !chainPrice &&
      readyForOpenToast
    ) {
      if (isPriceDown) {
        logEvent(attrKeys.products.VIEW_PRODUCT_DETAIL_TOAST, {
          name: 'PRODUCT_DETAIL',
          att: 'PRICELOW'
        });
        setOpenToast((prevState) => ({ ...prevState, isOpenPriceDownToast: true }));
      } else {
        logEvent(attrKeys.products.VIEW_PRODUCT_DETAIL_TOAST, {
          name: 'PRODUCT_DETAIL',
          att: 'SAME'
        });
        setOpenToast((prevState) => ({ ...prevState, isOpenDuplicatedToast: true }));
      }

      LocalStorage.set(DUPLICATED_PRODUCT_IDS, duplicatedProductIds.concat([Number(newProductId)]));
    }
  }, [chainPrice, hasTarget, isDup, isPriceDown, data, readyForOpenToast]);

  useEffect(() => {
    setOpenToast({
      isOpenPriceDownToast: false,
      isOpenDuplicatedToast: false
    });
    setReadyForOpenToast(true);
  }, [productId]);

  useEffect(() => {
    if (!isRedirectPage) {
      findChannelTalkButtonElement().then((element) => {
        if (element) {
          channelTalkRef.current = element;

          channelTalkRef.current.setAttribute(
            'style',
            `
          transition: transform .1s ease-in;
          transform: translate(0, -30px);
        `
          );
        }
      });
    }

    return () => {
      if (channelTalkRef.current) {
        channelTalkRef.current.setAttribute('style', 'transition: transform .1s ease-in');
      }
    };
  }, [isRedirectPage]);

  const handleClickWish = useCallback(
    (isWish: boolean) => {
      if (!data?.product) return false;

      if (!accessUser) {
        push({ pathname: '/login', query: { returnUrl: asPath } });
        return false;
      }

      if (isWish) {
        mutatePostProductsRemove();
      } else {
        mutatePostProductsAdd();
      }

      return true;
    },
    [accessUser, asPath, data?.product, mutatePostProductsAdd, mutatePostProductsRemove, push]
  );

  const handleClickSMS = useCallback(
    ({
      siteId,
      sellerType,
      id,
      sellerPhoneNumber
    }: {
      siteId?: number;
      sellerType?: number;
      id?: number;
      sellerPhoneNumber: string | null;
    }) => {
      if (!sellerPhoneNumber || !data) return;

      mutateMetaInfo({ isAddPurchaseCount: true });

      let message = '';

      if (
        siteId === PRODUCT_SITE.CAMEL.id ||
        (sellerType &&
          SELLER_STATUS[sellerType as keyof typeof SELLER_STATUS] === SELLER_STATUS['3'])
      ) {
        const { protocol, host } = window.location;
        const conversionId = Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`);
        message = `안녕하세요, 카멜에서 매물 보고 연락 드려요~! \n${protocol}//${host}/product/${id}/${conversionId}`;
      }

      if (checkAgent.isAndroidApp() && window.webview && window.webview.callSendMessage) {
        window.webview.callSendMessage(sellerPhoneNumber, message);
        return;
      }

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callSendMessage
      ) {
        window.webkit.messageHandlers.callSendMessage.postMessage(
          JSON.stringify({ sellerPhoneNumber, content: message })
        );
        return;
      }

      window.location.href = `sms:${sellerPhoneNumber}${
        checkAgent.isAndroidApp() ? '?' : '&'
      }body=${message}`;
    },
    [data, mutateMetaInfo]
  );

  const getProductImageOverlay = useCallback(
    ({ status, variant }: { status: number; variant?: TypographyVariant }) => {
      if (PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] === PRODUCT_STATUS['0']) {
        return null;
      }

      if (isDup && hasTarget) {
        return isPriceDown ? (
          <PriceDownOverlay variant={variant} />
        ) : (
          <DuplicatedOverlay variant={variant} />
        );
      }

      if (PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] === PRODUCT_STATUS['4']) {
        return <ReservingOverlay variant={variant} />;
      }

      return <SoldOutOverlay variant={variant} />;
    },
    [hasTarget, isDup, isPriceDown]
  );
  return (
    <>
      <PageHead
        title={`${data?.product.title} | 카멜 최저가 가격비교`}
        description={`${getMetaDescription(data?.product.description || '')}`}
        ogTitle={`${data?.product.title} | 카멜 최저가 가격비교`}
        ogDescription={`${getMetaDescription(data?.product.description || '')}`}
        ogImage={data?.product.imageMain || data?.product.imageThumbnail}
        ogUrl={`https://mrcamel.co.kr/products/${data?.product.id}`}
        product={data?.product}
      />
      <GeneralTemplate
        header={
          <Header
            type={(isRedirectPage && 'isBack') || (Boolean(isCrm) && 'isCrm') || undefined}
            disableAppDownloadBannerVariableTop={isRedirectPage}
          />
        }
        footer={
          !isRedirectPage ? (
            <ProductCTAButton
              product={data?.product}
              isProductLegit={data?.productLegit}
              isDup={isDup}
              hasTarget={hasTarget}
              isPriceCrm={isPriceCrm}
              salePrice={salePrice}
              isPriceDown={isPriceDown}
              isWish={data?.wish}
              onClickWish={handleClickWish}
              onClickSMS={handleClickSMS}
              mutateMetaInfo={mutateMetaInfo}
            />
          ) : undefined
        }
        hideAppDownloadBanner={isRedirectPage}
      >
        {isRedirectPage ? (
          data?.product && <ProductRedirect product={data.product} />
        ) : (
          <>
            {data?.product && !isFetching && (
              <ProductFixedSummaryCard
                isOpen={triggered}
                showAppDownloadBanner={showAppDownloadBanner}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <ProductFixedSummary
                  isSafe={isSafe}
                  image={data.product.imageThumbnail || data.product.imageMain}
                  title={data.product.title}
                  price={data.product.price}
                  status={data.product.status}
                  getProductImageOverlay={getProductImageOverlay}
                />
              </ProductFixedSummaryCard>
            )}
            <ProductImages
              isLoading={isLoading || isFetching}
              product={data?.product}
              getProductImageOverlay={getProductImageOverlay}
              isProductLegit={data?.productLegit}
            />
            <ProductInfo contentRef={contentRef} isSafe={isSafe} product={product} />
            <ProductActions product={product} onClickSMS={handleClickSMS} />
            {data?.productLegit && (
              <ProductDetailLegitBanner data={data.product.productLegit} product={data.product} />
            )}
            <ProductSellerReviews product={product} />
            <ProductSellerProductList product={product} />
            <ProductAveragePriceChart product={product} />
            {isCrm ? (
              <CtaButton
                variant="contained"
                brandColor="primary"
                customStyle={{ margin: '42px auto 0' }}
              >
                <Typography
                  variant="body1"
                  weight="bold"
                  customStyle={{ color: palette.common.white }}
                >
                  지금 모델 전체보기 ({commaNumber((!isFetching && data?.quoteTitleCount) || 0)}개)
                </Typography>
              </CtaButton>
            ) : (
              <ProductKeywordList
                relatedKeywords={data?.relatedKeywords ? data?.relatedKeywords : undefined}
                productId={data?.product.id}
              />
            )}
            <ProductRelatedProductList
              brandId={data?.product?.brand.id}
              categoryId={data?.product?.category.id}
              line={data?.product?.line}
              prevProduct={data?.product}
            />
          </>
        )}
      </GeneralTemplate>
      <AppDownloadDialog
        variant="wish"
        open={isShowAppDownloadDialog}
        onClose={() => setIsShowAppDownloadDialog(false)}
      />
      <Toast
        open={isOpenDuplicatedToast}
        autoHideDuration={6000}
        onClose={() =>
          setOpenToast((prevState) => ({ ...prevState, isOpenDuplicatedToast: false }))
        }
      >
        <Flexbox alignment="center" justifyContent="space-between" gap={8}>
          <Typography
            weight="medium"
            customStyle={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              color: palette.common.white
            }}
          >
            판매자가 같은 매물을 다시 올렸어요
          </Typography>
          <Typography
            weight="medium"
            customStyle={{
              textDecoration: 'underline',
              whiteSpace: 'nowrap',
              color: palette.common.white
            }}
            onClick={() => {
              logEvent(attrKeys.products.CLICK_PRODUCT_DETAIL, {
                name: attrProperty.productName.PRODUCT_DETAIL,
                att: isPriceDown ? 'TOASTPRICELOW' : 'TOASTSAME'
              });
            }}
          >
            <Link href={`/products/${data?.product.targetProductId}`}>
              <a>확인하기</a>
            </Link>
          </Typography>
        </Flexbox>
      </Toast>
      <Toast
        open={isOpenPriceDownToast}
        autoHideDuration={6000}
        onClose={() => setOpenToast((prevState) => ({ ...prevState, isOpenPriceDownToast: false }))}
      >
        <Flexbox alignment="center" justifyContent="space-between" gap={8}>
          <PriceDownText weight="medium">
            {`${commaNumber(salePrice)}만원 할인! 판매자가 가격을 내려서 다시 올렸어요`}
          </PriceDownText>
          <Typography
            weight="medium"
            customStyle={{
              textDecoration: 'underline',
              whiteSpace: 'nowrap',
              color: palette.common.white
            }}
          >
            <Link href={`/products/${data?.product.targetProductId}`}>
              <a>확인하기</a>
            </Link>
          </Typography>
        </Flexbox>
      </Toast>
      <ProductDetailLegitBottomSheet
        title={String(data?.product.title)}
        thumbnail={data?.product.imageThumbnail || (data?.product.imageMain as string)}
      />
    </>
  );
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
  try {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(req.cookies);
    Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

    const { id } = query;

    const productId = Number(id || 0);

    const data = await queryClient.fetchQuery(
      queryKeys.products.product({ productId }),
      async () => {
        const resultProduct = await fetchProduct({ productId });

        resultProduct.product.viewCount += 1;

        return resultProduct;
      }
    );
    queryClient.setQueryData(queryKeys.products.product({ productId }), data);

    const dehydratedState: DehydratedState = dehydrate(queryClient);

    return {
      props: {
        dehydratedState
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

const ProductFixedSummaryCard = styled.div<{ isOpen: boolean; showAppDownloadBanner: boolean }>`
  position: fixed;
  display: grid;
  grid-template-columns: 64px auto;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  opacity: ${({ isOpen }) => Number(isOpen)};
  transition: opacity 0.3s ease-in 0s;
  width: 100%;
  margin: 0 -20px;
  background-color: ${({ theme }) => theme.palette.common.grey['98']};
`;

const PriceDownText = styled(Typography)`
  color: ${({ theme }) => theme.palette.common.white};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export default ProductDetail;
