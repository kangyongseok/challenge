import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { QueryClient, dehydrate } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { SSRConfig } from 'next-i18next';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import type { TypographyVariant } from 'mrcamel-ui';
import { Flexbox, Toast, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { AppDownloadDialog, MyShopAppDownloadDialog } from '@components/UI/organisms';
import {
  DuplicatedOverlay,
  PriceDownOverlay,
  ProductDetailHeader,
  ReservingOverlay,
  SoldOutOverlay
} from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { UserShopProductDeleteConfirmDialog } from '@components/pages/userShop';
import {
  ProductActions,
  ProductCTAButton,
  ProductDetailFooter,
  ProductDetailLegitBanner,
  ProductDetailLegitBottomSheet,
  ProductImages,
  ProductInfo,
  ProductMowebAppContents,
  ProductRedirect,
  ProductRelatedProductList,
  ProductSoldoutCard
} from '@components/pages/product';

import type { AccessUser } from '@dto/userAuth';

import updateAccessUserOnBraze from '@library/updateAccessUserOnBraze';
import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import {
  ID_FILTER,
  LABELS,
  PRODUCT_SITE,
  PRODUCT_SOURCE,
  PRODUCT_STATUS
} from '@constants/product';
import { ACCESS_USER, DUPLICATED_PRODUCT_IDS } from '@constants/localStorage';
import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollEnable } from '@utils/scroll';
import { getMetaDescription, getProductType, productDetailAtt } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { getCookies } from '@utils/cookies';
import { checkAgent, commaNumber, getProductDetailUrl, getRandomNumber } from '@utils/common';

import { userShopSelectedProductState } from '@recoil/userShop';
import { loginBottomSheetState, toastState } from '@recoil/common';
import useRedirectVC from '@hooks/useRedirectVC';
import useQueryProduct from '@hooks/useQueryProduct';

function ProductDetail({ _nextI18Next }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    query: { id: productId, redirect, chainPrice },
    asPath
  } = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const setToastState = useRecoilValue(toastState);

  const {
    data,
    isLoading,
    isFetching,
    mutatePostProductsAdd,
    mutatePostProductsRemove,
    mutateMetaInfo,
    refetch
  } = useQueryProduct();
  useRedirectVC(
    data?.product ? getProductDetailUrl({ product: data?.product }) : `/products/${productId}`
  );

  const [readyForOpenToast, setReadyForOpenToast] = useState(false);
  const [isShowAppDownloadDialog, setIsShowAppDownloadDialog] = useState(false);
  const [isCamelSellerProduct, setCamelSellerProduct] = useState(false);
  const [viewDetail, setViewDetail] = useState(false);
  const [{ isOpenPriceDownToast, isOpenDuplicatedToast }, setOpenToast] = useState({
    isOpenPriceDownToast: false,
    isOpenDuplicatedToast: false
  });
  const [targetProductUrl, setTargetProductUrl] = useState('');

  const loggedBrazeRef = useRef(false);
  const contentRef = useRef<HTMLHRElement | null>(null);

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

  const isNormalseller =
    (data?.product.site.id === 34 || data?.product.productSeller.type === 4) &&
    data?.product.productSeller.type !== 3;

  useEffect(() => {
    scrollEnable();
  }, [data]);

  useEffect(() => {
    if (setToastState.status === 'soldout' && isCamelSellerProduct) {
      refetch();
    }
  }, [setToastState, refetch, isCamelSellerProduct]);

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
  const soldout = useMemo(
    () =>
      PRODUCT_STATUS[data?.product.status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] &&
      !(isDup && hasTarget) &&
      PRODUCT_STATUS[data?.product.status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['4'],
    [data?.product.status, hasTarget, isDup]
  );
  const accessUser = LocalStorage.get<AccessUser | null>(ACCESS_USER);
  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);
  const product = !isLoading && !isFetching ? data?.product : undefined;

  const handleClickWish = useCallback(
    (isWish: boolean) => {
      if (!data?.product) return false;

      if (!accessUser) {
        setLoginBottomSheet(true);
        return false;
      }

      if (isWish) {
        mutatePostProductsRemove();
      } else {
        mutatePostProductsAdd();
      }

      return true;
    },
    [
      accessUser,
      data?.product,
      mutatePostProductsAdd,
      mutatePostProductsRemove,
      setLoginBottomSheet
    ]
  );

  const handleClickSMS = useCallback(
    ({
      siteId,
      sellerType,
      id,
      sellerPhoneNumber,
      conversionId
    }: {
      siteId?: number;
      sellerType?: number;
      id?: number;
      sellerPhoneNumber: string | null;
      conversionId?: number;
    }) => {
      if (!sellerPhoneNumber || !data) return;

      mutateMetaInfo({ isAddPurchaseCount: true });

      let message = '';

      if (
        siteId === PRODUCT_SITE.CAMEL.id ||
        (sellerType &&
          SELLER_STATUS[sellerType as keyof typeof SELLER_STATUS] === SELLER_STATUS['3']) ||
        isNormalseller
      ) {
        const { protocol, host } = window.location;
        const newConversionId =
          conversionId || Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`);
        message = `안녕하세요, 카멜에서 매물 보고 연락 드려요~! \n${protocol}//${host}/products/${id}?conversionId=${newConversionId}`;
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
        checkAgent.isAndroid() ? '?' : '&'
      }body=${message}`;
    },
    [data, mutateMetaInfo, isNormalseller]
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

  const handleClickViewDetail = () => {
    logEvent(attrKeys.products.CLICK_SOLDOUT_DETAIL, {
      name: attrProperty.name.productDetail
    });

    setViewDetail(true);
  };

  useEffect(() => {
    setUserShopSelectedProductState({ id: Number(productId) });

    if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(process.env.KAKAO_JS_KEY);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.roleSeller?.userId && accessUser?.userId) {
      setCamelSellerProduct(data?.roleSeller?.userId === accessUser?.userId);
    }
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
  }, [accessUser?.userId, data]);

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
    scrollEnable();

    if (!data) return;

    setTargetProductUrl(getProductDetailUrl({ type: 'targetProduct', product: data.product }));
  }, [data]);

  useEffect(() => {
    loggedBrazeRef.current = false;
  }, [asPath]);

  useEffect(() => {
    if (!data || !data.product || !accessUser || loggedBrazeRef.current) return;

    loggedBrazeRef.current = true;

    const categories = [];

    const {
      product: { category: productCategory, productCategories = [], quoteTitle: productQuoteTitle }
    } = data;

    let quoteTitle = productQuoteTitle || '';

    if (productCategory) {
      categories.push(productCategory.name);
    }

    if (productCategories && !!productCategories.length) {
      productCategories.forEach(({ category: { name: categoryName } }) =>
        categories.push(categoryName)
      );
    }

    categories.forEach((c) => {
      quoteTitle = quoteTitle.replace(c, '');
    });

    quoteTitle = quoteTitle.replace('  ', ' ').replace('  ', ' ');

    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        quoteTitle += ` ${category}`;
      });
    }

    updateAccessUserOnBraze({ ...accessUser, lastProductModel: quoteTitle });
  }, [data, accessUser]);

  return (
    <>
      <PageHead
        title={`${data?.product.title} | 카멜`}
        description={`${getMetaDescription(data?.product)}`}
        ogTitle={`${data?.product.title} | 카멜`}
        ogDescription={`${getMetaDescription(data?.product)}`}
        ogImage={data?.product.imageMain || data?.product.imageThumbnail}
        ogUrl={`https://mrcamel.co.kr${
          data?.product ? getProductDetailUrl({ product: data.product }) : ''
        }`}
        canonical={`https://mrcamel.co.kr${
          (_nextI18Next as SSRConfig['_nextI18Next'])?.initialLocale === locales.ko.lng
            ? ''
            : `/${(_nextI18Next as SSRConfig['_nextI18Next'])?.initialLocale}`
        }${data?.product ? getProductDetailUrl({ product: data.product }) : ''}`}
        keywords={`중고 ${data?.product.brand.name}, 중고 ${data?.product.category.name}, 중고 ${data?.product.quoteTitle}, ${data?.product.brand.name}, ${data?.product.category.name}, ${data?.product.quoteTitle}, 여자 ${data?.product.category.name}, 남자 ${data?.product.category.name}`}
        product={data?.product}
      />
      <GeneralTemplate
        subset
        header={<ProductDetailHeader data={data} />}
        footer={
          <ProductDetailFooter
            data={data}
            viewDetail={viewDetail}
            isRedirectPage={isRedirectPage}
            isCamelSellerProduct={isCamelSellerProduct}
            soldout={soldout}
            refresh={refetch}
            productButton={
              <ProductCTAButton
                product={data?.product}
                channels={data?.channels}
                roleSeller={data?.roleSeller}
                isBlockedUser={data?.blockUser || false}
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
                refetch={refetch}
              />
            }
          />
        }
        hideAppDownloadBanner={isRedirectPage}
      >
        {isRedirectPage && data?.product && <ProductRedirect product={data.product} />}
        {!isRedirectPage && (
          <>
            {!(checkAgent.isIOSApp() || checkAgent.isAndroidApp()) && soldout && !viewDetail ? (
              <ProductSoldoutCard
                product={data?.product}
                isSafe={isSafe}
                onClick={handleClickViewDetail}
              />
            ) : (
              <>
                <ProductImages
                  isLoading={isLoading || isFetching}
                  product={data?.product}
                  getProductImageOverlay={getProductImageOverlay}
                  isProductLegit={data?.productLegit}
                  isCamelSellerProduct={isCamelSellerProduct}
                />
                <ProductInfo
                  contentRef={contentRef}
                  isSafe={isSafe}
                  product={product}
                  isCamelSellerProduct={isCamelSellerProduct}
                />
                {!isCamelSellerProduct && (
                  <ProductActions
                    product={product}
                    hasRoleSeller={!!data?.roleSeller?.userId}
                    onClickSMS={handleClickSMS}
                  />
                )}
                {isCamelSellerProduct && <DivideLine />}
              </>
            )}
            {data && data.product.productLegit && (
              <ProductDetailLegitBanner data={data.product.productLegit} product={data.product} />
            )}
            <ProductMowebAppContents data={data} />
            <ProductRelatedProductList
              brandId={data?.product?.brand.id}
              categoryId={data?.product?.category.id}
              line={data?.product?.line}
              prevProduct={data?.product}
              quoteTitle={data?.product.quoteTitle}
              price={data?.product.price}
              productId={data?.product.id}
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
              color: common.uiWhite
            }}
          >
            판매자가 같은 매물을 다시 올렸어요
          </Typography>
          <Typography
            weight="medium"
            customStyle={{
              textDecoration: 'underline',
              whiteSpace: 'nowrap',
              color: common.ui80
            }}
            onClick={() => {
              logEvent(attrKeys.products.clickProductDetail, {
                name: attrProperty.name.productDetail,
                att: isPriceDown ? 'TOASTPRICELOW' : 'TOASTSAME',
                productType: getProductType(
                  data?.product.productSeller.site.id || 0,
                  data?.product.productSeller.type || 0
                )
              });
            }}
          >
            <Link href={targetProductUrl}>
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
              color: common.ui80
            }}
          >
            <Link href={targetProductUrl}>
              <a>확인하기</a>
            </Link>
          </Typography>
        </Flexbox>
      </Toast>
      <ProductDetailLegitBottomSheet
        title={String(data?.product.title)}
        thumbnail={data?.product.imageThumbnail || (data?.product.imageMain as string)}
      />
      <MyShopAppDownloadDialog />
      <UserShopProductDeleteConfirmDialog redirect />
    </>
  );
}

export async function getServerSideProps({
  req,
  res,
  query,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const isGoBack = req.cookies.isGoBack ? JSON.parse(req.cookies.isGoBack) : false;
  if (isGoBack) {
    res.setHeader('Set-Cookie', 'isGoBack=false;path=/');

    return {
      props: {
        ...(await serverSideTranslations(locale || defaultLocale))
      }
    };
  }

  try {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));
    Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

    const { id } = query;

    const splitIds = String(id).split('-');
    const productId = Number(splitIds[splitIds.length - 1] || 0);

    if (query.id === 'undefined') {
      return {
        redirect: {
          destination: '/',
          statusCode: 301
        }
      };
    }

    const product = await queryClient.fetchQuery(
      queryKeys.products.product({ productId }),
      async () => {
        const resultProduct = await fetchProduct({ productId, source: PRODUCT_SOURCE.API });

        resultProduct.product.viewCount += 1;

        return resultProduct;
      }
    );

    queryClient.setQueryData(queryKeys.products.product({ productId }), product);

    return {
      props: {
        ...(await serverSideTranslations(locale || defaultLocale)),
        dehydratedState: dehydrate(queryClient)
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

const PriceDownText = styled(Typography)`
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const DivideLine = styled.div`
  position: relative;
  left: -20px;
  width: calc(100% + 40px);
  height: 8px;
  margin-bottom: 30px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
`;

export default ProductDetail;
